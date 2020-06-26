import * as fs from 'fs';

import { RevAiApiClient } from '../../../src/api-client';
import { ApiRequestHandler } from '../../../src/api-request-handler';
import { objectToStream } from '../testhelpers';

jest.mock('../../../src/api-request-handler');

let sut: RevAiApiClient;

describe('api-client', () => {
    const jobId = 'Umx5c6F7pH7r';

    beforeEach(() => {
        ApiRequestHandler.mockClear();
        sut = new RevAiApiClient('testtoken');
    });

    describe('getTranscriptObject', () => {
        const expectedTranscript = {
            "monologues": [{
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
            }]
        };

        it('get transcript object', async () => {
            const mockHandler = ApiRequestHandler.mock.instances[0];
            mockHandler.makeApiRequest.mockResolvedValue(expectedTranscript);

            const transcript = await sut.getTranscriptObject(jobId);

            expect(mockHandler.makeApiRequest).toBeCalledWith('get', `/jobs/${jobId}/transcript`,
                { 'Accept': `application/vnd.rev.transcript.v1.0+json` }, 'json');
            expect(mockHandler.makeApiRequest).toBeCalledTimes(1);
            expect(transcript).toEqual(expectedTranscript);
        });
    });

    describe('getTranscriptObjectStream', () => {
        const expectedTranscript = {
            "monologues": [{
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
            }]
        };

        it('get transcript object', async () => {
            const mockHandler = ApiRequestHandler.mock.instances[0];
            mockHandler.makeApiRequest.mockResolvedValue(objectToStream(expectedTranscript));

            const transcript = await sut.getTranscriptObjectStream(jobId);

            expect(mockHandler.makeApiRequest).toBeCalledWith('get', `/jobs/${jobId}/transcript`,
                { 'Accept': `application/vnd.rev.transcript.v1.0+json` }, 'stream');
            expect(mockHandler.makeApiRequest).toBeCalledTimes(1);
            expect(transcript.read()).toEqual(expectedTranscript);
        });
    });

    describe('getTranscriptText', () => {
        it('get transcript text', async () => {
            const expectedTranscript = 'Speaker 0    00:00:00    Hello World.'
            const mockHandler = ApiRequestHandler.mock.instances[0];
            mockHandler.makeApiRequest.mockResolvedValue(expectedTranscript);

            const transcript = await sut.getTranscriptText(jobId);

            expect(mockHandler.makeApiRequest).toBeCalledWith('get', `/jobs/${jobId}/transcript`,
                { 'Accept': 'text/plain' }, 'text');
            expect(mockHandler.makeApiRequest).toBeCalledTimes(1);
            expect(transcript).toEqual(expectedTranscript);
        });
    });

    describe('getTranscriptTextStream', () => {
        it('get transcript text stream', async () => {
            const expectedTranscript = 'Speaker 0    00:00:00    Hello World.'
            const mockHandler = ApiRequestHandler.mock.instances[0];
            mockHandler.makeApiRequest.mockResolvedValue(objectToStream(expectedTranscript));

            const transcript = await sut.getTranscriptTextStream(jobId);

            expect(mockHandler.makeApiRequest).toBeCalledWith('get',
                `/jobs/${jobId}/transcript`, { 'Accept': 'text/plain' }, 'stream');
            expect(mockHandler.makeApiRequest).toBeCalledTimes(1);
            expect(transcript.read()).toEqual(expectedTranscript);
        });
    });
});