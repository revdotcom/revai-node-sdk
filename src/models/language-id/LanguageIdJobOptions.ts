import { CustomerUrlData } from '../CustomerUrlData';

/**
 * Options that can used when submitting Rev AI language id job.
 * See https://docs.rev.ai/api/language-identification/reference/#operation/SubmitLanguageIdentificationJob for more details.
 */
export interface LanguageIdJobOptions {
    media_url?: string;
    source_config?: CustomerUrlData;
    metadata?: string;
    callback_url?: string;
    notification_config?: CustomerUrlData;
    delete_after_seconds?: number;
}