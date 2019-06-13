import axios from 'axios';
import { RevAiApiClient } from '../src/api-client';
import {
    setupFakeApiError,
    setupFakeInvalidStateError,
    setupFakeInsufficientCreditsError,
    setupFakeInvalidParametersError
} from './testhelpers';
import {
    RevAiApiError,
    InvalidParameterError,
    InvalidStateError,
    InsufficientCreditsError
} from '../src/models/RevAiApiError';

const fs = require('fs');
const FormData = require('form-data');
jest.mock('axios');

describe('api-client', () => {
    const mockedAxios = axios as jest.Mocked<typeof axios>;
    const sut = new RevAiApiClient('testtoken');
    const jobId = 'Umx5c6F7pH7r';
    const otherJobId = 'EMx5c67p3dr';
    const mediaUrl = 'https://support.rev.com/hc/en-us/article_attachments/200043975/FTC_Sample_1_-_Single.mp3';
    const jobDetails = {
        id: jobId,
        status: 'in_progress',
        created_on: '2018-05-05T23:23:22.29Z'
    }
    const filename = 'path/to/test.mp3';

    beforeEach(() => {
        mockedAxios.get.mockReset();
        mockedAxios.post.mockReset();
        mockedAxios.delete.mockReset();
        fs.writeFile.mockReset();
    });

    describe('getAccount', () => {
        afterEach(() => {
            expect(mockedAxios.get).toBeCalledWith('/account');
            expect(mockedAxios.get).toBeCalledTimes(1);
        });

        it('get account email and balance', async () => {
            const accountEmail = 'test@rev.com';
            const balanceSeconds = 300;
            const data = { email: accountEmail, balance_seconds: balanceSeconds};
            const resp = { data: data };
            mockedAxios.get.mockResolvedValue(resp);

            const account = await sut.getAccount();

            expect(account).toEqual(data);
        });

        it('handles when api returns unauthorized', async () => {
            const fakeError = setupFakeApiError(401, "Unauthorized");
            mockedAxios.get.mockImplementation(() => Promise.reject(fakeError));

            try {
                await sut.getAccount();
            }

            catch (e) {
                expect(e).toEqual(new RevAiApiError(fakeError));
            }
        });
    });

    describe('getJobDetails', () => {
        afterEach(() => {
            expect(mockedAxios.get).toBeCalledWith(`/jobs/${jobId}`);
            expect(mockedAxios.get).toBeCalledTimes(1);
        })

        it('get job by id', async () => {
            const resp = { data: jobDetails };
            mockedAxios.get.mockResolvedValue(resp);

            const job = await sut.getJobDetails(jobId);

            expect(job).toEqual(jobDetails);
        });

        it('handles when api returns unauthorized', async () => {
            const fakeError = setupFakeApiError(401, "Unauthorized");
            mockedAxios.get.mockImplementation(() => Promise.reject(fakeError));

            try {
                await sut.getJobDetails(jobId);
            }

            catch (e) {
                expect(e).toEqual(new RevAiApiError(fakeError));
            }
        });

        it('handles when api returns jobnotfound', async () => {
            const fakeError = setupFakeApiError(404, "Job not found");
            mockedAxios.get.mockImplementation(() => Promise.reject(fakeError));

            try {
                await sut.getJobDetails(jobId);
            }

            catch (e) {
                expect(e).toEqual(new RevAiApiError(fakeError));
            }
        });
    });

    describe('getListOfJobs', () => {
        afterEach(() => {
            expect(mockedAxios.get).toBeCalledTimes(1);
        })

        it('get list of jobs', async () => {
            const resp = { data: [jobDetails] };
            mockedAxios.get.mockResolvedValue(resp);

            const jobs = await sut.getListOfJobs();

            expect(jobs).toEqual([jobDetails]);
            expect(mockedAxios.get).toBeCalledWith('/jobs');
        });

        it('get list of jobs with limit of 5', async () => {
            const jobDetails2 = {
                id: otherJobId,
                status: 'transcribed',
                created_on: '2013-05-05T23:23:22.29Z'
            };
            const resp = { data: [jobDetails, jobDetails2] };
            mockedAxios.get.mockResolvedValue(resp);

            const jobs = await sut.getListOfJobs(5);

            expect(jobs).toEqual([jobDetails, jobDetails2]);
            expect(mockedAxios.get).toBeCalledWith('/jobs?limit=5');
        });

        it('get list of jobs starting after certain job id', async () => {
            const resp = { data: [jobDetails] };
            mockedAxios.get.mockResolvedValue(resp);

            const jobs = await sut.getListOfJobs(undefined, otherJobId);

            expect(jobs).toEqual([jobDetails]);
            expect(mockedAxios.get).toBeCalledWith(`/jobs?starting_after=${otherJobId}`);
        });

        it('get list of jobs with limit of 5 and starting after certain job id', async () => {
            const limit = 5;
            const jobDetails2 = {
                id: otherJobId,
                status: 'transcribed',
                created_on: '2013-05-05T23:23:22.29Z'
            };
            const resp = { data: [jobDetails, jobDetails2] };
            mockedAxios.get.mockResolvedValue(resp);

            const jobs = await sut.getListOfJobs(limit, otherJobId);

            expect(jobs).toEqual([jobDetails, jobDetails2]);
            expect(mockedAxios.get).toBeCalledWith(`/jobs?limit=${limit}&starting_after=${otherJobId}`);
        });

        it('handles when api returns invalid parameters', async () => {
            const fakeError = setupFakeInvalidParametersError();
            mockedAxios.get.mockImplementation(() => Promise.reject(fakeError));

            try {
                await sut.getListOfJobs(-1);
            }

            catch (e) {
                expect(e).toEqual(new InvalidParameterError(fakeError));
            }
            expect(mockedAxios.get).toBeCalledWith('/jobs?limit=-1');
        });

        it('handles when api returns unauthorized', async () => {
            const fakeError = setupFakeApiError(401, "Unauthorized");
            mockedAxios.get.mockImplementation(() => Promise.reject(fakeError));

            try {
                await sut.getListOfJobs();
            }

            catch (e) {
                expect(e).toEqual(new RevAiApiError(fakeError));
            }
            expect(mockedAxios.get).toBeCalledWith('/jobs');
        });
    });

    describe('deleteJob', () => {
        afterEach(() => {
            expect(mockedAxios.delete).toBeCalledWith(`/jobs/${jobId}`);
            expect(mockedAxios.delete).toBeCalledTimes(1);
        })

        it('delete job by id', async () => {
            mockedAxios.delete.mockResolvedValue({});

            await sut.deleteJob(jobId);
        });

        it('handles when api returns unauthorized', async () => {
            const fakeError = setupFakeApiError(401, "Unauthorized");
            mockedAxios.delete.mockImplementation(() => Promise.reject(fakeError));

            try {
                await sut.deleteJob(jobId);
            }

            catch (e) {
                expect(e).toEqual(new RevAiApiError(fakeError));
            }
        });

        it('handles when api returns jobnotfound', async () => {
            const fakeError = setupFakeApiError(404, "Job not found");
            mockedAxios.delete.mockImplementation(() => Promise.reject(fakeError));

            try {
                await sut.deleteJob(jobId);
            }

            catch (e) {
                expect(e).toEqual(new RevAiApiError(fakeError));
            }
        });

        it('handles when api returns invalid state', async () => {
            const fakeError = setupFakeInvalidStateError();
            mockedAxios.delete.mockImplementation(() => Promise.reject(fakeError));

            try {
                await sut.deleteJob(jobId);
            }

            catch (e) {
                expect(e).toEqual(new InvalidStateError(fakeError));
            }
        });
    });

    describe('submitJobUrl', () => {
        afterEach(() => {
            expect(mockedAxios.post).toBeCalledTimes(1);
        });

        it('submit job with media url without options', async () => {
            const resp = { data: jobDetails };
            mockedAxios.post.mockResolvedValue(resp);

            const job = await sut.submitJobUrl(mediaUrl);

            expect(mockedAxios.post).toBeCalledWith('/jobs', { media_url: mediaUrl }, {
                headers: { 'Content-Type': 'application/json' }
            });
            expect(job).toEqual(jobDetails);
        });

        it('submit job with media url with options', async () => {
            const resp = { data: jobDetails };
            mockedAxios.post.mockResolvedValue(resp);
            const options = {
                metadata: 'This is a sample submit jobs option',
                callback_url: 'https://www.example.com/callback',
                custom_vocabularies: [{phrases: ['word1', 'word2']}, {phrases: ['word3', 'word4']}]
            }

            const job = await sut.submitJobUrl(mediaUrl, options);

            expect(mockedAxios.post).toBeCalledWith('/jobs', options, {
                headers: { 'Content-Type': 'application/json' }
            });
            expect(job).toEqual(jobDetails);
        });

        it('handles when api returns unauthorized', async () => {
            const fakeError = setupFakeApiError(401, "Unauthorized");
            mockedAxios.post.mockImplementation(() => Promise.reject(fakeError));

            try {
                await sut.submitJobUrl(mediaUrl);
            }

            catch (e) {
                expect(e).toEqual(new RevAiApiError(fakeError));
            }
            expect(mockedAxios.post).toBeCalledWith('/jobs', { media_url: mediaUrl }, {
                headers: { 'Content-Type': 'application/json' }
            });
        });

        it('handles when api returns insufficient credits', async () => {
            const fakeError = setupFakeInsufficientCreditsError();
            mockedAxios.post.mockImplementation(() => Promise.reject(fakeError));

            try {
                await sut.submitJobUrl(mediaUrl);
            }

            catch (e) {
                expect(e).toEqual(new InsufficientCreditsError(fakeError));
            }
            expect(mockedAxios.post).toBeCalledWith('/jobs', { media_url: mediaUrl }, {
                headers: { 'Content-Type': 'application/json' }
            });
        });

        it('handles when api returns invalid parameters', async () => {
            const fakeError = setupFakeInvalidParametersError();
            mockedAxios.post.mockImplementation(() => Promise.reject(fakeError));

            try {
                await sut.submitJobUrl(mediaUrl);
            }

            catch (e) {
                expect(e).toEqual(new InvalidParameterError(fakeError));
            }
            expect(mockedAxios.post).toBeCalledWith('/jobs', { media_url: mediaUrl }, {
                headers: { 'Content-Type': 'application/json' }
            });
        });
    });

    describe('submitJobLocalFile', () => {
        afterEach(() => {
            expect(mockedAxios.post).toBeCalledTimes(1);
        });

        it('submit job with local file without options', async () => {
            const resp = { data: jobDetails };
            mockedAxios.post.mockResolvedValue(resp);

            const job = await sut.submitJobLocalFile(filename);

            const expectedPayload = expect.objectContaining({
                '_boundary': expect.anything(),
                '_streams': expect.anything()
            });
            const expectedHeader = { 'content-type': expect.stringMatching(/multipart\/form-data; boundary=.+/) };
            expect(mockedAxios.post).toBeCalledWith('/jobs', expectedPayload, { headers: expectedHeader });
            expect(job).toEqual(jobDetails);
        });

        it('submit job with local file with options', async () => {
            const resp = { data: jobDetails };
            mockedAxios.post.mockResolvedValue(resp);
            const options = {
                metadata: 'This is a sample submit jobs option',
                callback_url: 'https://www.example.com/callback',
                custom_vocabularies: [{phrases: ['word1', 'word2']}, {phrases: ['word3', 'word4']}]
            };
            const expectedPayload = expect.objectContaining({
                '_boundary': expect.anything(),
                '_streams': expect.arrayContaining([expect.anything(), expect.anything(),
                    '{"metadata":"This is a sample submit jobs option","callback_url":"https://www.example.com/callback","custom_vocabularies":[{"phrases":["word1","word2"]},{"phrases":["word3","word4"]}]}'])
            });
            const expectedHeader = { 'content-type': expect.stringMatching(/multipart\/form-data; boundary=.+/) };

            const job = await sut.submitJobLocalFile(filename, options);

            expect(mockedAxios.post).toBeCalledWith('/jobs', expectedPayload, { headers: expectedHeader });
            expect(job).toEqual(jobDetails);
        });

        it('handles when api returns unauthorized', async () => {
            const fakeError = setupFakeApiError(401, "Unauthorized");
            mockedAxios.post.mockImplementation(() => Promise.reject(fakeError));
            const expectedPayload = expect.objectContaining({
                '_boundary': expect.anything(),
                '_streams': expect.anything()
            });
            const expectedHeader = { 'content-type': expect.stringMatching(/multipart\/form-data; boundary=.+/) };

            try {
                await sut.submitJobLocalFile(filename);
            }

            catch (e) {
                expect(e).toEqual(new RevAiApiError(fakeError));
            }
            expect(mockedAxios.post).toBeCalledWith('/jobs', expectedPayload, { headers: expectedHeader });
        });

        it('handles when api returns insufficient credits', async () => {
            const fakeError = setupFakeInsufficientCreditsError();
            mockedAxios.post.mockImplementation(() => Promise.reject(fakeError));
            const expectedPayload = expect.objectContaining({
                '_boundary': expect.anything(),
                '_streams': expect.anything()
            });
            const expectedHeader = { 'content-type': expect.stringMatching(/multipart\/form-data; boundary=.+/) };

            try {
                await sut.submitJobLocalFile(filename);
            }

            catch (e) {
                expect(e).toEqual(new InsufficientCreditsError(fakeError));
            }
            expect(mockedAxios.post).toBeCalledWith('/jobs', expectedPayload, { headers: expectedHeader });
        });

        it('handles when api returns invalid parameters', async () => {
            const fakeError = setupFakeInvalidParametersError();
            mockedAxios.post.mockImplementation(() => Promise.reject(fakeError));
            const expectedPayload = expect.objectContaining({
                '_boundary': expect.anything(),
                '_streams': expect.anything()
            });
            const expectedHeader = { 'content-type': expect.stringMatching(/multipart\/form-data; boundary=.+/) };

            try {
                await sut.submitJobLocalFile(filename);
            }

            catch (e) {
                expect(e).toEqual(new InvalidParameterError(fakeError));
            }
            expect(mockedAxios.post).toBeCalledWith('/jobs', expectedPayload, { headers: expectedHeader });
        });
    });

    describe('getTranscriptObject', () => {
        const expectedTranscript = {
                "monologues": [
                    {
                        "speaker": 1,
                        "elements": [
                            {
                            "type": "text",
                            "value": "Hello",
                            "ts": 0.5,
                            "end_ts": 1.5,
                            "confidence": 1
                            },
                            {
                            "type": "text",
                            "value": "World",
                            "ts": 1.75,
                            "end_ts": 2.85,
                            "confidence": 0.8
                            },
                            {
                            "type": "punct",
                            "value": "."
                            }
                        ]
                    }
                ]
            };
        afterEach(() => {
            expect(mockedAxios.get).toBeCalledWith(`/jobs/${jobId}/transcript`, {
                headers: { 'Accept': `application/vnd.rev.transcript.v1.0+json` }
            });
            expect(mockedAxios.get).toBeCalledTimes(1);
        });

        it('get transcript object', async () => {
            const resp = { data: expectedTranscript };
            mockedAxios.get.mockResolvedValue(resp);

            const transcript = await sut.getTranscriptObject(jobId);

            expect(fs.writeFile).toBeCalledTimes(0);
            expect(transcript).toEqual(expectedTranscript);
        });

        it ('writes file when given filename', async () => {
            const expectedFilename = 'exampleFilename.json';
            const resp = { data: expectedTranscript }
            mockedAxios.get.mockResolvedValue(resp);

            const transcript = await sut.getTranscriptObject(jobId, expectedFilename);

            expect(fs.writeFile).toBeCalledTimes(1);
            expect(fs.writeFile).toBeCalledWith(`${expectedFilename}`, JSON.stringify(resp.data, null, 4), expect.anything());
            expect(transcript).toEqual(expectedTranscript);
        });

        it ('writes to path when given filename and path', async () => {
            const expectedDir = './exampleDir/exampleFilename.json';
            const resp = { data: expectedTranscript }
            mockedAxios.get.mockResolvedValue(resp);

            const transcript = await sut.getTranscriptObject(jobId, expectedDir);

            expect(fs.writeFile).toBeCalledTimes(1);
            expect(fs.writeFile).toBeCalledWith(
                expect.stringMatching(/exampleDir.*exampleFilename.json/),
                JSON.stringify(resp.data, null, 4), expect.anything()
            );
            expect(transcript).toEqual(expectedTranscript);
        });

        it('handles when api returns unauthorized', async () => {
            const fakeError = setupFakeApiError(401, "Unauthorized");
            mockedAxios.get.mockImplementation(() => Promise.reject(fakeError));

            try {
                await sut.getTranscriptObject(jobId);
            }

            catch (e) {
                expect(e).toEqual(new RevAiApiError(fakeError));
            }
        });

        it('handles when api returns jobnotfound', async () => {
            const fakeError = setupFakeApiError(404, "Job not found");
            mockedAxios.get.mockImplementation(() => Promise.reject(fakeError));

            try {
                await sut.getTranscriptObject(jobId);
            }

            catch (e) {
                expect(e).toEqual(new RevAiApiError(fakeError));
            }
        });

        it('handles when api returns invalid state', async () => {
            const fakeError = setupFakeInvalidStateError();
            mockedAxios.get.mockImplementation(() => Promise.reject(fakeError));

            try {
                await sut.getTranscriptObject(jobId);
            }

            catch (e) {
                expect(e).toEqual(new InvalidStateError(fakeError));
            }
        });
    })

    describe('getTranscriptText', () => {
        afterEach(() => {
            expect(mockedAxios.get).toBeCalledWith(`/jobs/${jobId}/transcript`, {
                headers: { 'Accept': 'text/plain' }
            });
            expect(mockedAxios.get).toBeCalledTimes(1);
        });

        it('get transcript text', async () => {
            const expectedTranscript = 'Speaker 0    00:00    Hello World.'
            const resp = { data: expectedTranscript }
            mockedAxios.get.mockResolvedValue(resp);

            const transcript = await sut.getTranscriptText(jobId);

            expect(fs.writeFile).toBeCalledTimes(0);
            expect(transcript).toEqual(expectedTranscript);
        });

        it ('writes file when given filename', async () => {
            const expectedFilename = 'exampleFilename.txt';
            const expectedTranscript = 'Speaker 0    00:00    Hello World.'
            const resp = { data: expectedTranscript }
            mockedAxios.get.mockResolvedValue(resp);

            const transcript = await sut.getTranscriptText(jobId, expectedFilename);

            expect(fs.writeFile).toBeCalledTimes(1);
            expect(fs.writeFile).toBeCalledWith(`${expectedFilename}`, resp.data, expect.anything());
            expect(transcript).toEqual(expectedTranscript);
        });

        it ('writes to path when given filename and path', async () => {
            const expectedDir = './exampleDir/exampleFilename.txt';
            const expectedTranscript = 'Speaker 0    00:00    Hello World.'
            const resp = { data: expectedTranscript }
            mockedAxios.get.mockResolvedValue(resp);

            const transcript = await sut.getTranscriptText(jobId, expectedDir);

            expect(fs.writeFile).toBeCalledTimes(1);
            expect(fs.writeFile).toBeCalledWith(
                expect.stringMatching(/exampleDir.*exampleFilename.txt/),
                resp.data, expect.anything()
            );
            expect(transcript).toEqual(expectedTranscript);
        });

        it('handles when api returns unauthorized', async () => {
            const fakeError = setupFakeApiError(401, "Unauthorized");
            mockedAxios.get.mockImplementation(() => Promise.reject(fakeError));

            try {
                await sut.getTranscriptText(jobId);
            }

            catch (e) {
                expect(e).toEqual(new RevAiApiError(fakeError));
            }
        });

        it('handles when api returns jobnotfound', async () => {
            const fakeError = setupFakeApiError(404, "Job not found");
            mockedAxios.get.mockImplementation(() => Promise.reject(fakeError));

            try {
                await sut.getTranscriptText(jobId);
            }

            catch (e) {
                expect(e).toEqual(new RevAiApiError(fakeError));
            }
        });

        it('handles when api returns invalid state', async () => {
            const fakeError = setupFakeInvalidStateError();
            mockedAxios.get.mockImplementation(() => Promise.reject(fakeError));

            try {
                await sut.getTranscriptText(jobId);
            }

            catch (e) {
                expect(e).toEqual(new InvalidStateError(fakeError));
            }
        });
    });

    describe('getCaptions', () => {
        afterEach(() => {
            expect(mockedAxios.get).toBeCalledWith(`/jobs/${jobId}/captions`, {
                headers: { 'Accept': 'application/x-subrip' }
            });
            expect(mockedAxios.get).toBeCalledTimes(1);
        });

        it('get captions', async () => {
            const expectedTranscript = '1\n00:00:00,000 --> 00:00:05,000\nHello World.'
            const resp = { data: expectedTranscript }
            mockedAxios.get.mockResolvedValue(resp);

            const transcript = await sut.getCaptions(jobId);

            expect(fs.writeFile).toBeCalledTimes(0);
            expect(transcript).toEqual(expectedTranscript);
        })

        it ('writes file when given filename', async () => {
            const expectedFilename = 'exampleFilename.srt';
            const expectedTranscript = '1\n00:00:00,000 --> 00:00:05,000\nHello World.'
            const resp = { data: expectedTranscript }
            mockedAxios.get.mockResolvedValue(resp);

            const transcript = await sut.getCaptions(jobId, expectedFilename);

            expect(fs.writeFile).toBeCalledTimes(1);
            expect(fs.writeFile).toBeCalledWith(`${expectedFilename}`, resp.data, expect.anything());
            expect(transcript).toEqual(expectedTranscript);
        });

        it ('writes to path when given filename and path', async () => {
            const expectedDir = './exampleDir/exampleFilename.srt';
            const expectedTranscript = '1\n00:00:00,000 --> 00:00:05,000\nHello World.'
            const resp = { data: expectedTranscript }
            mockedAxios.get.mockResolvedValue(resp);

            const transcript = await sut.getCaptions(jobId, expectedDir);

            expect(fs.writeFile).toBeCalledTimes(1);
            expect(fs.writeFile).toBeCalledWith(
                expect.stringMatching(/exampleDir.*exampleFilename.srt/),
                resp.data, expect.anything()
            );
            expect(transcript).toEqual(expectedTranscript);
        });

        it('handles when api returns unauthorized', async () => {
            const fakeError = setupFakeApiError(401, "Unauthorized");
            mockedAxios.get.mockImplementation(() => Promise.reject(fakeError));

            try {
                await sut.getCaptions(jobId);
            }

            catch (e) {
                expect(e).toEqual(new RevAiApiError(fakeError));
            }
        });

        it('handles when api returns jobnotfound', async () => {
            const fakeError = setupFakeApiError(404, "Job not found");
            mockedAxios.get.mockImplementation(() => Promise.reject(fakeError));

            try {
                await sut.getCaptions(jobId);
            }

            catch (e) {
                expect(e).toEqual(new RevAiApiError(fakeError));
            }
        });

        it('handles when api returns invalid state', async () => {
            const fakeError = setupFakeInvalidStateError();
            mockedAxios.get.mockImplementation(() => Promise.reject(fakeError));

            try {
                await sut.getCaptions(jobId);
            }

            catch (e) {
                expect(e).toEqual(new InvalidStateError(fakeError));
            }
        });
    });
});
