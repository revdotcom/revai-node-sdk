/**
 * Configuration for streaming job
 */
export class SessionConfig {
    metadata?: string;
    customVocabularyID?: string;
    filterProfanity?: boolean;
    remove_disfluencies?: boolean;

    /**
     * @param metadata (Optional) metadata to be associated with the streaming job
     * @param customVocabularyID (Optional) id of custom vocabulary to be used for 
     *      this session
     * @param filterProfanity (Optional) whether to remove profanity from the 
     *      transcript
     * @param removeDisfluencies (Optional) whether to remove disfluencies 
     *      (ums, ahs) from transcript
     */
    constructor(
        metadata?: string,
        customVocabularyID?: string,
        filterProfanity?: boolean,
        removeDisfluencies?: boolean
    ) {
        this.metadata = metadata;
        this.customVocabularyID = customVocabularyID;
        this.filterProfanity = filterProfanity;
        this.remove_disfluencies = removeDisfluencies;
    }
}