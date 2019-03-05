import axios, { AxiosInstance } from 'axios';
import * as FormData from 'form-data';
import * as fs from 'fs';

import RevAiAccount from './models/RevAiAccount';
import {
    InsufficientCreditsError,
    InvalidParameterError,
    InvalidStateError,
    RevAiApiError
} from './models/RevAiApiError';
import RevAiApiJob from './models/RevAiApiJob';
import RevAiApiTranscript from './models/RevAiApiTranscript';
import RevAiJobOptions from './models/RevAiJobOptions';

export class RevAiApiClient {
    accessToken: string;
    version: string;
    instance: AxiosInstance;
    constructor (accessToken: string, version = 'v1') {
        this.accessToken = accessToken;
        axios.defaults.baseURL = `https://api.rev.ai/revspeech/${version}/`;
        /* tslint:disable:no-string-literal */
        axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        axios.defaults.headers['User-Agent'] = `RevAi-NodeSDK/1.0.7`;
        /* tslint:enable:no-string-literal */
    }

    async getAccount (): Promise<RevAiAccount> {
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

    async getJobDetails (id: string): Promise<RevAiApiJob> {
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

    async submitJobUrl (mediaUrl: string, options?: RevAiJobOptions): Promise<RevAiApiJob> {
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

    async submitJobLocalFile (filename: string, options?: RevAiJobOptions): Promise<RevAiApiJob> {
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

    async getTranscriptObject (id: string): Promise<RevAiApiTranscript> {
        try {
            const response = await axios.get(`/jobs/${id}/transcript`, {
                headers: { 'Accept': 'application/vnd.rev.transcript.v1.0+json' }
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

    async getTranscriptText (id: string): Promise<string> {
        try {
            const response = await axios.get(`/jobs/${id}/transcript`, {
                headers: { 'Accept': 'text/plain' }
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