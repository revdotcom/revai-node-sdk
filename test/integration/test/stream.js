const {AudioConfig} = require('../../../dist/src/models/streaming/AudioConfig');
const {RevAiStreamingClient} = require('../../../dist/src/streaming-client');
const configHelper = require('../src/config-helper');
const fs = require('fs');
const assert = require('assert');

(async () => {
    const audioConfig = new AudioConfig("audio/x-raw", 'interleaved', 16000, 'S16LE', 1);
    const client = new RevAiStreamingClient(configHelper.getApiKey(), audioConfig);
    client.baseUrl = `wss://${configHelper.getBaseUrl()}/speechtotext/v1alpha/stream`;

    client.on('close', (code, reason) => {
        assertCloseCodeAndReason(code, reason);
        printPassStatement();
        return;
    });
    client.on('httpResponse', code => {
        throw new Error(`Streaming client received http response with code: ${code}`);
    });
    client.on('connectFailed', error => {
        throw new Error(`Connection failed with error: ${error}`);
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
        } else {
            throw new Error('Type not recognized: ' + JSON.stringify(data));
        }
    });

    stream.on('error', (error) => {
        throw new Error(`Streaming error occurred: ${error}`);
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

function printPassStatement() {
    console.log('PASS Integration test/integration/test/stream.js');
}
