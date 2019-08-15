import { RevAiApiClient } from '../../src/api-client';
import { ApiRequestHandler } from '../../src/api-request-handler';
import { CaptionTypes } from '../../src/models/async/CaptionTypes';
import { objectToStream } from '../testhelpers';
const fs = require('fs');
const FormData = require('form-data');

jest.mock('../../src/api-request-handler');

let sut: RevAiApiClient;

describe('api-client', () => {
    const jobId = 'Umx5c6F7pH7r';
    
    beforeEach(() => {
        ApiRequestHandler.mockClear();
        sut = new RevAiApiClient('testtoken');
    });

    describe('getCaptions', () => {
        it('gets captions defaults to srt', async () => {
            const expectedTranscript = '1\n00:00:00,000 --> 00:00:05,000\nHello World.'
            const mockHandler = ApiRequestHandler.mock.instances[0];
            mockHandler.makeApiRequest.mockResolvedValue(objectToStream(expectedTranscript));
            
            const transcript = await sut.getCaptions(jobId);

            expect(mockHandler.makeApiRequest).toBeCalledWith('get', `/jobs/${jobId}/captions`,
                { 'Accept': 'application/x-subrip' }, 'stream');
            expect(mockHandler.makeApiRequest).toBeCalledTimes(1);
            expect(transcript.read().toString()).toEqual(expectedTranscript);
        });

        it.each([['application/x-subrip', 'text/vtt']])('uses given content type', async (contentType) => {
            const mockHandler = ApiRequestHandler.mock.instances[0];
            
            await sut.getCaptions(jobId, contentType);

            expect(mockHandler.makeApiRequest).toBeCalledWith('get', `/jobs/${jobId}/captions`,
                { 'Accept': contentType }, 'stream');
            expect(mockHandler.makeApiRequest).toBeCalledTimes(1);
        });
    });

    describe('getSrtCaptions', () => {
        it('gets srt captions', async () => {
            const expectedTranscript = '1\n00:00:00,000 --> 00:00:05,000\nHello World.'
            const mockHandler = ApiRequestHandler.mock.instances[0];
            mockHandler.makeApiRequest.mockResolvedValue(objectToStream(expectedTranscript));
            
            const transcript = await sut.getSrtCaptions(jobId);

            expect(mockHandler.makeApiRequest).toBeCalledWith('get', `/jobs/${jobId}/captions`,
                { 'Accept': 'application/x-subrip' }, 'stream');
            expect(mockHandler.makeApiRequest).toBeCalledTimes(1);
            expect(transcript.read().toString()).toEqual(expectedTranscript);
        });
    });

    describe('getVttCaptions', () => {
        it('gets vtt captions', async () => {
            const expectedTranscript = '1\n00:00:00,000 --> 00:00:05,000\nHello World.'
            const mockHandler = ApiRequestHandler.mock.instances[0];
            mockHandler.makeApiRequest.mockResolvedValue(objectToStream(expectedTranscript));
            
            const transcript = await sut.getVttCaptions(jobId);

            expect(mockHandler.makeApiRequest).toBeCalledWith('get', `/jobs/${jobId}/captions`,
                { 'Accept': 'text/vtt' }, 'stream');
            expect(mockHandler.makeApiRequest).toBeCalledTimes(1);
            expect(transcript.read().toString()).toEqual(expectedTranscript);
        });
    });
});