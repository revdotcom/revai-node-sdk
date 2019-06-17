import axios, { AxiosInstance } from 'axios';
import * as FormData from 'form-data';
import * as fs from 'fs';
import { Readable } from 'stream';

import { RevAiAccount } from './models/async/RevAiAccount';
import { RevAiJobOptions } from './models/async/RevAiJobOptions';
import {
    InsufficientCreditsError,
    InvalidParameterError,
    InvalidStateError,
    RevAiApiError
} from './models/RevAiApiError';
import { RevAiApiJob } from './models/RevAiApiJob';
import { RevAiApiTranscript } from './models/RevAiApiTranscript';

const enum ContentTypes {
    JSON = 'application/vnd.rev.transcript.v1.0+json',
    TEXT = 'text/plain',
    SRT = 'application/x-subrip'
}

export class RevAiApiClient {
    accessToken: string;
    version: string;
    instance: AxiosInstance;
    constructor (accessToken: string, version = 'v1') {
        this.accessToken = accessToken;
        axios.defaults.baseURL = `https://api.rev.ai/revspeech/${version}/`;
        /* tslint:disable:no-string-literal */
        axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        axios.defaults.headers['User-Agent'] = `RevAi-NodeSDK/1.1.0`;
        /* tslint:enable:no-string-literal */
    }

    async getAccount(): Promise<RevAiAccount> {
        try {
            const response = await axios.get('/account');
            return response.data;
        } catch (error) {
            switch (error.response.status) {
                case 401:
                    throw new RevAiApiError(error);
                default:
                    throw error;
            }
        }
    }

    async getJobDetails(id: string): Promise<RevAiApiJob> {
        try {
            const response = await axios.get(`/jobs/${id}`);
            return response.data;
        } catch (error) {
            switch (error.response.status) {
                case 401:
                case 404:
                    throw new RevAiApiError(error);
                default:
                    throw error;
            }
        }
    }

    async getListOfJobs(limit?: number, startingAfter?: string): Promise<RevAiApiJob[]> {
        try {
            let params = [];
            if (limit) {
                params.push(`limit=${limit}`);
            }
            if (startingAfter) {
                params.push(`starting_after=${startingAfter}`);
            }

            const query = `?${params.join('&')}`;
            const response = await axios.get(`/jobs${params.length > 0 ? query : ''}`);
            return response.data;
        } catch (error) {
            switch (error.response.status) {
                case 400:
                    throw new InvalidParameterError(error);
                case 401:
                    throw new RevAiApiError(error);
                default:
                    throw error;
            }
        }
    }

    async deleteJob(id: string): Promise<void> {
        try {
            await axios.delete(`/jobs/${id}`);
        } catch (error) {
            switch (error.response.status) {
                case 401:
                case 404:
                    throw new RevAiApiError(error);
                case 409:
                    throw new InvalidStateError(error);
                default:
                    throw error;
            }
        }
    }

    async submitJobUrl(mediaUrl: string, options?: RevAiJobOptions): Promise<RevAiApiJob> {
        if (options) {
            options.media_url = mediaUrl;
        } else {
            options = { 'media_url': mediaUrl };
        }

        try {
            const response = await axios.post('/jobs', options, {
                headers: { 'Content-Type': 'application/json' }
            });
            return response.data;
        } catch (error) {
            switch (error.response.status) {
                case 400:
                    throw new InvalidParameterError(error);
                case 401:
                    throw new RevAiApiError(error);
                case 403:
                    throw new InsufficientCreditsError(error);
                default:
                    throw error;
            }
        }
    }

    async submitJobLocalFile(filename: string, options?: RevAiJobOptions): Promise<RevAiApiJob> {
        let payload = new FormData();
        payload.append('media', fs.createReadStream(filename));
        if (options) {
            payload.append('options', JSON.stringify(options));
        }

        try {
            const response = await axios.post('/jobs', payload, {
                headers: payload.getHeaders()
            });

            return response.data;
        } catch (error) {
            switch (error.response.status) {
                case 400:
                    throw new InvalidParameterError(error);
                case 401:
                    throw new RevAiApiError(error);
                case 403:
                    throw new InsufficientCreditsError(error);
                default:
                    throw error;
            }
        }
    }

    async getTranscriptObject(id: string): Promise<RevAiApiTranscript> {
        return await this.getOutputsHelper(id, 'json', ContentTypes.JSON) as RevAiApiTranscript;
    }

    async getTranscriptObjectStream(id: string): Promise<Readable> {
        return await this.getOutputsHelper(id, 'stream', ContentTypes.JSON) as Readable;
    }

    async getTranscriptText(id: string): Promise<string> {
        return await this.getOutputsHelper(id, 'text', ContentTypes.TEXT) as string;
    }

    async getTranscriptTextStream(id: string): Promise<Readable> {
        return await this.getOutputsHelper(id, 'stream', ContentTypes.TEXT) as Readable;
    }

    async getCaptions(id: string): Promise<Readable> {
        return await this.getOutputsHelper(id, 'stream', ContentTypes.SRT) as Readable;
    }

    private async getOutputsHelper(
        id: string,
        type: any,
        format: string
    ): Promise<Readable|string|RevAiApiTranscript> {
        const endpoint = format === ContentTypes.SRT ? 'captions' : 'transcript';
        try {
            const response = await axios.get(`/jobs/${id}/${endpoint}`, {
                responseType: type,
                headers: { 'Accept': format }
            });

            return response.data;
        } catch (error) {
            switch (error.response.status) {
                case 401:
                case 404:
                    throw new RevAiApiError(error);
                case 409:
                    throw new InvalidStateError(error);
                default:
                    throw error;
            }
        }
    }
}