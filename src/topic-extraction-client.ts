/* eslint-disable no-underscore-dangle */
import { BaseApiClient } from './base-api-client';
import { GetListOfJobsOptions } from './models/GetListOfJobsOptions';
import { RevAiApiTranscript } from './models/RevAiApiTranscript';
import { TopicExtractionJob } from './models/topic-extraction/TopicExtractionJob';
import { TopicExtractionJobOptions } from './models/topic-extraction/TopicExtractionJobOptions';
import { TopicExtractionResult } from './models/topic-extraction/TopicExtractionResult';
import { TopicExtractionResultOptions } from './models/topic-extraction/TopicExtractionResultOptions';

const TopicsContentType = 'application/vnd.rev.topic.v1.0+json';

/**
 * Client which handles connection to the Rev AI topic extraction API.
 */
export class TopicExtractionClient extends BaseApiClient<TopicExtractionJob, TopicExtractionResult> {
    /**
     * @param accessToken Access token used to validate API requests
     */
    constructor (accessToken: string) {
        super(accessToken, 'topic_extraction', 'v1');
    }

    /**
     * See https://docs.rev.ai/api/topic-extraction/reference/#operation/GetTopicExtractionJobById
     * Get information about a specific topic extraction job
     * @param id Id of job whose details are to be retrieved
     * @returns Job details
     */
    async getJobDetails(id: string): Promise<TopicExtractionJob> {
        return super._getJobDetails(id);
    }

    /**
     * See https://docs.rev.ai/api/topic-extraction/reference/#operation/GetListOfTopicExtractionJobs
     * Get a list of topic extraction jobs submitted within the last 30 days in reverse chronological order
     * @param options Job options for getting list of jobs
     * @returns List of job details
     */
    async getListOfJobs(options?: GetListOfJobsOptions): Promise<TopicExtractionJob[]> {
        return super._getListOfJobs(options);
    }

    /**
     * See https://docs.rev.ai/api/topic-extraction/reference/#operation/DeleteTopicExtractionJobById
     * Delete a specific topic extraction job.
     * All data related to the job, such as input and result, will be permanently deleted.
     * A job can only by deleted once it's in a terminal state.
     * @param id Id of job to be deleted
     */
    async deleteJob(id: string): Promise<void> {
        return super._deleteJob(id);
    }

    /**
     * See https://docs.rev.ai/api/topic-extraction/reference/#operation/SubmitTopicExtractionJob
     * Submits a topic extraction job with plain text as the input.
     * @param options Options submitted with the job: see TopicExtractionJobOptions object
     * @returns Details of the submitted job
     */
    async submitJobFromText(text: string, options: TopicExtractionJobOptions = {}): Promise<TopicExtractionJob> {
        options = { ...options, text: text };
        return super._submitJob(options);
    }

    /**
     * See https://docs.rev.ai/api/topic-extraction/reference/#operation/SubmitTopicExtractionJob
     * Submits a topic extraction job with a json transcript as the input.
     * @param options Options submitted with the job: see TopicExtractionJobOptions object
     * @returns Details of the submitted job
     */
    async submitJobFromJson(json: RevAiApiTranscript,
        options: TopicExtractionJobOptions = {}): Promise<TopicExtractionJob> {
        options = { ...options, json: json };
        return super._submitJob(options);
    }

    /**
     * See https://docs.rev.ai/api/topic-extraction/reference/#operation/GetTopicExtractionResultById
     * Get the result of a topic extraction job.
     * @param id Id of job to get result of
     * @param options Options submitted with getting results
     * @returns Topic extraction job result
     */
    async getResult(id: string, options?: TopicExtractionResultOptions): Promise<TopicExtractionResult> {
        return super._getResult(id, options, { 'Accept': TopicsContentType });
    }
}
