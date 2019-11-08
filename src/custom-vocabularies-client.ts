import * as FormData from 'form-data';
import * as fs from 'fs';
import { Readable } from 'stream';

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
        this.apiHandler = new ApiRequestHandler(`https://api.rev.ai/revspeech/${version}/vocabularies`, accessToken);
    }

    public async submitCustomVocabularies(
        customVocabularies: CustomVocabulary[],
        callbackUrl: string = undefined,
        metadata: string = undefined
    ): Promise<RevAiApiCustomVocabulary> {
        if (!customVocabularies) {
            throw Error('Custom Vocabularies not provided');
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

    public async getCustomVocabulary(id: string): Promise<RevAiApiCustomVocabulary> {
        if (!id) {
            throw Error('Custom Vocabulary ID not provided');
        }
        return this.apiHandler.makeApiRequest('get', '', {}, 'json', { 'id': id });
    }
}