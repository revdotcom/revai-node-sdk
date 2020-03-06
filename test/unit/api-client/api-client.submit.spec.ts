import * as fs from 'fs';
import { Readable } from 'stream';

import { RevAiApiClient } from '../../../src/api-client';
import { ApiRequestHandler } from '../../../src/api-request-handler';

jest.mock('../../../src/api-request-handler');

let sut: RevAiApiClient;

describe('api-client job submission', () => {
    const jobId = 'Umx5c6F7pH7r';
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

    describe('submitJobUrl', () => {
        it('submit job with media url without options', async () => {
            const mockHandler = ApiRequestHandler.mock.instances[0];
            mockHandler.makeApiRequest.mockResolvedValue(jobDetails);

            const job = await sut.submitJobUrl(mediaUrl);

            expect(mockHandler.makeApiRequest).toBeCalledWith('post', '/jobs',
                { 'Content-Type': 'application/json' }, 'json', { media_url: mediaUrl });
            expect(mockHandler.makeApiRequest).toBeCalledTimes(1);
            expect(job).toEqual(jobDetails);
        });

        it('submit job with media url with all options null', async () => {
            const mockHandler = ApiRequestHandler.mock.instances[0];
            mockHandler.makeApiRequest.mockResolvedValue(jobDetails);
            const options = {
                metadata: null,
                callback_url: null,
                custom_vocabularies: null,
                skip_punctuation: null,
                skip_diarization: null,
                speaker_channels_count: null,
                filter_profanity: null
            };

            const job = await sut.submitJobUrl(mediaUrl, null);

            expect(mockHandler.makeApiRequest).toBeCalledWith('post', '/jobs',
                { 'Content-Type': 'application/json' }, 'json', { media_url: mediaUrl });
            expect(mockHandler.makeApiRequest).toBeCalledTimes(1);
            expect(job).toEqual(jobDetails);
        });

        it('submit job with media url with options', async () => {
            const mockHandler = ApiRequestHandler.mock.instances[0];
            mockHandler.makeApiRequest.mockResolvedValue(jobDetails);
            const options = {
                metadata: 'This is a sample submit jobs option',
                callback_url: 'https://www.example.com/callback',
                custom_vocabularies: [{phrases: ['word1', 'word2']}, {phrases: ['word3', 'word4']}],
                skip_punctuation: true,
                skip_diarization: true,
                speaker_channels_count: 1,
                filter_profanity: true           
            };

            const job = await sut.submitJobUrl(mediaUrl, options);

            expect(mockHandler.makeApiRequest).toBeCalledWith('post', '/jobs',
                { 'Content-Type': 'application/json' }, 'json', options);
            expect(mockHandler.makeApiRequest).toBeCalledTimes(1);
            expect(job).toEqual(jobDetails);
        });
    });

    describe('submitJobFileStream', () => {
        it('submit job with Readable', async () => {
            const mockHandler = ApiRequestHandler.mock.instances[0];
            mockHandler.makeApiRequest.mockResolvedValue(jobDetails);
            let fakeStream = new Readable();

            const job = await sut.submitJobAudioData(fakeStream);

            const expectedPayload = expect.objectContaining({
                '_boundary': expect.anything(),
                '_streams': expect.arrayContaining([expect.anything(),
                    expect.stringContaining('Content-Disposition: form-data; name="media"')])
            });
            const expectedHeader = { 'content-type': expect.stringMatching(/multipart\/form-data; boundary=.+/) };
            expect(mockHandler.makeApiRequest).toBeCalledWith('post', '/jobs',
                expectedHeader, 'json', expectedPayload);
            expect(mockHandler.makeApiRequest).toBeCalledTimes(1);
            expect(job).toEqual(jobDetails);
        });

        it('submit job with Buffer', async () => {
            const mockHandler = ApiRequestHandler.mock.instances[0];
            mockHandler.makeApiRequest.mockResolvedValue(jobDetails);
            let fakeStream = new Buffer(10);

            const job = await sut.submitJobAudioData(fakeStream);

            const expectedPayload = expect.objectContaining({
                '_boundary': expect.anything(),
                '_streams': expect.arrayContaining([expect.anything(),
                    expect.stringContaining('Content-Disposition: form-data; name="media"')])
            });
            const expectedHeader = { 'content-type': expect.stringMatching(/multipart\/form-data; boundary=.+/) };
            expect(mockHandler.makeApiRequest).toBeCalledWith('post', '/jobs',
                expectedHeader, 'json', expectedPayload);
            expect(mockHandler.makeApiRequest).toBeCalledTimes(1);
            expect(job).toEqual(jobDetails);
        });

        it('submit job with name', async () => {
            const mockHandler = ApiRequestHandler.mock.instances[0];
            mockHandler.makeApiRequest.mockResolvedValue(jobDetails);
            let fakeStream = new Buffer(10);

            const job = await sut.submitJobAudioData(fakeStream, 'example.mp3');

            const expectedPayload = expect.objectContaining({
                '_boundary': expect.anything(),
                '_streams': expect.arrayContaining([expect.anything(),
                expect.stringContaining('Content-Disposition: form-data; name="media"; filename="example.mp3"')])
            });
            const expectedHeader = { 'content-type': expect.stringMatching(/multipart\/form-data; boundary=.+/) };
            expect(mockHandler.makeApiRequest).toBeCalledWith('post', '/jobs',
                expectedHeader, 'json', expectedPayload);
            expect(mockHandler.makeApiRequest).toBeCalledTimes(1);
            expect(job).toEqual(jobDetails);
        });

        it('submit job with all options null', async () => {
            const mockHandler = ApiRequestHandler.mock.instances[0];
            mockHandler.makeApiRequest.mockResolvedValue(jobDetails);
            let fakeStream = new Buffer(10);
            const options = {
                metadata: null,
                callback_url: null,
                custom_vocabularies: null,
                skip_punctuation: null,
                skip_diarization: null,
                speaker_channels_count: null,
                filter_profanity: null
            };

            const job = await sut.submitJobAudioData(fakeStream, null, options);

            const expectedPayload = expect.objectContaining({
                '_boundary': expect.anything(),
                '_streams': expect.arrayContaining([expect.anything(),
                    expect.stringContaining('Content-Disposition: form-data; name="media"')])
            });
            const expectedHeader = { 'content-type': expect.stringMatching(/multipart\/form-data; boundary=.+/) };
            expect(mockHandler.makeApiRequest).toBeCalledWith('post', '/jobs',
                expectedHeader, 'json', expectedPayload);
            expect(mockHandler.makeApiRequest).toBeCalledTimes(1);
            expect(job).toEqual(jobDetails);
        });

        it('submit job with options', async () => {
            const mockHandler = ApiRequestHandler.mock.instances[0];
            mockHandler.makeApiRequest.mockResolvedValue(jobDetails);
            let mockStream = new Buffer(10);
            const options = {
                metadata: 'This is a sample submit jobs option',
                callback_url: 'https://www.example.com/callback',
                custom_vocabularies: [{phrases: ['word1', 'word2']}, {phrases: ['word3', 'word4']}],
                skip_punctuation: true,
                skip_diarization: true,
                speaker_channels_count: 1,
                filter_profanity: true           
            };

            const job = await sut.submitJobAudioData(mockStream, 'example.mp3', options);

            const expectedPayload = expect.objectContaining({
                '_boundary': expect.anything(),
                '_streams': expect.arrayContaining([
                    expect.anything(),
                    expect.stringContaining('Content-Disposition: form-data; name="media"; filename="example.mp3"'),
                    '{' +
                        '"metadata":"This is a sample submit jobs option",' +
                        '"callback_url":"https://www.example.com/callback",' +
                        '"custom_vocabularies":[{"phrases":["word1","word2"]},{"phrases":["word3","word4"]}],' +
                        '"skip_punctuation":true,' +
                        '"skip_diarization":true,' +
                        '"speaker_channels_count":1,' +
                        '"filter_profanity":true' +
                    '}'
                ])
            });
            const expectedHeader = { 'content-type': expect.stringMatching(/multipart\/form-data; boundary=.+/) };
            expect(mockHandler.makeApiRequest).toBeCalledWith('post', '/jobs',
                expectedHeader, 'json', expectedPayload);
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
            expect(mockHandler.makeApiRequest).toBeCalledWith('post', '/jobs',
                expectedHeader, 'json', expectedPayload);
            expect(mockHandler.makeApiRequest).toBeCalledTimes(1);
            expect(job).toEqual(jobDetails);
        });

        it('submit job with local file with all options null', async () => {
            const mockHandler = ApiRequestHandler.mock.instances[0];
            mockHandler.makeApiRequest.mockResolvedValue(jobDetails);
            const options = {
                metadata: null,
                callback_url: null,
                custom_vocabularies: null,
                skip_punctuation: null,
                skip_diarization: null,
                speaker_channels_count: null,
                filter_profanity: null
            };

            const job = await sut.submitJobLocalFile(filename, options);

            const expectedPayload = expect.objectContaining({
                '_boundary': expect.anything(),
                '_streams': expect.arrayContaining([expect.stringContaining('Content-Type: audio/mpeg'),
                    expect.stringContaining('Content-Disposition: form-data; name="media"; filename="test.mp3"')])
            });
            const expectedHeader = { 'content-type': expect.stringMatching(/multipart\/form-data; boundary=.+/) };
            expect(mockHandler.makeApiRequest).toBeCalledWith('post', '/jobs',
                expectedHeader, 'json', expectedPayload);
            expect(mockHandler.makeApiRequest).toBeCalledTimes(1);
            expect(job).toEqual(jobDetails);
        });

        it('submit job with local file with options', async () => {
            const mockHandler = ApiRequestHandler.mock.instances[0];
            mockHandler.makeApiRequest.mockResolvedValue(jobDetails);
            const options = {
                metadata: 'This is a sample submit jobs option',
                callback_url: 'https://www.example.com/callback',
                custom_vocabularies: [{phrases: ['word1', 'word2']}, {phrases: ['word3', 'word4']}],
                skip_punctuation: true,
                skip_diarization: true,
                speaker_channels_count: 1,
                filter_profanity: true           
            };
            const expectedPayload = expect.objectContaining({
                '_boundary': expect.anything(),
                '_streams': expect.arrayContaining([expect.stringContaining('Content-Type: audio/mpeg'),
                    expect.stringContaining('Content-Disposition: form-data; name="media"; filename="test.mp3"'),
                    '{' +
                        '"metadata":"This is a sample submit jobs option",' +
                        '"callback_url":"https://www.example.com/callback",' +
                        '"custom_vocabularies":[{"phrases":["word1","word2"]},{"phrases":["word3","word4"]}],' +
                        '"skip_punctuation":true,' +
                        '"skip_diarization":true,' +
                        '"speaker_channels_count":1,' +
                        '"filter_profanity":true' +
                    '}'
                ])
            });
            const expectedHeader = { 'content-type': expect.stringMatching(/multipart\/form-data; boundary=.+/) };

            const job = await sut.submitJobLocalFile(filename, options);

            expect(mockHandler.makeApiRequest).toBeCalledWith('post', '/jobs',
                expectedHeader, 'json', expectedPayload);
            expect(mockHandler.makeApiRequest).toBeCalledTimes(1);
            expect(job).toEqual(jobDetails);
        });
    });
});