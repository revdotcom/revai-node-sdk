import { NlpModel } from './NlpModel';
import { SummarizationFormattingOptions } from './SummarizationFormattingOptions';

export interface SummarizationOptions {
    prompt?: string;
    model?: NlpModel;
    type?: SummarizationFormattingOptions;
}
