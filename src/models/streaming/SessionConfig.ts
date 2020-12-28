/**
 * Configuration for streaming job
 */
export class SessionConfig {
    metadata?: string;
    customVocabularyID?: string;
    filterProfanity?: boolean;
    removeDisfluencies?: boolean;
    deleteAfterSeconds?: number;
    language?: string;

    /**
     * @param metadata (Optional) metadata to be associated with the streaming job
     * @param customVocabularyID (Optional) id of custom vocabulary to be used for
     *      this session
     * @param filterProfanity (Optional) whether to remove profanity from the
     *      transcript
     * @param removeDisfluencies (Optional) whether to remove disfluencies
     *      (ums, ahs) from transcript
     * @param deleteAfterSeconds (Optional) number of seconds after job completion
     *      when job is auto-deleted
     * @param language (Optional) language identified using ISO 639-1 2-letter
     *      language code
     */
    constructor(
        metadata?: string,
        customVocabularyID?: string,
        filterProfanity?: boolean,
        removeDisfluencies?: boolean,
        deleteAfterSeconds?: number,
        language?: string
    ) {
        this.metadata = metadata;
        this.customVocabularyID = customVocabularyID;
        this.filterProfanity = filterProfanity;
        this.removeDisfluencies = removeDisfluencies;
        this.deleteAfterSeconds = deleteAfterSeconds;
        this.language = language;
    }
}
