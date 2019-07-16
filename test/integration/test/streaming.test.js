const {AudioConfig} = require('../../../dist/src/models/streaming/AudioConfig');
const {RevAiStreamingClient} = require('../../../dist/src/streaming-client');
const configHelper = require('../src/config-helper');
const fs = require('fs');

test('Can stream raw audio file', async (done) => {
    jest.setTimeout(60000);
    const audioConfig = new AudioConfig("audio/x-raw", 'interleaved', 16000, 'S16LE', 1);
    const client = new RevAiStreamingClient(configHelper.getApiKey(), audioConfig);
        
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

    var stream = client.start();

    var file = fs.createReadStream('./resources/english_test.raw');
    stream.on('readable', function() {
        console.log(this.read());
    });
        
    stream.on('finish', () => {
        console.log("Finish event triggered");
    });

    stream.on('end', () => {
        console.log('End event triggered')
    })

    file.pipe(stream);
    
})