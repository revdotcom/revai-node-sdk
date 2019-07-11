const clientHelper = require('../src/client-helper');
const configHelper = require('../src/config-helper');
const RevAiApiJob = require('../../../dist/src/models/RevAiApiJob')

test('Can get list of jobs', async () => {
    const client = clientHelper.getClient(configHelper.getApiKey());
    const jobList = await client.getListOfJobs();
    jobList.forEach((revAiJob) => {
        expect(revAiJob).toMatchObject(RevAiApiJob);
    })
});

test('Can get single job', async () => {
    const client = clientHelper.getClient(configHelper.getApiKey());
    const jobList = await client.getListOfJobs(1);
    expect(jobList.length).toEqual(1);
    expect(jobList[0]).toMatchObject(RevAiApiJob);
})