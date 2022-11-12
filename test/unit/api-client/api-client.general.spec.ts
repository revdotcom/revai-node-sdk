import { RevAiApiClient } from '../../../src/api-client';
import { ApiRequestHandler } from '../../../src/api-request-handler';

jest.mock('../../../src/api-request-handler');

describe('api-client', () => {
    let sut: RevAiApiClient;
    let mockMakeApiRequest: jest.Mock;

    const jobId = 'Umx5c6F7pH7r';
    const otherJobId = 'EMx5c67p3dr';
    const jobDetails = {
        id: jobId,
        status: 'in_progress',
        created_on: '2018-05-05T23:23:22.29Z'
    };

    beforeEach(() => {
        mockMakeApiRequest = jest.fn();
        (ApiRequestHandler as jest.Mock<ApiRequestHandler>).mockImplementationOnce(() => ({
            makeApiRequest: mockMakeApiRequest
        }));
        sut = new RevAiApiClient({ token: 'testtoken' });
    });

    describe('getAccount', () => {
        it('get account email and balance', async () => {
            const accountEmail = 'test@rev.com';
            const balanceSeconds = 300;
            const data = { email: accountEmail, balance_seconds: balanceSeconds };
            mockMakeApiRequest.mockResolvedValueOnce(data);

            const account = await sut.getAccount();

            expect(mockMakeApiRequest).toBeCalledWith('get', '/account', {}, 'json');
            expect(mockMakeApiRequest).toBeCalledTimes(1);
            expect(account).toEqual(data);
        });
    });

    describe('getJobDetails', () => {
        it('get job by id', async () => {
            mockMakeApiRequest.mockResolvedValue(jobDetails);

            const job = await sut.getJobDetails(jobId);

            expect(mockMakeApiRequest).toBeCalledWith('get', `/jobs/${jobDetails.id}`, {}, 'json');
            expect(mockMakeApiRequest).toBeCalledTimes(1);
            expect(job).toEqual(jobDetails);
        });
    });

    describe('getListOfJobs', () => {
        it('get list of jobs', async () => {
            mockMakeApiRequest.mockResolvedValue([jobDetails]);

            const jobs = await sut.getListOfJobs();

            expect(jobs).toEqual([jobDetails]);
            expect(mockMakeApiRequest).toBeCalledWith('get', '/jobs', {}, 'json');
            expect(mockMakeApiRequest).toBeCalledTimes(1);
        });

        it('get list of jobs with limit of 5', async () => {
            const jobDetails2 = {
                id: otherJobId,
                status: 'transcribed',
                created_on: '2013-05-05T23:23:22.29Z'
            };
            const data = [jobDetails, jobDetails2];
            mockMakeApiRequest.mockResolvedValue(data);

            const jobs = await sut.getListOfJobs(5);

            expect(jobs).toEqual([jobDetails, jobDetails2]);
            expect(mockMakeApiRequest).toBeCalledWith('get', '/jobs?limit=5', {}, 'json');
            expect(mockMakeApiRequest).toBeCalledTimes(1);
        });

        it('get list of jobs starting after certain job id', async () => {
            mockMakeApiRequest.mockResolvedValue([jobDetails]);

            const jobs = await sut.getListOfJobs(undefined, otherJobId);

            expect(jobs).toEqual([jobDetails]);
            expect(mockMakeApiRequest).toBeCalledWith('get',
                `/jobs?starting_after=${otherJobId}`, {}, 'json');
            expect(mockMakeApiRequest).toBeCalledTimes(1);
        });

        it('get list of jobs with limit of 5 and starting after certain job id', async () => {
            const limit = 5;
            const jobDetails2 = {
                id: otherJobId,
                status: 'transcribed',
                created_on: '2013-05-05T23:23:22.29Z'
            };
            mockMakeApiRequest.mockResolvedValue([jobDetails, jobDetails2]);

            const jobs = await sut.getListOfJobs(limit, otherJobId);

            expect(jobs).toEqual([jobDetails, jobDetails2]);
            expect(mockMakeApiRequest).toBeCalledWith('get',
                `/jobs?limit=${limit}&starting_after=${otherJobId}`, {}, 'json');
            expect(mockMakeApiRequest).toBeCalledTimes(1);
        });
    });

    describe('deleteJob', () => {
        it('delete job by id', async () => {
            mockMakeApiRequest.mockResolvedValue(null);

            await sut.deleteJob(jobId);

            expect(mockMakeApiRequest).toBeCalledWith('delete', `/jobs/${jobId}`, {}, 'text');
            expect(mockMakeApiRequest).toBeCalledTimes(1);
        });
    });
});
