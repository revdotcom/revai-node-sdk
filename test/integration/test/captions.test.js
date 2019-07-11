const clientHelper = require('../src/client-helper');
const configHelper = require('../src/config-helper');

test('Can get srt captions', async (done) => {
    const client = clientHelper.getClient(configHelper.getApiKey());
    const jobList = await client.getListOfJobs();
    const jobId = getTranscribedJobId(jobList);
    expect(jobId).toBeDefined();
    const captionsStream = await client.getCaptions(jobId);
    var streamString = '';
    console.log(streamString.length);
    captionsStream.on('data', data => {
        streamString += data.toString();
    })
    captionsStream.on('end', () => {
        expect(streamString.length).toBeGreaterThan(0)
        done();
    })
})

function getTranscribedJobId(jobList) {
    var completedJobId;
    for(job of jobList) {
        if(job.status === 'transcribed') {
            completedJobId = job.id;
        }
    }
    return completedJobId;
}