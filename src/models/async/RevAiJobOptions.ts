import { CustomVocabulary } from '../CustomVocabulary';

export interface SegmentToTranscribe {
    start: number;
    end: number;
}

/**
 * Options that can used when submitting Rev.ai speech-to-text job.
 * See https://www.rev.ai/docs#operation/SubmitTranscriptionJob for more details.
 */
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
    language?: string;
    transcriber?: string;
    verbatim?: boolean;
    rush?: boolean;
    test_mode?: boolean;
    segments_to_transcribe?: SegmentToTranscribe[];
}
