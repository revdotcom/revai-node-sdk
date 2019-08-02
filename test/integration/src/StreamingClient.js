const { RevAiStreamingClient } = require('../../../dist/src/streaming-client');
const configHelper = require('./config-helper');
const fs = require('fs');

class StreamingClient {

    constructor(audioConfig) {
        this.client = new RevAiStreamingClient(configHelper.getApiKey, audioConfig);
        //this.client.baseUrl = configHelper.getBaseUrl;
    }

    async streamAudio() {
        try {
            this.client.on('close', (code, reason) => {
                console.log(`Connection closed, ${code}: ${reason}`);
            });
            this.client.on('httpResponse', code => {
                console.log(code);
            });
            this.client.on('connectFailed', error => {
                console.log(error);
            });
            this.client.on('connect', connectMessage => {
                console.log(connectMessage);
            })

            var stream = this.client.start();

            var file = fs.createReadStream('./resources/english_test.raw')
            stream.on('data', data => {
                console.log(data);
            })
            stream.on('end', function () {
                console.log("End of Stream");
                //no more final hyp
            })

            file.pipe(stream);



        } catch (error) {
            console.log(error);
        }
    }
}

exports.StreamingClient = StreamingClient;