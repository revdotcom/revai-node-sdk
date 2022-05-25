import { Sentiment } from './Sentiment';

/**
 * Sentiment analysis result model.
 * See https://docs.rev.ai/api/sentiment-analysis/reference/#operation/GetSentimentAnalysisResultById for more details.
 */
export interface SentimentAnalysisResult {
    messages: SentimentAnalysisMessage[];
}

/** Sentiment analysis message */
export interface SentimentAnalysisMessage {
    content: string;
    score: number;
    sentiment: Sentiment;
    ts?: number;
    end_ts?: number;
    offset?: number;
    length?: number;
}
