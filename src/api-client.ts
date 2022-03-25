import * as FormData from 'form-data';
import * as fs from 'fs';
import { Readable } from 'stream';

import { ApiRequestHandler } from './api-request-handler';
import { CaptionType } from './models/async/CaptionType';
import { RevAiAccount } from './models/async/RevAiAccount';
import { RevAiJobOptions } from './models/async/RevAiJobOptions';
import { RevAiApiJob } from './models/RevAiApiJob';
import { RevAiApiTranscript } from './models/RevAiApiTranscript';

const enum TranscriptContentTypes {
    JSON = 'application/vnd.rev.transcript.v1.0+json',
    TEXT = 'text/plain'
}

const TWO_GIGABYTES = 2e9; // Number of Bytes in 2 Gigabytes

/**
 * Client which handles connection to the rev.ai API.
 */
export class RevAiApiClient {
    apiHandler: ApiRequestHandler;

    /**
     * @param accessToken Access token used to validate API requests
     * @param version (optional) version of the API to be used
     */
    constructor (accessToken: string, version = 'v1') {
        this.apiHandler = new ApiRequestHandler(`https://api.rev.ai/speechtotext/${version}/`, accessToken);
    }

    /**
     * See https://docs.rev.ai/api/asynchronous/reference/#tag/Account
     * Get information associated with the account whose access token is used by this client
     * @returns Account object
     */
    async getAccount(): Promise<RevAiAccount> {
        return await this.apiHandler.makeApiRequest<RevAiAccount>('get', '/account', {}, 'json');
    }

    /**
     * See https://docs.rev.ai/api/asynchronous/reference/#operation/GetJobById
     * Get information about a specific job
     * @param id Id of job whose details are to be retrieved
     * @returns Job details
     */
    async getJobDetails(id: string): Promise<RevAiApiJob> {
        return await this.apiHandler.makeApiRequest<RevAiApiJob>('get', `/jobs/${id}`, {}, 'json');
    }

    /**
     * See https://docs.rev.ai/api/asynchronous/reference/#operation/GetListOfJobs
     * Get a list of transcription jobs submitted within the last week in reverse chronological order
     * (last submitted first) up to the provided limit number of jobs per call. Pagination is supported via passing
     * the last job id from previous call into starting_after.
     * @param limit (optional) maximum number of jobs to retrieve, default is 100
     * @param startingAfter (optional) returns only jobs created after the job with this id, exclusive
     * @returns List of job details
     */
    async getListOfJobs(limit?: number, startingAfter?: string): Promise<RevAiApiJob[]> {
        const params = [];
        if (limit) {
            params.push(`limit=${limit}`);
        }
        if (startingAfter) {
            params.push(`starting_after=${startingAfter}`);
        }

        const query = `?${params.join('&')}`;
        return await this.apiHandler.makeApiRequest<RevAiApiJob[]>('get',
            `/jobs${params.length > 0 ? query : ''}`, {}, 'json');
    }

    /**
     * See https://docs.rev.ai/api/asynchronous/reference/#operation/DeleteJobById
     * Delete a specific transcription job.
     * All data related to the job, such as input media and transcript, will be permanently deleted.
     * A job can only by deleted once it's completed.
     * @param id Id of job to be deleted
     */
    async deleteJob(id: string): Promise<void> {
        return await this.apiHandler.makeApiRequest('delete', `/jobs/${id}`, {}, 'text');
    }

    /**
     * See https://docs.rev.ai/api/asynchronous/reference/#operation/SubmitTranscriptionJob
     * Submit media given a URL for transcription. The audio data is downloaded from the URL.
     * @param mediaUrl Web location of media to be downloaded and transcribed
     * @param options (optional) Options submitted with the job, see RevAiJobOptions object
     * @returns Details of the submitted job
     */
    async submitJobUrl(mediaUrl: string, options?: RevAiJobOptions): Promise<RevAiApiJob> {
        options = this.filterNullOptions({
            media_url: mediaUrl,
            ...(options || {})
        });

        return await this.apiHandler.makeApiRequest<RevAiApiJob>('post', `/jobs`,
            { 'Content-Type': 'application/json' }, 'json', options);
    }

    /**
     * See https://docs.rev.ai/api/asynchronous/reference/#operation/SubmitTranscriptionJob
     * Submit audio data for transcription.
     * @param audioData Audio data to be transcribed.
     * @param filename (optional) Name of file associated with audio.
     * @param options (optional) Options submitted with the job, see RevAiJobOptions object
     *     or https://docs.rev.ai/api/asynchronous/reference/#operation/SubmitTranscriptionJob
     * @returns Details of submitted job
     */
    async submitJobAudioData(
        audioData: Buffer | Readable,
        filename?: string,
        options?: RevAiJobOptions
    ): Promise<RevAiApiJob> {
        const payload = new FormData();
        payload.append('media', audioData, { filename: filename || 'audio_file' });
        if (options) {
            options = this.filterNullOptions(options);
            payload.append('options', JSON.stringify(options));
        }

        return await this.apiHandler.makeApiRequest<RevAiApiJob>('post', `/jobs`,
            payload.getHeaders(), 'json', payload, TWO_GIGABYTES);
    }

