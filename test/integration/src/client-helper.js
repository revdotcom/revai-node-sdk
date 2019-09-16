const configUtil = require('./config-helper');
const revai = require('../../../dist/src/api-client');
const JobStatus = require('../../../dist/src/models/JobStatus').JobStatus;
const JobType = require('../../../dist/src/models/JobType').JobType;

module.exports = {
    getClient: (apiKey) => {
        const client = new revai.RevAiApiClient(apiKey);
        client.apiHandler.instance.defaults.baseURL = `https://${configUtil.getBaseUrl()}/revspeech/v1/`;
        return client;
    },
    getTranscribedJobId: (jobList) => {
        var completedJobId;
        for(job of jobList) {
            if(job.status === JobStatus.Transcribed && job.type != JobType.Stream) {
                completedJobId = job.id;
            }
        }
        return completedJobId;
    }
}