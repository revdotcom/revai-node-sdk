import * as fs from 'fs';
import * as sockets from 'websocket';
import * as events from 'events';
import { Duplex, PassThrough } from 'stream';

import AudioConfig from './models/streaming/AudioConfig';
import BufferedDuplex from './models/streaming/BufferedDuplex';
import StreamingResponse from './models/streaming/StreamingResponse';

export class RevAiStreamingClient extends events.EventEmitter {
    accessToken: string;
    config: AudioConfig;
    baseUrl: string;
    requests: PassThrough;
    responses: PassThrough;
    client: sockets.WebSocketClient;
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

    start (): Duplex {
        var self = this;
        this.client.on('connectFailed', function(error: Error) {
            self.emit('connectFailed', error);
            self.requests.end();
            throw error;
        });
        this.client.on('connect', function(connection: any) {
            self.emit('connect');
            connection.on('error', function(error : Error) {
                self.emit('error', error);
                self.requests.end();
                self.responses.push(null);
                throw error;
            });
            connection.on('close', function(code: number, reason: string) {
                self.emit('close', code, reason);
                self.requests.end();
                self.responses.push(null);
            });
            connection.on('message', function(message: any) {
                if (message.type === 'utf8') {
                    self.responses.write(JSON.parse(message.utf8Data) as StreamingResponse);
                }
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
        this.client.connect(this.baseUrl);
        console.log(this.client);
        return new BufferedDuplex(this.requests, this.responses, { readableObjectMode: true });
    }

    end (): void {
        this.client.abort();
        this.requests.write("EOS");
        this.requests.end();
        this.responses.push(null);
    }
}

/*
Example: 
let audioConfig = new AudioConfig("audio/x.wav");
const token = "token";
var client = new RevAiStreamingClient(token, audioConfig);
var stream = client.start();
client.on('connect', () => {
    console.log("client connected");
});
client.on('close', (code, reason) => {
    console.log(`Connection closed, ${code}: ${reason}`);
});

var file = fs.createReadStream('../test.wav');
file.pipe(stream);
stream.on('data', data => {
    console.log(data);
});
stream.on('end', function () {
    console.log("End of Stream");
});
*/