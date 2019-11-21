const clientHelper = require('../src/client-helper');
const configHelper = require('../src/config-helper');

test('Job not found', async() => {
    const client = clientHelper.getAsyncClient(configHelper.getApiKey());
    const randomString = Math.random().toString(36).replace('0.', '');
    try {
        await client.getJobDetails(randomString);
    } catch (error) {
        var revAiError = error;
    } finally {
        expect(revAiError.statusCode).toEqual(404);
        expect(revAiError.title).toBe('could not find job');
    }
}, 30000);
