import { ApiRequestHandler } from './api-request-handler';
import { CustomVocabulary } from './models/CustomVocabulary';
import { CustomVocabularyOptions } from './models/CustomVocabularyOptions';
import { RevAiApiCustomVocabulary } from './models/RevAiApiCustomVocabulary';

/**
* Client which handles communication with custom vocabularies
* Rev.ai api
*/
export class RevAiCustomVocabulariesClient {
    apiHandler: ApiRequestHandler;

    /**
    * @param accessToken Access token used to authenticate API requests
    * @param version (optional) version of the API to be used
    */
    constructor(accessToken: string, version: string = 'v1') {
        this.apiHandler = new ApiRequestHandler(`https://api.rev.ai/speechtotext/${version}/vocabularies`, accessToken);
    }

    public async submitCustomVocabularies(
        customVocabularies: CustomVocabulary[],
        callbackUrl: string = undefined,
        metadata: string = undefined
    ): Promise<RevAiApiCustomVocabulary> {
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

    public async getCustomVocabularyInformation(id: string): Promise<RevAiApiCustomVocabulary> {
        if (!id) {
            throw Error('id is a required parameter');
        }
        return await this.apiHandler.makeApiRequest('get', `/${id}`, {}, 'json');
    }
}