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
    });

    describe('end', () => {

        it ('Ends streaming connection', () => {
            var ended = false;
            const sut = new RevAiStreamingClient(token, audioConfig);

            const res = sut.start();
            res.on('end', () => {
                ended = true;
            });
            sut.end();

            const mockedClient = WebSocketClient.mock.instances[0];
            expect(mockedClient.abort).toBeCalledTimes(1);
            expect(ended).toBeTruthy();
        });
    });
});