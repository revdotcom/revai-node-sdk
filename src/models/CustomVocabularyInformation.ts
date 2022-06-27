import { CustomVocabularyStatus } from './CustomVocabularyStatus';

export interface CustomVocabularyInformation {
    id: string;
    status: CustomVocabularyStatus;
    created_on: string;
    callbackurl?: string;
    failure?: string;
    failuredetail?: string;
}