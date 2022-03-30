import { Element } from '../RevAiApiTranscript';

/**
 * Represents a response from the Rev AI streaming service
 */
export interface StreamingResponse {
    type: string;
}

/**
 * Represents a hypothesis response from the Rev AI streaming service. Both final and partial.
 */
export interface StreamingHypothesis extends StreamingResponse {
    ts?: number;
    end_ts?: number;
    elements: Element[];
}

/**
 * Represents a connected message from the Rev AI streaming service. Id is the id of the created job.
 */
export interface StreamingConnected extends StreamingResponse {
    id: string;
}