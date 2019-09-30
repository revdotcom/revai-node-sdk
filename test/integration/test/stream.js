const {AudioConfig} = require('../../../dist/src/models/streaming/AudioConfig');
const {RevAiStreamingClient} = require('../../../dist/src/streaming-client');
const configHelper = require('../src/config-helper');
const fs = require('fs');
const assert = require('assert');

(async (done) => {
    const audioConfig = new AudioConfig("audio/x-raw", 'interleaved', 16000, 'S16LE', 1);
    const client = new RevAiStreamingClient(configHelper.getApiKey(), audioConfig);
    client.baseUrl = `wss://${configHelper.getBaseUrl()}/speechtotext/v1alpha/stream`;
        
    client.on('close', (code, reason) => {
        console.log(`Connection closed, ${code}: ${reason}`);
        assertCloseCodeAndReason(code, reason);
        console.log('Streaming test PASS');
        return;
    });
    client.on('httpResponse', code => {
        console.log(`Streaming client received http response with code: ${code}`);
    });
    client.on('connectFailed', error => {
        console.log(`Connection failed with error: ${error}`);
    });
    client.on('connect', connectionMessage => {
        console.log(`Connected with job id: ${connectionMessage.id}`);
    });

    var stream = client.start();

    stream.on('data', data => {
        if (data.type === 'partial') {
            assertPartialHypothesis(data);
        } else if (data.type === 'final') {
            assertFinalHypothesis(data);
        }
    });

    stream.on('error', (error) => {
        console.log(`Streaming error occurred: ${error}`);
    });

    var file = fs.createReadStream('./test/integration/resources/english_test.raw');

    file.on('end', () => {
        client.end();
    });

    file.once('readable', () => {
        file.pipe(stream);
    });

})()

function assertPartialHypothesis(partial) {
    partial.elements.forEach(element => {
        assert.equal(element.type, 'text', 'Expected element type to be [text]: ' + JSON.stringify(element));
        assert.notEqual(element.value, 'undefined', 'Expected element value to not be [undefined]: ' + JSON.stringify(element));
    });
}

function assertFinalHypothesis(final) {
    assert.ok(final.ts < final.end_ts);
    final.elements.forEach(element => {
        if (element.type === 'punct') {
            assert.notEqual(element.value, 'undefined', 'Expected element value to not be [undefined]: ' + JSON.stringify(element));
        } else {
            assert.equal(element.type, 'text', 'Expected element type to be [text]: ' + JSON.stringify(element));
            assert.notEqual(element.value, 'undefined', 'Expected element value to not be [undefined]: ' + JSON.stringify(element));
            assert.ok(element.ts < element.end_ts, 'Expected starting timestamp value is not less than ending timestamp: ' + JSON.stringify(element));
            assert.notEqual(element.confidence, 'undefined', 'Expected confidence to not be [undefined]:' + JSON.stringify(element));
        }
    });
}

function assertCloseCodeAndReason(code, reason) {
    assert.equal(code, 1000, `Expected close code to be [1000] but was ${code}`);
    assert.equal(reason, 'End of input. Closing', `Expected close reason to be [End of input. Closing] but was ${reason}`);
}
