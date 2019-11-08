import axios from 'axios';

import { ApiRequestHandler, AxiosResponseTypes, HttpMethodTypes } from '../../src/api-request-handler';
import {
    InsufficientCreditsError,
    InvalidParameterError,
    InvalidStateError,
    RevAiApiError
} from '../../src/models/RevAiApiError';
import {
    objectToStream,
    setupFakeApiError,
    setupFakeInsufficientCreditsError,
    setupFakeInvalidParametersError,
    setupFakeInvalidStateError
} from './testhelpers';
import { Readable, Writable, Transform } from 'stream';

describe('api-request-handler', () => {
    let sut: ApiRequestHandler;
    const baseURL = 'www.example.com';
    const accessToken = 'token';

    beforeEach(() => {
        sut = new ApiRequestHandler(baseURL, accessToken);
    });

    describe('makeApiRequest', () => {
        beforeEach(() => {
            axios.request.mockReset();
        });

        it.each([['get', 'post', 'delete']])('sends request', async (method) => {
            const endpoint = '/test';
            const headers = { 'Header1' : 'test' };
            const responseType = 'text';
            const response = 'testResponse';
            axios.request.mockResolvedValue({ data : response });

            let res = await sut.makeApiRequest(method, endpoint, headers, responseType);

            expect(axios.request).toBeCalledTimes(1);
            expect(axios.request).toBeCalledWith({
                method: method,
                url: endpoint,
                data: undefined,
                headers: headers,
                responseType: responseType
            });
            expect(res).toBe(response);
        });

        it('passes params on post requests', async () => {
            const endpoint = '/test';
            const headers = { 'Header1' : 'test' };
            const responseType = 'text';
            const response = 'testResponse';
            const params = { data : 'stuff' };
            axios.request.mockResolvedValue({ data : response });

            let res = await sut.makeApiRequest('post', endpoint, headers, responseType, params);

            expect(axios.request).toBeCalledTimes(1);
            expect(axios.request).toBeCalledWith({
                method: 'post',
                url: endpoint,
                data: { data : 'stuff' },
                headers: headers,
                responseType: responseType
            });
            expect(res).toBe(response);
        });

        it.each([['get', 'delete']])('does not pass params on get or delete', async (method) => {
            const endpoint = '/test';
            const headers = { 'Header1' : 'test' };
            const responseType = 'text';
            const response = 'testResponse';
            const params = { data : 'stuff' };
            axios.request.mockResolvedValue({ data : response });

            let res = await sut.makeApiRequest(method, endpoint, headers, responseType, params);

            expect(axios.request).toBeCalledTimes(1);
            expect(axios.request).toBeCalledWith({
                method: method,
                url: endpoint,
                data: undefined,
                headers: headers,
                responseType: responseType
            });
            expect(res).toBe(response);
        });

        it('handles when api returns unauthorized', async () => {
            const method = 'get';
            const endpoint = '/test';
            const headers = { 'Header1' : 'test' };
            const responseType = 'text';
            const fakeError = setupFakeApiError(401, 'Unauthorized');
            axios.request.mockImplementationOnce(() => Promise.reject(fakeError));

            try {
                await sut.makeApiRequest(method, endpoint, headers, responseType);
            } catch (e) {
                expect(e).toEqual(new RevAiApiError(fakeError));
            }
            expect(axios.request).toBeCalledTimes(1);
            expect(axios.request).toBeCalledWith({
                method: method,
                url: endpoint,
                data: undefined,
                headers: headers,
                responseType: responseType
            });
        });

        it('handles when api returns not found', async () => {
            const method = 'get';
            const endpoint = '/test';
            const headers = { 'Header1' : 'test' };
            const responseType = 'text';
            const fakeError = setupFakeApiError(404, 'not found');
            axios.request.mockImplementationOnce(() => Promise.reject(fakeError));

            try {
                await sut.makeApiRequest(method, endpoint, headers, responseType);
            } catch (e) {
                expect(e).toEqual(new RevAiApiError(fakeError));
            }
            expect(axios.request).toBeCalledTimes(1);
            expect(axios.request).toBeCalledWith({
                method: method,
                url: endpoint,
                data: undefined,
                headers: headers,
                responseType: responseType
            });
        });

        it('handles when api returns bad request', async () => {
            const method = 'get';
            const endpoint = '/test';
            const headers = { 'Header1' : 'test' };
            const responseType = 'text';
            const fakeError = setupFakeInvalidParametersError();
            axios.request.mockImplementationOnce(() => Promise.reject(fakeError));

            try {
                await sut.makeApiRequest(method, endpoint, headers, responseType);
            } catch (e) {
                expect(e).toEqual(new InvalidParameterError(fakeError));
            }
            expect(axios.request).toBeCalledTimes(1);
            expect(axios.request).toBeCalledWith({
                method: method,
                url: endpoint,
                data: undefined,
                headers: headers,
                responseType: responseType
            });
        });

        it('handles when api returns invalid state', async () => {
            const method = 'get';
            const endpoint = '/test';
            const headers = { 'Header1' : 'test' };
            const responseType = 'text';
            const fakeError = setupFakeInvalidStateError();
            axios.request.mockImplementationOnce(() => Promise.reject(fakeError));

            try {
                await sut.makeApiRequest(method, endpoint, headers, responseType);
            } catch (e) {
                expect(e).toEqual(new InvalidStateError(fakeError));
            }
            expect(axios.request).toBeCalledTimes(1);
            expect(axios.request).toBeCalledWith({
                method: method,
                url: endpoint,
                data: undefined,
                headers: headers,
                responseType: responseType
            });
        });

        it('handles when api returns insufficient credits', async () => {
            const method = 'get';
            const endpoint = '/test';
            const headers = { 'Header1' : 'test' };
            const responseType = 'text';
            const fakeError = setupFakeInsufficientCreditsError();
            axios.request.mockImplementationOnce(() => Promise.reject(fakeError));

            try {
                await sut.makeApiRequest(method, endpoint, headers, responseType);
            } catch (e) {
                expect(e).toEqual(new InsufficientCreditsError(fakeError));
            }
            expect(axios.request).toBeCalledTimes(1);
            expect(axios.request).toBeCalledWith({
                method: method,
                url: endpoint,
                data: undefined,
                headers: headers,
                responseType: responseType
            });
        });

        it('reads error response body when error is thrown from stream request', async () => {
            const responseType = 'stream';
            const method = 'get';
            const endpoint = '/test';
            const headers = { 'Header1' : 'test' };
            const fakeError = setupFakeInvalidParametersError();
            const fakeData = {
                title: 'fakeTitle',
                type: 'fakeType',
                detail: 'fakeDetail',
                parameters: {
                    'media_url': [
                        'The media_url field is required'
                    ]
                }
            };
            let responseStream = new Transform({ objectMode: true });
            responseStream.push(JSON.stringify(fakeData));
            fakeError.response.data = responseStream;
            axios.request.mockImplementationOnce(() => Promise.reject(fakeError));

            try {
                await sut.makeApiRequest(method, endpoint, headers, responseType);
            } catch (e) {
                expect(e).toEqual(new InvalidParameterError(fakeError));
            }
            expect(axios.request).toBeCalledTimes(1);
            expect(axios.request).toBeCalledWith({
                method: method,
                url: endpoint,
                data: undefined,
                headers: headers,
                responseType: responseType
            });
        });
    });
});