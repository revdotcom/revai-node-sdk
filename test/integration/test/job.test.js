const clientHelper = require('../src/client-helper');
const configHelper = require('../src/config-helper');

test('Can submit local file', async () => {
    const client = clientHelper.getClient(configHelper.getApiKey());
    const options = new Object();
    options.metadata = 'Node sdk submit local file';
    const job = await client.submitJobLocalFile('./test/integration/resources/test_mp3.mp3', options);
    expect(job.status).toBe('in_progress');
    expect(job.id).not.toBeNull();
});

test('Can submit url', async () => {
    const client = clientHelper.getClient(configHelper.getApiKey());
    const options = new Object();
    options.metadata = 'Node sdk submit url';
    const job = await client.submitJobUrl('https://www.rev.ai/FTC_Sample_1.mp3');
    expect(job.status).toBe('in_progress');
    expect(job.id).not.toBeNull();
});