    /**
     * See https://docs.rev.ai/api/asynchronous/reference/#operation/SubmitTranscriptionJob
     * Send local file for transcription.
     * @param filepath Path to local file to be transcribed. Assumes the process has access to read this file.
     * @param options (optional) Options submitted with the job, see RevAiJobOptions object
     *     or https://docs.rev.ai/api/asynchronous/reference/#operation/SubmitTranscriptionJob
     * @returns Details of submitted job
     */
    async submitJobLocalFile(filepath: string, options?: RevAiJobOptions): Promise<RevAiApiJob> {
        const payload = new FormData();
        payload.append('media', fs.createReadStream(filepath));
        if (options) {
            options = this.filterNullOptions(options);
            payload.append('options', JSON.stringify(options));
        }

        return await this.apiHandler.makeApiRequest<RevAiApiJob>('post', `/jobs`,
            payload.getHeaders(), 'json', payload, TWO_GIGABYTES);
    }

    /**
     * See https://docs.rev.ai/api/asynchronous/reference/#operation/GetTranscriptById
     * Get transcript of a job as a javascript object, see the RevAiApiTranscript object.
     * @param id Id of job to retrieve the transcript of
     * @returns Transcript of job as a javascript object.
     */
    async getTranscriptObject(id: string): Promise<RevAiApiTranscript> {
        return await this.apiHandler.makeApiRequest<RevAiApiTranscript>('get', `/jobs/${id}/transcript`,
            { 'Accept': TranscriptContentTypes.JSON }, 'json');
    }

    /**
     * See https://docs.rev.ai/api/asynchronous/reference/#operation/GetTranscriptById
     * Get transcript of a job as a stream of JSON.
     * Use for large transcripts or transcripts meant to be written directly to file.
     * @param id Id of job to retrieve transcript of
     * @returns ReadableStream containing JSON of transcript
     */
    async getTranscriptObjectStream(id: string): Promise<Readable> {
        return await this.apiHandler.makeApiRequest<Readable>('get',
            `/jobs/${id}/transcript`, { 'Accept': TranscriptContentTypes.JSON }, 'stream');
    }

    /**
     * See https://docs.rev.ai/api/asynchronous/reference/#operation/GetTranscriptById
     * Get transcript of a job as plain text.
     * @param id Id of job to retrieve transcript of
     * @returns Transcript of the requested job as a readable text string
     */
    async getTranscriptText(id: string): Promise<string> {
        return await this.apiHandler.makeApiRequest<string>('get', `/jobs/${id}/transcript`,
            { 'Accept': TranscriptContentTypes.TEXT }, 'text');
    }

    /**
     * See https://docs.rev.ai/api/asynchronous/reference/#operation/GetTranscriptById
     * Get transcript of a job as a stream of plain text.
     * Use for large transcripts or transcripts meant to be written directly to file.
     * @param id Id of job to retrieve transcript of
     * @returns ReadableStream containing text of transcript
     */
    async getTranscriptTextStream(id: string): Promise<Readable> {
        return await this.apiHandler.makeApiRequest<Readable>('get',
            `/jobs/${id}/transcript`, { 'Accept': TranscriptContentTypes.TEXT }, 'stream');
    }

    /**
     * See https://docs.rev.ai/api/asynchronous/reference/#operation/GetCaptions
     * Get captions created from the transcript of a job.
     * Captions are only retrievable in a stream and can be obtained in either SRT or VTT format.
     * @param id Id of job to get captions of
     * @param contentType Type of Captions to retrieve, see enum CaptionType for options
     * @param channelId If the job was submitted using speaker_channels_count,
     *     provide a speaker channel to be captioned. If no speaker_channels_count was provided on submission
     *     this parameter should not be provided.
     * @returns ReadableStream of captions in requested format
     */
    async getCaptions(id: string, contentType?: CaptionType, channelId?: number): Promise<Readable> {
        let url = `/jobs/${id}/captions`;
        if (channelId) {
            url += `?speaker_channel=${channelId}`;
        }
        return await this.apiHandler.makeApiRequest<Readable>(
            'get', url, { 'Accept': contentType || CaptionType.SRT }, 'stream');
    }

    private filterNullOptions(options: RevAiJobOptions): RevAiJobOptions {
        const filteredOptions: RevAiJobOptions = {};
        Object.keys(options).forEach((option) => {
            if (options[option] !== null && options[option] !== undefined) {
                filteredOptions[option] = options[option];
            }
        });
        return filteredOptions;
    }
}
