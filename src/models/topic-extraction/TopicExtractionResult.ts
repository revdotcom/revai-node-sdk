/**
 *
 */
export interface TopicExtractionResult {
    topics: Topic[];
}

/** Topic extraction topic */
export interface Topic {
    topicName: string;
    score: number;
    informants: Informant[];
}

/** Topic extraction informant */
export interface Informant {
    content: string;
    ts?: number;
    endTs?: number;
    offset?: number;
    length?: number;
}

/** Query results options */
export interface TopicExtractionResultsOptions {
    threshold?: number;
}
