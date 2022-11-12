/* eslint-disable @typescript-eslint/ban-types */
import { ApiRequestHandler } from './api-request-handler';
import { RevAiApiClientConfig } from './models/RevAiApiClientConfig';
import { RevAiApiDeployment, RevAiApiDeploymentConfigMap } from './models/RevAiApiDeploymentConfigConstants';

/**
 * Base client implementation. Intended to be extended by a specific client per API
 */
export abstract class BaseApiClient<TJob, TResult> {
    private apiClientConfig: RevAiApiClientConfig = {};
    apiHandler: ApiRequestHandler;

    /**
     * @param either string Access token used to validate API requests or RevAiApiClientConfig object
     * @param serviceApi Type of api service
     * @param version (optional) version of the API to be used
     */
    constructor (params: RevAiApiClientConfig | string, serviceApi: string, version: string) {
        if (typeof params === 'object') {
            this.apiClientConfig = Object.assign(this.apiClientConfig, params as RevAiApiClientConfig);

            if (this.apiClientConfig.version === null || this.apiClientConfig.version === undefined) {
                this.apiClientConfig.version = version;
            }
            if (this.apiClientConfig.deploymentConfig === null || this.apiClientConfig.deploymentConfig === undefined) {
                this.apiClientConfig.deploymentConfig = RevAiApiDeploymentConfigMap.get(RevAiApiDeployment.US);
            }
            if (this.apiClientConfig.serviceApi === null || this.apiClientConfig.serviceApi === undefined) {
                this.apiClientConfig.serviceApi = serviceApi;
            }
            if (this.apiClientConfig.token === null || this.apiClientConfig.token === undefined) {
                throw new Error('token must be defined');
            }
        } else {
            this.apiClientConfig.token = params;
            this.apiClientConfig.version = version;
            this.apiClientConfig.deploymentConfig = RevAiApiDeploymentConfigMap.get(RevAiApiDeployment.US);
            this.apiClientConfig.serviceApi = serviceApi;
        }

        this.apiHandler = new ApiRequestHandler(
            `${this.apiClientConfig.deploymentConfig.baseUrl}/${this.apiClientConfig.serviceApi}`
                + `/${this.apiClientConfig.version}/`,
            this.apiClientConfig.token
        );
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
     * @param params Query params for this request
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

        return await this.apiHandler.makeApiRequest<TJob>('post', '/jobs',
            { 'Content-Type': 'application/json' }, 'json', options);
    }

    /**
     * Get the result of a job.
     * @param id id of job to get result of
     * @param options (optional) Options submitted with the request
     * @param headers (optional) Http headers to be used for the request
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

    protected filterNullOptions(options: {}): any {
        const filteredOptions: any = {};
        Object.keys(options).forEach((option) => {
            if (options[option] !== null && options[option] !== undefined) {
                filteredOptions[option] = options[option];
            }
        });
        return filteredOptions;
    }
}
