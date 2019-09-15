import { EventEmitter } from 'events';
import { Duplex, PassThrough } from 'stream';
import { client } from 'websocket';

import { AudioConfig } from './models/streaming/AudioConfig';
import { BufferedDuplex } from './models/streaming/BufferedDuplex';
import {
    StreamingConnected,
    StreamingHypothesis,
    StreamingResponse
} from './models/streaming/StreamingResponses';

// tslint:disable-next-line
const sdkVersion = require('../package.json').version;

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
     * @param metadata (optional) Metadata to be associated with the streaming job
     *
     * @returns BufferedDuplex. Data written to this buffer will be sent to the api
     * Data received from the api can be read from this duplex
     */
    public start(metadata?: string): Duplex {
        let url = this.baseUrl +
            `?access_token=${this.accessToken}` +
            `&content_type=${this.config.getContentTypeString()}` +
            `&user_agent=${encodeURIComponent(`RevAi-NodeSDK/${sdkVersion}`)}`;
        if (metadata) {
            url += `&metadata=${encodeURIComponent(metadata)}`;
        }

        this.client.connect(url);
        return new BufferedDuplex(this.requests, this.responses, { readableObjectMode: true });
    }

    /**
     * Signals to the api that you have finished sending data.
     */
    public end(): void {
        this.requests.end('EOS', 'utf8');
    }

    /**
     * Immediately kills the streaming connection, no more results will be returned from the API
     * after this is called.
     */
    public unsafeEnd(): void {
        this.client.abort();
        this.closeStreams();
    }

    private setUpHttpResponseHandler(): void {
        this.client.on('httpResponse', (response: any) => {
            this.emit('httpResponse', response.statusCode);
            this.closeStreams();
        });
    }

    private setUpConnectionFailureHandler(): void {
        this.client.on('connectFailed', (error: Error) => {
            this.emit('connectFailed', error);
            this.closeStreams();
        });
    }

    private setUpConnectedHandlers(): void {
        this.client.on('connect', (connection: any) => {
            connection.on('error', (error: Error) => {
                this.emit('error', error);
                this.closeStreams();
            });
            connection.on('close', (code: number, reason: string) => {
                this.emit('close', code, reason);
                this.closeStreams();
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
                if (value.includes('EOS') || value.includes(Buffer.from('EOS'))) {
                    connection.sendUTF('EOS');
                }
            }
            setTimeout(() => this.doSendLoop(connection, buffer), 100);
        }
    }

    private closeStreams(): void {
        this.requests.end();
        this.responses.push(null);
    }
}