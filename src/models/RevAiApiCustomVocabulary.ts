import {CustomVocabularyStatus} from './CustomVocabularyStatus';

export interface RevAiApiCustomVocabulary {
    id: string;
    status: CustomVocabularyStatus;
    created_on: string;
    callbackurl?: string;
    failure?: string;
    failuredetail?: string;
}