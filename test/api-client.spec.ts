import { RevAiApiClient } from '../src/api-client';
import { ApiRequestHandler } from '../src/api-request-handler';
import { RevAiApiTranscript } from '../src/models/RevAiApiTranscript';
import { objectToStream } from './testhelpers';
const fs = require('fs');
const FormData = require('form-data');

jest.mock('../src/api-request-handler');

let sut: RevAiApiClient;

describe('api-client', () => {
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
        ApiRequestHandler.mockClear();
        sut = new RevAiApiClient('testtoken');
    });

    describe('getAccount', () => {
        it('get account email and balance', async () => {
            const accountEmail = 'test@rev.com';
            const balanceSeconds = 300;
            const data = { email: accountEmail, balance_seconds: balanceSeconds};
            const mockHandler = ApiRequestHandler.mock.instances[0];
            mockHandler.makeApiRequest.mockResolvedValue(data);

            const account = await sut.getAccount();

            expect(mockHandler.makeApiRequest).toBeCalledWith(
                'get',
                '/account',
                {},
                'json'
            );
            expect(mockHandler.makeApiRequest).toBeCalledTimes(1);
            expect(account).toEqual(data);
        });
    });

    describe('getJobDetails', () => {
        it('get job by id', async () => {
            const mockHandler = ApiRequestHandler.mock.instances[0];
            mockHandler.makeApiRequest.mockResolvedValue(jobDetails);

            const job = await sut.getJobDetails(jobId);

            expect(mockHandler.makeApiRequest).toBeCalledWith(
                'get',
                `/jobs/${jobDetails.id}`,
                {},
                'json'
            );
            expect(mockHandler.makeApiRequest).toBeCalledTimes(1);
            expect(job).toEqual(jobDetails);
        });
    });

    describe('getListOfJobs', () => {
        it('get list of jobs', async () => {
            const mockHandler = ApiRequestHandler.mock.instances[0];
            mockHandler.makeApiRequest.mockResolvedValue([jobDetails]);

            const jobs = await sut.getListOfJobs();

            expect(jobs).toEqual([jobDetails]);
            expect(mockHandler.makeApiRequest).toBeCalledWith(
                'get',
                `/jobs`,
                {},
                'json'
            );
            expect(mockHandler.makeApiRequest).toBeCalledTimes(1);
        });

        it('get list of jobs with limit of 5', async () => {
            const jobDetails2 = {
                id: otherJobId,
                status: 'transcribed',
                created_on: '2013-05-05T23:23:22.29Z'
            };
            const data = [jobDetails, jobDetails2];
            const mockHandler = ApiRequestHandler.mock.instances[0];
            mockHandler.makeApiRequest.mockResolvedValue(data);

            const jobs = await sut.getListOfJobs(5);

            expect(jobs).toEqual([jobDetails, jobDetails2]);
            expect(mockHandler.makeApiRequest).toBeCalledWith(
                'get',
                '/jobs?limit=5',
                {},
                'json'
            );
            expect(mockHandler.makeApiRequest).toBeCalledTimes(1);
        });

        it('get list of jobs starting after certain job id', async () => {
            const mockHandler = ApiRequestHandler.mock.instances[0];
            mockHandler.makeApiRequest.mockResolvedValue([jobDetails]);

            const jobs = await sut.getListOfJobs(undefined, otherJobId);

            expect(jobs).toEqual([jobDetails]);
            expect(mockHandler.makeApiRequest).toBeCalledWith(
                'get',
                `/jobs?starting_after=${otherJobId}`,
                {},
                'json'
            );
            expect(mockHandler.makeApiRequest).toBeCalledTimes(1);
        });

        it('get list of jobs with limit of 5 and starting after certain job id', async () => {
            const limit = 5;
            const jobDetails2 = {
                id: otherJobId,
                status: 'transcribed',
                created_on: '2013-05-05T23:23:22.29Z'
            };
            const mockHandler = ApiRequestHandler.mock.instances[0];
            mockHandler.makeApiRequest.mockResolvedValue([jobDetails, jobDetails2]);

            const jobs = await sut.getListOfJobs(limit, otherJobId);

            expect(jobs).toEqual([jobDetails, jobDetails2]);
            expect(mockHandler.makeApiRequest).toBeCalledWith(
                'get',
                `/jobs?limit=${limit}&starting_after=${otherJobId}`,
                {},
                'json'
            );
            expect(mockHandler.makeApiRequest).toBeCalledTimes(1);
        });
    });

    describe('deleteJob', () => {
        it('delete job by id', async () => {
            const mockHandler = ApiRequestHandler.mock.instances[0];
            mockHandler.makeApiRequest.mockResolvedValue(null);

            await sut.deleteJob(jobId);

            expect(mockHandler.makeApiRequest).toBeCalledWith(
                'delete',
                `/jobs/${jobId}`,
                {},
                'text'
            );
            expect(mockHandler.makeApiRequest).toBeCalledTimes(1);
        });
    });

    describe('submitJobUrl', () => {
        it('submit job with media url without options', async () => {
            const mockHandler = ApiRequestHandler.mock.instances[0];
            mockHandler.makeApiRequest.mockResolvedValue(jobDetails);

            const job = await sut.submitJobUrl(mediaUrl);

            expect(mockHandler.makeApiRequest).toBeCalledWith(
                'post',
                '/jobs',
                { 'Content-Type': 'application/json' },
                'json',
                { media_url: mediaUrl }
            );
            expect(mockHandler.makeApiRequest).toBeCalledTimes(1);
            expect(job).toEqual(jobDetails);
        });

        it('submit job with media url with options', async () => {
            const mockHandler = ApiRequestHandler.mock.instances[0];
            mockHandler.makeApiRequest.mockResolvedValue(jobDetails);
            const options = {
                metadata: 'This is a sample submit jobs option',
                callback_url: 'https://www.example.com/callback',
                custom_vocabularies: [{phrases: ['word1', 'word2']}, {phrases: ['word3', 'word4']}]
            }

            const job = await sut.submitJobUrl(mediaUrl, options);

            expect(mockHandler.makeApiRequest).toBeCalledWith(
                'post',
                '/jobs',
                { 'Content-Type': 'application/json' },
                'json',
                options
            );
            expect(mockHandler.makeApiRequest).toBeCalledTimes(1);
            expect(job).toEqual(jobDetails);
        });
    });

    describe('submitJobLocalFile', () => {
        it('submit job with local file without options', async () => {
            const mockHandler = ApiRequestHandler.mock.instances[0];
            mockHandler.makeApiRequest.mockResolvedValue(jobDetails);

            const job = await sut.submitJobLocalFile(filename);

            const expectedPayload = expect.objectContaining({
                '_boundary': expect.anything(),
                '_streams': expect.arrayContaining([expect.stringContaining('Content-Type: audio/mpeg'),
                    expect.stringContaining('Content-Disposition: form-data; name="media"; filename="test.mp3"')])
            });
            const expectedHeader = { 'content-type': expect.stringMatching(/multipart\/form-data; boundary=.+/) };
            expect(mockHandler.makeApiRequest).toBeCalledWith(
                'post',
                '/jobs',
                expectedHeader
                'json',
                expectedPayload
            );
            expect(mockHandler.makeApiRequest).toBeCalledTimes(1);
            expect(job).toEqual(jobDetails);
        });

        it('submit job with local file with options', async () => {
            const mockHandler = ApiRequestHandler.mock.instances[0];
            mockHandler.makeApiRequest.mockResolvedValue(jobDetails);
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

            expect(mockHandler.makeApiRequest).toBeCalledWith(
                'post',
                '/jobs',
                expectedHeader
                'json',
                expectedPayload
            );
            expect(mockHandler.makeApiRequest).toBeCalledTimes(1);
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
            const mockHandler = ApiRequestHandler.mock.instances[0];
            mockHandler.makeApiRequest.mockResolvedValue(expectedTranscript);

            const transcript = await sut.getTranscriptObject(jobId);

            expect(mockHandler.makeApiRequest).toBeCalledWith(
                'get',
                `/jobs/${jobId}/transcript`,
                { 'Accept': `application/vnd.rev.transcript.v1.0+json` },
                'json'
            );
            expect(mockHandler.makeApiRequest).toBeCalledTimes(1);
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
            const mockHandler = ApiRequestHandler.mock.instances[0];
            mockHandler.makeApiRequest.mockResolvedValue(objectToStream(expectedTranscript));

            const transcript = await sut.getTranscriptObjectStream(jobId);

            expect(mockHandler.makeApiRequest).toBeCalledWith(
                'get',
                `/jobs/${jobId}/transcript`,
                { 'Accept': `application/vnd.rev.transcript.v1.0+json` },
                'stream'
            );
            expect(mockHandler.makeApiRequest).toBeCalledTimes(1);
            expect(transcript.read()).toEqual(expectedTranscript);
        });
    });

    describe('getTranscriptText', () => {
        it('get transcript text', async () => {
            const expectedTranscript = 'Speaker 0    00:00    Hello World.'
            const mockHandler = ApiRequestHandler.mock.instances[0];
            mockHandler.makeApiRequest.mockResolvedValue(expectedTranscript);

            const transcript = await sut.getTranscriptText(jobId);

            expect(mockHandler.makeApiRequest).toBeCalledWith(
                'get',
                `/jobs/${jobId}/transcript`,
                { 'Accept': 'text/plain' },
                'text'
            );
            expect(mockHandler.makeApiRequest).toBeCalledTimes(1);
            expect(transcript).toEqual(expectedTranscript);
        });
    });

    describe('getTranscriptTextStream', () => {
        it('get transcript text', async () => {
            const expectedTranscript = 'Speaker 0    00:00    Hello World.'
            const mockHandler = ApiRequestHandler.mock.instances[0];
            mockHandler.makeApiRequest.mockResolvedValue(objectToStream(expectedTranscript));

            const transcript = await sut.getTranscriptTextStream(jobId);

            expect(mockHandler.makeApiRequest).toBeCalledWith(
                'get',
                `/jobs/${jobId}/transcript`,
                { 'Accept': 'text/plain' },
                'stream'
            );
            expect(mockHandler.makeApiRequest).toBeCalledTimes(1);
            expect(transcript.read()).toEqual(expectedTranscript);
        });
    });

    describe('getCaptions', () => {
        it('get captions', async () => {
            const expectedTranscript = '1\n00:00:00,000 --> 00:00:05,000\nHello World.'
            const mockHandler = ApiRequestHandler.mock.instances[0];
            mockHandler.makeApiRequest.mockResolvedValue(objectToStream(expectedTranscript));

            const transcript = await sut.getCaptions(jobId);

            expect(mockHandler.makeApiRequest).toBeCalledWith(
                'get',
                `/jobs/${jobId}/captions`,
                { 'Accept': 'application/x-subrip' },
                'stream'
            );
            expect(mockHandler.makeApiRequest).toBeCalledTimes(1);
            expect(transcript.read().toString()).toEqual(expectedTranscript);
        })
    });
});
