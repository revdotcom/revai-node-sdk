import { TranslationJobStatus } from './TranslationJobStatus';
import { TranslationLanguageOptions } from './TranslationLanguageOptions';

export interface TranslationLanguage extends TranslationLanguageOptions {
    status: TranslationJobStatus;
    failure: string;
}


