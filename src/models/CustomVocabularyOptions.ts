import { CustomerUrlData } from './CustomerUrlData';
import { CustomVocabulary } from './CustomVocabulary';

export interface CustomVocabularyOptions {
    callback_url?: string;
    notification_config?: CustomerUrlData;
    metadata?: string;
    custom_vocabularies: CustomVocabulary[];
}