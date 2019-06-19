import * as FormData from 'form-data';
import * as fs from 'fs';
import { Readable } from 'stream';

import { ApiRequestHandler } from './api-request-handler';
import { RevAiAccount } from './models/async/RevAiAccount';
import { RevAiJobOptions } from './models/async/RevAiJobOptions';
import { RevAiApiJob } from './models/RevAiApiJob';
import { RevAiApiTranscript } from './models/RevAiApiTranscript';

const enum ContentTypes {
    JSON = 'application/vnd.rev.transcript.v1.0+json',
    TEXT = 'text/plain',
    SRT = 'application/x-subrip'
}

export class RevAiApiClient extends ApiRequestHandler {
    accessToken: string;
    version: string;
    constructor (accessToken: string, version = 'v1') {
        super(`https://api.rev.ai/revspeech/${version}/`, {
            'Authorization': `Bearer ${accessToken}`,
            'User-Agent': `RevAi-NodeSDK/2.0.1`
        });
        this.accessToken = accessToken;
        /* tslint:enable:no-string-literal */
    }

    async getAccount(): Promise<RevAiAccount> {
        return await this.makeApiRequest<RevAiAccount>(
            'get',
            '/account',
            {},
            'json',
        );
    }

    async getJobDetails(id: string): Promise<RevAiApiJob> {
        return await this.makeApiRequest<RevAiApiJob>(
            'get',
            `/jobs/${id}`,
            {},
            'json',
        );
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
        return await this.makeApiRequest<RevAiApiJob[]>(
            'get',
            `/jobs${params.length > 0 ? query : ''}`,
            {},
            'json',
        );
    }

    async deleteJob(id: string): Promise<void> {
        return await this.makeApiRequest(
            'delete',
            `/jobs/${id}`,
            {},
            'text',
        );
    }

    async submitJobUrl(mediaUrl: string, options?: RevAiJobOptions): Promise<RevAiApiJob> {
        if (options) {
            options.media_url = mediaUrl;
        } else {
            options = { 'media_url': mediaUrl };
        }

        return await this.makeApiRequest<RevAiApiJob>(
            'post',
            `/jobs`,
            { 'Content-Type': 'application/json' },
            'json',
            options
        );
    }

    async submitJobLocalFile(filename: string, options?: RevAiJobOptions): Promise<RevAiApiJob> {
        let payload = new FormData();
        payload.append('media', fs.createReadStream(filename));
        if (options) {
            payload.append('options', JSON.stringify(options));
        }

        return await this.makeApiRequest<RevAiApiJob>(
            'post',
            `/jobs`,
            payload.getHeaders(),
            'json',
            options
        );
    }

    async getTranscriptObject(id: string): Promise<RevAiApiTranscript> {
        return await this.makeApiRequest<RevAiApiTranscript>(
            'get',
            `/jobs/${id}/transcript`,
            { 'Accept': ContentTypes.JSON },
            'json'
        );
    }

    async getTranscriptObjectStream(id: string): Promise<Readable> {
        return await this.makeApiRequest<Readable>(
            'get',
            `/jobs/${id}/transcript`,
            { 'Accept': ContentTypes.JSON },
            'stream'
        );
    }

    async getTranscriptText(id: string): Promise<string> {
        return await this.makeApiRequest<string>(
            'get',
            `/jobs/${id}/transcript`,
            { 'Accept': ContentTypes.TEXT },
            'text'
        );
    }

    async getTranscriptTextStream(id: string): Promise<Readable> {
        return await this.makeApiRequest<Readable>(
            'get',
            `/jobs/${id}/transcript`,
            { 'Accept': ContentTypes.TEXT },
            'stream'
        );
    }

    async getCaptions(id: string): Promise<Readable> {
        return await this.makeApiRequest<Readable>(
            'get',
            `/jobs/${id}/captions`,
            { 'Accept': ContentTypes.SRT },
            'stream'
        );
    }
}