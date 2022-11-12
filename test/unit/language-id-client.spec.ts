import { Readable } from 'stream';
import {
    GetListOfJobsOptions,
    LanguageIdClient,
    LanguageIdJob,
    LanguageIdJobOptions,
    LanguageIdResult } from '../../src';
import { ApiRequestHandler } from '../../src/api-request-handler';
import { CustomerUrlData } from '../../src/models/CustomerUrlData';

jest.mock('../../src/api-request-handler');

describe('language-id-client', () => {
    let sut: LanguageIdClient;
    let mockMakeApiRequest: jest.Mock;

    const jobId = 'Umx5c6F7pH7r';
    const otherJobId = 'EMx5c67p3dr';
    const metadata = 'This is a sample submit jobs option';
    const sourceAuth = { 'Authorization': 'Bearer source_token' };
    const callbackAuth = { 'Authorization': 'Bearer callback_token' };
    const sourceConfig: CustomerUrlData = {
        url: 'https://www.rev.ai/FTC_Sample_1.mp3',
        auth_headers: sourceAuth
    };
    const notificationConfig: CustomerUrlData = {
        url: 'https://www.example.com/callback',
        auth_headers: callbackAuth
    };
    const filename = 'path/to/test.mp3';
    const twoGigabytes = 2e9; // Number of Bytes in 2 Gigabytes
    const jobDetails = {
        id: jobId,
        status: 'completed',
        created_on: '2022-05-012T23:23:22.29Z',
        type: 'language_id'
    } as LanguageIdJob;

    beforeEach(() => {
        mockMakeApiRequest = jest.fn();
        (ApiRequestHandler as jest.Mock<ApiRequestHandler>).mockImplementationOnce(() => ({
            makeApiRequest: mockMakeApiRequest
        }));
        sut = new LanguageIdClient({ token: 'testtoken' });
    });

    describe('getJobDetails', () => {
        it('get job by id', async () => {
            mockMakeApiRequest.mockResolvedValue(jobDetails);

            const job = await sut.getJobDetails(jobId);

            expect(mockMakeApiRequest).toBeCalledWith('get', `/jobs/${jobDetails.id}`, {}, 'json');
            expect(mockMakeApiRequest).toBeCalledTimes(1);
            expect(job).toEqual(jobDetails);
        });
    });

    describe('getListOfJobs', () => {
        const jobDetails2 = {
            id: otherJobId,
            status: 'completed',
            created_on: '2013-05-05T23:23:22.29Z',
            type: 'language_id'
        } as LanguageIdJob;

        it('get list of jobs', async () => {
            mockMakeApiRequest.mockResolvedValue([jobDetails, jobDetails2]);

            const jobs = await sut.getListOfJobs();

            expect(jobs).toEqual([jobDetails, jobDetails2]);
            expect(mockMakeApiRequest).toBeCalledWith('get', '/jobs', {}, 'json');
            expect(mockMakeApiRequest).toBeCalledTimes(1);
        });

        it('get list of jobs with params', async () => {
            const params = {
                limit: 5,
                startingafter: otherJobId
            } as GetListOfJobsOptions;
            mockMakeApiRequest.mockResolvedValue([jobDetails, jobDetails2]);

            const jobs = await sut.getListOfJobs(params);

            expect(jobs).toEqual([jobDetails, jobDetails2]);
            expect(mockMakeApiRequest).toBeCalledWith('get',
                `/jobs?limit=5&startingafter=${otherJobId}`, {}, 'json');
            expect(mockMakeApiRequest).toBeCalledTimes(1);
        });
    });

    describe('submitJob', () => {
        it('submit job with with authentication support options', async () => {
            mockMakeApiRequest.mockResolvedValue(jobDetails);
            const options: LanguageIdJobOptions = {
                source_config: sourceConfig,
                metadata: metadata,
                notification_config: notificationConfig,
                delete_after_seconds: 0
            };

            const job = await sut.submitJob(options);

            expect(mockMakeApiRequest).toBeCalledWith('post', '/jobs',
                { 'Content-Type': 'application/json' }, 'json', options);
            expect(mockMakeApiRequest).toBeCalledTimes(1);
            expect(job).toEqual(jobDetails);
        });
    });

    describe('submitJobFileStream', () => {
        it('submit job with Readable', async () => {
            mockMakeApiRequest.mockResolvedValue(jobDetails);
            const fakeStream = new Readable();

            const job = await sut.submitJobAudioData(fakeStream);

            const expectedPayload = expect.objectContaining({
                '_boundary': expect.anything(),
                '_streams': expect.arrayContaining([
                    expect.anything(),
                    expect.stringContaining('Content-Disposition: form-data; name="media"')
                ])
            });
            const expectedHeader = { 'content-type': expect.stringMatching(/multipart\/form-data; boundary=.+/) };
            expect(mockMakeApiRequest).toBeCalledWith('post', '/jobs',
                expectedHeader, 'json', expectedPayload, twoGigabytes);
            expect(mockMakeApiRequest).toBeCalledTimes(1);
            expect(job).toEqual(jobDetails);
        });

        it('submit job with Buffer', async () => {
            mockMakeApiRequest.mockResolvedValue(jobDetails);
            const fakeStream = Buffer.alloc(10);

            const job = await sut.submitJobAudioData(fakeStream);

            const expectedPayload = expect.objectContaining({
                '_boundary': expect.anything(),
                '_streams': expect.arrayContaining([
                    expect.anything(),
                    expect.stringContaining('Content-Disposition: form-data; name="media"')
                ])
            });
            const expectedHeader = { 'content-type': expect.stringMatching(/multipart\/form-data; boundary=.+/) };
            expect(mockMakeApiRequest).toBeCalledWith('post', '/jobs',
                expectedHeader, 'json', expectedPayload, twoGigabytes);
            expect(mockMakeApiRequest).toBeCalledTimes(1);
            expect(job).toEqual(jobDetails);
        });

        it('submit job with name', async () => {
            mockMakeApiRequest.mockResolvedValue(jobDetails);
            const fakeStream = Buffer.alloc(10);

            const job = await sut.submitJobAudioData(fakeStream, 'example.mp3');

            const expectedPayload = expect.objectContaining({
                '_boundary': expect.anything(),
                '_streams': expect.arrayContaining([
                    expect.anything(),
                    expect.stringContaining('Content-Disposition: form-data; name="media"; filename="example.mp3"')
                ])
            });
            const expectedHeader = { 'content-type': expect.stringMatching(/multipart\/form-data; boundary=.+/) };
            expect(mockMakeApiRequest).toBeCalledWith('post', '/jobs',
                expectedHeader, 'json', expectedPayload, twoGigabytes);
            expect(mockMakeApiRequest).toBeCalledTimes(1);
            expect(job).toEqual(jobDetails);
        });

        it('submit job with all options undefined', async () => {
            mockMakeApiRequest.mockResolvedValue(jobDetails);
            const fakeStream = Buffer.alloc(10);

            const job = await sut.submitJobAudioData(fakeStream, null, {});

            const expectedPayload = expect.objectContaining({
                '_boundary': expect.anything(),
                '_streams': expect.arrayContaining([
                    expect.anything(),
                    expect.stringContaining('Content-Disposition: form-data; name="media"; filename="audio_file"'),
                    expect.stringContaining('Content-Type: application/octet-stream'),
                    expect.stringContaining('Content-Disposition: form-data; name="options"'),
                    expect.not.stringContaining('metadata'),
                    expect.not.stringContaining('notification_config'),
                    expect.not.stringContaining('delete_after_seconds')
                ])
            });
            const expectedHeader = { 'content-type': expect.stringMatching(/multipart\/form-data; boundary=.+/) };
            expect(mockMakeApiRequest).toBeCalledWith('post', '/jobs',
                expectedHeader, 'json', expectedPayload, twoGigabytes);
            expect(mockMakeApiRequest).toBeCalledTimes(1);
            expect(job).toEqual(jobDetails);
        });

        it('submit job with options', async () => {
            mockMakeApiRequest.mockResolvedValue(jobDetails);
            const fakeStream = Buffer.alloc(10);
            const options = {
                metadata: metadata,
                delete_after_seconds: 0
            };

            const job = await sut.submitJobAudioData(fakeStream, 'example.mp3', options);

            const expectedPayload = expect.objectContaining({
                '_boundary': expect.anything(),
                '_streams': expect.arrayContaining([
                    expect.anything(),
                    expect.stringContaining('Content-Disposition: form-data; name="media"; filename="example.mp3"'),
                    expect.stringContaining('Content-Disposition: form-data; name="options"'),
                    expect.stringContaining(`"metadata":"${metadata}",`),
                    expect.stringContaining('"delete_after_seconds":0')
                ])
            });
            const expectedHeader = { 'content-type': expect.stringMatching(/multipart\/form-data; boundary=.+/) };
            expect(mockMakeApiRequest).toBeCalledWith('post', '/jobs',
                expectedHeader, 'json', expectedPayload, twoGigabytes);
            expect(mockMakeApiRequest).toBeCalledTimes(1);
            expect(job).toEqual(jobDetails);
        });
    });

    describe('submitJobLocalFile', () => {
        it('submit job with local file without options', async () => {
            mockMakeApiRequest.mockResolvedValue(jobDetails);
            const job = await sut.submitJobLocalFile(filename);

            const expectedPayload = expect.objectContaining({
                '_boundary': expect.anything(),
                '_streams': expect.arrayContaining([
                    expect.stringContaining('Content-Type: audio/mpeg'),
                    expect.stringContaining('Content-Disposition: form-data; name="media"; filename="test.mp3"')
                ])
            });
            const expectedHeader = { 'content-type': expect.stringMatching(/multipart\/form-data; boundary=.+/) };
            expect(mockMakeApiRequest).toBeCalledWith('post', '/jobs',
                expectedHeader, 'json', expectedPayload, twoGigabytes);
            expect(mockMakeApiRequest).toBeCalledTimes(1);
            expect(job).toEqual(jobDetails);
        });

        it('submit job with local file with all options undefined', async () => {
            mockMakeApiRequest.mockResolvedValue(jobDetails);
            const job = await sut.submitJobLocalFile(filename, {});

            const expectedPayload = expect.objectContaining({
                '_boundary': expect.anything(),
                '_streams': expect.arrayContaining([
                    expect.stringContaining('Content-Type: audio/mpeg'),
                    expect.stringContaining('Content-Disposition: form-data; name="media"; filename="test.mp3"'),
                    expect.not.stringContaining('metadata'),
                    expect.not.stringContaining('notification_config'),
                    expect.not.stringContaining('delete_after_seconds')
                ])
            });
            const expectedHeader = { 'content-type': expect.stringMatching(/multipart\/form-data; boundary=.+/) };
            expect(mockMakeApiRequest).toBeCalledWith('post', '/jobs',
                expectedHeader, 'json', expectedPayload, twoGigabytes);
            expect(mockMakeApiRequest).toBeCalledTimes(1);
            expect(job).toEqual(jobDetails);
        });

        it('submit job with local file with options', async () => {
            mockMakeApiRequest.mockResolvedValue(jobDetails);
            const options = {
                metadata: metadata,
                delete_after_seconds: 0
            };
            const expectedPayload = expect.objectContaining({
                '_boundary': expect.anything(),
                '_streams': expect.arrayContaining([
                    expect.stringContaining('Content-Type: audio/mpeg'),
                    expect.stringContaining('Content-Disposition: form-data; name="media"; filename="test.mp3"'),
                    expect.stringContaining('Content-Disposition: form-data; name="options"'),
                    expect.stringContaining(`"metadata":"${metadata}",`),
                    expect.stringContaining('"delete_after_seconds":0')
                ])
            });
            const expectedHeader = { 'content-type': expect.stringMatching(/multipart\/form-data; boundary=.+/) };

            const job = await sut.submitJobLocalFile(filename, options);

            expect(mockMakeApiRequest).toBeCalledWith('post', '/jobs',
                expectedHeader, 'json', expectedPayload, twoGigabytes);
            expect(mockMakeApiRequest).toBeCalledTimes(1);
            expect(job).toEqual(jobDetails);
        });
    });

    describe('getResult', () => {
        const jobResult = {
            top_language: 'en',
            language_confidences: [
                {
                    'language': 'en',
                    'confidence': 0.907
                },
                {
                    'language': 'nl',
                    'confidence': 0.023
                },
                {
                    'language': 'ar',
                    'confidence': 0.023
                },
                {
                    'language': 'de',
                    'confidence': 0.023
                },
                {
                    'language': 'cmn',
                    'confidence': 0.023
                }
            ]
        } as LanguageIdResult;

        it('get job result', async () => {
            mockMakeApiRequest.mockResolvedValue(jobResult);

            const res = await sut.getResult(jobId);

            expect(mockMakeApiRequest).toBeCalledWith('get', `/jobs/${jobId}/result`,
                { 'Accept': 'application/vnd.rev.languageid.v1.0+json' }, 'json');
            expect(mockMakeApiRequest).toBeCalledTimes(1);
            expect(res).toEqual(jobResult);
        });
    });

    describe('deleteJob', () => {
        it('delete job by id', async () => {
            mockMakeApiRequest.mockResolvedValue(null);

            await sut.deleteJob(jobId);

            expect(mockMakeApiRequest).toBeCalledWith('delete', `/jobs/${jobId}`, {}, 'text');
            expect(mockMakeApiRequest).toBeCalledTimes(1);
        });
    });
});
