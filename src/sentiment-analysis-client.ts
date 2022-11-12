/* eslint-disable no-underscore-dangle */
import { BaseApiClient } from './base-api-client';
import { GetListOfJobsOptions } from './models/GetListOfJobsOptions';
import { RevAiApiTranscript } from './models/RevAiApiTranscript';
import { SentimentAnalysisJob } from './models/sentiment-analysis/SentimentAnalysisJob';
import { SentimentAnalysisJobOptions } from './models/sentiment-analysis/SentimentAnalysisJobOptions';
import { SentimentAnalysisResult } from './models/sentiment-analysis/SentimentAnalysisResult';
import { SentimentAnalysisResultOptions } from './models/sentiment-analysis/SentimentAnalysisResultOptions';

const SentimentsContentType = 'application/vnd.rev.sentiment.v1.0+json';

/**
 * Client which handles connection to the Rev AI sentiment analysis API.
 */
export class SentimentAnalysisClient extends BaseApiClient<SentimentAnalysisJob, SentimentAnalysisResult> {
    /**
     * @param accessToken Access token used to validate API requests
     */
    constructor (accessToken: string) {
        super(accessToken, 'sentiment_analysis', 'v1');
    }

    /**
     * See https://docs.rev.ai/api/sentiment-analysis/reference/#operation/GetSentimentAnalysisJobById
     * Get information about a specific sentiment analysis job
     * @param id Id of job whose details are to be retrieved
     * @returns Job details
     */
    async getJobDetails(id: string): Promise<SentimentAnalysisJob> {
        return super._getJobDetails(id);
    }

    /**
     * See https://docs.rev.ai/api/sentiment-analysis/reference/#operation/GetListOfSentimentAnalysisJobs
     * Get a list of sentiment analysis jobs submitted within the last 30 days in reverse chronological order
     * @param options Job options for getting list of jobs
     * @returns List of job details
     */
    async getListOfJobs(options?: GetListOfJobsOptions): Promise<SentimentAnalysisJob[]> {
        return super._getListOfJobs(options);
    }

    /**
     * See https://docs.rev.ai/api/sentiment-analysis/reference/#operation/DeleteSentimentAnalysisJobById
     * Delete a specific sentiment analysis job.
     * All data related to the job, such as input and result, will be permanently deleted.
     * A job can only by deleted once it's in a terminal state.
     * @param id Id of job to be deleted
     */
    async deleteJob(id: string): Promise<void> {
        return super._deleteJob(id);
    }

    /**
     * See https://docs.rev.ai/api/sentiment-analysis/reference/#operation/SubmitSentimentAnalysisJob
     * Submits a sentiment analysis job with plain text as the input.
     * @param options Options submitted with the job: see SentimentAnalysisJobOptions object
     * @returns Details of the submitted job
     */
    async submitJobFromText(text: string, options: SentimentAnalysisJobOptions = {}): Promise<SentimentAnalysisJob> {
        options = { ...options, text: text };
        return super._submitJob(options);
    }

    /**
     * See https://docs.rev.ai/api/sentiment-analysis/reference/#operation/SubmitSentimentAnalysisJob
     * Submits a sentiment analysis job with a json transcript as the input.
     * @param options Options submitted with the job: see SentimentAnalysisJobOptions object
     * @returns Details of the submitted job
     */
    async submitJobFromJson(json: RevAiApiTranscript,
        options: SentimentAnalysisJobOptions = {}): Promise<SentimentAnalysisJob> {
        options = { ...options, json: json };
        return super._submitJob(options);
    }

    /**
     * See https://docs.rev.ai/api/sentiment-analysis/reference/#operation/GetSentimentAnalysisResultById
     * Get the result of a sentiment analysis job.
     * @param id Id of job to get result of
     * @param options Options submitted with getting results
     * @returns sentiment analysis job result
     */
    async getResult(id: string, options?: SentimentAnalysisResultOptions): Promise<SentimentAnalysisResult> {
        return super._getResult(id, options, { 'Accept': SentimentsContentType });
    }
}
