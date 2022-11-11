import { ApiRequestHandler } from '../../src/api-request-handler';
import { RevAiCustomVocabulariesClient } from '../../src/custom-vocabularies-client';

jest.mock('../../src/api-request-handler');

let sut: RevAiCustomVocabulariesClient;

describe('custom-vocabularies-client', () => {
    const customVocabularies = [
        { phrases: ['my', 'test', 'custom', 'vocabularies'] }
    ];
    const callbackUrl = 'example.com';
    const callbackAuth = { 'Authorization': 'Bearer token' };
    const metadata = 'my metadata';
    const notificationConfig = {
        url: callbackUrl,
        auth_headers: callbackAuth
    };
    const customVocabularyLegacyOptions = {
        custom_vocabularies: customVocabularies,
        callback_url: callbackUrl,
        metadata: metadata
    };
    const customVocabularyOptions = {
        custom_vocabularies: customVocabularies,
        notification_config: notificationConfig,
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
        it('submit custom vocabularies with the callback url', async () => {
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
                customVocabularyLegacyOptions
            );
            expect(mockHandler.makeApiRequest).toBeCalledTimes(1);
            expect(customVocabularyInformation).toEqual(customVocabularyDetails);
        });

        it('submit custom vocabularies with the notification config', async () => {
            const mockHandler = ApiRequestHandler.mock.instances[0];
            mockHandler.makeApiRequest.mockResolvedValue(customVocabularyDetails);

            const customVocabularyInformation = await sut.submitCustomVocabularies(
                customVocabularies,
                null,
                metadata,
                notificationConfig
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
        it('get custom vocabulary by id', async () => {
            const mockHandler = ApiRequestHandler.mock.instances[0];
            mockHandler.makeApiRequest.mockResolvedValue(customVocabularyDetails);

            const customVocabularyInformation = await sut.getCustomVocabularyInformation(customVocabularyId);

            expect(mockHandler.makeApiRequest).toBeCalledWith('get', `/${customVocabularyDetails.id}`, {}, 'json');
            expect(mockHandler.makeApiRequest).toBeCalledTimes(1);
            expect(customVocabularyInformation).toEqual(customVocabularyDetails);
        });
    });

    describe('getListOfCustomVocabularyInformations', () => {
        it('get list of custom vocabulary informations', async () => {
            const mockHandler = ApiRequestHandler.mock.instances[0];
            mockHandler.makeApiRequest.mockResolvedValue([customVocabularyDetails]);

            const informations = await sut.getListOfCustomVocabularyInformations();

            expect(informations).toEqual([customVocabularyDetails]);
            expect(mockHandler.makeApiRequest).toBeCalledWith('get', '', {}, 'json');
            expect(mockHandler.makeApiRequest).toBeCalledTimes(1);
        });

        it('get list of custom vocabulary informations with limit of 5', async () => {
            const customVocabularyDetails2 = {
                id: 'myUniqueId2',
                status: 'complete',
                created_on: '2018-05-05T23:23:22.29Z'
            };
            const mockHandler = ApiRequestHandler.mock.instances[0];
            mockHandler.makeApiRequest.mockResolvedValue([customVocabularyDetails, customVocabularyDetails2]);

            const informations = await sut.getListOfCustomVocabularyInformations(5);

            expect(informations).toEqual([customVocabularyDetails, customVocabularyDetails2]);
            expect(mockHandler.makeApiRequest).toBeCalledWith('get', '?limit=5', {}, 'json');
            expect(mockHandler.makeApiRequest).toBeCalledTimes(1);
        });
    });

    describe('deleteCustomVocabulary', () => {
        it('delete custom vocabulary by id', async () => {
            const mockHandler = ApiRequestHandler.mock.instances[0];
            mockHandler.makeApiRequest.mockResolvedValue(null);

            const res = await sut.deleteCustomVocabulary(customVocabularyId);

            expect(mockHandler.makeApiRequest).toBeCalledWith('delete', `/${customVocabularyDetails.id}`, {}, 'text');
            expect(mockHandler.makeApiRequest).toBeCalledTimes(1);
            expect(res).toBe(null);
        });
    });
});
