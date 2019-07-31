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
    ts?: Element;
    end_ts?: Element;
    elements: Element[];
}

/**
 * Represents a connected message from the rev.ai streaming service. Id is the id of the created job.
 */
export interface StreamingConnected extends StreamingResponse {
    id: string;
}