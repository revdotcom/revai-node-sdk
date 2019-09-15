/**
 * Configuration for streaming job
 */
export class SessionConfig {
    metadata?: string;

    /**
     * @param metadata (Optional) metadata to be associated with the streaming job
     */
    constructor(
        metadata?: string
    ) {
        this.metadata = metadata;
    }
}