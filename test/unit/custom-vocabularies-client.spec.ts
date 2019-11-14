import { ApiRequestHandler } from '../../src/api-request-handler';
import { RevAiCustomVocabulariesClient } from '../../src/custom-vocabularies-client';

import { objectToStream } from './testhelpers';

jest.mock('../../src/api-request-handler');

let sut: RevAiCustomVocabulariesClient;

describe('custom-vocabularies-client', () => {
    const customVocabularies = [
        {phrases: ['my', 'test', 'custom', 'vocabularies']}
    ];
    const callbackUrl = 'example.com';
    const metadata = 'my metadata';
    const customVocabularyOptions = {
        custom_vocabularies: customVocabularies,
        callback_url: callbackUrl,
        metadata: metadata
    };

    const customVocabularyId = 'myUniqueID';
    const customVocabularyDetails = {
        id: customVocabularyId,
        status: 'in_progress',
        created_on: '2018-05-05T23:23:22.29Z'
    };

    beforeEach(() => {
        ApiRequestHandler.mockClear();
        sut = new RevAiCustomVocabulariesClient('testtoken');
    });

    describe('submitCustomVocabularies', () => {
        it('submit customVocabularies', async () => {
            const mockHandler = ApiRequestHandler.mock.instances[0];
            mockHandler.makeApiRequest.mockResolvedValue(customVocabularyDetails);

            const customVocabularyInformation = await sut.submitCustomVocabularies(
                customVocabularies,
                callbackUrl,
                metadata
            );

            expect(mockHandler.makeApiRequest).toBeCalledWith(
                'post',
                '',
                { 'Content-Type': 'application/json' },
                'json',
                customVocabularyOptions
            );
            expect(mockHandler.makeApiRequest).toBeCalledTimes(1);
            expect(customVocabularyInformation).toEqual(customVocabularyDetails);
        });
    });

    describe('getCustomVocabularyInformation', () => {
        it('get customVocabulary by id', async () => {
            const mockHandler = ApiRequestHandler.mock.instances[0];
            mockHandler.makeApiRequest.mockResolvedValue(customVocabularyDetails);

            const customVocabularyInformation = await sut.getCustomVocabularyInformation(customVocabularyId);

            expect(mockHandler.makeApiRequest).toBeCalledWith('get', `/${customVocabularyDetails.id}`, {}, 'json');
            expect(mockHandler.makeApiRequest).toBeCalledTimes(1);
            expect(customVocabularyInformation).toEqual(customVocabularyDetails);
        });
    });
});
