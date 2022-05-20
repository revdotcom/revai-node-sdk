import { RevAiApiTranscript } from '../RevAiApiTranscript';

/**
 * Options that can used when submitting Rev AI topic extraction job.
 * See https://docs.rev.ai/api/topic-extraction/reference/#operation/SubmitTopicExtractionJob for more details.
 */
export interface TopicExtractionJobOptions {
    metadata?: string;
    callback_url?: string;
    delete_after_seconds?: number;
    language?: string;
    text?: string;
    json?: RevAiApiTranscript;
}