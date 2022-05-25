/**
 * Language id result model.
 * See https://docs.rev.ai/api/language-identification/reference/#operation/GetLanguageIdentificationResultById for more details.
 */
export interface LanguageIdResult {
    top_language: string;
    language_confidences: LanguageConfidence[];
}

/** Language id language confidence */
export interface LanguageConfidence {
    language: string;
    confidence: number;
}