const clientHelper = require('../src/client-helper');
const RevAiApiJob = require('../../../dist/src/models/RevAiApiJob')
const client = clientHelper.getAsyncClient();

beforeAll(async (done) => {
    const jobList = await client.getListOfJobs();
    if (jobList === undefined || jobList.length < 2) {
        await client.submitJobUrl('https://www.rev.ai/FTC_Sample_1.mp3');
        await client.submitJobUrl('https://www.rev.ai/FTC_Sample_1.mp3');
    }
    done();
}, 60000);

test('Can get list of jobs', async () => {
    const jobList = await client.getListOfJobs();
    jobList.forEach((revAiJob) => {
        expect(revAiJob).toMatchObject(RevAiApiJob);
    });
}, 30000);

test('Can get single job', async () => {
    const jobList = await client.getListOfJobs(1);
    expect(jobList.length).toEqual(1);
    expect(jobList[0]).toMatchObject(RevAiApiJob);
}, 30000);
