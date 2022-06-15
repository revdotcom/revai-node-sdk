export interface RevAiApiTranscript {
    monologues: Monologue[];
}

export interface SpeakerInfo {
    id: string;
    display_name: string;
}

export interface Monologue {
    speaker: number;
    speaker_info?: SpeakerInfo;
    elements: Element[];
}

export interface Element {
    type: string;
    value: string;
    ts?: number;
    end_ts?: number;
    confidence?: number;
}
