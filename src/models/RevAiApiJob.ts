import { SegmentToTranscribe } from './async/RevAiJobOptions';
import { JobStatus } from './JobStatus';
import { JobType } from './JobType';

/** Speech to text job model */
export interface RevAiApiJob {
    id: string;
    status: JobStatus;
    type: JobType;
    created_on: string;
    completed_on?: string;
    metadata?: string;
    name?: string;
    callback_url?: string;
    duration_seconds?: number;
    media_url?: string;
    failure?: string;
    failure_detail?: string;
    delete_after_seconds?: number;
    skip_diarization?: boolean;
    skip_punctuation?: boolean;
    remove_disfluencies?: boolean;
    filter_profanity?: boolean;
    custom_vocabulary_id?: string;
    speaker_channels_count?: number;
    language?: string;
    transcriber?: string;
    verbatim?: boolean;
    rush?: boolean;
    segments_to_transcribe?: SegmentToTranscribe[];
}
