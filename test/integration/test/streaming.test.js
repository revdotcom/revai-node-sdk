const {AudioConfig} = require('../../../dist/src/models/streaming/AudioConfig');
const {RevAiStreamingClient} = require('../../../dist/src/streaming-client');
const configHelper = require('../src/config-helper');
const fs = require('fs');

test('Can stream raw audio file', async (done) => {
    //jest.setTimeout(120000);
    const audioConfig = new AudioConfig("audio/x-raw", 'interleaved', 16000, 'S16LE', 1);
    const client = new RevAiStreamingClient(configHelper.getApiKey(), audioConfig);
    client.baseUrl = 'wss://api-test.rev.ai/speechtotext/v1alpha/stream';
        
    client.on('close', (code, reason) => {
        console.log(`Connection closed, ${code}: ${reason}`);
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
        console.log(JSON.stringify(data, null, 2));
    });

    stream.on('end', () => {
        console.log('Stream end event called');
    })

    // var bufs = [];
    var file = fs.createReadStream('./resources/english_test.raw');

    // file.once('end', () => {
    //     console.log('File stream end event was triggered');
    // });

    // file.on('data', (chunk) => {
    //     bufs.push(chunk);
    // })

    // file.on('end', () => {
    //     var buf = Buffer.concat(bufs);
    //     stream.write(buf);
    // })

    file.on('end', () => {
        client.end();
    });

    file.pipe(stream);
    
})