const clientHelper = require('../src/client-helper');
const JobStatus = require('../../../dist/src/models/JobStatus').JobStatus;
const client = clientHelper.getAsyncClient();
const InvalidParameterError = require('../../../src/models/RevAiApiError').InvalidParameterError;

beforeAll(async (done) => {
    const jobList = await client.getListOfJobs();
    var jobId;
    if(jobList !== undefined) {
        jobId = clientHelper.getTranscribedJobId(jobList);
    }
    if(jobId === undefined) {
        const job = await client.submitJobUrl('https://www.rev.ai/FTC_Sample_1.mp3');
        jobId = job.id;
    }

    var intervalObject = setInterval(function() {
        (async () => {
            const jobDetails = await client.getJobDetails(jobId);
            if (jobDetails.status == JobStatus.Transcribed) {
                clearInterval(intervalObject);
                done();
            }
        })()
    }, 15000);
}, 600000);

test('Can get srt captions', async (done) => {
    const jobList = await client.getListOfJobs();
    const jobId = clientHelper.getTranscribedJobId(jobList);
    expect(jobId).toBeDefined();
    var captionStream = null;
    try {
        captionsStream = await client.getCaptions(jobId);
    }
    catch (error) {
        if (error instanceof InvalidParameterError){
            captionsStream = await client.getCaptions(jobId, undefined, 0);
        }
        else {
            throw error;
        }
    }
    var streamString = '';
    captionsStream.on('data', data => {
        streamString += data.toString();
    })
    captionsStream.on('end', () => {
        expect(streamString.length).toBeGreaterThan(0)
        done();
    })
}, 60000);
