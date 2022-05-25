const clientHelper = require('../../src/client-helper');
const LanguageIdJob = require('../../../dist/src/models/language-id/LanguageIdJob')
const client = clientHelper.getLanguageIdClient();

beforeAll(async (done) => {
    const jobList = await client.getListOfJobs();
    if (jobList === undefined || jobList.length < 2) {
        const options1 = new Object();
        options1.metadata = 'Node sdk submit url 1';
        const options2 = new Object();
        options2.metadata = 'Node sdk submit url 2';
        await client.submitJobUrl('https://www.rev.ai/FTC_Sample_1.mp3', options1);
        await client.submitJobUrl('https://www.rev.ai/FTC_Sample_1.mp3', options2);
    }
    done();
}, 60000);

test('Can get list of jobs', async () => {
    const jobList = await client.getListOfJobs();
    jobList.forEach((languageIdJob) => {
        expect(languageIdJob).toMatchObject(LanguageIdJob);
    });
}, 30000);

test('Can get single job and job by id', async () => {
    const jobList = await client.getListOfJobs(1);
    expect(jobList.length).toEqual(1);
    expect(jobList[0]).toMatchObject(LanguageIdJob);

    const jobId = jobList[0].id;
    const job = await client.getJobDetails(jobId);

    expect(job).toMatchObject(LanguageIdJob);
    expect(job.id).toEqual(jobId);
}, 30000);