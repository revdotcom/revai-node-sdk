import { JobStatus } from '../JobStatus';
import { JobType } from '../JobType';

/** Language id job model */
export interface LanguageIdJob {
    id: string;
    status: JobStatus;
    type: JobType;
    created_on: string;
    completed_on?: string;
    metadata?: string;
    callback_url?: string;
    processed_duration_seconds?: number;
    media_url?: string;
    failure?: string;
    failure_detail?: string;
    delete_after_seconds?: number;
}