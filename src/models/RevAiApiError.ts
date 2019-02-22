import { AxiosError } from 'axios';

export class RevAiApiError {
    statusCode: number;
    title: string;
    detail?: string;
    type?: string;

    constructor (e: AxiosError) {
        if (e.response) {
            this.statusCode = e.response.status;
            this.title = e.response.data.title || '';
            this.detail = e.response.data.detail || '';
            this.type = e.response.data.type || '';
        }
    }
}

export class InvalidParameterError extends RevAiApiError {
    parameters: {};

    constructor (e: AxiosError) {
        super(e);
        this.parameters = e.response.data.parameters;
    }
}

export class InvalidStateError extends RevAiApiError {
    currentValue: string;
    allowedValues: string[];

    constructor (e: AxiosError) {
        super(e);
        this.currentValue = e.response.data.current_value;
        this.allowedValues = e.response.data.allowed_values;
    }
}

export class InsufficientCreditsError extends RevAiApiError {
    currentBalance: number;

    constructor (e: AxiosError) {
        super(e);
        this.currentBalance = e.response.data.current_balance;
    }
}
