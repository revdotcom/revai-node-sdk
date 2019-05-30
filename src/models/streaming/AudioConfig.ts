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
     * @param contentType Content type of the audio stream.
     * @param layout (optional) Layout of the audio channels. "interleaved" or "non-interleaved".
     * @param rate (optional) Sample rate of audio. 8000-48000hz supported.
     * @param format (optional) Format of audio.
     * @param channels (optional) Number of audio channels. 1-10 supported.
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

    public getContentTypeString(): string {
        return `${this.contentType}` +
            (this.layout ? `;layout=${this.layout}` : '') +
            (this.rate ? `;rate=${this.rate}` : '') +
            (this.format ? `;format=${this.format}` : '') +
            (this.channels ? `;channels=${this.channels}` : '');
    }
}