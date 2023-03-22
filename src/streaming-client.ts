import { EventEmitter } from 'events';
import { IncomingMessage } from 'http';
import { Duplex, PassThrough } from 'stream';
import { client, connection, IClientConfig, Message } from 'websocket';

import { AudioConfig } from './models/streaming/AudioConfig';
import { BufferedDuplex } from './models/streaming/BufferedDuplex';
import { RevAiApiClientConfig } from './models/RevAiApiClientConfig';
import { RevAiApiDeployment, RevAiApiDeploymentConfigMap } from './models/RevAiApiDeploymentConfigConstants';
import { SessionConfig } from './models/streaming/SessionConfig';
import {
    StreamingConnected,
    StreamingHypothesis,
    StreamingResponse
} from './models/streaming/StreamingResponses';

const sdkVersion = require('../package.json').version;

/**
 * Client which handles a streaming connection to the Rev AI API.
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
    private apiClientConfig: RevAiApiClientConfig = {};
    private streamsClosed: boolean;
    private accessToken: string;
    private config: AudioConfig;
    private requests: PassThrough;
    private responses: PassThrough;
    private protocol: Duplex;

    /**
     * @param either string Access token used to validate API requests or RevAiApiClientConfig object
     * @param config Configuration of the audio the user will send from this client
     * @param version (optional) Version of the Rev AI API the user wants to use
     */
    constructor(params: RevAiApiClientConfig | string, config: AudioConfig, version = 'v1') {
        super();

        if (typeof params === 'object') {
            this.apiClientConfig = Object.assign(this.apiClientConfig, params as RevAiApiClientConfig);

            if (this.apiClientConfig.version === null || this.apiClientConfig.version === undefined) {
                this.apiClientConfig.version = version;
            }
            if (this.apiClientConfig.deploymentConfig === null || this.apiClientConfig.deploymentConfig === undefined) {
                this.apiClientConfig.deploymentConfig = RevAiApiDeploymentConfigMap.get(RevAiApiDeployment.US);
            }
            if (this.apiClientConfig.token === null || this.apiClientConfig.token === undefined) {
                throw new Error('token must be defined');
            }
        } else {
            this.apiClientConfig.token = params;
            this.apiClientConfig.version = version;
            this.apiClientConfig.deploymentConfig = RevAiApiDeploymentConfigMap.get(RevAiApiDeployment.US);
        }
        this.apiClientConfig.serviceApi = 'speechtotext';

        this.streamsClosed = false;
        this.accessToken = this.apiClientConfig.token;
        this.config = config;
        this.baseUrl = `${this.apiClientConfig.deploymentConfig.baseWebsocketUrl}/${this.apiClientConfig.serviceApi}` +
            `/${this.apiClientConfig.version}/stream`;
        this.requests = new PassThrough({ objectMode: true });
        this.responses = new PassThrough({ objectMode: true });
        this.protocol = new BufferedDuplex(this.requests, this.responses, {
            readableObjectMode: true,
            writableObjectMode: true
        });
        const clientConfig: IClientConfig = {};
        const clientConfigExtensionProperties = {
            keepalive: true,
            keepaliveInterval: 30000
        };
        this.client = new client({
            ...clientConfig,
            ...clientConfigExtensionProperties
        });
        this.setUpHttpResponseHandler();
        this.setUpConnectionFailureHandler();
        this.setUpConnectedHandlers();
    }

    /**
     * Begins a streaming connection. Returns a duplex
     * from which the user can read responses from the api and to which the user
     * should write their audio data
     * @param config (Optional) Optional configuration for the streaming session
     *
     * @returns BufferedDuplex. Data written to this buffer will be sent to the api
     * Data received from the api can be read from this duplex
     */
    public start(config?: SessionConfig): Duplex {
        let url = this.baseUrl +
            `?access_token=${this.accessToken}` +
            `&content_type=${this.config.getContentTypeString()}` +
            `&user_agent=${encodeURIComponent(`RevAi-NodeSDK/${sdkVersion}`)}`;
        if (config) {
            if (config.metadata) {
                url += `&metadata=${encodeURIComponent(config.metadata)}`;
            }
            if (config.customVocabularyID) {
                url += `&custom_vocabulary_id=${encodeURIComponent(config.customVocabularyID)}`;
            }
            if (config.filterProfanity) {
                url += '&filter_profanity=true';
            }
            if (config.removeDisfluencies) {
                url += '&remove_disfluencies=true';
            }
            if (config.deleteAfterSeconds !== null && config.deleteAfterSeconds !== undefined) {
                url += `&delete_after_seconds=${encodeURIComponent(config.deleteAfterSeconds.toString())}`;
            }
            if (config.detailedPartials) {
                url += '&detailed_partials=true';
            }
            if (config.startTs !== null && config.startTs !== undefined) {
                url += `&start_ts=${encodeURIComponent(config.startTs.toString())}`;
            }
            if (config.transcriber) {
                url += `&transcriber=${encodeURIComponent(config.transcriber)}`;
            }
            if (config.language) {
                url += `&language=${encodeURIComponent(config.language)}`;
            }
            if (config.skipPostprocessing) {
                url += '&skip_postprocessing=true';
            }
            if (config.enableSpeakerSwitch) {
                url += '&enable_speaker_switch=true';
            }
        }

        this.client.connect(url);
        return this.protocol;
    }

    /**
     * Signals to the api that you have finished sending data.
     */
    public end(): void {
        this.protocol.end('EOS', 'utf8');
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
        this.client.on('httpResponse', (response: IncomingMessage) => {
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
        this.client.on('connect', (conn: connection) => {
            conn.on('error', (error: Error) => {
                this.emit('error', error);
                this.closeStreams();
            });
            conn.on('close', (code: number, reason: string) => {
                this.emit('close', code, reason);
                this.closeStreams();
            });
            conn.on('message', (message: Message) => {
                if (this.streamsClosed) {
                    return;
                }
                if (message.type === 'utf8') {
                    const response = JSON.parse(message.utf8Data);
                    if ((response as StreamingResponse).type === 'connected') {
                        this.emit('connect', response as StreamingConnected);
                    } else if (this.responses.writable) {
                        this.responses.write(response as StreamingHypothesis);
                    }
                }
            });
            this.doSendLoop(conn);
        });
    }

    private doSendLoop(conn: connection): void {
        if (conn.connected) {
            const value = this.requests.read();
            if (value !== null) {
                if (typeof value === 'string') {
                    conn.sendUTF(value);
                } else {
                    conn.send(value);
                }
            }
            setTimeout(() => this.doSendLoop(conn), 100);
        }
    }

    private closeStreams(): void {
        if (!this.streamsClosed) {
            this.streamsClosed = true;
            this.protocol.end();
            this.requests.end();
            this.responses.push(null);
        }
    }
}