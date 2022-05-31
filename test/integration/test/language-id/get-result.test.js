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

test('Can get result of completed job', async () => {
    const job = await client.getJobDetails(jobId);
    expect(job.status).toBe(JobStatus.Completed);

    const res = await client.getResult(jobId);

    expect(res).toHaveProperty('top_language');
    expect(res).toHaveProperty('language_confidences');
}, 30000);