import { ApiRequestHandler } from '../../src/api-request-handler';
import { BaseApiClient } from '../../src/base-api-client';

jest.mock('../../../src/api-request-handler');

interface TJob {
    id: string;
};
interface TResult { };

describe('base-api-client', () => {
    let sut: BaseApiClient<TJob, TResult>;
    let mockMakeApiRequest: jest.Mock;

    const jobId = 'Umx5c6F7pH7r';
    const otherJobId = 'EMx5c67p3dr';
    const jobDetails = {
        id: jobId,
        status: 'completed',
        created_on: '2018-05-05T23:23:22.29Z'
    } as TJob;

    beforeEach(() => {
        mockMakeApiRequest = jest.fn();
        (ApiRequestHandler as jest.Mock<ApiRequestHandler>).mockImplementationOnce(() => ({
            makeApiRequest: mockMakeApiRequest
        }));
        sut = new BaseApiClient('testtoken', 'topic_extraction');
    });

    describe('_getJobDetails', () => {
        it('get job by id', async () => {
            mockMakeApiRequest.mockResolvedValue(jobDetails);

            const job = await (sut as any)._getJobDetails(jobId);

            expect(mockMakeApiRequest).toBeCalledWith('get', `/jobs/${jobDetails.id}`, {}, 'json');
            expect(mockMakeApiRequest).toBeCalledTimes(1);
            expect(job).toEqual(jobDetails);
        });
    });

    describe('_getListOfJobs', () => {
        it('get list of jobs', async () => {
            mockMakeApiRequest.mockResolvedValue([jobDetails]);

            const jobs = await (sut as any)._getListOfJobs();

            expect(jobs).toEqual([jobDetails]);
            expect(mockMakeApiRequest).toBeCalledWith('get', `/jobs`, {}, 'json');
            expect(mockMakeApiRequest).toBeCalledTimes(1);
        });

        it('get list of jobs with params', async () => {
            const params = {
                limit: 5,
                starting_after: otherJobId,
                other_field: "asdf"
            };
            const jobDetails2 = {
                id: otherJobId,
                status: 'completed',
                created_on: '2013-05-05T23:23:22.29Z'
            } as TJob;
            mockMakeApiRequest.mockResolvedValue([jobDetails, jobDetails2]);

            const jobs = await (sut as any)._getListOfJobs(params);

            expect(jobs).toEqual([jobDetails, jobDetails2]);
            expect(mockMakeApiRequest).toBeCalledWith('get',
                `/jobs?limit=5&starting_after=${otherJobId}&other_field=asdf`, {}, 'json');
            expect(mockMakeApiRequest).toBeCalledTimes(1);
        });
    });

    describe('_submitJob', () => {
        it('submit job', async () => {
            mockMakeApiRequest.mockResolvedValue(jobDetails);

            const job = await (sut as any)._submitJob({});

            expect(mockMakeApiRequest).toBeCalledWith('post', '/jobs',
                { 'Content-Type': 'application/json' }, 'json', {});
            expect(mockMakeApiRequest).toBeCalledTimes(1);
            expect(job).toEqual(jobDetails);
        });

        it('submit job with options', async () => {
            mockMakeApiRequest.mockResolvedValue(jobDetails);
            const options = {
                some_option: 'asdf',
                another_options: 5
            }

            const job = await (sut as any)._submitJob(options);

            expect(mockMakeApiRequest).toBeCalledWith('post', '/jobs',
                { 'Content-Type': 'application/json' }, 'json', options);
            expect(mockMakeApiRequest).toBeCalledTimes(1);
            expect(job).toEqual(jobDetails);
        });
    });

    describe('deleteJob', () => {
        it('delete job by id', async () => {
            mockMakeApiRequest.mockResolvedValue(null);

            await (sut as any)._deleteJob(jobId);

            expect(mockMakeApiRequest).toBeCalledWith('delete', `/jobs/${jobId}`, {}, 'text');
            expect(mockMakeApiRequest).toBeCalledTimes(1);
        });
    });
});
