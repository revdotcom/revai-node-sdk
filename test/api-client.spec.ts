import axios from 'axios';
import { RevAiApiClient } from '../src/api-client';
import { RevAiApiTranscript } from '../src/models/RevAiApiTranscript';
import {
    objectToStream,
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

describe('api-client', () => {
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
    /*
    beforeEach(() => {
        axios.get.mockReset();
        axios.post.mockReset();
        axios.delete.mockReset();
    });

    describe('getAccount', () => {
        afterEach(() => {
            expect(axios.get).toBeCalledWith('/account');
            expect(axios.get).toBeCalledTimes(1);
        });

        it.only('get account email and balance', async () => {
            const accountEmail = 'test@rev.com';
            const balanceSeconds = 300;
            const data = { email: accountEmail, balance_seconds: balanceSeconds};
            const resp = { data: data };
            axios.get.mockResolvedValue(resp);

            const account = await sut.getAccount();

            expect(account).toEqual(data);
        });

        it('handles when api returns unauthorized', async () => {
            const fakeError = setupFakeApiError(401, "Unauthorized");
            axios.get.mockImplementation(() => Promise.reject(fakeError));

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
            expect(axios.get).toBeCalledWith(`/jobs/${jobId}`);
            expect(axios.get).toBeCalledTimes(1);
        })

        it('get job by id', async () => {
            const resp = { data: jobDetails };
            axios.get.mockResolvedValue(resp);

            const job = await sut.getJobDetails(jobId);

            expect(job).toEqual(jobDetails);
        });

        it('handles when api returns unauthorized', async () => {
            const fakeError = setupFakeApiError(401, "Unauthorized");
            axios.get.mockImplementation(() => Promise.reject(fakeError));

            try {
                await sut.getJobDetails(jobId);
            }

            catch (e) {
                expect(e).toEqual(new RevAiApiError(fakeError));
            }
        });

        it('handles when api returns jobnotfound', async () => {
            const fakeError = setupFakeApiError(404, "Job not found");
            axios.get.mockImplementation(() => Promise.reject(fakeError));

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
            expect(axios.get).toBeCalledTimes(1);
        })

        it('get list of jobs', async () => {
            const resp = { data: [jobDetails] };
            axios.get.mockResolvedValue(resp);

            const jobs = await sut.getListOfJobs();

            expect(jobs).toEqual([jobDetails]);
            expect(axios.get).toBeCalledWith('/jobs');
        });

        it('get list of jobs with limit of 5', async () => {
            const jobDetails2 = {
                id: otherJobId,
                status: 'transcribed',
                created_on: '2013-05-05T23:23:22.29Z'
            };
            const resp = { data: [jobDetails, jobDetails2] };
            axios.get.mockResolvedValue(resp);

            const jobs = await sut.getListOfJobs(5);

            expect(jobs).toEqual([jobDetails, jobDetails2]);
            expect(axios.get).toBeCalledWith('/jobs?limit=5');
        });

        it('get list of jobs starting after certain job id', async () => {
            const resp = { data: [jobDetails] };
            axios.get.mockResolvedValue(resp);

            const jobs = await sut.getListOfJobs(undefined, otherJobId);

            expect(jobs).toEqual([jobDetails]);
            expect(axios.get).toBeCalledWith(`/jobs?starting_after=${otherJobId}`);
        });

        it('get list of jobs with limit of 5 and starting after certain job id', async () => {
            const limit = 5;
            const jobDetails2 = {
                id: otherJobId,
                status: 'transcribed',
                created_on: '2013-05-05T23:23:22.29Z'
            };
            const resp = { data: [jobDetails, jobDetails2] };
            axios.get.mockResolvedValue(resp);

            const jobs = await sut.getListOfJobs(limit, otherJobId);

            expect(jobs).toEqual([jobDetails, jobDetails2]);
            expect(axios.get).toBeCalledWith(`/jobs?limit=${limit}&starting_after=${otherJobId}`);
        });

        it('handles when api returns invalid parameters', async () => {
            const fakeError = setupFakeInvalidParametersError();
            axios.get.mockImplementation(() => Promise.reject(fakeError));

            try {
                await sut.getListOfJobs(-1);
            }

            catch (e) {
                expect(e).toEqual(new InvalidParameterError(fakeError));
            }
            expect(axios.get).toBeCalledWith('/jobs?limit=-1');
        });

        it('handles when api returns unauthorized', async () => {
            const fakeError = setupFakeApiError(401, "Unauthorized");
            axios.get.mockImplementation(() => Promise.reject(fakeError));

            try {
                await sut.getListOfJobs();
            }

            catch (e) {
                expect(e).toEqual(new RevAiApiError(fakeError));
            }
            expect(axios.get).toBeCalledWith('/jobs');
        });
    });

    describe('deleteJob', () => {
        afterEach(() => {
            expect(axios.delete).toBeCalledWith(`/jobs/${jobId}`);
            expect(axios.delete).toBeCalledTimes(1);
        })

        it('delete job by id', async () => {
            axios.delete.mockResolvedValue({});

            await sut.deleteJob(jobId);
        });

        it('handles when api returns unauthorized', async () => {
            const fakeError = setupFakeApiError(401, "Unauthorized");
            axios.delete.mockImplementation(() => Promise.reject(fakeError));

            try {
                await sut.deleteJob(jobId);
            }

            catch (e) {
                expect(e).toEqual(new RevAiApiError(fakeError));
            }
        });

        it('handles when api returns jobnotfound', async () => {
            const fakeError = setupFakeApiError(404, "Job not found");
            axios.delete.mockImplementation(() => Promise.reject(fakeError));

            try {
                await sut.deleteJob(jobId);
            }

            catch (e) {
                expect(e).toEqual(new RevAiApiError(fakeError));
            }
        });

        it('handles when api returns invalid state', async () => {
            const fakeError = setupFakeInvalidStateError();
            axios.delete.mockImplementation(() => Promise.reject(fakeError));

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
            expect(axios.post).toBeCalledTimes(1);
        });

        it('submit job with media url without options', async () => {
            const resp = { data: jobDetails };
            axios.post.mockResolvedValue(resp);

            const job = await sut.submitJobUrl(mediaUrl);

            expect(axios.post).toBeCalledWith('/jobs', { media_url: mediaUrl }, {
                headers: { 'Content-Type': 'application/json' }
            });
            expect(job).toEqual(jobDetails);
        });

        it('submit job with media url with options', async () => {
            const resp = { data: jobDetails };
            axios.post.mockResolvedValue(resp);
            const options = {
                metadata: 'This is a sample submit jobs option',
                callback_url: 'https://www.example.com/callback',
                custom_vocabularies: [{phrases: ['word1', 'word2']}, {phrases: ['word3', 'word4']}]
            }

            const job = await sut.submitJobUrl(mediaUrl, options);

            expect(axios.post).toBeCalledWith('/jobs', options, {
                headers: { 'Content-Type': 'application/json' }
            });
            expect(job).toEqual(jobDetails);
        });

        it('handles when api returns unauthorized', async () => {
            const fakeError = setupFakeApiError(401, "Unauthorized");
            axios.post.mockImplementation(() => Promise.reject(fakeError));

            try {
                await sut.submitJobUrl(mediaUrl);
            }

            catch (e) {
                expect(e).toEqual(new RevAiApiError(fakeError));
            }
            expect(axios.post).toBeCalledWith('/jobs', { media_url: mediaUrl }, {
                headers: { 'Content-Type': 'application/json' }
            });
        });

        it('handles when api returns insufficient credits', async () => {
            const fakeError = setupFakeInsufficientCreditsError();
            axios.post.mockImplementation(() => Promise.reject(fakeError));

            try {
                await sut.submitJobUrl(mediaUrl);
            }

            catch (e) {
                expect(e).toEqual(new InsufficientCreditsError(fakeError));
            }
            expect(axios.post).toBeCalledWith('/jobs', { media_url: mediaUrl }, {
                headers: { 'Content-Type': 'application/json' }
            });
        });

        it('handles when api returns invalid parameters', async () => {
            const fakeError = setupFakeInvalidParametersError();
            axios.post.mockImplementation(() => Promise.reject(fakeError));

            try {
                await sut.submitJobUrl(mediaUrl);
            }

            catch (e) {
                expect(e).toEqual(new InvalidParameterError(fakeError));
            }
            expect(axios.post).toBeCalledWith('/jobs', { media_url: mediaUrl }, {
                headers: { 'Content-Type': 'application/json' }
            });
        });
    });

    describe('submitJobLocalFile', () => {
        afterEach(() => {
            expect(axios.post).toBeCalledTimes(1);
        });

        it('submit job with local file without options', async () => {
            const resp = { data: jobDetails };
            axios.post.mockResolvedValue(resp);

            const job = await sut.submitJobLocalFile(filename);

            const expectedPayload = expect.objectContaining({
                '_boundary': expect.anything(),
                '_streams': expect.arrayContaining([expect.stringContaining('Content-Type: audio/mpeg'),
                    expect.stringContaining('Content-Disposition: form-data; name="media"; filename="test.mp3"')])
            });
            const expectedHeader = { 'content-type': expect.stringMatching(/multipart\/form-data; boundary=.+/) };
            expect(axios.post).toBeCalledWith('/jobs', expectedPayload, { headers: expectedHeader });
            expect(job).toEqual(jobDetails);
        });

        it('submit job with local file with options', async () => {
            const resp = { data: jobDetails };
            axios.post.mockResolvedValue(resp);
            const options = {
                metadata: 'This is a sample submit jobs option',
                callback_url: 'https://www.example.com/callback',
                custom_vocabularies: [{phrases: ['word1', 'word2']}, {phrases: ['word3', 'word4']}]
            };
            const expectedPayload = expect.objectContaining({
                '_boundary': expect.anything(),
                '_streams': expect.arrayContaining([expect.stringContaining('Content-Type: audio/mpeg'),
                    expect.stringContaining('Content-Disposition: form-data; name="media"; filename="test.mp3"'),
                    '{"metadata":"This is a sample submit jobs option","callback_url":"https://www.example.com/callback","custom_vocabularies":[{"phrases":["word1","word2"]},{"phrases":["word3","word4"]}]}'])
            });
            const expectedHeader = { 'content-type': expect.stringMatching(/multipart\/form-data; boundary=.+/) };

            const job = await sut.submitJobLocalFile(filename, options);

            expect(axios.post).toBeCalledWith('/jobs', expectedPayload, { headers: expectedHeader });
            expect(job).toEqual(jobDetails);
        });

        it('handles when api returns unauthorized', async () => {
            const fakeError = setupFakeApiError(401, "Unauthorized");
            axios.post.mockImplementation(() => Promise.reject(fakeError));
            const expectedPayload = expect.objectContaining({
                '_boundary': expect.anything(),
                '_streams': expect.arrayContaining([expect.stringContaining('Content-Type: audio/mpeg'),
                    expect.stringContaining('Content-Disposition: form-data; name=\"media\"; filename=\"test.mp3\"')])
            });
            const expectedHeader = { 'content-type': expect.stringMatching(/multipart\/form-data; boundary=.+/) };

            try {
                await sut.submitJobLocalFile(filename);
            }

            catch (e) {
                expect(e).toEqual(new RevAiApiError(fakeError));
            }
            expect(axios.post).toBeCalledWith('/jobs', expectedPayload, { headers: expectedHeader });
        });

        it('handles when api returns insufficient credits', async () => {
            const fakeError = setupFakeInsufficientCreditsError();
            axios.post.mockImplementation(() => Promise.reject(fakeError));
            const expectedPayload = expect.objectContaining({
                '_boundary': expect.anything(),
                '_streams': expect.arrayContaining([expect.stringContaining('Content-Type: audio/mpeg'),
                    expect.stringContaining('Content-Disposition: form-data; name=\"media\"; filename=\"test.mp3\"')])
            });
            const expectedHeader = { 'content-type': expect.stringMatching(/multipart\/form-data; boundary=.+/) };

            try {
                await sut.submitJobLocalFile(filename);
            }

            catch (e) {
                expect(e).toEqual(new InsufficientCreditsError(fakeError));
            }
            expect(axios.post).toBeCalledWith('/jobs', expectedPayload, { headers: expectedHeader });
        });

        it('handles when api returns invalid parameters', async () => {
            const fakeError = setupFakeInvalidParametersError();
            axios.post.mockImplementation(() => Promise.reject(fakeError));
            const expectedPayload = expect.objectContaining({
                '_boundary': expect.anything(),
                '_streams': expect.arrayContaining([expect.stringContaining('Content-Type: audio/mpeg'),
                    expect.stringContaining('Content-Disposition: form-data; name=\"media\"; filename=\"test.mp3\"')])
            });
            const expectedHeader = { 'content-type': expect.stringMatching(/multipart\/form-data; boundary=.+/) };

            try {
                await sut.submitJobLocalFile(filename);
            }

            catch (e) {
                expect(e).toEqual(new InvalidParameterError(fakeError));
            }
            expect(axios.post).toBeCalledWith('/jobs', expectedPayload, { headers: expectedHeader });
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
            expect(axios.get).toBeCalledWith(`/jobs/${jobId}/transcript`, {
                responseType: 'json',
                headers: { 'Accept': `application/vnd.rev.transcript.v1.0+json` }
            });
            expect(axios.get).toBeCalledTimes(1);
        });

        it('get transcript object', async () => {
            const resp = { data: expectedTranscript };
            axios.get.mockResolvedValue(resp);

            const transcript = await sut.getTranscriptObject(jobId);

            expect(transcript).toEqual(expectedTranscript);
        });

        it('handles when api returns unauthorized', async () => {
            const fakeError = setupFakeApiError(401, "Unauthorized");
            axios.get.mockImplementation(() => Promise.reject(fakeError));

            try {
                await sut.getTranscriptObject(jobId);
            }

            catch (e) {
                expect(e).toEqual(new RevAiApiError(fakeError));
            }
        });

        it('handles when api returns jobnotfound', async () => {
            const fakeError = setupFakeApiError(404, "Job not found");
            axios.get.mockImplementation(() => Promise.reject(fakeError));

            try {
                await sut.getTranscriptObject(jobId);
            }

            catch (e) {
                expect(e).toEqual(new RevAiApiError(fakeError));
            }
        });

        it('handles when api returns invalid state', async () => {
            const fakeError = setupFakeInvalidStateError();
            axios.get.mockImplementation(() => Promise.reject(fakeError));

            try {
                await sut.getTranscriptObject(jobId);
            }

            catch (e) {
                expect(e).toEqual(new InvalidStateError(fakeError));
            }
        });
    });

    describe('getTranscriptObjectStream', () => {
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
            expect(axios.get).toBeCalledWith(`/jobs/${jobId}/transcript`, {
                responseType: 'stream',
                headers: { 'Accept': `application/vnd.rev.transcript.v1.0+json` }
            });
            expect(axios.get).toBeCalledTimes(1);
        });

        it('get transcript object', async () => {
            const resp = { data: objectToStream(expectedTranscript) };
            axios.get.mockResolvedValue(resp);

            const transcript = await sut.getTranscriptObjectStream(jobId);

            expect(transcript.read()).toEqual(expectedTranscript);
        });

        it('handles when api returns unauthorized', async () => {
            const fakeError = setupFakeApiError(401, "Unauthorized");
            axios.get.mockImplementation(() => Promise.reject(fakeError));

            try {
                await sut.getTranscriptObjectStream(jobId);
            }

            catch (e) {
                expect(e).toEqual(new RevAiApiError(fakeError));
            }
        });

        it('handles when api returns jobnotfound', async () => {
            const fakeError = setupFakeApiError(404, "Job not found");
            axios.get.mockImplementation(() => Promise.reject(fakeError));

            try {
                await sut.getTranscriptObjectStream(jobId);
            }

            catch (e) {
                expect(e).toEqual(new RevAiApiError(fakeError));
            }
        });

        it('handles when api returns invalid state', async () => {
            const fakeError = setupFakeInvalidStateError();
            axios.get.mockImplementation(() => Promise.reject(fakeError));

            try {
                await sut.getTranscriptObjectStream(jobId);
            }

            catch (e) {
                expect(e).toEqual(new InvalidStateError(fakeError));
            }
        });
    });

    describe('getTranscriptText', () => {
        afterEach(() => {
            expect(axios.get).toBeCalledWith(`/jobs/${jobId}/transcript`, {
                responseType: 'text',
                headers: { 'Accept': 'text/plain' }
            });
            expect(axios.get).toBeCalledTimes(1);
        });

        it('get transcript text', async () => {
            const expectedTranscript = 'Speaker 0    00:00    Hello World.'
            const resp = { data: expectedTranscript }
            axios.get.mockResolvedValue(resp);

            const transcript = await sut.getTranscriptText(jobId);

            expect(transcript).toEqual(expectedTranscript);
        });

        it('handles when api returns unauthorized', async () => {
            const fakeError = setupFakeApiError(401, "Unauthorized");
            axios.get.mockImplementation(() => Promise.reject(fakeError));

            try {
                await sut.getTranscriptText(jobId);
            }

            catch (e) {
                expect(e).toEqual(new RevAiApiError(fakeError));
            }
        });

        it('handles when api returns jobnotfound', async () => {
            const fakeError = setupFakeApiError(404, "Job not found");
            axios.get.mockImplementation(() => Promise.reject(fakeError));

            try {
                await sut.getTranscriptText(jobId);
            }

            catch (e) {
                expect(e).toEqual(new RevAiApiError(fakeError));
            }
        });

        it('handles when api returns invalid state', async () => {
            const fakeError = setupFakeInvalidStateError();
            axios.get.mockImplementation(() => Promise.reject(fakeError));

            try {
                await sut.getTranscriptText(jobId);
            }

            catch (e) {
                expect(e).toEqual(new InvalidStateError(fakeError));
            }
        });
    });

    describe('getTranscriptTextStream', () => {
        afterEach(() => {
            expect(axios.get).toBeCalledWith(`/jobs/${jobId}/transcript`, {
                responseType: 'stream',
                headers: { 'Accept': 'text/plain' }
            });
            expect(axios.get).toBeCalledTimes(1);
        });

        it('get transcript text', async () => {
            const expectedTranscript = 'Speaker 0    00:00    Hello World.'
            const resp = { data: objectToStream(expectedTranscript) }
            axios.get.mockResolvedValue(resp);

            const transcript = await sut.getTranscriptTextStream(jobId);

            expect(transcript.read()).toEqual(expectedTranscript);
        });

        it('handles when api returns unauthorized', async () => {
            const fakeError = setupFakeApiError(401, "Unauthorized");
            axios.get.mockImplementation(() => Promise.reject(fakeError));

            try {
                await sut.getTranscriptTextStream(jobId);
            }

            catch (e) {
                expect(e).toEqual(new RevAiApiError(fakeError));
            }
        });

        it('handles when api returns jobnotfound', async () => {
            const fakeError = setupFakeApiError(404, "Job not found");
            axios.get.mockImplementation(() => Promise.reject(fakeError));

            try {
                await sut.getTranscriptTextStream(jobId);
            }

            catch (e) {
                expect(e).toEqual(new RevAiApiError(fakeError));
            }
        });

        it('handles when api returns invalid state', async () => {
            const fakeError = setupFakeInvalidStateError();
            axios.get.mockImplementation(() => Promise.reject(fakeError));

            try {
                await sut.getTranscriptTextStream(jobId);
            }

            catch (e) {
                expect(e).toEqual(new InvalidStateError(fakeError));
            }
        });
    });

    describe('getCaptions', () => {
        afterEach(() => {
            expect(axios.get).toBeCalledWith(`/jobs/${jobId}/captions`, {
                responseType: 'stream',
                headers: { 'Accept': 'application/x-subrip' }
            });
            expect(axios.get).toBeCalledTimes(1);
        });

        it('get captions', async () => {
            const expectedTranscript = '1\n00:00:00,000 --> 00:00:05,000\nHello World.'
            const resp = { data: objectToStream(expectedTranscript) }
            axios.get.mockResolvedValue(resp);

            const transcript = await sut.getCaptions(jobId);

            expect(transcript.read().toString()).toEqual(expectedTranscript);
        })

        it('handles when api returns unauthorized', async () => {
            const fakeError = setupFakeApiError(401, "Unauthorized");
            axios.get.mockImplementation(() => Promise.reject(fakeError));

            try {
                await sut.getCaptions(jobId);
            }

            catch (e) {
                expect(e).toEqual(new RevAiApiError(fakeError));
            }
        });

        it('handles when api returns jobnotfound', async () => {
            const fakeError = setupFakeApiError(404, "Job not found");
            axios.get.mockImplementation(() => Promise.reject(fakeError));

            try {
                await sut.getCaptions(jobId);
            }

            catch (e) {
                expect(e).toEqual(new RevAiApiError(fakeError));
            }
        });

        it('handles when api returns invalid state', async () => {
            const fakeError = setupFakeInvalidStateError();
            axios.get.mockImplementation(() => Promise.reject(fakeError));

            try {
                await sut.getCaptions(jobId);
            }

            catch (e) {
                expect(e).toEqual(new InvalidStateError(fakeError));
            }
        });
    });
    */
});
