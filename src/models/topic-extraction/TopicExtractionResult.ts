/** Topic extraction result model*/
export interface TopicExtractionResult {
    topics: Topic[];
}

/** Topic extraction topic */
export interface Topic {
    topic_name: string;
    score: number;
    informants: Informant[];
}

/** Topic extraction informant */
export interface Informant {
    content: string;
    ts?: number;
    end_ts?: number;
    offset?: number;
    length?: number;
}

