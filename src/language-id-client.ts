/* eslint-disable no-underscore-dangle */
import * as fs from 'fs';
import { Readable } from 'stream';
import * as FormData from 'form-data';

import { BaseApiClient } from './base-api-client';
import { RevAiApiClientConfig } from './models/RevAiApiClientConfig';
import { GetListOfJobsOptions } from './models/GetListOfJobsOptions';
import { LanguageIdJob } from './models/language-id/LanguageIdJob';
import { LanguageIdJobOptions } from './models/language-id/LanguageIdJobOptions';
import { LanguageIdResult } from './models/language-id/LanguageIdResult';

const LanguageIdContentType = 'application/vnd.rev.languageid.v1.0+json';

const TWO_GIGABYTES = 2e9; // Number of Bytes in 2 Gigabytes

/**
 * Client which handles connection to the Rev AI Language Id API.
 */
export class LanguageIdClient extends BaseApiClient<LanguageIdJob, LanguageIdResult> {
    /**
     * @param either string Access token used to validate API requests or RevAiApiClientConfig object
     */
    constructor(params: RevAiApiClientConfig | string) {
        super(params, 'languageid', 'v1');
    }

    /**
     * See https://docs.rev.ai/api/language-identification/reference/#operation/GetLanguageIdentificationJobById
     * Get information about a specific language id job
     * @param id Id of job whose details are to be retrieved
     * @returns Job details
     */
    async getJobDetails(id: string): Promise<LanguageIdJob> {
        return super._getJobDetails(id);
    }

    /**
     * See https://docs.rev.ai/api/language-identification/reference/#operation/GetListOfLanguageIdentificationJobs
     * Get a list of language id jobs submitted within the last 30 days in reverse chronological order
     * @param options Job options for getting list of jobs
     * @returns List of job details
     */
    async getListOfJobs(options?: GetListOfJobsOptions): Promise<LanguageIdJob[]> {
        return super._getListOfJobs(options);
    }

    /**
     * See https://docs.rev.ai/api/language-identification/reference/#operation/DeleteLanguageIdentificationJobById
     * Delete a specific language id job.
     * All data related to the job, such as input and result, will be permanently deleted.
     * A job can only by deleted once it's completed.
     * @param id Id of job to be deleted
     */
    async deleteJob(id: string): Promise<void> {
        return super._deleteJob(id);
    }

    /**
     * See https://docs.rev.ai/api/language-identification/reference/#operation/SubmitLanguageIdentificationJob
     * Submits a language id job from url with options.
     * @param options Options submitted with the job: see LanguageIdJobOptions object
     * @returns Details of the submitted job
     */
    async submitJob(options: LanguageIdJobOptions = {}): Promise<LanguageIdJob> {
        return super._submitJob(options);
    }

    /**
     * See https://docs.rev.ai/api/language-identification/reference/#operation/SubmitLanguageIdentificationJob
     * Submit local audio data for language id.
     * @param audioData Audio data to be submitted for language id.
     * @param filename (optional) Name of file associated with audio.
     * @param options (optional) Options submitted with the job, see LanguageIdJobOptions object
     *     or https://docs.rev.ai/api/language-identification/reference/#operation/SubmitLanguageIdentificationJob
     * @returns Details of submitted job
     */
    async submitJobAudioData(
        audioData: Buffer | Readable,
        filename?: string,
        options?: LanguageIdJobOptions
    ): Promise<LanguageIdJob> {
        const payload = new FormData();
        payload.append('media', audioData, { filename: filename || 'audio_file' });
        if (options) {
            options = this.filterNullOptions(options);
            payload.append('options', JSON.stringify(options));
        }

        return await this.apiHandler.makeApiRequest<LanguageIdJob>('post', '/jobs',
            payload.getHeaders(), 'json', payload, TWO_GIGABYTES);
    }

    /**
     * See https://docs.rev.ai/api/language-identification/reference/#operation/SubmitLanguageIdentificationJob
     * Send local file for language id.
     * @param filepath Path to local file to be submitted for language id. Assumes the process has access to
     * read this file.
     * @param options (optional) Options submitted with the job, see LanguageIdJob object
     *     or https://docs.rev.ai/api/language-identification/reference/#operation/SubmitLanguageIdentificationJob
     * @returns Details of submitted job
     */
    async submitJobLocalFile(filepath: string, options?: LanguageIdJobOptions): Promise<LanguageIdJob> {
        const payload = new FormData();
        payload.append('media', fs.createReadStream(filepath));
        if (options) {
            options = this.filterNullOptions(options);
            payload.append('options', JSON.stringify(options));
        }

        return await this.apiHandler.makeApiRequest<LanguageIdJob>('post', '/jobs',
            payload.getHeaders(), 'json', payload, TWO_GIGABYTES);
    }

    /**
     * See https://docs.rev.ai/api/language-identification/reference/#operation/GetLanguageIdentificationResultById
     * Get the result of a successful language id job.
     * @param id Id of job to get result of
     * @returns Language id job result
     */
    async getResult(id: string): Promise<LanguageIdResult> {
        return super._getResult(id, {}, { 'Accept': LanguageIdContentType });
    }
}