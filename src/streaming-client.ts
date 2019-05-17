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
        this.baseUrl = `wss://api.rev.ai/speechtotext/${version}/stream?` +
            `access_token=${accessToken}` +
            `&content_type=${config.getContentTypeString()}`;
    }

    start (): Duplex {
        var requests = new PassThrough();
        var responses = new PassThrough({ objectMode: true });
        const client = new sockets.client();

        client.on('connectFailed', function(error) {
            console.log("failed to connect");
            console.log(error);
        });
        client.on('connect', function(connection) {
            connection.on('error', function(error) {
                console.log("error");
                console.log(error);
            });
            connection.on('close', function(code, reason) {
                console.log(`Connection closed, ${code}: ${reason}`);
            });
            connection.on('message', function(message) {
                if (message.type === 'utf8') {
                    responses.write(JSON.parse(message.utf8Data));
                }
            });
            
            function sendFromBuffer() {
                if (connection.connected) {
                    var value = requests.read(requests.readableLength);
                    if (value != null) {
                        connection.send(value);
                    }
                    setTimeout(sendFromBuffer, 250);
                }
            }
            sendFromBuffer();
        });
        client.connect(this.baseUrl);
        return new BufferedDuplex(requests, responses, { readableObjectMode: true });
    }
}