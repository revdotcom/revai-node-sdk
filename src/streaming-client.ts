import * as fs from 'fs';
import * as sockets from 'websocket';
import { Duplex, PassThrough } from 'stream';

import AudioConfig from './models/streaming/AudioConfig';
import BufferedDuplex from './models/streaming/BufferedDuplex';

export class RevAiStreamingClient {
    accessToken: string;
    config: AudioConfig;
    baseUrl: string;
    requests: PassThrough;
    responses: PassThrough;
    constructor(accessToken: string, config: AudioConfig, version = 'v1alpha'){
        this.accessToken = accessToken;
        this.config = config;
        this.baseUrl = `wss://api-test.rev.ai/speechtotext/${version}/stream?` +
            `access_token=${accessToken}` +
            `&content_type=${config.getContentTypeString()}`;
        this.requests = new PassThrough();
        this.responses = new PassThrough({ objectMode: true });
    }

    start (): Duplex {
        const client = new sockets.client();

        var self = this;
        client.on('connectFailed', function(error) {
            console.log("failed to connect");
            console.log(error);
        });
        client.on('connect', function(connection) {
            connection.on('error', function(error) {
                console.log("error");
                console.log(error);
                self.requests.end(null);
            });
            connection.on('close', function(code, reason) {
                console.log(`Connection closed, ${code}: ${reason}`);
                self.requests.end(null);
            });
            connection.on('message', function(message) {
                if (message.type === 'utf8') {
                    self.responses.write(JSON.parse(message.utf8Data));
                }
            });
            
            function sendFromBuffer() {
                if (connection.connected) {
                    var value = self.requests.read(self.requests.readableLength);
                    if (value != null) {
                        connection.send(value);
                    }
                    setTimeout(sendFromBuffer, 250);
                }
            }
            sendFromBuffer();
        });
        client.connect(this.baseUrl);
        return new BufferedDuplex(this.requests, this.responses, { readableObjectMode: true });
    }

    end (): void {
        this.requests.write("EOS");
        this.requests.end(null);
    }
}

let audioConfig = new AudioConfig();
audioConfig.contentType = "audio/*";
const token = "02-MhfBgAVW-kHX6qGWzG0GO0u-5Qy8oWsMeNvYkXVPpiQRUnGarKMYewusVjpAMHUKcwChQa2PKo4qVvYs_tWgkymYvU";
var test = new RevAiStreamingClient(token, audioConfig);
var stream = test.start();
var file = fs.createReadStream('../discovery-1min.wav');
file.pipe(stream);
stream.on('readable', function () {
    console.log(stream.read());
});
stream.on('end', function () {
    console.log("End of Stream");
});