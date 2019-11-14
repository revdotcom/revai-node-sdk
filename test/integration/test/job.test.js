const fs = require('fs');
const clientHelper = require('../src/client-helper');
const configHelper = require('../src/config-helper');

test('Can submit local file', async () => {
    const client = clientHelper.getAsyncClient(configHelper.getApiKey());
    const options = new Object();
    options.metadata = 'Node sdk submit local file';
    const job = await client.submitJobLocalFile('./test/integration/resources/test_mp3.mp3', options);
    expect(job.status).toBe('in_progress');
    expect(job.id).not.toBeNull();
});

test('Can submit url', async () => {
    const client = clientHelper.getAsyncClient(configHelper.getApiKey());
    const options = new Object();
    options.metadata = 'Node sdk submit url';
    const job = await client.submitJobUrl('https://www.rev.ai/FTC_Sample_1.mp3', options);
    expect(job.status).toBe('in_progress');
    expect(job.id).not.toBeNull();
});

test('Can submit buffer', async (done) => {
    const client = clientHelper.getAsyncClient(configHelper.getApiKey());
    const options = new Object();
    options.metadata = 'Node sdk submit buffer';
    const fileStream = fs.readFile('./test/integration/resources/test_mp3.mp3', async (err, data) => {
        const job = await client.submitJobAudioData(data, undefined, options);
        expect(job.status).toBe('in_progress');
        expect(job.id).not.toBeNull();
        console.log(job.id);
        done();
    });
});

test('Can submit buffer with filename', async (done) => {
    const client = clientHelper.getAsyncClient(configHelper.getApiKey());
    const options = new Object();
    options.metadata = 'Node sdk submit buffer';
    const fileStream = fs.readFile('./test/integration/resources/test_mp3.mp3', async (err, data) => {
        const job = await client.submitJobAudioData(data, "test_file.mp3", options);
        expect(job.status).toBe('in_progress');
        expect(job.id).not.toBeNull();
        done();
    });
});

test('Can submit ReadableStream', async () => {
    const client = clientHelper.getAsyncClient(configHelper.getApiKey());
    const options = new Object();
    const fileStream = fs.createReadStream('./test/integration/resources/test_mp3.mp3');
    options.metadata = 'Node sdk submit ReadableStream';
    const job = await client.submitJobAudioData(fileStream, 'test_mp3.mp3', options);
    expect(job.status).toBe('in_progress');
    expect(job.id).not.toBeNull();
});