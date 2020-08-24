import { CustomVocabulary } from '../CustomVocabulary';

export interface RevAiJobOptions {
    media_url?: string;
    metadata?: string;
    callback_url?: string;
    skip_diarization?: boolean;
    skip_punctuation?: boolean;
    speaker_channels_count?: number;
    custom_vocabularies?: CustomVocabulary[];
    filter_profanity?: boolean;
    remove_disfluencies?: boolean;
    delete_after_seconds?: number;
}
