import { ApiRequestHandler } from './api-request-handler';

export type ServiceApi = 'topic_extraction' | 'sentiment_analysis';

/**
 * Base client implementation
 */
export class BaseApiClient<TJob, TSubmitOptions, TResult, TResultOptions> {
    apiHandler: ApiRequestHandler;

    /**
     * @param accessToken Access token used to validate API requests
     * @param serviceApi Type of api service
     * @param version (optional) version of the API to be used
     */
    constructor (accessToken: string, serviceApi: ServiceApi, version = 'v1') {
        this.apiHandler = new ApiRequestHandler(`https://api.rev.ai/${serviceApi}/${version}/`, accessToken);
    }

    /**
     * Get information about a specific job
     * @param id Id of job whose details are to be retrieved
     * @returns Job details
     */
    protected async getJobDetails(id: string): Promise<TJob> {
        return await this.apiHandler.makeApiRequest<TJob>('get', `/jobs/${id}`, {}, 'json');
    }

    /**
     * Get a list of jobs submitted within the last 30 days in reverse chronological order 
     * (last submitted first) up to the provided limit number of jobs per call. Pagination is supported via passing
     * the last job id from previous call into starting_after.
     * @param limit (optional) maximum number of jobs to retrieve, default is 100
     * @param startingAfter (optional) returns only jobs created after the job with this id, exclusive
     * @returns List of job details
     */
    protected async getListOfJobs(limit?: number, startingAfter?: string): Promise<TJob[]> {
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
     * Delete a specific job.
     * All data related to the job will be permanently deleted.
     * A job can only by deleted once it's completed.
     * @param id Id of job to be deleted
     */
    protected async deleteJob(id: string): Promise<void> {
        return await this.apiHandler.makeApiRequest('delete', `/jobs/${id}`, {}, 'text');
    }

    /**
     * Submit a job to the api. 
     * @param options (optional) Options submitted with the job
     * @returns Details of the submitted job
     */
    protected async submitJob(options?: TSubmitOptions): Promise<TJob> {
        options = this.filterNullOptions({
            ...(options || {})
        });

        return await this.apiHandler.makeApiRequest<TJob>('post', `/jobs`,
            { 'Content-Type': 'application/json' }, 'json', options);
    }

    /**
     * Get the result of a job. 
     * @param id id of job to get result of
     * @param options (optional) Options submitted with the request
     * @returns Job result object
     */
    protected async getResult(id: string, options?: TResultOptions, headers: any = {}): Promise<TResult> {
        options = this.filterNullOptions({
            ...(options || {})
        });
        const query = this.buildQueryParams({
            ...(options || {})
        });
        return await this.apiHandler.makeApiRequest<TResult>('get',
            `/jobs/${id}/result${query ? `?${query}` : ''}`, headers, 'json');
    }

    private buildQueryParams(params: any): string {
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
