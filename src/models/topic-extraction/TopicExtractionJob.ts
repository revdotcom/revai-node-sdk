import { JobStatus } from '../JobStatus';

/** Topic extraction job model */
export interface TopicExtractionJob {
    id: string;
    status: JobStatus;
    type: string;
    created_on: string;
    completed_on?: string;
    metadata?: string;
    callback_url?: string;
    delete_after_seconds?: number;
    failure?: string;
    failure_detail?: string;
    word_count?: number;
    language?: string;
}