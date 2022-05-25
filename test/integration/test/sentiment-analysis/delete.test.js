const clientHelper = require('../../src/client-helper');
const RevAiApiError = require('../../../../dist/src/models/RevAiApiError').RevAiApiError;
const JobStatus = require('../../../../dist/src/models/JobStatus').JobStatus;
const client = clientHelper.getSentimentAnalysisClient();

let jobId;

beforeAll(async (done) => {
    const job = await client.submitJobFromText("deletion integration test");
    jobId = job.id;

    while((jobStatus = (await client.getJobDetails(job.id)).status) == JobStatus.InProgress)
    {
        await new Promise(resolve => setTimeout(resolve, 1000));
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
        expect(error.response.status).toBe(404);
    }
}, 30000);