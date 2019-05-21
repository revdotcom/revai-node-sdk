export default class AudioConfig {
    contentType: string;
    layout?: string;
    rate?: number;
    format?: string;
    channels?: number;
    constructor(contentType = "audio/*", layout?: string, rate?: number, format?: string, channels?: number){
        this.contentType = contentType;
        this.layout = layout;
        this.rate = rate;
        this.format = format;
        this.channels = channels;
    }

    getContentTypeString(): string {
        return `${this.contentType}` +
            (this.layout ? `;layout=${this.layout}` : "") +
            (this.rate ? `;rate=${this.rate}` : "") +
            (this.format ? `;format=${this.format}` : "") +
            (this.channels ? `;channels=${this.channels}` : "");
    }
}