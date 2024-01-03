import { SummarizationModel } from './SummarizationModel';
import { SummarizationFormattingOptions } from './SummarizationFormattingOptions';

export interface SummarizationOptions {
    prompt?: string;
    model?: SummarizationModel;
    type?: SummarizationFormattingOptions;
}
