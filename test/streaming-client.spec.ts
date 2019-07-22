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
        mockClient = sut.client;
    });

    describe('start', () => {
        it('Connects to api with parameters', () => {
            // Act
            const res = sut.start();

            // Assert
            expect(mockClient.connect).toBeCalledWith(`wss://api.rev.ai/speechtotext/v1alpha/stream?` +
                `access_token=${token}` +
                `&content_type=${audioConfig.getContentTypeString()}`
            );
            expect(mockClient.connect).toBeCalledTimes(1);
        });

        it('Returns duplex stream', () => {
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
            mockClient.emit('httpResponse', {statusCode: 401});

            // Assert
            expect(statusCode).toBe(401);
            expect(() => { res.write("message"); }).toThrow();
        });

        it('adds event listener to connectFailed', () => {
            // Setup
            const res = sut.start();
            let connectionError = null;
            let expectedError = new Error("fake error")
            sut.on('connectFailed', error => {
                connectionError = error;
            });
            
            // Act
            mockClient.emit('connectFailed', expectedError);

            // Assert
            expect(connectionError).toBe(expectedError);
            expect(() => { res.write("message"); }).toThrow();
        });

        it('adds event listener to connection close', () => {
            // Setup
            const res = sut.start();
            let closeCode = null;
            let closeReason = null;
            const expectedCloseCode = 1000;
            const expectedCloseReason = "NormalClosure";
            let mockConnection = new WebSocketConnection();
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
            expect(() => { res.write("message"); }).toThrow();
        });

        it('adds event listener to connection error', () => {
            // Setup
            const res = sut.start();
            let connectionError = null;
            const expectedError = new Error("fake connection error");
            let mockConnection = new WebSocketConnection();
            sut.on('error', error => {
                connectionError = error;
            });

            // Act
            mockClient.emit('connect', mockConnection);
            mockConnection.emit('error', expectedError);

            // Assert
            expect(connectionError).toBe(expectedError);
            expect(() => { res.write("message"); }).toThrow();
        });

        it('emits connected event on connected message from server', () => {
            // Setup
            const res = sut.start();
            let jobId = null;
            const expectedJobId = "1";
            let mockConnection = new WebSocketConnection();
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
        });
    });

    describe('Message sending', () => {
        it('Sends messages written to input of duplex', () => {
            // Setup
            const res = sut.start();
            const mockConnection = new WebSocketConnection();
            mockClient.emit('connect', mockConnection);
            const input = Buffer.from([0x62]);

            // Act
            res.write(input);
            jest.runOnlyPendingTimers();

            // Assert
            expect(mockConnection.send).toBeCalledTimes(1);
            expect(mockConnection.send).toBeCalledWith(input);
        });
    });

    describe('finish', () => {
        it('Closes off input stream', () => {
            // Setup
            let duplex = sut.start();

            // Act
            sut.end();

            // Assert
            expect(() => { duplex.write("message"); }).toThrow();
        });
    });

    describe('end', () => {
        it('Aborts client connection', () => {
            // Act
            sut.end();

            // Assert
            expect(mockClient.abort).toBeCalledTimes(1);
        });

        it('Closes off input stream', () => {
            // Setup
            let duplex = sut.start();

            // Act
            sut.end();

            // Assert
            expect(() => { duplex.write("message"); }).toThrow();
        });
    });
});