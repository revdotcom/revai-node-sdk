import RevAiApiClient from '../src/api-client';
import axios from 'axios';
const fs = require('fs');
const FormData = require('form-data');

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const apiClient = new RevAiApiClient('testtoken');

describe('rev ai api client', () => {
    beforeEach(() => {
        mockedAxios.get.mockClear();
        mockedAxios.post.mockClear();
    });

    test('get account', async () => {
        const accountEmail = 'test@rev.com';
        const balanceSeconds = 300;
        const data = { email: accountEmail, balance_seconds: balanceSeconds};
        const resp = { data: data };
        mockedAxios.get.mockResolvedValue(resp);

        const account = await apiClient.getAccount();

        expect(mockedAxios.get).toBeCalledWith('account');
        expect(mockedAxios.get).toBeCalledTimes(1);
        expect(account).toEqual(data);
    });

    test('get job by id', async() => {
        const jobId = 'Umx5c6F7pH7r';
        const data = {
            id: jobId,
            status: 'in_progress',
            created_on: '2018-05-05T23:23:22.29Z'
        };
        const resp = { data: data };
        mockedAxios.get.mockResolvedValue(resp);

        const job = await apiClient.getJobDetails(jobId);

        expect(mockedAxios.get).toBeCalledWith(`/jobs/${jobId}`);
        expect(mockedAxios.get).toBeCalledTimes(1);
        expect(job).toEqual(data);
    });

    test('submit job with media url without options', async() => {
        const mediaUrl = 'https://support.rev.com/hc/en-us/article_attachments/200043975/FTC_Sample_1_-_Single.mp3';
        const options = { media_url: mediaUrl }
        const data = {
            id: 'Umx5c6F7pH7r',
            status: 'in_progress',
            created_on: '2018-05-05T23:23:22.29Z'
        };
        const resp = { data: data };
        mockedAxios.post.mockResolvedValue(resp);

        const job = await apiClient.submitJobUrl(mediaUrl);

        expect(mockedAxios.post).toBeCalledWith('/jobs', options, {
            headers: { 'Content-Type': 'application/json' }
        });
        expect(mockedAxios.post).toBeCalledTimes(1);
        expect(job).toEqual(data);
    });

    test('submit job with media url with options', async() => {
        const mediaUrl = 'https://support.rev.com/hc/en-us/article_attachments/200043975/FTC_Sample_1_-_Single.mp3';
        const options = { 
            media_url: mediaUrl,
            metadata: 'This is a sample submit jobs option',
            callback_url: 'https://www.example.com/callback'
        };
        const data = {
            id: 'Umx5c6F7pH7r',
            status: 'in_progress',
            created_on: '2018-05-05T23:23:22.29Z'
        };
        const resp = { data: data };
        mockedAxios.post.mockResolvedValue(resp);

        const job = await apiClient.submitJobUrl(mediaUrl, options);

        expect(mockedAxios.post).toBeCalledWith('/jobs', options, {
            headers: { 'Content-Type': 'application/json' }
        });
        expect(mockedAxios.post).toBeCalledTimes(1);
        expect(job).toEqual(data);
    });

    test('submit job with local file without options', async() => {
        const filename = 'path/to/test.mp3';
        const data = {
            id: 'Umx5c6F7pH7r',
            status: 'in_progress',
            created_on: '2018-05-05T23:23:22.29Z'
        };
        const resp = { data: data };

        const job = await apiClient.submitJobLocalFile(filename);

        const expectedPayload = expect.objectContaining({
            '_boundary': expect.anything(),
            '_streams': expect.arrayContaining([expect.stringContaining('Content-Type: audio/mpeg'), 
                expect.stringContaining('Content-Disposition: form-data; name=\"media\"; filename=\"test.mp3\"')])
        })
        const expectedHeader = { 'content-type': expect.stringMatching(/multipart\/form-data; boundary=.+/) };
        expect(mockedAxios.post).toBeCalledWith('/jobs', expectedPayload, { headers: expectedHeader });
        expect(mockedAxios.post).toBeCalledTimes(1);
        expect(job).toEqual(data);
    });

    test('submit job with local file with options', async() => {
        const filename = 'path/to/test.mp3';
        const options = {
            metadata: 'This is a sample submit jobs option for multipart',
            callback_url: 'https://www.example.com/callback'
        }
        const data = {
            id: 'Umx5c6F7pH7r',
            status: 'in_progress',
            created_on: '2018-05-05T23:23:22.29Z'
        };
        const resp = { data: data };

        const job = await apiClient.submitJobLocalFile(filename, options);

        const expectedPayload = expect.objectContaining({
            '_boundary': expect.anything(),
            '_streams': expect.arrayContaining([expect.stringContaining('Content-Type: audio/mpeg'), 
                expect.stringContaining('Content-Disposition: form-data; name="media"; filename="test.mp3"'),
                '{"metadata":"This is a sample submit jobs option for multipart","callback_url":"https://www.example.com/callback"}'])
        })
        const expectedHeader = { 'content-type': expect.stringMatching(/multipart\/form-data; boundary=.+/) };
        expect(mockedAxios.post).toBeCalledWith('/jobs', expectedPayload, { headers: expectedHeader });
        expect(mockedAxios.post).toBeCalledTimes(1);
        expect(job).toEqual(data);
    });
});