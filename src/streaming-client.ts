import * as fs from 'fs';
import * as sockets from 'websocket';
import { Duplex, PassThrough } from 'stream';

import AudioConfig from './models/streaming/AudioConfig';

export class RevAiStreamingClient {
    accessToken: string;
    config: AudioConfig;
    baseUrl: string;
    constructor(accessToken: string, config: AudioConfig, version = 'v1alpha'){
        this.accessToken = accessToken;
        this.config = config;
        this.baseUrl = `wss://api.rev.ai/speechtotext/${version}/stream?` +
            `access_token=${accessToken}` +
            `&content_type=${config.getContentTypeString()}`;
    }

    start (): Duplex {
        var requests = new PassThrough();
        var responses = new PassThrough();
        const client = new sockets.client();
        console.log(this.baseUrl);
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
                    console.log(message.utf8Data);
                }
                else {
                    console.log(message);
                }
            });
            
            function sendFromBuffer() {
                if (connection.connected) {
                    connection.send(requests.read(8000));
                }
            }
            sendFromBuffer();
        });
        client.connect(this.baseUrl);
        var duplex = new Duplex({
            write (chunk: any, encoding?: any, callback?: any) {
                requests.write(chunk, encoding);
                callback();
            },

            read (size) {
                responses.read(size);
                console.log("reading");
            }
        });
        return duplex;
    }
}