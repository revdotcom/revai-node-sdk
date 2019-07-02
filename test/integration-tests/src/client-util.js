require('dotenv').config();
const revai = require('revai-node-sdk');

function getClientBaseUrl() {
    return process.env.BASE_URL;
}

module.exports = {
    getClient: function (apiKey) {
        let client = new revai.RevAiApiClient(apiKey);
        client.apiHandler.instance.defaults.baseURL = getClientBaseUrl();
        return client;
    }
};