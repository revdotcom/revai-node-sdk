import * as websockets from 'websocket';
import AudioConfig from '../src/models/streaming/AudioConfig';
import { RevAiStreamingClient } from '../src/streaming-client';

const fs = require('fs');
const events = require('events');
jest.mock('websocket');

const audioConfig = new AudioConfig("audio/x-wav");

describe('streaming-client', () => {
    const mockedWebSocketClient = websockets.client as jest.Mocked<typeof websockets.client>;
    const sut = new RevAiStreamingClient('testtoken', audioConfig);

    beforeEach(() => {
        mockedWebSocketClient.connect.mockReset();
        mockedWebSocketClient.on.mockReset();
        mockedWebSocketClient.abort.mockReset();
    });
});