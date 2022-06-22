const clientHelper = require('../src/client-helper');
const JobStatus = require('../../../dist/src/models/JobStatus').JobStatus;
const client = clientHelper.getAsyncClient();

beforeAll(async (done) => {
    const jobList = await client.getListOfJobs();
    let jobId;
    if(jobList !== undefined) {
        jobId = clientHelper.getTranscribedJobId(jobList);
    }
    if(jobId === undefined) {
        const job = await client.submitJobUrl('https://www.rev.ai/FTC_Sample_1.mp3');
        jobId = job.id;
    }
    let intervalObject = setInterval(function(){
        (async () => {
            const jobDetails = await client.getJobDetails(jobId);
            if (jobDetails.status === JobStatus.Transcribed) {
                clearInterval(intervalObject);
                done();
            }
        })();
    }, 15000);
}, 600000);

test('Can get JSON transcript', async (done) => {
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
        });
    });
    done();
}, 30000);

test('JSON stream is equivalent to JSON object', async (done) => {
    const jobList = await client.getListOfJobs();
    const jobId = clientHelper.getTranscribedJobId(jobList);
    expect(jobId).toBeDefined();
    const jsonObject = await client.getTranscriptObject(jobId);
    const jsonStream = await client.getTranscriptObjectStream(jobId);
    let streamString = '';
    jsonStream.on('data', data => {
        streamString += data.toString();
    });
    jsonStream.on('end', () => {
        const streamObject = JSON.parse(streamString);
        expect(jsonObject).toStrictEqual(streamObject);
        done();
    });
}, 30000);

test('Can get text transcript', async (done) => {
    const jobList = await client.getListOfJobs();
    const jobId = clientHelper.getTranscribedJobId(jobList);
    expect(jobId).toBeDefined();
    const transcript = await client.getTranscriptText(jobId);
    expect(transcript).toBeDefined();
    expect(transcript.length).toBeGreaterThan(0);
    done();
}, 30000);

test('Text stream is equivalent to text string', async (done) => {
    const jobList = await client.getListOfJobs();
    const jobId = clientHelper.getTranscribedJobId(jobList);
    expect(jobId).toBeDefined();
    const textString = await client.getTranscriptText(jobId);
    const textStream = await client.getTranscriptTextStream(jobId);
    let streamString = '';
    textStream.on('data', data => {
        streamString += data.toString();
    });
    textStream.on('end', () => {
        expect(textString).toBe(streamString);
        done();
    });
}, 30000);
