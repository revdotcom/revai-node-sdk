import { PassThrough } from 'stream';
import { WebSocketClient, WebSocketConnection } from 'websocket';
import { AudioConfig } from '../src/models/streaming/AudioConfig';
import { BufferedDuplex } from '../src/models/streaming/BufferedDuplex';
import { RevAiStreamingClient } from '../src/streaming-client';
const fs = require('fs');
const events = require('events');

jest.useFakeTimers();

let sut: RevAiStreamingClient;
let mockClient: WebSocketClient;

const audioConfig = new AudioConfig("audio/x-wav");
const token = "testToken";

describe('streaming-client', () => {
    beforeEach(() => {
        sut = new RevAiStreamingClient(token, audioConfig);
        mockClient = new WebSocketClient();
        sut.client = mockClient;
    });

    describe('start', () => {
        it('Connects to api with parameters', () => {
            const res = sut.start();

            expect(mockClient.connect).toBeCalledWith(`wss://api.rev.ai/speechtotext/v1alpha/stream?` +
                `access_token=${token}` +
                `&content_type=${audioConfig.getContentTypeString()}`
            );
            expect(mockClient.connect).toBeCalledTimes(1);
        });

        it('Returns duplex stream', () => {
            const res = sut.start();

            expect(res).toBeInstanceOf(BufferedDuplex);
        });
    });

    describe('client setup', () => {
        it('Emits httpResponse event when client emits httpResponse', () => {
            const res = sut.start();
            var statusCode = null;
            sut.on('httpResponse', code => {
                statusCode = code;
            });

            mockClient.emit('httpResponse', {statusCode: 401});

            expect(statusCode).toBe(401);
        });

        it('Emits connectFailed event when client emits connectFailed', () => {
            const res = sut.start();
            var connectionError = null;
            var expectedError = new Error("fake error")
            sut.on('connectFailed', error => {
                connectionError = error;
            });
            
            mockClient.emit('connectFailed', expectedError);

            expect(connectionError).toBe(expectedError);
        });

        it('Emits close code and reason on connection close', () => {
            const res = sut.start();
            var closeCode = null;
            var closeReason = null;
            const expectedCloseCode = 1000;
            const expectedCloseReason = "NormalClosure";
            var mockConnection = new WebSocketConnection();
            sut.on('close', (code, reason) => {
                closeCode = code;
                closeReason = reason;
            });

            mockClient.emit('connect', mockConnection);
            mockConnection.emit('close', expectedCloseCode, expectedCloseReason);

            expect(closeCode).toBe(expectedCloseCode);
            expect(closeReason).toBe(expectedCloseReason);
        });

        it('Emits error on connection error', () => {
            const res = sut.start();
            var connectionError = null;
            const expectedError = new Error("fake connection error");
            var mockConnection = new WebSocketConnection();
            sut.on('error', error => {
                connectionError = error;
            });

            mockClient.emit('connect', mockConnection);
            mockConnection.emit('error', expectedError);

            expect(connectionError).toBe(expectedError);
        });

        it('Emits connect event on receiving connected message', () => {
            const res = sut.start();
            var jobId = null;
            const expectedJobId = "1";
            var mockConnection = new WebSocketConnection();
            sut.on('connect', response => {
                jobId = response.id;
            });

            mockClient.emit('connect', mockConnection);
            mockConnection.emit('message', 
                {
                    type: 'utf8', 
                    utf8Data: `{ \"type\": \"connected\", \"id\": \"${expectedJobId}\"}`
                }
            );

            expect(jobId).toBe(expectedJobId);
        });
    });

    describe('Message sending', () => {
        it('Sends messages written to input of duplex', () => {
            const res = sut.start();
            const mockConnection = new WebSocketConnection();
            mockClient.emit('connect', mockConnection);
            const input = Buffer.from([0x62]);

            res.write(input);
            jest.runOnlyPendingTimers();

            expect(mockConnection.send).toBeCalledTimes(1);
            expect(mockConnection.send).toBeCalledWith(input);
        });

        it('Writes hypothesis messages to output', () => {
            const res = sut.start();
            var message = null;
            const mockConnection = new WebSocketConnection();
            mockClient.emit('connect', mockConnection);
            res.on('data', data => {
                console.log("hi");
                message = data;
            });

            mockConnection.emit('message', 
                {
                    type: 'utf8', 
                    utf8Data: `{ \"type\": \"partial\", \"transcript\": \"hello world\"}`
                }
            );

            setTimeout(() => { 
                expect(message).toBe({type: "partial", transcript: "hello world"});
            }, 100);
        });
    });

    describe('end', () => {
        it('Aborts client connection', () => {
            sut.end();

            expect(mockClient.abort).toBeCalledTimes(1);
        });

        it('Ends duplex stream', () => {
            var duplex = sut.start();
            var ended = false;
            duplex.on('end', () => {
                ended = true;
            });

            sut.end();
            
            setTimeout(() => {
                expect(ended).toBeTruthy();
            }, 100);
        });

        it('Closes off input stream', () => {
            var duplex = sut.start();
            sut.end();

            expect(() => { duplex.write("message"); }).toThrow();
        });
    });
});