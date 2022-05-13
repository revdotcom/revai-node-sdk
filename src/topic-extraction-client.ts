import { BaseApiClient } from './base-api-client';
import { TopicExtractionJob } from './models/topic-extraction/TopicExtractionJob';
import { TopicExtractionJobOptions } from './models/topic-extraction/TopicExtractionJobOptions';
import { TopicExtractionResult, TopicExtractionResultsOptions } from './models/topic-extraction/TopicExtractionResult';

const TopicsContentType = 'application/vnd.rev.topic.v1.0+json';

/**
 * Client which handles connection to the Rev AI topic extraction API.
 */
export class TopicExtractionClient extends 
    BaseApiClient<TopicExtractionJob, 
    TopicExtractionJobOptions, 
    TopicExtractionResult, 
    TopicExtractionResultsOptions> {
    /**
     * @param accessToken Access token used to validate API requests
     * @param version (optional) version of the API to be used
     */
    constructor (accessToken: string, version = 'v1') {
        super(accessToken, 'topic_extraction', version);
    }

    async getResult(id: string, params?: TopicExtractionResultsOptions) {
        return super.getResult(id, params, { 'Accept': TopicsContentType });
    }
}
