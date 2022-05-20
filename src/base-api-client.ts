import { ApiRequestHandler } from './api-request-handler';

type ServiceApi = 'topic_extraction' | 'sentiment_analysis';

/**
 * Base client implementation. Intended to be extended by a specific client per API
 */
export class BaseApiClient<TJob, TResult> {
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
    protected async _getJobDetails(id: string): Promise<TJob> {
        return await this.apiHandler.makeApiRequest<TJob>('get', `/jobs/${id}`, {}, 'json');
    }

    /**
     * Get a list of jobs submitted within the last 30 days in reverse chronological order
     * (last submitted first) up to the provided limit number of jobs per call. Pagination is supported via passing
     * the last job id from previous call into starting_after.
     * @param params
     * @returns List of job details
     */
    protected async _getListOfJobs(params?: {}): Promise<TJob[]> {
        const query = this.buildQueryParams(params || {});
        return await this.apiHandler.makeApiRequest<TJob[]>('get',
            `/jobs${query ? `?${query}` : ''}`, {}, 'json');
    }

    /**
     * Delete a specific job.
     * All data related to the job will be permanently deleted.
     * A job can only by deleted once it's completed.
     * @param id Id of job to be deleted
     */
    protected async _deleteJob(id: string): Promise<void> {
        return await this.apiHandler.makeApiRequest('delete', `/jobs/${id}`, {}, 'text');
    }

    /**
     * Submit a job to the api.
     * @param options (optional) Options submitted with the job
     * @returns Details of the submitted job
     */
    protected async _submitJob(options?: {}): Promise<TJob> {
        options = this.filterNullOptions(options || {});

        return await this.apiHandler.makeApiRequest<TJob>('post', `/jobs`,
            { 'Content-Type': 'application/json' }, 'json', options);
    }

    /**
     * Get the result of a job.
     * @param id id of job to get result of
     * @param options (optional) Options submitted with the request
     * @returns Job result object
     */
    protected async _getResult(id: string, options?: {}, headers?: {}): Promise<TResult> {
        options = this.filterNullOptions(options || {});
        const query = this.buildQueryParams(options || {});
        return await this.apiHandler.makeApiRequest<TResult>('get',
            `/jobs/${id}/result${query ? `?${query}` : ''}`, headers || {}, 'json');
    }

    private buildQueryParams(params: {}): string {
        return Object.keys(params).map((key) => `${key}=${params[key]}`).join('&');
    }

    private filterNullOptions(options: {}): any {
        const filteredOptions: any = {};
        Object.keys(options).forEach((option) => {
            if (options[option] !== null && options[option] !== undefined) {
                filteredOptions[option] = options[option];
            }
        });
        return filteredOptions;
    }
}
