/**
 * Configuration for streaming job
 */
export class SessionConfig {
    metadata?: string;
    customVocabularyID?: string;
    filterProfanity?: boolean;
    removeDisfluencies?: boolean;
    deleteAfterSeconds?: number;
    startTs?: number;
    transcriber?: string;
    detailedPartials?: boolean;
    language: string;

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
     * @param startTs (Optional) number of seconds to offset all hypotheses timings
     * @param transcriber (Optional) type of transcriber to use to transcribe the
     *      media file
     * @param detailedPartials (Optional) whether to return detailed partials
     * @param language (Optional) language to use for the streaming job
     */
    constructor(
        metadata?: string,
        customVocabularyID?: string,
        filterProfanity?: boolean,
        removeDisfluencies?: boolean,
        deleteAfterSeconds?: number,
        startTs?: number,
        transcriber?: string,
        detailedPartials?: boolean,
        language?: string
    ) {
        this.metadata = metadata;
        this.customVocabularyID = customVocabularyID;
        this.filterProfanity = filterProfanity;
        this.removeDisfluencies = removeDisfluencies;
        this.deleteAfterSeconds = deleteAfterSeconds;
        this.startTs = startTs;
        this.transcriber = transcriber;
        this.detailedPartials = detailedPartials;
        this.language = language;
    }
}
