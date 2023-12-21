import { RevAiApiClient } from '../../../src/api-client';
import { ApiRequestHandler } from '../../../src/api-request-handler';
import { objectToStream } from '../testhelpers';

jest.mock('../../../src/api-request-handler');

describe('api-client', () => {
    let sut: RevAiApiClient;
    let mockMakeApiRequest: jest.Mock;

    const jobId = 'Umx5c6F7pH7r';
    const translationLanguage = 'es';

    beforeEach(() => {
        mockMakeApiRequest = jest.fn();
        (ApiRequestHandler as jest.Mock<ApiRequestHandler>).mockImplementationOnce(() => ({
            makeApiRequest: mockMakeApiRequest
        }));
        sut = new RevAiApiClient({ token: 'testtoken' });
    });

    describe('getTranslatedCaptions', () => {
        it('gets captions defaults to srt', async () => {
            const expectedTranscript = '1\n00:00:00,000 --> 00:00:05,000\nHello World.';
            mockMakeApiRequest.mockResolvedValue(objectToStream(expectedTranscript));

            const transcript = await sut.getTranslatedCaptions(jobId, translationLanguage);

            expect(mockMakeApiRequest).toBeCalledWith('get', `/jobs/${jobId}/captions/translation/${translationLanguage}`,
                { 'Accept': 'application/x-subrip' }, 'stream');
            expect(mockMakeApiRequest).toBeCalledTimes(1);
            expect(transcript.read().toString()).toEqual(expectedTranscript);
        });

        it.each([['application/x-subrip', 'text/vtt']])('uses given content type', async (contentType) => {
            await sut.getTranslatedCaptions(jobId, translationLanguage, contentType);

            expect(mockMakeApiRequest).toBeCalledWith('get', `/jobs/${jobId}/captions/translation/${translationLanguage}`,
                { 'Accept': contentType }, 'stream');
            expect(mockMakeApiRequest).toBeCalledTimes(1);
        });

        it('attaches channelId if given', async () => {
            await sut.getTranslatedCaptions(jobId, translationLanguage, null, 1);

            expect(mockMakeApiRequest).toBeCalledWith('get', `/jobs/${jobId}/captions/translation/${translationLanguage}?speaker_channel=1`,
                { 'Accept': 'application/x-subrip' }, 'stream');
            expect(mockMakeApiRequest).toBeCalledTimes(1);
        });
    });
});