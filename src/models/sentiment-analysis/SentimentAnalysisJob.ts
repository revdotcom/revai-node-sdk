import { JobStatus } from '../JobStatus';
import { JobType } from '../JobType';

/**
 * Sentiment analysis job details model.
 * See https://docs.rev.ai/api/topic-extraction/reference/#operation/GetSentimentAnalysisJobById for more details.
 */
export interface SentimentAnalysisJob {
    id: string;
    status: JobStatus;
    type: JobType;
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