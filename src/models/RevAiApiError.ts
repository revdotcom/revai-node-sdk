import { AxiosError } from 'axios';

export class RevAiApiError {
    statusCode: number;
    title: string;
    detail?: string;
    type?: string;

    constructor (e: AxiosError) {
        if (e.response) {
            this.statusCode = e.response.status;
            this.title = e.response.data.title || "";
            this.detail = e.response.data.detail || "";
            this.type = e.response.data.type || "";
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
    current_value: string;
    allowed_values: string[];

    constructor (e: AxiosError) {
        super(e);
        this.current_value = e.response.data.current_value;
        this.allowed_values = e.response.data.allowed_values;
    }
}

export class InsufficientCreditsError extends RevAiApiError {
    current_balance: number;

    constructor (e: AxiosError) {
        super(e);
        this.current_balance = e.response.data.current_balance;
    }
}
