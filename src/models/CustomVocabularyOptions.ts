import { CustomVocabulary } from './CustomVocabulary';

export interface CustomVocabularyOptions {
    callback_url?: string;
    metadata?: string;
    custom_vocabularies: CustomVocabulary[];
}