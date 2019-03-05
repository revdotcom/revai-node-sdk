import { AxiosError } from "axios";

export const fakeAxiosError = {
    name: 'error',
    message: 'message',
    config: {},
    response: { status: 404, config: {}, data: {}, statusText: 'text', headers: {} }
};

export const setupFakeApiError = (statusCode: number, title: string, type?: string,
    detail?: string): AxiosError => {
    return {
        config: null,
        code: statusCode.toString(),
        request: {},
        response: {
            data: {
                title: title,
                type: type,
                detail: detail
            },
            status: statusCode,
            statusText: 'Failed',
            headers: null,
            config: null
        },
        name: 'axiosError',
        message: 'fake error'
    };
};

export const setupFakeInvalidStateError = (): AxiosError => {
    var err = setupFakeApiError(409,
        "Job is in invalid state",
        "https://www/rev.ai/api/speech/v1/errors/invalid-job-state",
        "Job is in invalid state to obtain the transcript"
    );
    err.response.data["allowed_values"] = ["transcribed"];
    err.response.data["current_value"] = "failed";
    return err;
}

export const setupFakeInsufficientCreditsError = (): AxiosError => {
    var err = setupFakeApiError(403,
        "You do not have enough credits",
        "https://www/rev.ai/api/speech/v1/errors/out-of-credit",
        "You only have 60 seconds remaining"
    );
    err.response.data["current_balance"] = 60;
    return err;
}

export const setupFakeInvalidParametersError = (): AxiosError => {
    var err = setupFakeApiError(400,
        "Your request parameters didn't validate",
        "https://www/rev.ai/api/speech/v1/errors/invalid-parameters"
    );
    err.response.data["parameters"] = {
        "media_url": [
            "The media_url field is required"
        ]
    }
    return err;
}
