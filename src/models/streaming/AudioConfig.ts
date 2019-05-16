export default class AudioConfig {
    contentType: string;
    layout?: string;
    rate?: number;
    format?: string;
    channels?: number;

    getContentTypeString (): string {
        return `${this.contentType}` +
            (this.layout == null ? "" : `;layout=${this.layout}`) +
            (this.rate == null ? "" : `;rate=${this.rate}`) +
            (this.format == null ? "" : `;format=${this.format}`) +
            (this.channels == null ? "" : `;channels=${this.channels}`);
    }
}