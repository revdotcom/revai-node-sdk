import { SummarizationJobStatus } from './SummarizationJobStatus';
import { SummarizationOptions } from './SummarizationOptions';

export interface Summarization extends SummarizationOptions {
    status: SummarizationJobStatus;
    completed_on?: string;
    failure?: string;
}
