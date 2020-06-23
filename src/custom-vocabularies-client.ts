import { ApiRequestHandler } from './api-request-handler';
import { CustomVocabulary } from './models/CustomVocabulary';
import { CustomVocabularyInformation } from './models/CustomVocabularyInformation';
import { CustomVocabularyOptions } from './models/CustomVocabularyOptions';

/**
* Client to submit and retreive status of custom vocabularies
* from the rev.ai api. Check rev.ai/docs for more information.
*/
export class RevAiCustomVocabulariesClient {
    apiHandler: ApiRequestHandler;

    /**
     * @param accessToken Access token used to authenticate API requests
     * @param version (optional) version of the API to be used
     */
    constructor(accessToken: string, version: string = 'v1') {
        this.apiHandler = new ApiRequestHandler(
            `https://api.rev.ai/speechtotext/${version}/vocabularies`,
            accessToken
        );
    }

    /**
     * See https://www.rev.ai/docs/streaming#operation/SubmitCustomVocabulary
     * Submit custom vocabularies to be built. This is primarily
     * useful for using the custom vocabulary with streaming jobs.
     * @param customVocabularies array of CustomVocabulary objects.
     *                           For more information visit rev.ai/docs
     * @param callbackUrl (optional) string url to be called when custom
     *                    vocabulary submission is completed
     * @param metadata (optional) string to include with this custom
     *                 vocabulary submission
     */
    async submitCustomVocabularies(
        customVocabularies: CustomVocabulary[],
        callbackUrl: string = undefined,
        metadata: string = undefined
    ): Promise<CustomVocabularyInformation> {
        if (!customVocabularies) {
            throw Error('customVocabularies is a required parameter');
        }

        let options: CustomVocabularyOptions = {custom_vocabularies: customVocabularies};
        if (callbackUrl) {
            options.callback_url = callbackUrl;
        }
        if (metadata) {
            options.metadata = metadata;
        }

        return await this.apiHandler.makeApiRequest(
            'post',
            '',
            { 'Content-Type': 'application/json' },
            'json',
            options
        );
    }

    /**
     * See https://www.rev.ai/docs/streaming#operation/GetCustomVocabulary
     * Retreive the information of a submitted custom vocabulary.
     * @param id string id of the custom vocabulary submission whose
     *           information is to be retreived.
     */
    async getCustomVocabularyInformation(id: string): Promise<CustomVocabularyInformation> {
        if (!id) {
            throw Error('id is a required parameter');
        }

        return await this.apiHandler.makeApiRequest('get', `/${id}`, {}, 'json');
    }

    /**
     * See https://www.rev.ai/docs/streaming#operation/DeleteCustomVocabulary
     * Delete a submitted custom vocabulary.
     * @param id string id of the custom vocabulary to be deleted
     */
    async deleteCustomVocabulary(id: string): Promise<void> {
        if (!id) {
            throw Error('id is a required parameter');
        }

        return await this.apiHandler.makeApiRequest('delete', `/${id}`, {}, 'text');
    }
}
