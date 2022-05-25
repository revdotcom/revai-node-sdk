const clientHelper = require('../../src/client-helper');
const SentimentAnalysisJob = require('../../../../dist/src/models/sentiment-analysis/SentimentAnalysisJob')
const client = clientHelper.getSentimentAnalysisClient();

beforeAll(async (done) => {
    const jobList = await client.getListOfJobs();
    if (jobList === undefined || jobList.length < 2) {
        await client.submitJobFromText('integration test job 1');
        await client.submitJobFromText('integration test job 2');
    }
    done();
}, 60000);

test('Can get list of jobs', async () => {
    const jobList = await client.getListOfJobs();
    jobList.forEach((SentimentAnalysisJob) => {
        expect(SentimentAnalysisJob).toMatchObject(SentimentAnalysisJob);
    });
}, 30000);

test('Can get single job and job by id', async () => {
    const jobList = await client.getListOfJobs({limit: 1});
    expect(jobList.length).toEqual(1);
    expect(jobList[0]).toMatchObject(SentimentAnalysisJob);

    const jobId = jobList[0].id;
    const job = await client.getJobDetails(jobId);

    expect(job).toMatchObject(SentimentAnalysisJob);
    expect(job.id).toEqual(jobId);
}, 30000);
