import RevAiApiClient from '../src/api-client';
import axios from 'axios';
const fs = require('fs');
const FormData = require('form-data');

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const apiClient = new RevAiApiClient('testtoken');
const jobId = 'Umx5c6F7pH7r';
const mediaUrl = 'https://support.rev.com/hc/en-us/article_attachments/200043975/FTC_Sample_1_-_Single.mp3';
const jobDetails = {
    id: jobId,
    status: 'in_progress',
    created_on: '2018-05-05T23:23:22.29Z'
}

describe('rev ai api client', () => {
    beforeEach(() => {
        mockedAxios.get.mockReset();
        mockedAxios.post.mockReset();
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
        const resp = { data: jobDetails };
        mockedAxios.get.mockResolvedValue(resp);

        const job = await apiClient.getJobDetails(jobId);

        expect(mockedAxios.get).toBeCalledWith(`/jobs/${jobId}`);
        expect(mockedAxios.get).toBeCalledTimes(1);
        expect(job).toEqual(jobDetails);
    });

    test('submit job with media url without options', async() => {
        const resp = { data: jobDetails };
        mockedAxios.post.mockResolvedValue(resp);

        const job = await apiClient.submitJobUrl(mediaUrl);

        expect(mockedAxios.post).toBeCalledWith('/jobs', { media_url: mediaUrl }, {
            headers: { 'Content-Type': 'application/json' }
        });
        expect(mockedAxios.post).toBeCalledTimes(1);
        expect(job).toEqual(jobDetails);
    });

    test('submit job with media url with options', async() => {
        const resp = { data: jobDetails };
        mockedAxios.post.mockResolvedValue(resp);
        const options = {
            metadata: 'This is a sample submit jobs option',
            callback_url: 'https://www.example.com/callback'
        }

        const job = await apiClient.submitJobUrl(mediaUrl, options);

        expect(mockedAxios.post).toBeCalledWith('/jobs', options, {
            headers: { 'Content-Type': 'application/json' }
        });
        expect(mockedAxios.post).toBeCalledTimes(1);
        expect(job).toEqual(jobDetails);
    });

    test('submit job with local file without options', async() => {
        const filename = 'path/to/test.mp3';
        const resp = { data: jobDetails };
        mockedAxios.post.mockResolvedValue(resp);

        const job = await apiClient.submitJobLocalFile(filename);

        const expectedPayload = expect.objectContaining({
            '_boundary': expect.anything(),
            '_streams': expect.arrayContaining([expect.stringContaining('Content-Type: audio/mpeg'), 
                expect.stringContaining('Content-Disposition: form-data; name=\"media\"; filename=\"test.mp3\"')])
        })
        const expectedHeader = { 'content-type': expect.stringMatching(/multipart\/form-data; boundary=.+/) };
        expect(mockedAxios.post).toBeCalledWith('/jobs', expectedPayload, { headers: expectedHeader });
        expect(mockedAxios.post).toBeCalledTimes(1);
        expect(job).toEqual(jobDetails);
    });

    test('submit job with local file with options', async() => {
        const filename = 'path/to/test.mp3';
        const resp = { data: jobDetails };
        mockedAxios.post.mockResolvedValue(resp);
        const options = {
            metadata: 'This is a sample submit jobs option',
            callback_url: 'https://www.example.com/callback'
        }

        const job = await apiClient.submitJobLocalFile(filename, options);

        const expectedPayload = expect.objectContaining({
            '_boundary': expect.anything(),
            '_streams': expect.arrayContaining([expect.stringContaining('Content-Type: audio/mpeg'), 
                expect.stringContaining('Content-Disposition: form-data; name="media"; filename="test.mp3"'),
                '{"metadata":"This is a sample submit jobs option","callback_url":"https://www.example.com/callback"}'])
        })
        const expectedHeader = { 'content-type': expect.stringMatching(/multipart\/form-data; boundary=.+/) };
        expect(mockedAxios.post).toBeCalledWith('/jobs', expectedPayload, { headers: expectedHeader });
        expect(mockedAxios.post).toBeCalledTimes(1);
        expect(job).toEqual(jobDetails);
    });

    test('get transcript object', async() => {
        const expectedTranscript = {
            "monologues": [
                {
                    "speaker": 1,
                    "elements": [
                        {
                        "type": "text",
                        "value": "Hello",
                        "ts": 0.5,
                        "end_ts": 1.5,
                        "confidence": 1
                        },
                        {
                        "type": "text",
                        "value": "World",
                        "ts": 1.75,
                        "end_ts": 2.85,
                        "confidence": 0.8
                        },
                        {
                        "type": "punct",
                        "value": "."
                        }
                    ]
                }
            ]
        };
        const resp = { data: expectedTranscript };
        mockedAxios.get.mockResolvedValue(resp);

        const transcript = await apiClient.getTranscriptObject(jobId);

        expect(mockedAxios.get).toBeCalledWith(`/jobs/${jobId}/transcript`, {
            headers: { 'Accept': `application/vnd.rev.transcript.v1.0+json` }
        });
        expect(mockedAxios.get).toBeCalledTimes(1);
        expect(transcript).toEqual(expectedTranscript);
    })

    test('get transcript test', async() => {
        const expectedTranscript = 'Speaker 0    00:00    Hello World.'
        const resp = { data: expectedTranscript }
        mockedAxios.get.mockResolvedValue(resp);
        
        const transcript = await apiClient.getTranscriptText(jobId);

        expect(mockedAxios.get).toBeCalledWith(`/jobs/${jobId}/transcript`, {
            headers: { 'Accept': 'text/plain' }
        });
        expect(mockedAxios.get).toBeCalledTimes(1);
        expect(transcript).toEqual(expectedTranscript);
    })
});
