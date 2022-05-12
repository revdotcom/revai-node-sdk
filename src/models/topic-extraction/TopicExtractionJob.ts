import { JobStatus } from '../JobStatus';

/**
 * 
 */
export interface TopicExtractionJob {
    type: 'topic_extraction';
    id: string;
    status: JobStatus;
    createdOn: string;
    completedOn?: string;
    metadata?: string;
    callbackUrl?: string;
    deleteAfterSeconds?: number;
    failure?: string;
    failureDetail?: string;
    wordCount?: number;
    language?: string;
}
