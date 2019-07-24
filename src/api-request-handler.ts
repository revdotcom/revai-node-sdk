import axios, { AxiosInstance } from 'axios';

import {
    InsufficientCreditsError,
    InvalidParameterError,
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
        params?: {}
    ): Promise<Response> {
        try {
            const data = (method === 'get' || method === 'delete') ? undefined : params;
            const response = await this.instance.request({
                method: method,
                url: url,
                data: data,
                headers: headers,
                responseType: responseType
            });

            return response.data;
        } catch (error) {
            // tslint:disable-next-line
            if (error.response == null) {
                throw error;
            }
            switch (error.response.status) {
                case 400:
                    throw new InvalidParameterError(error);
                case 401:
                case 404:
                    throw new RevAiApiError(error);
                case 403:
                    throw new InsufficientCreditsError(error);
                case 409:
                    throw new InvalidStateError(error);
                default:
                    throw error;
            }
        }
    }
}