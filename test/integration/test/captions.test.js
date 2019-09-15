const clientHelper = require('../src/client-helper');
const configHelper = require('../src/config-helper');
const InstanceStateError = require('../../../src/models/RevAiApiError').InvalidStateError;

test('Can get srt captions', async (done) => {
    const client = clientHelper.getClient(configHelper.getApiKey());
    const jobList = await client.getListOfJobs();
    const jobId = clientHelper.getTranscribedJobId(jobList);
    expect(jobId).toBeDefined();
    var captionStream = null;
    try {
        captionsStream = await client.getCaptions(jobId);
    }
    catch (error){
        if (error instanceof InvalidStateError){
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
})