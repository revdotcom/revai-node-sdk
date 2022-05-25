const clientHelper = require('../../src/client-helper');
const JobStatus = require('../../../../dist/src/models/JobStatus').JobStatus;
const client = clientHelper.getSentimentAnalysisClient();

let jobId;

beforeAll(async (done) => {
    const job = await client.submitJobFromText("get result integration test");
    jobId = job.id;

    while((jobStatus = (await client.getJobDetails(job.id)).status) == JobStatus.InProgress)
    {
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    done();
}, 60000);

test('Can get result of completed job', async () => {
    const job = await client.getJobDetails(jobId);
    expect(job.status).toBe(JobStatus.Completed);

    const res = await client.getResult(jobId);

    expect(res).toHaveProperty('messages');
}, 30000);