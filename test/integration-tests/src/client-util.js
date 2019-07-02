const configUtil = require('./config-util');
const revai = require('revai-node-sdk');


module.exports = {
    getClient: function (apiKey) {
        let client = new revai.RevAiApiClient(apiKey);
        client.apiHandler.instance.defaults.baseURL = configUtil.getBaseUrl();
        return client;
    }
};