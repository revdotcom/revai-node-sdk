import { Element } from '../RevAiApiTranscript';

export interface StreamingResponse {
    type: string;
}

export interface StreamingHypothesis extends StreamingResponse {
    transcript?: string;
    ts?: number;
    end_ts?: number;
    elements: Element[];
}

export interface StreamingConnected extends StreamingResponse {
    id: string;
}