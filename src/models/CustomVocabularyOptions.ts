import { CustomerUrlData } from './CustomerUrlData';
import { CustomVocabulary } from './CustomVocabulary';

export interface CustomVocabularyOptions {
    notification_config?: CustomerUrlData;
    metadata?: string;
    custom_vocabularies: CustomVocabulary[];
}