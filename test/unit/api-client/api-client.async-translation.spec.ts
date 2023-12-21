import { RevAiApiClient } from '../../../src/api-client';
import { ApiRequestHandler } from '../../../src/api-request-handler';
import { objectToStream } from '../testhelpers';

jest.mock('../../../src/api-request-handler');

describe('api-client', () => {
    let sut: RevAiApiClient;
    let mockMakeApiRequest: jest.Mock;

    const jobId = 'test-job-id';
    const translationLanguage = 'es';

    beforeEach(() => {
        mockMakeApiRequest = jest.fn();
        (ApiRequestHandler as jest.Mock<ApiRequestHandler>).mockImplementationOnce(() => ({
            makeApiRequest: mockMakeApiRequest
        }));
        sut = new RevAiApiClient({ token: 'testtoken' });
    });

    describe('getTranslatedTranscriptObject', () => {
        const expectedTranscript = {
            monologues: [{
                speaker: 1,
                elements: [
                    {
                        'type': 'text',
                        'value': 'Hello',
                        'ts': 0.5,
                        'end_ts': 1.5,
                        'confidence': 1
                    },
                    {
                        'type': 'text',
                        'value': 'World',
                        'ts': 1.75,
                        'end_ts': 2.85,
                        'confidence': 0.8
                    },
                    {
                        'type': 'punct',
                        'value': '.'
                    }
                ]
            }]
        };

        it('get transcript object', async () => {
            mockMakeApiRequest.mockResolvedValue(expectedTranscript);

            const transcript = await sut.getTranslatedTranscriptObject(jobId, translationLanguage);

            expect(mockMakeApiRequest).toBeCalledWith('get',
                `/jobs/${jobId}/transcript/translation/${translationLanguage}`,
                { 'Accept': 'application/vnd.rev.transcript.v1.0+json' }, 'json');
            expect(mockMakeApiRequest).toBeCalledTimes(1);
            expect(transcript).toEqual(expectedTranscript);
        });
    });

    describe('getTranslatedTranscriptObjectStream', () => {
        const expectedTranscript = {
            monologues: [{
                speaker: 1,
                elements: [
                    {
                        'type': 'text',
                        'value': 'Hello',
                        'ts': 0.5,
                        'end_ts': 1.5,
                        'confidence': 1
                    },
                    {
                        'type': 'text',
                        'value': 'World',
                        'ts': 1.75,
                        'end_ts': 2.85,
                        'confidence': 0.8
                    },
                    {
                        'type': 'punct',
                        'value': '.'
                    }
                ]
            }]
        };

        it('get transcript object', async () => {
            mockMakeApiRequest.mockResolvedValue(objectToStream(expectedTranscript));

            const transcript = await sut.getTranslatedTranscriptObjectStream(jobId, translationLanguage);

            expect(mockMakeApiRequest).toBeCalledWith('get',
                `/jobs/${jobId}/transcript/translation/${translationLanguage}`,
                { 'Accept': 'application/vnd.rev.transcript.v1.0+json' }, 'stream');
            expect(mockMakeApiRequest).toBeCalledTimes(1);
            expect(transcript.read()).toEqual(expectedTranscript);
        });
    });

    describe('getTranslatedTranscriptText', () => {
        it('get transcript text', async () => {
            const expectedTranscript = 'Speaker 0    00:00:00    Hello World.';
            mockMakeApiRequest.mockResolvedValue(expectedTranscript);

            const transcript = await sut.getTranslatedTranscriptText(jobId, translationLanguage);

            expect(mockMakeApiRequest).toBeCalledWith('get',
                `/jobs/${jobId}/transcript/translation/${translationLanguage}`,
                { 'Accept': 'text/plain' }, 'text');
            expect(mockMakeApiRequest).toBeCalledTimes(1);
            expect(transcript).toEqual(expectedTranscript);
        });
    });

    describe('getTranslatedTranscriptTextStream', () => {
        it('get transcript text stream', async () => {
            const expectedTranscript = 'Speaker 0    00:00:00    Hello World.';
            mockMakeApiRequest.mockResolvedValue(objectToStream(expectedTranscript));

            const transcript = await sut.getTranslatedTranscriptTextStream(jobId, translationLanguage);

            expect(mockMakeApiRequest).toBeCalledWith('get',
                `/jobs/${jobId}/transcript/translation/${translationLanguage}`, { 'Accept': 'text/plain' }, 'stream');
            expect(mockMakeApiRequest).toBeCalledTimes(1);
            expect(transcript.read()).toEqual(expectedTranscript);
        });
    });
});
