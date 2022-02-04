import { Readable } from 'stream';

import { RevAiApiClient } from '../../../src/api-client';
import { ApiRequestHandler } from '../../../src/api-request-handler';
import { RevAiJobOptions } from '../../../src/models/async/RevAiJobOptions';

jest.mock('../../../src/api-request-handler');

describe('api-client job submission', () => {
    let sut: RevAiApiClient;
    let mockMakeApiRequest: jest.Mock;

    const jobId = 'Umx5c6F7pH7r';
    const mediaUrl = 'https://support.rev.com/hc/en-us/article_attachments/200043975/FTC_Sample_1_-_Single.mp3';
    const jobDetails = {
        id: jobId,
        status: 'in_progress',
        created_on: '2018-05-05T23:23:22.29Z'
    };
    const filename = 'path/to/test.mp3';

    const twoGigabytes = 2e9; // Number of Bytes in 2 Gigabytes

    beforeEach(() => {
        mockMakeApiRequest = jest.fn().mockResolvedValue(jobDetails);
        (ApiRequestHandler as jest.Mock<ApiRequestHandler>).mockImplementationOnce(() => ({
            makeApiRequest: mockMakeApiRequest
        }));
        sut = new RevAiApiClient('testtoken');
    });

    describe('submitJobUrl', () => {
        it('submit job with media url without options', async () => {
            const job = await sut.submitJobUrl(mediaUrl);

            expect(mockMakeApiRequest).toBeCalledWith('post', '/jobs',
                { 'Content-Type': 'application/json' }, 'json', { media_url: mediaUrl });
            expect(mockMakeApiRequest).toBeCalledTimes(1);
            expect(job).toEqual(jobDetails);
        });

        it('submit job with media url with null options', async () => {
            const job = await sut.submitJobUrl(mediaUrl, null);

            expect(mockMakeApiRequest).toBeCalledWith('post', '/jobs',
                { 'Content-Type': 'application/json' }, 'json', { media_url: mediaUrl });
            expect(mockMakeApiRequest).toBeCalledTimes(1);
            expect(job).toEqual(jobDetails);
        });

        it('submit job with media url with empty options', async () => {
            const job = await sut.submitJobUrl(mediaUrl, {});

            expect(mockMakeApiRequest).toBeCalledWith('post', '/jobs',
                { 'Content-Type': 'application/json' }, 'json', { media_url: mediaUrl });
            expect(mockMakeApiRequest).toBeCalledTimes(1);
            expect(job).toEqual(jobDetails);
        });

        it('submit job with media url with all options null', async () => {
            const options: RevAiJobOptions = {
                metadata: null,
                callback_url: null,
                custom_vocabulary_id: null,
                custom_vocabularies: null,
                skip_punctuation: null,
                skip_diarization: null,
                speaker_channels_count: null,
                filter_profanity: null,
                remove_disfluencies: null,
                delete_after_seconds: null,
                language: null,
                transcriber: null
            };

            const job = await sut.submitJobUrl(mediaUrl, options);

            expect(mockMakeApiRequest).toBeCalledWith('post', '/jobs',
                { 'Content-Type': 'application/json' }, 'json', { media_url: mediaUrl });
            expect(mockMakeApiRequest).toBeCalledTimes(1);
            expect(job).toEqual(jobDetails);
        });

        it('submit job with media url with custom vocabulary id', async () => {
            const options: RevAiJobOptions = {
                custom_vocabulary_id: 'cvId'
            };

            const job = await sut.submitJobUrl(mediaUrl, options);

            expect(mockMakeApiRequest).toBeCalledWith('post', '/jobs',
                { 'Content-Type': 'application/json' }, 'json', { ...options, media_url: mediaUrl });
            expect(mockMakeApiRequest).toBeCalledTimes(1);
            expect(job).toEqual(jobDetails);
        });

        it('submit human transcription job with options', async () => {
            const options: RevAiJobOptions = {
                metadata: 'This is a sample submit jobs option',
                callback_url: 'https://www.example.com/callback',
                transcriber: 'human',
                verbatim: true,
                rush: true,
                segments_to_transcribe: [{
                    start: 0.0,
                    end: 1.5
                }, {
                    start: 240,
                    end: 300
                }]
            };

            const job = await sut.submitJobUrl(mediaUrl, options);

            expect(mockMakeApiRequest).toBeCalledWith('post', '/jobs',
                { 'Content-Type': 'application/json' }, 'json', { ...options, media_url: mediaUrl });
            expect(mockMakeApiRequest).toBeCalledTimes(1);
            expect(job).toEqual(jobDetails);
        });
    });

    describe('submitJobFileStream', () => {
        it('submit job with Readable', async () => {
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

        it('submit job with all options null', async () => {
            const fakeStream = Buffer.alloc(10);
            const options = {
                metadata: null,
                callback_url: null,
                custom_vocabularies: null,
                skip_punctuation: null,
                skip_diarization: null,
                speaker_channels_count: null,
                filter_profanity: null,
                remove_disfluencies: null,
                delete_after_seconds: null,
                language: null,
                transcriber: null
            };
            const job = await sut.submitJobAudioData(fakeStream, null, options);

            const expectedPayload = expect.objectContaining({
                '_boundary': expect.anything(),
                '_streams': expect.arrayContaining([
                    expect.anything(),
                    expect.stringContaining('Content-Disposition: form-data; name="media"; filename=\"audio_file\"'),
                    expect.stringContaining('Content-Type: application/octet-stream'),
                    expect.stringContaining('Content-Disposition: form-data; name=\"options\"'),
                    expect.not.stringContaining('metadata'),
                    expect.not.stringContaining('callback_url'),
                    expect.not.stringContaining('custom_vocabularies'),
                    expect.not.stringContaining('skip_punctuation'),
                    expect.not.stringContaining('skip_diarization'),
                    expect.not.stringContaining('speaker_channels_count'),
                    expect.not.stringContaining('filter_profanity'),
                    expect.not.stringContaining('remove_disfluencies'),
                    expect.not.stringContaining('delete_after_seconds'),
                    expect.not.stringContaining('language'),
                    expect.not.stringContaining('transcriber')
                ])
            });
            const expectedHeader = { 'content-type': expect.stringMatching(/multipart\/form-data; boundary=.+/) };
            expect(mockMakeApiRequest).toBeCalledWith('post', '/jobs',
                expectedHeader, 'json', expectedPayload, twoGigabytes);
            expect(mockMakeApiRequest).toBeCalledTimes(1);
            expect(job).toEqual(jobDetails);
        });

        it('submit job with options', async () => {
            const fakeStream = Buffer.alloc(10);
            const options = {
                metadata: 'This is a sample submit jobs option',
                callback_url: 'https://www.example.com/callback',
                custom_vocabularies: [{phrases: ['word1', 'word2']}, {phrases: ['word3', 'word4']}],
                skip_punctuation: true,
                skip_diarization: true,
                speaker_channels_count: 1,
                filter_profanity: true,
                remove_disfluencies: true,
                delete_after_seconds: 0,
                language: 'en',
                transcriber: 'machine_v2'
            };

            const job = await sut.submitJobAudioData(fakeStream, 'example.mp3', options);

            const expectedPayload = expect.objectContaining({
                '_boundary': expect.anything(),
                '_streams': expect.arrayContaining([
                    expect.anything(),
                    expect.stringContaining('Content-Disposition: form-data; name="media"; filename="example.mp3"'),
                    expect.stringContaining('Content-Disposition: form-data; name=\"options\"'),
                    expect.stringContaining('"metadata":"This is a sample submit jobs option",'),
                    expect.stringContaining('"callback_url":"https://www.example.com/callback",'),
                    expect.stringContaining(
                        '"custom_vocabularies":[{"phrases":["word1","word2"]},{"phrases":["word3","word4"]}],'),
                    expect.stringContaining('"skip_punctuation":true,'),
                    expect.stringContaining('"skip_diarization":true,'),
                    expect.stringContaining('"speaker_channels_count":1,'),
                    expect.stringContaining('"filter_profanity":true'),
                    expect.stringContaining('"remove_disfluencies":true'),
                    expect.stringContaining('"delete_after_seconds":0'),
                    expect.stringContaining('"language":"en"'),
                    expect.stringContaining('"transcriber":"machine_v2"')
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

        it('submit job with local file with all options null', async () => {
            const options = {
                metadata: null,
                callback_url: null,
                custom_vocabularies: null,
                skip_punctuation: null,
                skip_diarization: null,
                speaker_channels_count: null,
                filter_profanity: null,
                remove_disfluencies: null,
                delete_after_seconds: null,
                language: null,
                transcriber: null
            };

            const job = await sut.submitJobLocalFile(filename, options);

            const expectedPayload = expect.objectContaining({
                '_boundary': expect.anything(),
                '_streams': expect.arrayContaining([
                    expect.stringContaining('Content-Type: audio/mpeg'),
                    expect.stringContaining('Content-Disposition: form-data; name="media"; filename="test.mp3"'),
                    expect.not.stringContaining('metadata'),
                    expect.not.stringContaining('callback_url'),
                    expect.not.stringContaining('custom_vocabularies'),
                    expect.not.stringContaining('skip_punctuation'),
                    expect.not.stringContaining('skip_diarization'),
                    expect.not.stringContaining('speaker_channels_count'),
                    expect.not.stringContaining('filter_profanity'),
                    expect.not.stringContaining('remove_disfluencies'),
                    expect.not.stringContaining('delete_after_seconds'),
                    expect.not.stringContaining('language'),
                    expect.not.stringContaining('transcriber')
                ])
            });
            const expectedHeader = { 'content-type': expect.stringMatching(/multipart\/form-data; boundary=.+/) };
            expect(mockMakeApiRequest).toBeCalledWith('post', '/jobs',
                expectedHeader, 'json', expectedPayload, twoGigabytes);
            expect(mockMakeApiRequest).toBeCalledTimes(1);
            expect(job).toEqual(jobDetails);
        });

        it('submit job with local file with options', async () => {
            const options = {
                metadata: 'This is a sample submit jobs option',
                callback_url: 'https://www.example.com/callback',
                custom_vocabularies: [{phrases: ['word1', 'word2']}, {phrases: ['word3', 'word4']}],
                skip_punctuation: true,
                skip_diarization: true,
                speaker_channels_count: 1,
                filter_profanity: true,
                remove_disfluencies: true,
                delete_after_seconds: 0,
                language: 'en',
                transcriber: 'machine_v2'
            };
            const expectedPayload = expect.objectContaining({
                '_boundary': expect.anything(),
                '_streams': expect.arrayContaining([
                    expect.stringContaining('Content-Type: audio/mpeg'),
                    expect.stringContaining('Content-Disposition: form-data; name=\"media\"; filename=\"test.mp3\"'),
                    expect.stringContaining('Content-Disposition: form-data; name=\"options\"'),
                    expect.stringContaining('"metadata":"This is a sample submit jobs option",'),
                    expect.stringContaining('"callback_url":"https://www.example.com/callback",'),
                    expect.stringContaining(
                        '"custom_vocabularies":[{"phrases":["word1","word2"]},{"phrases":["word3","word4"]}],'),
                    expect.stringContaining('"skip_punctuation":true,'),
                    expect.stringContaining('"skip_diarization":true,'),
                    expect.stringContaining('"speaker_channels_count":1,'),
                    expect.stringContaining('"filter_profanity":true'),
                    expect.stringContaining('"remove_disfluencies":true'),
                    expect.stringContaining('"delete_after_seconds":0'),
                    expect.stringContaining('"language":"en"'),
                    expect.stringContaining('"transcriber":"machine_v2"')
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
});
