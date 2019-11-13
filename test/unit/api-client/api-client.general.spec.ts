import * as fs from 'fs';

import { RevAiApiClient } from '../../../src/api-client';
import { ApiRequestHandler } from '../../../src/api-request-handler';
import { RevAiApiTranscript } from '../../../src/models/RevAiApiTranscript';
import { objectToStream } from '../testhelpers';

jest.mock('../../../src/api-request-handler');

let sut: RevAiApiClient;

describe('api-client', () => {
    const jobId = 'Umx5c6F7pH7r';
    const otherJobId = 'EMx5c67p3dr';
    const jobDetails = {
        id: jobId,
        status: 'in_progress',
        created_on: '2018-05-05T23:23:22.29Z'
    }

    beforeEach(() => {
        ApiRequestHandler.mockClear();
        sut = new RevAiApiClient('testtoken');
    });

    describe('getAccount', () => {
        it('get account email and balance', async () => {
            const accountEmail = 'test@rev.com';
            const balanceSeconds = 300;
            const data = { email: accountEmail, balance_seconds: balanceSeconds};
            const mockHandler = ApiRequestHandler.mock.instances[0];
            mockHandler.makeApiRequest.mockResolvedValue(data);

            const account = await sut.getAccount();

            expect(mockHandler.makeApiRequest).toBeCalledWith('get', '/account', {}, 'json');
            expect(mockHandler.makeApiRequest).toBeCalledTimes(1);
            expect(account).toEqual(data);
        });
    });

    describe('getJobDetails', () => {
        it('get job by id', async () => {
            const mockHandler = ApiRequestHandler.mock.instances[0];
            mockHandler.makeApiRequest.mockResolvedValue(jobDetails);

            const job = await sut.getJobDetails(jobId);

            expect(mockHandler.makeApiRequest).toBeCalledWith('get', `/jobs/${jobDetails.id}`, {}, 'json');
            expect(mockHandler.makeApiRequest).toBeCalledTimes(1);
            expect(job).toEqual(jobDetails);
        });
    });

    describe('getListOfJobs', () => {
        it('get list of jobs', async () => {
            const mockHandler = ApiRequestHandler.mock.instances[0];
            mockHandler.makeApiRequest.mockResolvedValue([jobDetails]);

            const jobs = await sut.getListOfJobs();

            expect(jobs).toEqual([jobDetails]);
            expect(mockHandler.makeApiRequest).toBeCalledWith('get', `/jobs`, {}, 'json');
            expect(mockHandler.makeApiRequest).toBeCalledTimes(1);
        });

        it('get list of jobs with limit of 5', async () => {
            const jobDetails2 = {
                id: otherJobId,
                status: 'transcribed',
                created_on: '2013-05-05T23:23:22.29Z'
            };
            const data = [jobDetails, jobDetails2];
            const mockHandler = ApiRequestHandler.mock.instances[0];
            mockHandler.makeApiRequest.mockResolvedValue(data);

            const jobs = await sut.getListOfJobs(5);

            expect(jobs).toEqual([jobDetails, jobDetails2]);
            expect(mockHandler.makeApiRequest).toBeCalledWith('get', '/jobs?limit=5', {}, 'json');
            expect(mockHandler.makeApiRequest).toBeCalledTimes(1);
        });

        it('get list of jobs starting after certain job id', async () => {
            const mockHandler = ApiRequestHandler.mock.instances[0];
            mockHandler.makeApiRequest.mockResolvedValue([jobDetails]);

            const jobs = await sut.getListOfJobs(undefined, otherJobId);

            expect(jobs).toEqual([jobDetails]);
            expect(mockHandler.makeApiRequest).toBeCalledWith('get',
                `/jobs?starting_after=${otherJobId}`, {}, 'json');
            expect(mockHandler.makeApiRequest).toBeCalledTimes(1);
        });

        it('get list of jobs with limit of 5 and starting after certain job id', async () => {
            const limit = 5;
            const jobDetails2 = {
                id: otherJobId,
                status: 'transcribed',
                created_on: '2013-05-05T23:23:22.29Z'
            };
            const mockHandler = ApiRequestHandler.mock.instances[0];
            mockHandler.makeApiRequest.mockResolvedValue([jobDetails, jobDetails2]);

            const jobs = await sut.getListOfJobs(limit, otherJobId);

            expect(jobs).toEqual([jobDetails, jobDetails2]);
            expect(mockHandler.makeApiRequest).toBeCalledWith('get',
                `/jobs?limit=${limit}&starting_after=${otherJobId}`, {}, 'json');
            expect(mockHandler.makeApiRequest).toBeCalledTimes(1);
        });
    });

    describe('deleteJob', () => {
        it('delete job by id', async () => {
            const mockHandler = ApiRequestHandler.mock.instances[0];
            mockHandler.makeApiRequest.mockResolvedValue(null);

            await sut.deleteJob(jobId);

            expect(mockHandler.makeApiRequest).toBeCalledWith('delete', `/jobs/${jobId}`, {}, 'text');
            expect(mockHandler.makeApiRequest).toBeCalledTimes(1);
        });
    });
});
