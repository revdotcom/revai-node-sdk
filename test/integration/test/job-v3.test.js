const clientHelper = require('../src/client-helper');

test('Can submit url with machine_v3 transcriber', async () => {
    const client = clientHelper.getAsyncClient();
    const options = {
        metadata: 'Node sdk v3 submit url test',
        transcriber: 'machine_v3'
    };

    const job = await client.submitJobUrl('https://www.rev.ai/FTC_Sample_1.mp3', options);

    expect(job.status).toBe('in_progress');
    expect(job.id).not.toBeNull();
}, 30000);
