import AudioConfig from '../src/models/streaming/AudioConfig';
import BufferedDuplex from '../src/models/streaming/BufferedDuplex';
import { RevAiStreamingClient } from '../src/streaming-client';

const fs = require('fs');
const events = require('events');

const audioConfig = new AudioConfig("audio/x-wav");
const token = "testToken";

describe('streaming-client-integration', () => {
    
});