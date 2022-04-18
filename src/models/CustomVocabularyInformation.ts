import { CustomerUrlData } from './CustomerUrlData';
import {CustomVocabularyStatus} from './CustomVocabularyStatus';

export interface CustomVocabularyInformation {
    id: string;
    status: CustomVocabularyStatus;
    created_on: string;
    notification_config?: CustomerUrlData;
    failure?: string;
    failuredetail?: string;
}