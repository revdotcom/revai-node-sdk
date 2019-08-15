const {AudioConfig} = require('../../../dist/src/models/streaming/AudioConfig');
const {RevAiStreamingClient} = require('../../../dist/src/streaming-client');
const configHelper = require('../src/config-helper');
const fs = require('fs');

test('Can stream raw audio file', done => {
    jest.setTimeout(60000);
    const audioConfig = new AudioConfig("audio/x-raw", 'interleaved', 16000, 'S16LE', 1);
    const client = new RevAiStreamingClient(configHelper.getApiKey(), audioConfig);
    client.baseUrl = 'wss://api-test.rev.ai/speechtotext/v1alpha/stream';
        
    client.on('close', (code, reason) => {
        console.log(`Connection closed, ${code}: ${reason}`);
        expect(code).toBe(1006);
        expect(reason).toBe('Connection dropped by remote peer.');
        done();
    });
    client.on('httpResponse', code => {
        console.log(code);
    });
    client.on('connectFailed', error => {
        console.log(error);
    });
    client.on('connect', connectMessage => {
        console.log(connectMessage);
    });

    console.log('BaseUrl: ' + client.baseUrl.toString());

    var stream = client.start();

    stream.on('data', data => {
        console.log(data);
        if(data.type === 'partial') {
            assertPartialHypothesis(data);
        } else if (data.type === 'final') {
            assertFinalHypothesis(data);
            console.log('final was found');
            stream.destroy();
        }
    });

    stream.on('drain', () => {
        console.log('drain event triggered')
    });

    stream.on('close', () => {
        console.log('close event triggered');
    });

    stream.on('error', (error) => {
        console.log(error);
        console.log('error event triggered')
    });

    stream.on('end', () => {
        console.log('stream end was triggered');
        client.end();
    })

    stream.on('finish', () => {
        console.log('finish was called');
    })

    var eos = new Buffer('EOS', 'utf8');

    var file = fs.createReadStream('./resources/english_test.raw', { highWaterMark: 128 * 1024 });

    file.once('readable', () => {
        file.pipe(stream);
    })


})

function assertPartialHypothesis(partial) {
    partial.elements.forEach(element => {
        expect(element.type).toBe('text');
        expect(element.value).toBeDefined();
    });
}

function assertFinalHypothesis(final) {
    expect(final.ts).toBeLessThan(final.end_ts);
    final.elements.forEach(element => {
        if(element.type === 'punct') {
            expect(element.value).toBeDefined();
        } else {
            expect(element.type).toBe('text');
            expect(element.value).toBeDefined();
            expect(element.ts).toBeLessThan(element.end_ts);
            expect(element.confidence).toBe(1);
        }
    });
}