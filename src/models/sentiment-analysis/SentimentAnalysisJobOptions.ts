import { CustomerUrlData } from '../CustomerUrlData';
import { RevAiApiTranscript } from '../RevAiApiTranscript';

/**
 * Options that can used when submitting Rev AI sentiment analysis job.
 * See https://docs.rev.ai/api/sentiment-analysis/reference/#operation/SubmitSentimentAnalysisJob for more details.
 */
export interface SentimentAnalysisJobOptions {
    metadata?: string;
    notification_config?: CustomerUrlData;
    delete_after_seconds?: number;
    language?: string;
    text?: string;
    json?: RevAiApiTranscript;
}