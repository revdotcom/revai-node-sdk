const configUtil = require('./config-helper');
const revai = require('../../../dist/src/api-client');

module.exports = {
    getClient: (apiKey) => {
        const client = new revai.RevAiApiClient(apiKey);
        client.apiHandler.instance.defaults.baseURL = `https://${configUtil.getBaseUrl()}/revspeech/v1/`;
        return client;
    },
    getTranscribedJobId: (jobList) => {
        var completedJobId;
        for(job of jobList) {
            if(job.status === 'transcribed' && job.type != 'stream') {
                completedJobId = job.id;
            }
        }
        return completedJobId;
    }
}