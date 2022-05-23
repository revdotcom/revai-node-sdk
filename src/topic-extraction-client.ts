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
     * @param version (optional) version of the API to be used
     */
    constructor (accessToken: string, version = 'v1') {
        super(accessToken, 'topic_extraction', version);
    }

    async getJobDetails(id: string): Promise<TopicExtractionJob> {
        return super._getJobDetails(id);
    }

    async getListOfJobs(options?: GetListOfJobsOptions): Promise<TopicExtractionJob[]> {
        return super._getListOfJobs(options);
    }

    async deleteJob(id: string): Promise<void> {
        return super._deleteJob(id);
    }

    async submitJobFromText(text: string, options: TopicExtractionJobOptions = {}): Promise<TopicExtractionJob> {
        options = { ...options, text: text };
        return super._submitJob(options);
    }

    async submitJobFromJson(json: RevAiApiTranscript,
        options: TopicExtractionJobOptions = {}): Promise<TopicExtractionJob> {
        options = { ...options, json: json };
        return super._submitJob(options);
    }

    async getResult(id: string, params?: TopicExtractionResultOptions): Promise<TopicExtractionResult> {
        return super._getResult(id, params, { 'Accept': TopicsContentType });
    }
}
