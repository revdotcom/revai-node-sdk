import AudioConfig from '../src/models/streaming/AudioConfig';
import BufferedDuplex from '../src/models/streaming/BufferedDuplex';
import { RevAiStreamingClient } from '../src/streaming-client';

const WebSocketClient = require('websocket').client;
const fs = require('fs');
const events = require('events');
jest.mock('websocket');

const audioConfig = new AudioConfig("audio/x-wav");
const token = "testToken";

describe('streaming-client', () => {
    beforeEach(() => {
        WebSocketClient.mockReset();
    });

    describe('start', () => {
        it ('Connects to api with parameters', () => {
            const sut = new RevAiStreamingClient(token, audioConfig);

            const res = sut.start();

            expect(WebSocketClient).toBeCalledTimes(1);
            const mockedClient = WebSocketClient.mock.instances[0];
            expect(mockedClient.connect).toBeCalledWith(`wss://api.rev.ai/speechtotext/v1alpha/stream?` +
                `access_token=${token}` +
                `&content_type=${audioConfig.getContentTypeString()}`
            );
            expect(mockedClient.connect).toBeCalledTimes(1);
        });

        it ('Returns duplex stream', () => {
            const sut = new RevAiStreamingClient(token, audioConfig);

            const res = sut.start();

            expect(res).toBeInstanceOf(BufferedDuplex);
        });

        it ('Throws error when connection fails', () => {
            var threwExpected = false;
            const sut = new RevAiStreamingClient(token, audioConfig);
            sut.on('connectFailed', (error) => {
                console.log(error);
                if (error.prototype.message === "fake error"){
                    threwExpected = true;
                }
            });

            const res = sut.start();
            const mockedClient = WebSocketClient.mock.instances[0];
            mockedClient.emit.mockRestore();
            mockedClient.emit('connectFailed', new Error("fake error"));

            expect(threwExpected).toBeTruthy();
        });
    });
});