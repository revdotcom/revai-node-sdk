const clientHelper = require('../src/client-helper');
const configHelper = require('../src/config-helper');

test('Can get JSON transcript', async (done) => {
    const client = clientHelper.getClient(configHelper.getApiKey());
    const jobList = await client.getListOfJobs();
    const jobId = clientHelper.getTranscribedJobId(jobList);
    expect(jobId).toBeDefined();
    const transcript = await client.getTranscriptObject(jobId);
    transcript.monologues.forEach( monologue => {
        expect(monologue.speaker).toBeDefined();
        monologue.elements.forEach( element => {
            if(element.type === 'text') {
                expect(element.value).toBeDefined();
                expect(element.confidence).toBeGreaterThanOrEqual(0.0);
                expect(element.end_ts).toBeGreaterThanOrEqual(0.0);
                expect(element.ts).toBeGreaterThanOrEqual(0.0);
                expect(element.ts).toBeLessThanOrEqual(element.end_ts);
            } else {
                expect(element.type).toBeDefined();
                expect(element.value).toBeDefined();
            }
        })
    })
    done();
});

test('JSON stream is equivalent to JSON object', async (done) => {
    const client = clientHelper.getClient(configHelper.getApiKey());
    const jobList = await client.getListOfJobs();
    const jobId = clientHelper.getTranscribedJobId(jobList);
    expect(jobId).toBeDefined();
    const jsonObject = await client.getTranscriptObject(jobId);
    const jsonStream = await client.getTranscriptObjectStream(jobId);
    var streamString = '';
    jsonStream.on('data', data => {
        streamString += data.toString();
    });
    jsonStream.on('end', () => {
        const streamObject = JSON.parse(streamString);
        expect(jsonObject).toStrictEqual(streamObject);
        done();
    });
})

test('Can get text transcript', async (done) => {
    const client = clientHelper.getClient(configHelper.getApiKey());
    const jobList = await client.getListOfJobs();
    const jobId = clientHelper.getTranscribedJobId(jobList);
    expect(jobId).toBeDefined();
    const transcript = await client.getTranscriptText(jobId);
    expect(transcript).toBeDefined();
    expect(transcript.length).toBeGreaterThan(0);
    done();
})

test('Text stream is equivalent to text string', async (done) => {
    const client = clientHelper.getClient(configHelper.getApiKey());
    const jobList = await client.getListOfJobs();
    const jobId = clientHelper.getTranscribedJobId(jobList);
    expect(jobId).toBeDefined();
    const textString = await client.getTranscriptText(jobId);
    const textStream = await client.getTranscriptTextStream(jobId);
    //console.log('String: ' + textString);
    var streamString = '';
    textStream.on('data', data => {
        streamString += data.toString();
    })
    textStream.on('end', () => {
        expect(textString).toBe(streamString);
        done();
    })
})
