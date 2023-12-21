import { RevAiApiClient } from '../../../src/api-client';
import { ApiRequestHandler } from '../../../src/api-request-handler';
import { objectToStream } from '../testhelpers';

jest.mock('../../../src/api-request-handler');

describe('api-client', () => {
    let sut: RevAiApiClient;
    let mockMakeApiRequest: jest.Mock;

    const jobId = 'test-job-id';

    beforeEach(() => {
        mockMakeApiRequest = jest.fn();
        (ApiRequestHandler as jest.Mock<ApiRequestHandler>).mockImplementationOnce(() => ({
            makeApiRequest: mockMakeApiRequest
        }));
        sut = new RevAiApiClient({ token: 'testtoken' });
    });

    describe('getTranscriptSummaryObject', () => {
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

        it('get transcript summary object', async () => {
            mockMakeApiRequest.mockResolvedValue(expectedTranscript);

            const transcript = await sut.getTranscriptSummaryObject(jobId)

            expect(mockMakeApiRequest).toBeCalledWith('get', `/jobs/${jobId}/transcript/summary`,
                { 'Accept': 'application/json' }, 'json');
            expect(mockMakeApiRequest).toBeCalledTimes(1);
            expect(transcript).toEqual(expectedTranscript);
        });
    });

    describe('getTranscriptSummaryObjectStream', () => {
        const expectedTranscript = {
            summary: 'summary',
            bullet_points: ['bullet1','bullet2']
        };

        it('get transcript summary object', async () => {
            mockMakeApiRequest.mockResolvedValue(objectToStream(expectedTranscript));

            const transcript = await sut.getTranscriptSummaryObjectStream(jobId);

            expect(mockMakeApiRequest).toBeCalledWith('get', `/jobs/${jobId}/transcript/summary`,
                { 'Accept': 'application/json' }, 'stream');
            expect(mockMakeApiRequest).toBeCalledTimes(1);
            expect(transcript.read()).toEqual(expectedTranscript);
        });
    });

    describe('getTranscriptSummaryText', () => {
        it('get transcript summary text', async () => {
            const expectedTranscript = 'Speaker 0    00:00:00    Hello World.';
            mockMakeApiRequest.mockResolvedValue(expectedTranscript);

            const transcript = await sut.getTranscriptSummaryText(jobId);

            expect(mockMakeApiRequest).toBeCalledWith('get', `/jobs/${jobId}/transcript/summary`,
                { 'Accept': 'text/plain' }, 'text');
            expect(mockMakeApiRequest).toBeCalledTimes(1);
            expect(transcript).toEqual(expectedTranscript);
        });
    });

    describe('getTranscriptSummaryTextStream', () => {
        it('get transcript summary text stream', async () => {
            const expectedTranscript = 'Speaker 0    00:00:00    Hello World.';
            mockMakeApiRequest.mockResolvedValue(objectToStream(expectedTranscript));

            const transcript = await sut.getTranscriptSummaryTextStream(jobId);

            expect(mockMakeApiRequest).toBeCalledWith('get',
                `/jobs/${jobId}/transcript/summary`, { 'Accept': 'text/plain' }, 'stream');
            expect(mockMakeApiRequest).toBeCalledTimes(1);
            expect(transcript.read()).toEqual(expectedTranscript);
        });
    });
});
