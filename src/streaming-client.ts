import * as events from 'events';
import * as fs from 'fs';
import { Duplex, PassThrough } from 'stream';
import * as sockets from 'websocket';

import { AudioConfig } from './models/streaming/AudioConfig';
import { BufferedDuplex } from './models/streaming/BufferedDuplex';
import {
    StreamingConnected,
    StreamingHypothesis,
    StreamingResponse
} from './models/streaming/StreamingResponses';

/**
 * Client which handles a streaming connection to the Rev.ai API.
 * @event httpResponse emitted when the client fails to start a websocket connection and
 *      receives an http response. Event contains the http status code of the response.
 * @event connectFailed emitted when the client fails to begin a websocket connection and
 *      received a websocket error. Event contains the received error.
 * @event connect emitted when the client receives a connected message from the API. Contains
 *      the StreamingConnected returned from the API.
 * @event close emitted when the connection is properly closed by the server. Contains the
 *      close code and reason.
 * @event error emitted when an error occurs in the connection to the server. Contains the
 *      thrown error.
 *
 * @example
 * const audioConfig = new AudioConfig(<YOUR-CONTENT-TYPE-PARAMS>);
 * const token = <YOUR-ACCESS-TOKEN>;
 * var client = new RevAiStreamingClient(token, audioConfig);
 * client.on('close', (code, reason) => {
 *     console.log(`Connection closed, ${code}: ${reason}`);
 * });
 * client.on('httpResponse', code => {
 *     console.log(code);
 * })
 * client.on('connectFailed', error => {
 *     console.log(error);
 * })
 * client.on('connect', connectionMessage => {
 *     console.log(connectionMessage);
 * })
 *
 * var stream = client.start();
 *
 * var file = fs.createReadStream(<YOUR-AUDIO-FILE>);
 * stream.on('data', data => {
 *     console.log(data);
 * });
 * stream.on('end', function () {
 *     console.log("End of Stream");
 * });
 *
 * file.pipe(stream);
 */
export class RevAiStreamingClient extends events.EventEmitter {
    baseUrl: string;
    client: sockets.WebSocketClient;
    private accessToken: string;
    private config: AudioConfig;
    private requests: PassThrough;
    private responses: PassThrough;

    /**
     * @param accessToken Access token associated with the user's account
     * @param config Configuration of the audio the user will send from this client
     * @param version (optional) Version of the Rev.ai API the user wants to use
     */
    constructor(accessToken: string, config: AudioConfig, version = 'v1alpha') {
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

    /**
     * Sets up the client and begins the streaming connection. Returns a duplex
     * from which the user can read responses from the api and to which the user
     * should write their audio data
     *
     * @returns BufferedDuplex. Data written to this buffer will be sent to the api
     * Data received from the api can be read from this duplex
     */
    start(): Duplex {
        this.setUpClient();
        this.client.connect(this.baseUrl);
        return new BufferedDuplex(this.requests, this.responses, { readableObjectMode: true });
    }

    /**
     * Ends the streaming connection and closes off the buffer returned from start()
     */
    end(): void {
        this.client.abort();
        this.requests.end('EOS');
        this.responses.push(null);
    }

    private setUpClient(): void {
        this.setUpHttpResponseHandler();
        this.setUpConnectionFailureHandler();
        this.setUpConnectedHandlers();
    }

    private setUpHttpResponseHandler(): void {
        this.client.on('httpResponse', (response: any) => {
            this.emit('httpResponse', response.statusCode);
            this.end();
        });
    }

    private setUpConnectionFailureHandler(): void {
        this.client.on('connectFailed', (error: Error) => {
            this.emit('connectFailed', error);
            this.end();
        });
    }

    private setUpConnectedHandlers(): void {
        this.client.on('connect', (connection: any) => {
            connection.on('error', (error: Error) => {
                this.emit('error', error);
                this.end();
            });
            connection.on('close', (code: number, reason: string) => {
                this.emit('close', code, reason);
                this.end();
            });
            connection.on('message', (message: any) => {
                if (message.type === 'utf8') {
                    let response = JSON.parse(message.utf8Data);
                    if ((response as StreamingResponse).type === 'connected') {
                        this.emit('connect', response as StreamingConnected);
                    } else {
                        this.responses.write(response as StreamingHypothesis);
                    }
                }
            });

            function sendFromBuffer(buffer: PassThrough): void {
                if (connection.connected) {
                    let value = buffer.read(buffer.readableLength);
                    if (value !== null) {
                        connection.send(value);
                    }
                    setTimeout(() => sendFromBuffer(buffer), 100);
                }
            }
            sendFromBuffer(this.requests);
        });
    }
}