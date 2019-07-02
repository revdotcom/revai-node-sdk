const configUtil = require('./config-helper');
const revai = require('../../../dist/src/api-client');

module.exports = {
    getClient: (apiKey) => {
        const client = new revai.RevAiApiClient(apiKey);
        client.apiHandler.instance.defaults.baseURL = configUtil.getBaseUrl();
        return client;
    }
}