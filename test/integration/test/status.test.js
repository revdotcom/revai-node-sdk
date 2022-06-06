const clientHelper = require('../src/client-helper');

test('Job not found', async() => {
    const client = clientHelper.getAsyncClient();
    const randomString = Math.random().toString(36).replace('0.', '');
    try {
        await client.getJobDetails(randomString);
    } catch (error) {
        expect(error.statusCode).toEqual(404);
        expect(error.details.title).toBe('could not find job');
    }
}, 30000);
