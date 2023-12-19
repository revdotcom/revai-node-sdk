import { TranslationLanguage } from './TranslationLanguage';


export interface Translation {
    target_languages: TranslationLanguage[];
    completed_on?: string;
}
