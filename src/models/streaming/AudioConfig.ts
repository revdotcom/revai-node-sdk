/**
 * Configuration for an audio stream.
 */
export class AudioConfig {
    contentType: string;
    layout?: string;
    rate?: number;
    format?: string;
    channels?: number;

    /**
     * @param contentType {string} Content type of the audio stream.
     * @param layout (optional) {string} Layout of the audio channels. "interleaved" or "non-interleaved".
     * @param rate (optional) {int} Sample rate of audio. 8000-48000hz supported.
     * @param format (optional) {string} Format of audio.
     * @param channels (optional) {int} Number of audio channels. 1-10 supported.
     */
    constructor(
        contentType = 'audio/*',
        layout?: string,
        rate?: number,
        format?: string,
        channels?: number
    ) {
        this.contentType = contentType;
        this.layout = layout;
        this.rate = rate;
        this.format = format;
        this.channels = channels;
    }

    getContentTypeString(): string {
        return `${this.contentType}` +
            (this.layout ? `;layout=${this.layout}` : '') +
            (this.rate ? `;rate=${this.rate}` : '') +
            (this.format ? `;format=${this.format}` : '') +
            (this.channels ? `;channels=${this.channels}` : '');
    }
}