import axios, { AxiosInstance } from 'axios';

import {
    InvalidParameterError,
    ForbiddenAccessError,
    UnsupportedApiError,
    InvalidStateError,
    RevAiApiError
} from './models/RevAiApiError';

export type HttpMethodTypes = 'post' | 'get' | 'delete';
export type AxiosResponseTypes = 'stream' | 'json' | 'text';

// tslint:disable-next-line
const sdkVersion = require('../package.json').version;

/**
 * Abstract class which should be inherited to make use of creating api calls
 *
 * This class handles creating and sending requests as well as catching common errors
 */
export class ApiRequestHandler {
    /** Single instance of axios which uses provided arguments for all requests */
    instance: AxiosInstance;

    constructor (url: string, accessToken: string) {
        this.instance = axios.create({
            baseURL: url,
            maxContentLength: Infinity,
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'User-Agent': `RevAi-NodeSDK/${sdkVersion}`
            }
        });
    }

    public async makeApiRequest<Response> (
        method: HttpMethodTypes,
        url: string,
        headers: {},
        responseType: AxiosResponseTypes,
        params?: {},
        maxBodyLength?: number
    ): Promise<Response> {
        try {
            const data = (method === 'get' || method === 'delete') ? undefined : params;
            const response = await this.instance.request({
                method: method,
                url: url,
                data: data,
                headers: headers,
                responseType: responseType,
                maxBodyLength
            });

            return response.data;
        } catch (error) {
            // tslint:disable-next-line
            if (error.response == null) {
                throw error;
            }
            if (responseType === 'stream') {
                error.response.data = JSON.parse(error.response.data.read());
            }
            switch (error.response.status) {
                case 400:
                    throw new InvalidParameterError(error);
                case 403:
                    throw new ForbiddenAccessError(error);
                case 404:
                    throw new UnsupportedApiError(error);
                case 409:
                    throw new InvalidStateError(error);
                default:
                    throw new RevAiApiError(error);
            }
        }
    }
}