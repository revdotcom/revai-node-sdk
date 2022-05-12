import { BaseApiClient } from './base-api-client';
import { RevAiApiTranscript } from './models/RevAiApiTranscript';
import { TopicExtractionJob } from './models/topic-extraction/TopicExtractionJob';
import { TopicExtractionJobOptions } from './models/topic-extraction/TopicExtractionJobOptions';
import { TopicExtractionResult, TopicExtractionResultsOptions } from './models/topic-extraction/TopicExtractionResult';

/**
 * Client which handles connection to the Rev AI topic extraction API.
 */
export class TopicExtractionClient extends BaseApiClient {
    /**
     * @param accessToken Access token used to validate API requests
     * @param version (optional) version of the API to be used
     */
    constructor (accessToken: string, version = 'v1') {
        super(accessToken, 'topic_extraction', version);
    }

    async getJobDetails(id: string): Promise<TopicExtractionJob> {
        return super._getJobDetails<TopicExtractionJob>(id);
    }

    async getListOfJobs(): Promise<TopicExtractionJob[]> {
        return super._getListOfJobs<TopicExtractionJob>();
    }

    async deleteJob(id: string): Promise<void> {
        return super._deleteJob(id);
    }

    async submitJobFromText(text: string, options?: TopicExtractionJobOptions): Promise<TopicExtractionJob> {
        options.text = text;
        return super._submitJob<TopicExtractionJob>(options);
    }

    async submitJobFromJson(json: RevAiApiTranscript, options?: TopicExtractionJobOptions): Promise<TopicExtractionJob> {
        options.json = json;
        return super._submitJob<TopicExtractionJob>(options);
    }

    async getResult(id: string, params: TopicExtractionResultsOptions): Promise<TopicExtractionResult> {
        return super._getResult<TopicExtractionResult>(id, params);
    }
}
