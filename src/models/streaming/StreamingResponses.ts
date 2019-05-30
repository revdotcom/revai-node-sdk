import { Element } from '../RevAiApiTranscript';

/**
 * Represents a response from the rev.ai streaming service
 */
export interface StreamingResponse {
    type: string;
}

/**
 * Represents a hypothesis response from the rev.ai streaming service. Both final and partial.
 */
export interface StreamingHypothesis extends StreamingResponse {
    transcript?: string;
    ts?: number;
    end_ts?: number;
    elements: Element[];
}

/**
 * Represents a connected message from the rev.ai streaming service. Id is the id of the created job.
 */
export interface StreamingConnected extends StreamingResponse {
    id: string;
}