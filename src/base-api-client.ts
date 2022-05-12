import { ApiRequestHandler } from './api-request-handler';

export type ServiceApi = 'speechtotext' | 'topic_extraction' | 'sentiment_analysis';

/**
 * 
 */
export class BaseApiClient {
    apiHandler: ApiRequestHandler;

    /**
     * @param accessToken Access token used to validate API requests
     * @param serviceApi Type of 
     * @param version (optional) version of the API to be used
     */
    constructor (accessToken: string, serviceApi: ServiceApi, version = 'v1') {
        this.apiHandler = new ApiRequestHandler(`https://api.rev.ai/${serviceApi}/${version}/`, accessToken);
    }

    /**
     * 
     * @param id Id of job whose details are to be retrieved
     * @returns Job details
     */
    protected async _getJobDetails<TJob>(id: string): Promise<TJob> {
        return await this.apiHandler.makeApiRequest<TJob>('get', `/jobs/${id}`, {}, 'json');
    }

    /**
     * 
     * @param limit (optional) maximum number of jobs to retrieve, default is 100
     * @param startingAfter (optional) returns only jobs created after the job with this id, exclusive
     * @returns List of job details
     */
    protected async _getListOfJobs<TJob>(limit?: number, startingAfter?: string): Promise<TJob[]> {
        const params = [];
        if (limit) {
            params.push(`limit=${limit}`);
        }
        if (startingAfter) {
            params.push(`starting_after=${startingAfter}`);
        }

        const query = `?${params.join('&')}`;
        return await this.apiHandler.makeApiRequest<TJob[]>('get',
            `/jobs${params.length > 0 ? query : ''}`, {}, 'json');
    }

    /**
     * 
     * @param id Id of job to be deleted
     */
    protected async _deleteJob(id: string): Promise<void> {
        return await this.apiHandler.makeApiRequest('delete', `/jobs/${id}`, {}, 'text');
    }

    /**
     * 
     * @param mediaUrl Web location of media to be downloaded and transcribed
     * @param options (optional) Options submitted with the job: see RevAiJobOptions object
     * @returns Details of the submitted job
     */
    protected async _submitJob<TJob>(options?: any): Promise<TJob> {
        options = this.filterNullOptions({
            ...(options || {})
        });

        return await this.apiHandler.makeApiRequest<TJob>('post', `/jobs`,
            { 'Content-Type': 'application/json' }, 'json', options);
    }

    /**
     * 
     * @param params 
     * @returns 
     */
     protected async _getResult<TResult>(id: string, params?: any): Promise<TResult> {
        const query = this.buildQueryParams(params);
        return await this.apiHandler.makeApiRequest<TResult>('get',
            `/jobs/${id}/result${query ?? ''}`, {}, 'json');
    }

    private buildQueryParams(params?: any): string {
        return Object.keys(params).map((key) => `${key}=${params[key]}`).join('&');
    }

    private filterNullOptions(options: any): any {
        const filteredOptions: any = {};
        Object.keys(options).forEach((option) => {
            if (options[option] !== null && options[option] !== undefined) {
                filteredOptions[option] = options[option];
            }
        });
        return filteredOptions;
    }
}
