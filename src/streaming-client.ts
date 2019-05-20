import * as fs from 'fs';
import * as sockets from 'websocket';
import { Duplex, PassThrough } from 'stream';

import AudioConfig from './models/streaming/AudioConfig';
import BufferedDuplex from './models/streaming/BufferedDuplex';
import StreamingResponse from './models/streaming/StreamingResponse';

export class RevAiStreamingClient {
    accessToken: string;
    config: AudioConfig;
    baseUrl: string;
    requests: PassThrough;
    responses: PassThrough;
    client: sockets.WebSocketClient;
    constructor(accessToken: string, config: AudioConfig, version = 'v1alpha'){
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
            console.log("Failed to connect to streaming service");
            self.requests.end();
            throw error;
        });
        this.client.on('connect', function(connection: any) {
            connection.on('error', function(error : Error) {
                console.log("Error thrown in connection to streaming service");
                self.requests.end();
                self.responses.push(null);
                throw error;
            });
            connection.on('close', function(code: number, reason: string) {
                console.log(`Connection closed, ${code}: ${reason}`);
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
                    if (value !== null) {
                        connection.send(value);
                    }
                    setTimeout(sendFromBuffer, 100);
                }
            }
            sendFromBuffer();
        });
        this.client.connect(this.baseUrl);
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
let audioConfig = new AudioConfig();
audioConfig.contentType = "audio/x-wav";
const token = "token";
var client = new RevAiStreamingClient(token, audioConfig);
var stream = client.start();
var file = fs.createReadStream('../test.wav');
file.pipe(stream);
stream.on('data', data => {
    console.log(data);
});
stream.on('end', function () {
    console.log("End of Stream");
});
*/