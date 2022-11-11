import { ApiRequestHandler } from './api-request-handler';
import { CustomerUrlData } from './models/CustomerUrlData';
import { CustomVocabulary } from './models/CustomVocabulary';
import { CustomVocabularyInformation } from './models/CustomVocabularyInformation';
import { CustomVocabularyOptions } from './models/CustomVocabularyOptions';

/**
* Client to submit and retrieve status of custom vocabularies
* from the Rev AI api. Check https://docs.rev.ai/api/custom-vocabulary/ for more information.
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
     * See https://docs.rev.ai/api/custom-vocabulary/reference/#operation/SubmitCustomVocabulary
     * Submit custom vocabularies to be built. This is primarily
     * useful for using the custom vocabulary with streaming jobs.
     * @param customVocabularies array of CustomVocabulary objects.
     *                           For more information visit https://docs.rev.ai/api/custom-vocabulary/reference/#operation/SubmitCustomVocabulary!path=custom_vocabularies&t=request
     * @param callbackUrl (optional) string url to be called when custom vocabulary submission is completed
     * @param metadata (optional) string to include with this custom vocabulary submission
     * @param notificationConfig (optional) Object including notification url and authorization header
     *                           to use when calling the url
     * @returns Submitted custom vocabulary information
     */
    async submitCustomVocabularies(
        customVocabularies: CustomVocabulary[],
        callbackUrl: string = undefined,
        metadata: string = undefined,
        notificationConfig: CustomerUrlData = undefined
    ): Promise<CustomVocabularyInformation> {
        if (!customVocabularies) {
            throw Error('customVocabularies is a required parameter');
        }

        const options: CustomVocabularyOptions = { custom_vocabularies: customVocabularies };
        if (callbackUrl) {
            options.callback_url = callbackUrl;
        }
        if (notificationConfig) {
            options.notification_config = notificationConfig;
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
     * See https://docs.rev.ai/api/custom-vocabulary/reference/#operation/GetCustomVocabulary
     * Retrieve the information of a submitted custom vocabulary.
     * @param id string id of the custom vocabulary submission whose
     *           information is to be retrieved.
     * @returns Custom vocabulary information
     */
    async getCustomVocabularyInformation(id: string): Promise<CustomVocabularyInformation> {
        if (!id) {
            throw Error('id is a required parameter');
        }

        return await this.apiHandler.makeApiRequest('get', `/${id}`, {}, 'json');
    }

    /**
     * See https://docs.rev.ai/api/custom-vocabulary/reference/#operation/GetCustomVocabularies
     * Gets a list of most recent custom vocabularies' processing information
     * @param limit (optional) maximum number of jobs to retrieve, default is 100, maximum is 1000
     * @returns List of custom vocabulary informations
     */
    async getListOfCustomVocabularyInformations(limit?: number): Promise<CustomVocabularyInformation[]> {
        const url = limit ? `?limit=${limit}` : '';
        return await this.apiHandler.makeApiRequest<CustomVocabularyInformation[]>('get', url, {}, 'json');
    }

    /**
     * See https://docs.rev.ai/api/custom-vocabulary/reference/#operation/DeleteCustomVocabulary
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
