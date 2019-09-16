import { JobStatus } from '../../src/models/JobStatus';
import { JobType } from '../../src/models/JobType';

describe('test items for backwards compatibility', () => {
    it ('version 2.2.0+, status and type enum compatible with strings', () => {
        expect(JobStatus.Failed).toBe('failed');
        expect(JobStatus.InProgress).toBe('in_progress');
        expect(JobStatus.Transcribed).toBe('transcribed');
        expect(JobType.Async).toBe('async');
        expect(JobType.Stream).toBe('stream');
    });
});