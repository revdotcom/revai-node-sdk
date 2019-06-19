import axios from 'axios';
import {
    objectToStream,
    setupFakeApiError,
    setupFakeInvalidStateError,
    setupFakeInsufficientCreditsError,
    setupFakeInvalidParametersError
} from './testhelpers';
import { ApiRequestHandler, HttpMethodTypes, AxiosResponseTypes } from '../src/api-request-handler';
import {
    RevAiApiError,
    InvalidParameterError,
    InvalidStateError,
    InsufficientCreditsError
} from '../src/models/RevAiApiError';

class TestApiRequestHandler extends ApiRequestHandler {
    constructor(baseURL: string, defaultHeaders: {}){
        super(baseURL, defaultHeaders);
    }
}

describe('api-request-handler', () => {
    let sut: TestApiRequestHandler;
    const baseURL = 'www.example.com';
    const defaultHeaders = { 'Authorization' : 'token' };
    console.log(axios);
    const mockInstance = axios.create({});
    console.log(mockInstance);

    beforeEach(() => {
        sut = new TestApiRequestHandler(baseURL, defaultHeaders);
    });

    describe('makeApiRequest', () => {
        it.each([['get', 'post','delete']])('sends request', async (method) => {
            const endpoint = '/test';
            const headers = { 'Header1' : 'test' };
            const responseType = 'text';
            const response = 'testResponse';
            // mockInstance.request.mockResolvedValue({ data : response });

            var res = await sut.makeApiRequest(method, endpoint, headers, responseType);

            expect(mockInstance.request).toBeCalledTimes(1);
            expect(mockInstance.request).toBeCalledWith({
                method: method,
                url: endpoint,
                data: undefined,
                headers: headers,
                responseType: responseType
            });
            expect(res).toBe(response);
        });
    });
});
