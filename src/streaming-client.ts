import * as fs from 'fs';
import * as sockets from 'websocket';
import * as events from 'events';
import { Duplex, PassThrough } from 'stream';

import AudioConfig from './models/streaming/AudioConfig';
import BufferedDuplex from './models/streaming/BufferedDuplex';
import StreamingResponse from './models/streaming/StreamingResponse';

export class RevAiStreamingClient extends events.EventEmitter {
    baseUrl: string;
    client: sockets.WebSocketClient;
    private accessToken: string;
    private config: AudioConfig;
    private requests: PassThrough;
    private responses: PassThrough;
    constructor(accessToken: string, config: AudioConfig, version = 'v1alpha'){
        super();
        this.accessToken = accessToken;
        this.config = config;
        this.baseUrl = `wss://api.rev.ai/speechtotext/${version}/stream?` +
            `access_token=${accessToken}` +
            `&content_type=${config.getContentTypeString()}`;
        this.requests = new PassThrough();
        this.responses = new PassThrough({ objectMode: true });
        this.client = new sockets.client();
    }

    start(): Duplex {
        this.setUpClient();
        this.client.connect(this.baseUrl);
        return new BufferedDuplex(this.requests, this.responses, { readableObjectMode: true });
    }

    end(): void {
        this.client.abort();
        this.requests.write("EOS");
        this.requests.end();
        this.responses.push(null);
    }

    private setUpClient(): void {
        var self = this;
        this.client.on('httpResponse', function(response, client) {
            self.emit('httpResponse', response.statusCode);
            self.end();
        });
        this.client.on('connectFailed', function(error: Error) {
            self.emit('connectFailed', error);
            self.end();
        });
        this.client.on('connect', function(connection: any) {
            connection.on('error', function(error : Error) {
                self.emit('error', error);
                self.end();
            });
            connection.on('close', function(code: number, reason: string) {
                self.emit('close', code, reason);
                self.end();
            });
            connection.on('message', function(message: any) {
                if (message.type === 'utf8') {
                    var response = JSON.parse(message.utf8Data) as StreamingResponse;
                    if (response.type == "connected"){
                        self.emit('connect', response.id);
                    }
                    else{
                        self.responses.write(response);
                    }
                };
            });
            
            function sendFromBuffer() {
                if (connection.connected) {
                    var value = self.requests.read(self.requests.readableLength);
                    if (value != null) {
                        connection.send(value);
                    }
                    setTimeout(sendFromBuffer, 100);
                }
            }
            sendFromBuffer();
        });
    }
}

/*
// Example: 
let audioConfig = new AudioConfig("audio/x-wav");
const token = "token";
var client = new RevAiStreamingClient(token, audioConfig);
var stream = client.start();
client.on('close', (code, reason) => {
    console.log(`Connection closed, ${code}: ${reason}`);
});
client.on('httpResponse', code => {
    console.log(code);
})
client.on('connectFailed', (error) => {
    console.log(error);
})
client.on('connect', id => {
    console.log(`job id: ${id}`);
})

var file = fs.createReadStream('../test.wav');
file.pipe(stream);
stream.on('data', data => {
    console.log(data);
});
stream.on('end', function () {
    console.log("End of Stream");
});
*/