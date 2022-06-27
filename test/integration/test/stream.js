/* eslint-disable import/order */
const { AudioConfig } = require('../../../dist/src/models/streaming/AudioConfig');
const { SessionConfig } = require('../../../dist/src/models/streaming/SessionConfig');
const { CustomVocabularyStatus } = require('../../../dist/src/models/CustomVocabularyStatus');
const clientHelper = require('../src/client-helper');

const fs = require('fs');
const assert = require('assert');

const audioConfig = new AudioConfig('audio/x-raw', 'interleaved', 16000, 'S16LE', 1);

const handleHttpResponse = (code) => {
    throw new Error(`Streaming client received http response with code: ${code}`);
};

const handleConnectFailed = (error) => {
    throw new Error(`Connection failed with error: ${error}`);
};

const handleStreamError = (error) => {
    throw new Error(`Streaming error occurred: ${error}`);
};

// Test Streaming Client
(async () => {
    const client = clientHelper.getStreamingClient(audioConfig);

    client.on('close', (code, reason) => {
        assertCloseCodeAndReason(code, reason);
        printPassStatement('Streaming');
        return;
    });

    client.on('httpResponse', handleHttpResponse);
    client.on('connectFailed', handleConnectFailed);
    client.on('connect', connectionMessage => {
        console.log(`Connected with job ID: ${connectionMessage.id}`);
    });

    const stream = client.start();
    stream.on('error', handleStreamError);
    stream.on('data', data => {
        if (data.type === 'partial') {
            assertPartialHypothesis(data);
        } else if (data.type === 'final') {
            assertFinalHypothesis(data);
        } else {
            throw new Error('Type not recognized: ' + JSON.stringify(data));
        }
    });

    const file = fs.createReadStream('./test/integration/resources/english_test.raw');
    file.on('end', () => client.end());
    file.once('readable', () => file.pipe(stream));
})();

// Test Streaming Client with Custom Vocabulary
(async () => {
    const cvClient = clientHelper.getCustomVocabulariesClient();
    let cvSubmission = await cvClient.submitCustomVocabularies([{ phrases: [ 'test', 'vocabularies' ] }]);
    const stillInProgress = async () => {
        cvSubmission = await cvClient.getCustomVocabularyInformation(cvSubmission.id);
        return cvSubmission.status === CustomVocabularyStatus.InProgress;
    };

    while (await stillInProgress()) {
        await new Promise(resolve => setTimeout(resolve, 5000));
    }

    assertCustomVocabulariesCompleted(cvSubmission.status);

    const client = clientHelper.getStreamingClient(audioConfig);

    client.on('close', (code, reason) => {
        assertCloseCodeAndReason(code, reason);
        printPassStatement('Streaming with Custom Vocabulary');
    });
    client.on('httpResponse', handleHttpResponse);
    client.on('connectFailed', handleConnectFailed);
    client.on('connect', connectionMessage => {
        console.log(`Connected with job ID: ${connectionMessage.id} and custom vocabulary ID: ${cvSubmission.id}`);
    });

    const sessionConfig = new SessionConfig(customVocabularyID=cvSubmission.id);
    const stream = client.start(sessionConfig);
    stream.on('error', handleStreamError);
    stream.on('data', data => {
        if (data.type === 'partial') {
            assertPartialHypothesis(data);
        } else if (data.type === 'final') {
            assertFinalHypothesis(data);
        } else {
            throw new Error('Type not recognized: ' + JSON.stringify(data));
        }
    });

    const file = fs.createReadStream('./test/integration/resources/english_test.raw');
    file.on('end', () => client.end());
    file.once('readable', () => file.pipe(stream));
})();

// Test Streaming Client's Keep Alive
(async () => {
    const expectedReason = 'No data has been transferred, closing connection';
    const client = clientHelper.getStreamingClient(audioConfig);

    client.on('close', (code, reason) => {
        assert.equal(code, 1000, `Expected close code to be [1000] but was [${code}]`);
        assert.equal(reason, expectedReason, `Expected close reason to be [${expectedReason}] but was [${reason}]`);
        printPassStatement('Stream Keeps Alive Until Server Closes Connection');
        return;
    });
    client.on('httpResponse', handleHttpResponse);
    client.on('connectFailed', handleConnectFailed);
    client.on('connect', connectionMessage => {
        console.log(`Connected with job id: ${connectionMessage.id}`);
    });

    const stream = client.start();
    stream.on('error', handleStreamError);

    const file = fs.createReadStream('./test/integration/resources/english_test.raw');
    file.once('readable', () => file.pipe(stream));
})();

// Test Streaming Client's With Language Parameter
(async () => {
    const expectedReason = 'No data has been transferred, closing connection';
    const client = clientHelper.getStreamingClient(audioConfig);

    client.on('close', (code, reason) => {
        assert.equal(code, 1000, `Expected close code to be [1000] but was [${code}]`);
        assert.equal(reason, expectedReason, `Expected close reason to be [${expectedReason}] but was [${reason}]`);
        printPassStatement('Stream Keeps Alive Until Server Closes Connection');
        return;
    });
    client.on('httpResponse', handleHttpResponse);
    client.on('connectFailed', handleConnectFailed);
    client.on('connect', connectionMessage => {
        console.log(`Connected with job id: ${connectionMessage.id}`);
    });

    const stream = client.start(new SessionConfig(language='es'));
    stream.on('error', handleStreamError);

    const file = fs.createReadStream('./test/integration/resources/english_test.raw');
    file.once('readable', () => file.pipe(stream));
})();

const assertPartialHypothesis = (partial) => {
    partial.elements.forEach(element => {
        assert.equal(element.type, 'text', 'Expected element type to be [text]: ' + JSON.stringify(element));
        assert.notEqual(element.value, 'undefined', 'Expected element value to not be [undefined]: ' + JSON.stringify(element));
    });
};

const assertFinalHypothesis = (final) => {
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
};

const assertCloseCodeAndReason = (code, reason) => {
    assert.equal(code, 1000, `Expected close code to be [1000] but was [${code}]`);
    assert.equal(reason, 'End of input. Closing', `Expected close reason to be [End of input. Closing] but was [${reason}]`);
};

const assertCustomVocabulariesCompleted = (status) => {
    assert.equal(status, CustomVocabularyStatus.Complete);
};

const printPassStatement = (name='') => {
    const test = name ? `[${name}] ` : '';
    console.log(`PASS Integration ${test}test/integration/test/stream.js`);
};
