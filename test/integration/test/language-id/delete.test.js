const clientHelper = require('../../src/client-helper');
const JobStatus = require('../../../../dist/src/models/JobStatus').JobStatus;
const client = clientHelper.getLanguageIdClient();

let jobId;

beforeAll(async (done) => {
    const options = new Object();
    options.metadata = 'Node sdk submit url for deletion';
    options.source_config = { url: 'https://www.rev.ai/FTC_Sample_1.mp3', auth_headers: null };
    const job = await client.submitJob(options);
    jobId = job.id;

    while((jobStatus = (await client.getJobDetails(job.id)).status) == JobStatus.InProgress)
    {
        await new Promise( resolve => setTimeout(resolve, 1000));
    }
    done();
}, 60000);

test('Can delete completed job', async () => {
    const res = await client.getJobDetails(jobId);
    expect(res.status === JobStatus.Completed || res.status === JobStatus.Failed).toBe(true);

    await client.deleteJob(jobId);

    try {
        await client.getJobDetails(jobId);
    } catch (error) {
        expect(error.statusCode).toBe(404);
    }
}, 30000);