export interface RevAiApiJob {
    id: string;
    status: string;
    created_on: string;
    completed_on?: string;
    metadata?: string;
    name?: string;
    callback_url?: string;
    duration_seconds?: number;
    media_url?: string;
    failure?: string;
    failure_detail?: string;
}
