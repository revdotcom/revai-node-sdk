import * as FormData from 'form-data';
import * as fs from 'fs';
import { Readable } from 'stream';

import { ApiRequestHandler } from './api-request-handler';
import CaptionType from './models/async/CaptionTypes';
import { RevAiAccount } from './models/async/RevAiAccount';
import { RevAiJobOptions } from './models/async/RevAiJobOptions';
import { RevAiApiJob } from './models/RevAiApiJob';
import { RevAiApiTranscript } from './models/RevAiApiTranscript';

const enum TranscriptContentTypes {
    JSON = 'application/vnd.rev.transcript.v1.0+json',
    TEXT = 'text/plain'
}

export class RevAiApiClient {
    apiHandler: ApiRequestHandler;
    constructor (accessToken: string, version = 'v1') {
        this.apiHandler = new ApiRequestHandler(`https://api.rev.ai/revspeech/${version}/`, accessToken);
    }

    async getAccount(): Promise<RevAiAccount> {
        return await this.apiHandler.makeApiRequest<RevAiAccount>('get', '/account', {}, 'json');
    }

    async getJobDetails(id: string): Promise<RevAiApiJob> {
        return await this.apiHandler.makeApiRequest<RevAiApiJob>( 'get', `/jobs/${id}`, {}, 'json');
    }

    async getListOfJobs(limit?: number, startingAfter?: string): Promise<RevAiApiJob[]> {
        let params = [];
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

    async deleteJob(id: string): Promise<void> {
        return await this.apiHandler.makeApiRequest('delete', `/jobs/${id}`, {}, 'text');
    }

    async submitJobUrl(mediaUrl: string, options?: RevAiJobOptions): Promise<RevAiApiJob> {
        if (options) {
            options.media_url = mediaUrl;
        } else {
            options = { 'media_url': mediaUrl };
        }

        return await this.apiHandler.makeApiRequest<RevAiApiJob>('post', `/jobs`,
            { 'Content-Type': 'application/json' }, 'json', options);
    }

    async submitJobLocalFile(filename: string, options?: RevAiJobOptions): Promise<RevAiApiJob> {
        let payload = new FormData();
        payload.append('media', fs.createReadStream(filename));
        if (options) {
            payload.append('options', JSON.stringify(options));
        }

        return await this.apiHandler.makeApiRequest<RevAiApiJob>('post', `/jobs`,
            payload.getHeaders(), 'json', payload);
    }

    async getTranscriptObject(id: string): Promise<RevAiApiTranscript> {
        return await this.apiHandler.makeApiRequest<RevAiApiTranscript>('get', `/jobs/${id}/transcript`,
            { 'Accept': TranscriptContentTypes.JSON }, 'json');
    }

    async getTranscriptObjectStream(id: string): Promise<Readable> {
        return await this.apiHandler.makeApiRequest<Readable>('get',
            `/jobs/${id}/transcript`, { 'Accept': TranscriptContentTypes.JSON }, 'stream');
    }

    async getTranscriptText(id: string): Promise<string> {
        return await this.apiHandler.makeApiRequest<string>('get', `/jobs/${id}/transcript`,
            { 'Accept': TranscriptContentTypes.TEXT }, 'text');
    }

    async getTranscriptTextStream(id: string): Promise<Readable> {
        return await this.apiHandler.makeApiRequest<Readable>('get',
            `/jobs/${id}/transcript`, { 'Accept': TranscriptContentTypes.TEXT }, 'stream');
    }

    async getCaptions(id: string, contentType?: CaptionType, channelId?: number): Promise<Readable> {
        let url = `/jobs/${id}/captions`;
        if (channelId) {
            url += `?speaker_channel=${channelId}`;
        }
        return await this.apiHandler.makeApiRequest<Readable>('get',
            url, { 'Accept': contentType || CaptionType.SRT }, 'stream');
    }
}