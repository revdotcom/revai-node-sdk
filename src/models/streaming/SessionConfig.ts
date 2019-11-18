/**
 * Configuration for streaming job
 */
export class SessionConfig {
    metadata?: string;
    customVocabularyID?: string;

    /**
     * @param metadata (Optional) metadata to be associated with the streaming job
     * @param customVocabularyID (Optional) id of custom vocabulary to be used for
     *                            this session
     */
    constructor(
        metadata?: string,
        customVocabularyID?: string
    ) {
        this.metadata = metadata;
        this.customVocabularyID = customVocabularyID;
    }
}