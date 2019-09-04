const clientHelper = require('../src/client-helper');
const configHelper = require('../src/config-helper');

test('Can get srt captions', async (done) => {
    const client = clientHelper.getClient(configHelper.getApiKey());
    const jobList = await client.getListOfJobs();
    const jobId = clientHelper.getTranscribedJobId(jobList);
    expect(jobId).toBeDefined();
    const captionsStream = await client.getCaptions(jobId);
    var streamString = '';
    captionsStream.on('data', data => {
        streamString += data.toString();
    })
    captionsStream.on('end', () => {
        expect(streamString.length).toBeGreaterThan(0)
        done();
    })
})