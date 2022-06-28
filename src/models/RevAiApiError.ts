/* eslint-disable @typescript-eslint/ban-types */
import { AxiosError } from 'axios';


interface ProblemDetails {
    status: number;
    details: string;
    parameters: {};
    current_value?: string;
    allowed_values?: string[];
}
export class RevAiApiError {
    statusCode: number;
    details: unknown | string;

    constructor(e: AxiosError) {
        if (e.response) {
            this.statusCode = e.response.status;
            this.details = e.response.data || '';
        }
    }
}

export class InvalidParameterError extends RevAiApiError {
    parameters: {};

    constructor(e: AxiosError<ProblemDetails>) {
        super(e);
        this.parameters = e.response.data.parameters;
    }
}

export class InvalidStateError extends RevAiApiError {
    currentValue: string;
    allowedValues: string[];

    constructor(e: AxiosError<ProblemDetails>) {
        super(e);
        this.currentValue = e.response.data.current_value;
        this.allowedValues = e.response.data.allowed_values;
    }
}
