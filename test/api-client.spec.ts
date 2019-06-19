import axios from 'axios';
import { RevAiApiClient } from '../src/api-client';
import { RevAiApiTranscript } from '../src/models/RevAiApiTranscript';
import { objectToStream } from './testhelpers';
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
    
    beforeEach(() => {
        axios.request.mockReset();
    });

    describe('getAccount', () => {
        it('get account email and balance', async () => {
            const accountEmail = 'test@rev.com';
            const balanceSeconds = 300;
            const data = { email: accountEmail, balance_seconds: balanceSeconds};
            const resp = { data: data };
            axios.request.mockResolvedValue(resp);

            const account = await sut.getAccount();

            expect(axios.request).toBeCalledWith({
                method: 'get',
                url: '/account',
                headers: {},
                responseType: 'json'
            });
            expect(axios.request).toBeCalledTimes(1);
            expect(account).toEqual(data);
        });
    });

    describe('getJobDetails', () => {
        it('get job by id', async () => {
            const resp = { data: jobDetails };
            axios.request.mockResolvedValue(resp);

            const job = await sut.getJobDetails(jobId);

            expect(axios.request).toBeCalledWith({
                method: 'get',
                url: `/jobs/${jobDetails.id}`,
                headers: {},
                responseType: 'json'
            });
            expect(axios.request).toBeCalledTimes(1);
            expect(job).toEqual(jobDetails);
        });
    });

    describe('getListOfJobs', () => {
        afterEach(() => {
            expect(axios.request).toBeCalledTimes(1);
        })

        it('get list of jobs', async () => {
            const resp = { data: [jobDetails] };
            axios.request.mockResolvedValue(resp);

            const jobs = await sut.getListOfJobs();

            expect(jobs).toEqual([jobDetails]);
            expect(axios.request).toBeCalledWith({
                method: 'get',
                url: `/jobs`,
                headers: {},
                responseType: 'json'
            });
        });

        it('get list of jobs with limit of 5', async () => {
            const jobDetails2 = {
                id: otherJobId,
                status: 'transcribed',
                created_on: '2013-05-05T23:23:22.29Z'
            };
            const resp = { data: [jobDetails, jobDetails2] };
            axios.request.mockResolvedValue(resp);

            const jobs = await sut.getListOfJobs(5);

            expect(jobs).toEqual([jobDetails, jobDetails2]);
            expect(axios.request).toBeCalledWith({
                method: 'get',
                url: '/jobs?limit=5',
                headers: {},
                responseType: 'json'
            });
        });

        it('get list of jobs starting after certain job id', async () => {
            const resp = { data: [jobDetails] };
            axios.request.mockResolvedValue(resp);

            const jobs = await sut.getListOfJobs(undefined, otherJobId);

            expect(jobs).toEqual([jobDetails]);
            expect(axios.request).toBeCalledWith({
                method: 'get',
                url: `/jobs?starting_after=${otherJobId}`,
                headers: {},
                responseType: 'json'
            });
        });

        it('get list of jobs with limit of 5 and starting after certain job id', async () => {
            const limit = 5;
            const jobDetails2 = {
                id: otherJobId,
                status: 'transcribed',
                created_on: '2013-05-05T23:23:22.29Z'
            };
            const resp = { data: [jobDetails, jobDetails2] };
            axios.request.mockResolvedValue(resp);

            const jobs = await sut.getListOfJobs(limit, otherJobId);

            expect(jobs).toEqual([jobDetails, jobDetails2]);
            expect(axios.request).toBeCalledWith({
                method: 'get',
                url: `/jobs?limit=${limit}&starting_after=${otherJobId}`,
                headers: {},
                responseType: 'json'
            });
        });
    });

    describe('deleteJob', () => {
        it('delete job by id', async () => {
            axios.request.mockResolvedValue({});

            await sut.deleteJob(jobId);

            expect(axios.request).toBeCalledWith({
                method: 'delete',
                url: `/jobs/${jobId}`,
                headers: {},
                responseType: 'text'
            );
            expect(axios.request).toBeCalledTimes(1);
        });
    });

    describe('submitJobUrl', () => {
        afterEach(() => {
            expect(axios.request).toBeCalledTimes(1);
        });

        it('submit job with media url without options', async () => {
            const resp = { data: jobDetails };
            axios.request.mockResolvedValue(resp);

            const job = await sut.submitJobUrl(mediaUrl);

            expect(axios.request).toBeCalledWith({
                method: 'post',
                url: '/jobs',
                headers: { 'Content-Type': 'application/json' },
                responseType: 'json',
                data: { media_url: mediaUrl }
            });
            expect(job).toEqual(jobDetails);
        });

        it('submit job with media url with options', async () => {
            const resp = { data: jobDetails };
            axios.request.mockResolvedValue(resp);
            const options = {
                metadata: 'This is a sample submit jobs option',
                callback_url: 'https://www.example.com/callback',
                custom_vocabularies: [{phrases: ['word1', 'word2']}, {phrases: ['word3', 'word4']}]
            }

            const job = await sut.submitJobUrl(mediaUrl, options);

            expect(axios.request).toBeCalledWith({
                method: 'post',
                url: '/jobs',
                headers: { 'Content-Type': 'application/json' },
                responseType: 'json',
                data: options
            });
            expect(job).toEqual(jobDetails);
        });
    });

    describe('submitJobLocalFile', () => {
        afterEach(() => {
            expect(axios.request).toBeCalledTimes(1);
        });

        it('submit job with local file without options', async () => {
            const resp = { data: jobDetails };
            axios.request.mockResolvedValue(resp);

            const job = await sut.submitJobLocalFile(filename);

            const expectedPayload = expect.objectContaining({
                '_boundary': expect.anything(),
                '_streams': expect.arrayContaining([expect.stringContaining('Content-Type: audio/mpeg'),
                    expect.stringContaining('Content-Disposition: form-data; name="media"; filename="test.mp3"')])
            });
            const expectedHeader = { 'content-type': expect.stringMatching(/multipart\/form-data; boundary=.+/) };
            expect(axios.request).toBeCalledWith({
                method: 'post',
                url: '/jobs',
                headers: expectedHeader
                responseType: 'json',
                data: expectedPayload
            });
            expect(job).toEqual(jobDetails);
        });

        it('submit job with local file with options', async () => {
            const resp = { data: jobDetails };
            axios.request.mockResolvedValue(resp);
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

            expect(axios.request).toBeCalledWith({
                method: 'post',
                url: '/jobs',
                headers: expectedHeader
                responseType: 'json',
                data: expectedPayload
            });
            expect(job).toEqual(jobDetails);
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

        it('get transcript object', async () => {
            const resp = { data: expectedTranscript };
            axios.request.mockResolvedValue(resp);

            const transcript = await sut.getTranscriptObject(jobId);

            expect(axios.request).toBeCalledWith({
                method: 'get',
                url: `/jobs/${jobId}/transcript`,
                headers: { 'Accept': `application/vnd.rev.transcript.v1.0+json` },
                responseType: 'json'
            });
            expect(axios.request).toBeCalledTimes(1);
            expect(transcript).toEqual(expectedTranscript);
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

        it('get transcript object', async () => {
            const resp = { data: objectToStream(expectedTranscript) };
            axios.request.mockResolvedValue(resp);

            const transcript = await sut.getTranscriptObjectStream(jobId);

            expect(axios.request).toBeCalledWith({
                method: 'get',
                url: `/jobs/${jobId}/transcript`,
                headers: { 'Accept': `application/vnd.rev.transcript.v1.0+json` },
                responseType: 'stream'
            });
            expect(axios.request).toBeCalledTimes(1);
            expect(transcript.read()).toEqual(expectedTranscript);
        });
    });

    describe('getTranscriptText', () => {
        it('get transcript text', async () => {
            const expectedTranscript = 'Speaker 0    00:00    Hello World.'
            const resp = { data: expectedTranscript }
            axios.request.mockResolvedValue(resp);

            const transcript = await sut.getTranscriptText(jobId);

            expect(axios.request).toBeCalledWith({
                method: 'get',
                url: `/jobs/${jobId}/transcript`,
                headers: { 'Accept': 'text/plain' },
                responseType: 'text'
            });
            expect(axios.request).toBeCalledTimes(1);
            expect(transcript).toEqual(expectedTranscript);
        });
    });

    describe('getTranscriptTextStream', () => {
        afterEach(() => {
            
        });

        it('get transcript text', async () => {
            const expectedTranscript = 'Speaker 0    00:00    Hello World.'
            const resp = { data: objectToStream(expectedTranscript) }
            axios.request.mockResolvedValue(resp);

            const transcript = await sut.getTranscriptTextStream(jobId);

            expect(axios.request).toBeCalledWith({
                method: 'get',
                url: `/jobs/${jobId}/transcript`,
                headers: { 'Accept': 'text/plain' },
                responseType: 'stream'
            });
            expect(axios.request).toBeCalledTimes(1);
            expect(transcript.read()).toEqual(expectedTranscript);
        });
    });

    describe('getCaptions', () => {
        it('get captions', async () => {
            const expectedTranscript = '1\n00:00:00,000 --> 00:00:05,000\nHello World.'
            const resp = { data: objectToStream(expectedTranscript) }
            axios.request.mockResolvedValue(resp);

            const transcript = await sut.getCaptions(jobId);

            expect(axios.request).toBeCalledWith({
                method: 'get',
                url: `/jobs/${jobId}/captions`,
                headers: { 'Accept': 'application/x-subrip' },
                responseType: 'stream'
            });
            expect(axios.request).toBeCalledTimes(1);
            expect(transcript.read().toString()).toEqual(expectedTranscript);
        })
    });
});
