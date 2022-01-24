import { client } from 'websocket';

import { AudioConfig } from '../../src/models/streaming/AudioConfig';
import { BufferedDuplex } from '../../src/models/streaming/BufferedDuplex';
import { SessionConfig } from '../../src/models/streaming/SessionConfig';
import { RevAiStreamingClient } from '../../src/streaming-client';

import { WebSocketConnectionMock } from './mocks/websocket-mock';

jest.useFakeTimers();

let sut: RevAiStreamingClient;
let mockClient: client;

const audioConfig = new AudioConfig('audio/x-wav');
const token = 'testToken';
const baseUrl = 'wss://api.rev.ai/speechtotext/v1/stream';

// tslint:disable-next-line
const sdkVersion = require('../../package.json').version;

describe('streaming-client', () => {
    beforeEach(() => {
        sut = new RevAiStreamingClient(token, audioConfig);
        mockClient = sut.client;
    });

    describe('start', () => {
        it('connects to api with parameters', () => {
            // Arrange
            const config = new SessionConfig(
                'my metadata',
                'my custom vocab id',
                true,
                true,
                0
            );

            // Act
            const res = sut.start(config);

            // Assert
            expect(mockClient.connect).toBeCalledWith(`${baseUrl}` +
                `?access_token=${token}` +
                `&content_type=${audioConfig.getContentTypeString()}` +
                `&user_agent=${encodeURIComponent(`RevAi-NodeSDK/${sdkVersion}`)}` +
                `&metadata=${encodeURIComponent(config.metadata)}` +
                `&custom_vocabulary_id=${encodeURIComponent(config.customVocabularyID)}` +
                `&filter_profanity=${encodeURIComponent(config.filterProfanity)}` +
                `&remove_disfluencies=${encodeURIComponent(config.removeDisfluencies)}` +
                `&delete_after_seconds=${encodeURIComponent(config.deleteAfterSeconds)}`
            );
            expect(mockClient.connect).toBeCalledTimes(1);
            expect(res.writable).toBe(true);
        });

        it ('does not add optional parameters if no config provided', () => {
            // Act
            const res = sut.start();

            // Assert
            expect(mockClient.connect).toBeCalledWith(`${baseUrl}` +
                `?access_token=${token}` +
                `&content_type=${audioConfig.getContentTypeString()}` +
                `&user_agent=${encodeURIComponent(`RevAi-NodeSDK/${sdkVersion}`)}`
            );
            expect(mockClient.connect).toBeCalledTimes(1);
            expect(res.writable).toBe(true);
        });

        it ('does not add optional parameters if empty in config', () => {
            const config = new SessionConfig();

            // Act
            const res = sut.start(config);

            // Assert
            expect(mockClient.connect).toBeCalledWith(`${baseUrl}` +
                `?access_token=${token}` +
                `&content_type=${audioConfig.getContentTypeString()}` +
                `&user_agent=${encodeURIComponent(`RevAi-NodeSDK/${sdkVersion}`)}`
            );
            expect(mockClient.connect).toBeCalledTimes(1);
            expect(res.writable).toBe(true);
        });

        it ('does not add optional parameters if null in config', () => {
            const config = new SessionConfig(null, null, null);

            // Act
            const res = sut.start(config);

            // Assert
            expect(mockClient.connect).toBeCalledWith(`${baseUrl}` +
                `?access_token=${token}` +
                `&content_type=${audioConfig.getContentTypeString()}` +
                `&user_agent=${encodeURIComponent(`RevAi-NodeSDK/${sdkVersion}`)}`
            );
            expect(mockClient.connect).toBeCalledTimes(1);
            expect(res.writable).toBe(true);
        });

        it('returns duplex stream', () => {
            // Act
            const res = sut.start();

            // Assert
            expect(res).toBeInstanceOf(BufferedDuplex);
        });

        it('adds event listener to httpResponse', () => {
            // Setup
            const res = sut.start();
            let statusCode = null;
            sut.on('httpResponse', code => {
                statusCode = code;
            });

            // Act
            mockClient.emit('httpResponse', { statusCode: 401 });

            // Assert
            expect(statusCode).toBe(401);
            expect(res.writable).toBe(false);
            expect(() => { res.write('message'); }).toThrow();
        });

        it('adds event listener to connectFailed', () => {
            // Setup
            const res = sut.start();
            let connectionError = null;
            let expectedError = new Error('fake error');
            sut.on('connectFailed', error => {
                connectionError = error;
            });

            // Act
            mockClient.emit('connectFailed', expectedError);

            // Assert
            expect(connectionError).toBe(expectedError);
            expect(res.writable).toBe(false);
            expect(() => { res.write('message'); }).toThrow();
        });

        it('adds event listener to connection close', () => {
            // Setup
            const res = sut.start();
            const expectedCloseCode = 1000;
            const expectedCloseReason = 'NormalClosure';
            const mockConnection = new WebSocketConnectionMock();
            let closeCode = null;
            let closeReason = null;
            sut.on('close', (code, reason) => {
                closeCode = code;
                closeReason = reason;
            });

            // Act
            mockClient.emit('connect', mockConnection);
            mockConnection.emit('close', expectedCloseCode, expectedCloseReason);

            // Assert
            expect(closeCode).toBe(expectedCloseCode);
            expect(closeReason).toBe(expectedCloseReason);
            expect(res.writable).toBe(false);
            expect(() => { res.write('message'); }).toThrow();
        });

        it('adds event listener to connection error', () => {
            // Setup
            const res = sut.start();
            const expectedError = new Error('fake connection error');
            const mockConnection = new WebSocketConnectionMock();
            let connectionError = null;
            sut.on('error', error => {
                connectionError = error;
            });

            // Act
            mockClient.emit('connect', mockConnection);
            mockConnection.emit('error', expectedError);

            // Assert
            expect(connectionError).toBe(expectedError);
            expect(res.writable).toBe(false);
            expect(() => { res.write('message'); }).toThrow();
        });

        it('emits connected event on connected message from server', () => {
            // Setup
            const res = sut.start();
            let jobId = null;
            const expectedJobId = '1';
            let mockConnection = new WebSocketConnectionMock();
            sut.on('connect', response => {
                jobId = response.id;
            });

            // Act
            mockClient.emit('connect', mockConnection);
            mockConnection.emit('message',
                {
                    type: 'utf8',
                    utf8Data: `{ \"type\": \"connected\", \"id\": \"${expectedJobId}\"}`
                }
            );

            // Assert
            expect(jobId).toBe(expectedJobId);
            expect(res.writable).toBe(true);
        });

        it('does not write messages from server after streams are closed', () => {
            const res = sut.start();
            let mockConnection = new WebSocketConnectionMock();
            sut.unsafeEnd();

            // Act
            mockClient.emit('connect', mockConnection);
            mockConnection.emit('message',
                {
                    type: 'utf8',
                    utf8Data: `{ \"type\": \"partial\", \"ts\": 0, \"end_ts\": 1, \"elements\": [] }`
                }
            );

            // Assert
            expect(res.read()).toBe(null);
            expect(res.writable).toBe(false);
        });
    });

    describe('message sending', () => {
        it('sends messages written to input of duplex', () => {
            // Setup
            const res = sut.start();
            const mockConnection = new WebSocketConnectionMock();
            mockClient.emit('connect', mockConnection);
            const input = Buffer.from([0x62]);

            // Act
            res.write(input);
            jest.runOnlyPendingTimers();

            // Assert
            expect(mockConnection.send).toBeCalledTimes(1);
            expect(mockConnection.send).toBeCalledWith(input);
        });

        it('sends strings as text messages', () => {
            // Setup
            const res = sut.start();
            const mockConnection = new WebSocketConnectionMock();
            mockClient.emit('connect', mockConnection);

            // Act
            res.end('hello, world!', 'utf8');
            jest.runOnlyPendingTimers();

            // Assert
            expect(mockConnection.sendUTF).toBeCalledTimes(1);
            expect(mockConnection.sendUTF).toBeCalledWith('hello, world!');
        });
    });

    describe('end', () => {
        it('closes off input stream', () => {
            // Setup
            let duplex = sut.start();

            // Act
            sut.end();

            // Assert
            expect(duplex.writable).toBe(false);
            expect(() => { duplex.write('message'); }).toThrow();
        });
    });

    describe('unsafeEnd', () => {
        it('aborts client connection', () => {
            // Act
            sut.unsafeEnd();

            // Assert
            expect(mockClient.abort).toBeCalledTimes(1);
        });

        it('closes off input stream', () => {
            // Setup
            const duplex = sut.start();

            // Act
            sut.unsafeEnd();

            // Assert
            expect(duplex.writable).toBe(false);
            expect(() => { duplex.write('message'); }).toThrow();
        });
    });
});