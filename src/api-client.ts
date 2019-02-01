import axios, { AxiosInstance } from 'axios';
import RevAiAccount from './models/RevAiAccount';
import RevAiApiJob from './models/RevAiApiJob';
import RevAiJobOptions from './models/RevAiJobOptions';
import RevAiApiTranscript from './models/RevAiApiTranscript';
import RevAiApiError from './models/RevAiApiError';
import createError from './createError';
const fs = require('fs');
const FormData = require('form-data');

export default class RevAiApiClient {
    accessToken: string;
    version: string;
    instance: AxiosInstance;
    constructor(accessToken: string, version = 'v1') {
        this.accessToken = accessToken;
        axios.defaults.baseURL = `https://api.rev.ai/revspeech/${version}/`;
        axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        axios.defaults.headers['User-Agent'] = 'node_sdk';
    }

    async getAccount(): Promise<RevAiAccount> {
        try {
            const response = await axios.get('account');
            const account = response.data;
            return account;
        }
        catch (error) {
            console.log('error: ', error);
        }
    }

    async getJobDetails(id: string): Promise<RevAiApiJob> {
        try {
            const response = await axios.get(`/jobs/${id}`);
            const job = response.data;
            return job;
        }
        catch (error) { 
            console.log('error:\n', error);
        }
    }

    async submitJobUrl(mediaUrl: string, options?: RevAiJobOptions): Promise<RevAiApiJob> {
        if (options)
            options['media_url'] = mediaUrl;
        else
            options = { 'media_url': mediaUrl };
        
        try {
            const response = await axios.post('/jobs', options, {
                headers: { 'Content-Type': 'application/json' }
            });
            const job = response.data;
            return job;
        }
        catch (error) {
            console.log('error:\n', error);
        }
    }

    async submitJobLocalFile(filename: string, options?: RevAiJobOptions): Promise<RevAiApiJob> {
        let payload = new FormData();
        payload.append('media', fs.createReadStream(filename));
        if (options)
            payload.append('options', JSON.stringify(options));
        
        try {
            const response = await axios.post('/jobs', payload, {
                headers: payload.getHeaders()
            });
            const job = response.data;
            return job;
        }
        catch (error) {
            console.log('error:\n', error);
        }
    }

    async getTranscriptObject(id: string): Promise<RevAiApiTranscript> {
        try {
            const response = await axios.get(`/jobs/${id}/transcript`, {
                headers: { 'Accept': 'application/vnd.rev.transcript.v1.0+json' }
            });
            const transcript = response.data;
            return transcript;
        }
        catch (error) { 
            console.log('error:\n', error);
        }
    }

    async getTranscriptText(id: string): Promise<string> {
        try {
            const response = await axios.get(`/jobs/${id}/transcript`, {
                headers: { 'Accept': 'text/plain' }
            });
            const transcript = response.data;
            return transcript;
        }
        catch (error) {
            console.log('error:\n', error);
        }
    }
}
