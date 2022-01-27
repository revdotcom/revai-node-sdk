import { CustomVocabulary } from '../CustomVocabulary';

interface RevAiBaseJobOptions {
    media_url?: string;
    metadata?: string;
    callback_url?: string;
    skip_diarization?: boolean;
    skip_punctuation?: boolean;
    custom_vocabularies?: CustomVocabulary[];
    filter_profanity?: boolean;
    delete_after_seconds?: number;
    language?: string;
}

export interface RevAiJobOptions extends RevAiBaseJobOptions {
    speaker_channels_count?: number;
    remove_disfluencies?: boolean;
    transcriber?: string;
}

export interface RevAiHumanTranscriptionJobOptions extends RevAiBaseJobOptions {
    verbatim?: boolean;
    rush?: boolean;
    segments_to_transcribe?: boolean;
    test_mode?: boolean;
}
