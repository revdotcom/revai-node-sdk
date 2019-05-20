import { Element } from '../RevAiApiTranscript';

export default interface StreamingResponse {
    type: string;
    transcript?: string;
    ts?: number;
    end_ts?: number;
    elements: Element[];
}