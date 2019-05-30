import { EventEmitter } from 'events';
import * as fs from 'fs';
import { Duplex, PassThrough } from 'stream';
import { client } from 'websocket';

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
export class RevAiStreamingClient extends EventEmitter {
    baseUrl: string;
    client: client;
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
        this.baseUrl = `wss://api.rev.ai/speechtotext/${version}/stream`;
        this.requests = new PassThrough();
        this.responses = new PassThrough({ objectMode: true });
        this.client = new client();
        this.setUpHttpResponseHandler();
        this.setUpConnectionFailureHandler();
        this.setUpConnectedHandlers();
    }

    /**
     * Begins a streaming connection. Returns a duplex
     * from which the user can read responses from the api and to which the user
     * should write their audio data
     *
     * @returns BufferedDuplex. Data written to this buffer will be sent to the api
     * Data received from the api can be read from this duplex
     */
    public start(): Duplex {
        let url = this.baseUrl +
            `?access_token=${this.accessToken}` +
            `&content_type=${this.config.getContentTypeString()}`;
        this.client.connect(url);
        return new BufferedDuplex(this.requests, this.responses, { readableObjectMode: true });
    }

    /**
     * Ends the streaming connection and closes off the buffer returned from start()
     */
    public end(): void {
        this.client.abort();
        this.requests.end('EOS');
        this.responses.push(null);
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
            this.doSendLoop(connection, this.requests);
        });
    }

    private doSendLoop(connection: any, buffer: PassThrough): void {
        if (connection.connected) {
            let value = buffer.read(buffer.readableLength);
            if (value !== null) {
                connection.send(value);
            }
            setTimeout(() => this.doSendLoop(connection, buffer), 100);
        }
    }
}