export default interface RevAiApiError extends Error {
    status: number,
    title: string,
    detail?: string,
    type?: string,
    current_value?: string,
    allowed_values?: string[]
}
