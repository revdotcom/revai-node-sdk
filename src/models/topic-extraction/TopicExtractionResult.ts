/**
 * Topic extraction result model.
 * See https://docs.rev.ai/api/topic-extraction/reference/#operation/GetTopicExtractionResultById for more details.
 */
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
