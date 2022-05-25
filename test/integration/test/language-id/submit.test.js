const clientHelper = require('../../src/client-helper');
const JobStatus = require('../../../../dist/src/models/JobStatus').JobStatus;
const client = clientHelper.getLanguageIdClient();

test('Can submit url', async () => {
    const options = new Object();
    options.metadata = 'Node sdk submit url';
    const res = await client.submitJobUrl('https://www.rev.ai/FTC_Sample_1.mp3', options);

    expect(res.status).toBe(JobStatus.InProgress);
    expect(res.created_on).not.toBeNull();
    expect(res.id).not.toBeNull();
    expect(res.failure).toBeUndefined();
}, 30000);

test('Can submit local file', async () => {
    const options = new Object();
    options.metadata = 'Node sdk submit local file';

    const res = await client.submitJobLocalFile('../../resources/test_mp3.mp3', options);

    expect(res.status).toBe(JobStatus.InProgress);
    expect(res.created_on).not.toBeNull();
    expect(res.id).not.toBeNull();
    expect(res.failure).toBeUndefined();
}, 30000);

test('Can submit buffer', async (done) => {
    const options = new Object();
    options.metadata = 'Node sdk submit buffer';
    fs.readFile('../../resources/test_mp3.mp3', async (_, data) => {
        const res = await client.submitJobAudioData(data, undefined, options);

        expect(res.status).toBe(JobStatus.InProgress);
        expect(res.created_on).not.toBeNull();
        expect(res.id).not.toBeNull();
        expect(res.failure).toBeUndefined();
        done();
    });
}, 30000);

test('Can submit buffer with filename', async (done) => {
    const options = new Object();
    options.metadata = 'Node sdk submit buffer with filename';
    fs.readFile('../../resources/test_mp3.mp3', async (err, data) => {
        const res = await client.submitJobAudioData(data, "test_file.mp3", options);

        expect(res.status).toBe(JobStatus.InProgress);
        expect(res.created_on).not.toBeNull();
        expect(res.id).not.toBeNull();
        expect(res.failure).toBeUndefined();
        done();
    });
}, 30000);

test('Can submit ReadableStream', async () => {
    const options = new Object();
    const fileStream = fs.createReadStream('../../resources/test_mp3.mp3');
    options.metadata = 'Node sdk submit ReadableStream';

    const res = await client.submitJobAudioData(fileStream, 'test_mp3.mp3', options);

    expect(res.status).toBe(JobStatus.InProgress);
    expect(res.created_on).not.toBeNull();
    expect(res.id).not.toBeNull();
    expect(res.failure).toBeUndefined();
}, 30000);