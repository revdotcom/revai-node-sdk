import { CustomerUrlData } from '../CustomerUrlData';
import { CustomVocabulary } from '../CustomVocabulary';

export interface SegmentToTranscribe {
    start: number;
    end: number;
}

export interface SpeakerName {
    display_name: string;
}

/**
 * Options that can used when submitting Rev AI speech-to-text job.
 * See https://docs.rev.ai/api/asynchronous/reference/#operation/SubmitTranscriptionJob for more details.
 */
export interface RevAiJobOptions {
    media_url?: string;
    source_config?: CustomerUrlData;
    metadata?: string;
    callback_url?: string;
    notification_config?: CustomerUrlData;
    skip_diarization?: boolean;
    skip_punctuation?: boolean;
    skip_postprocessing?: boolean;
    diarization_type?: string;
    speaker_channels_count?: number;
    custom_vocabulary_id?: string;
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
    speaker_names?: SpeakerName[];
}
