export default interface RevAiApiTranscript {
    monologues: Monologue[];
}

export interface Monologue {
    speaker: number;
    elements: Element[];
}

export interface Element {
    type: string;
    value: string;
    ts?: number;
    end_ts?: number;
    confidence?: number;
}
