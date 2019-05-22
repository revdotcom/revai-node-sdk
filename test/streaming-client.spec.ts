import AudioConfig from '../src/models/streaming/AudioConfig';
import BufferedDuplex from '../src/models/streaming/BufferedDuplex';
import { RevAiStreamingClient } from '../src/streaming-client';

const fs = require('fs');
const events = require('events');
var WebSocketClient = require('websocket').client;

jest.mock('stream');

const audioConfig = new AudioConfig("audio/x-wav");
const token = "testToken";
var sut = new RevAiStreamingClient(token, audioConfig);
var mockClient = new WebSocketClient(); 
sut.client = mockClient;

describe('streaming-client', () => {
    beforeEach(() => {
        jest.spyOn(mockClient, 'connect');
        jest.spyOn(mockClient, 'on');
        jest.spyOn(mockClient, 'abort');
        mockClient.connect.mockReset();
        mockClient.on.mockReset();
        mockClient.abort.mockReset();
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

        it('Emits httpResponse event when client emits httpResponse', () => {
            mockClient.on.mockRestore();
            var statusCode = null;
            sut.on('httpResponse', code => {
                statusCode = code;
            });
            const res = sut.start();

            mockClient.emit('httpResponse', {statusCode: 401});

            expect(statusCode).toBe(401);
        });

        it('Emits connectFailed event when client emits connectFailed', () => {
            mockClient.on.mockRestore();
            var connectionError = null;
            var expectedError = new Error("fake error")
            sut.on('connectFailed', error => {
                connectionError = error;
            });
            const res = sut.start();
            
            mockClient.emit('connectFailed', expectedError);

            expect(connectionError).toBe(expectedError);
        });
    });

    describe('end', () => {
        it('Aborts client connection', () => {
            sut.end();

            expect(mockClient.abort).toBeCalledTimes(1);
        });
    });
});