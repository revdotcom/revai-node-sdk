import RevAiApiError from './models/RevAiApiError';

export default function createError(status: number, title: string, detail?: string, type?: string, currentValue?: string, allowedValues?: string[]): RevAiApiError {
    var error = <RevAiApiError> new Error(title);
    error.status = status;
    error.title = title;
    if (detail)
        error.detail = detail;
    if (type)
        error.type = type;
    if (currentValue)
        error.current_value = currentValue;
    if (allowedValues)
        error.allowed_values = allowedValues;
    return error;
}
