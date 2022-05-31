const clientHelper = require('../../src/client-helper');
const LanguageIdJob = require('../../../../dist/src/models/language-id/LanguageIdJob');
const client = clientHelper.getLanguageIdClient();

const metadatas = ['Node sdk submit url 1', 'Node sdk submit url 2'];

beforeAll(async (done) => {
    const jobList = await client.getListOfJobs();
    if (jobList === undefined || jobList.length < 2) {
        const sourceConfig = { url: 'https://www.rev.ai/FTC_Sample_1.mp3', auth_headers: null };
        const options1 = new Object();
        options1.metadata = metadatas[0];
        options1.source_config = sourceConfig;
        const options2 = new Object();
        options2.metadata = metadatas[1];
        options2.source_config = sourceConfig;
        await client.submitJob(options1);
        await client.submitJob(options2);
    }
    done();
}, 60000);

test('Can get list of jobs', async () => {
    const jobList = await client.getListOfJobs();
    jobList.forEach((languageIdJob, index) => {
        languageIdJob.metadata === metadatas[index];
        expect(languageIdJob).toMatchObject(LanguageIdJob);
    });
}, 30000);

test('Can get single job and job by id', async () => {
    const jobList = await client.getListOfJobs({limit: 1});
    expect(jobList.length).toEqual(1);
    expect(jobList[0]).toMatchObject(LanguageIdJob);

    const jobId = jobList[0].id;
    const job = await client.getJobDetails(jobId);

    expect(job).toMatchObject(LanguageIdJob);
    expect(job.id).toEqual(jobId);
}, 30000);
