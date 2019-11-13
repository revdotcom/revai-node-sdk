const configHelper = require('./config-helper');
const revaiAsync = require('../../../dist/src/api-client');
const revaiCustomVocabularies = require('../../../dist/src/custom-vocabularies-client');
const JobStatus = require('../../../dist/src/models/JobStatus').JobStatus;
const JobType = require('../../../dist/src/models/JobType').JobType;

module.exports = {
    getAsyncClient: (apiKey) => {
        const client = new revaiAsync.RevAiApiClient(apiKey);
        client.apiHandler.instance.defaults.baseURL = `https://${configHelper.getBaseUrl()}/revspeech/v1/`;
        return client;
    },
    getCustomVocabulariesClient: (apiKey) => {
        const client = new revaiCustomVocabularies.RevAiCustomVocabulariesClient(apiKey);
        client.apiHandler.instance.defaults.baseURL = `https://${configHelper.getBaseUrl()}/speechtotext/v1/vocabularies`;
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