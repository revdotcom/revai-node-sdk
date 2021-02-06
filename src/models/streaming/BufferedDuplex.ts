import { Duplex, PassThrough } from 'stream';

/**
 * Represents a two way buffered stream. Extends Duplex which implements both Readable and Writable
 */
export class BufferedDuplex extends Duplex {
    input: PassThrough;
    output: PassThrough;

    /**
     * @param input Buffer for the Writable side of the stream.
     * @param output Buffer for the Readable side of the stream.
     * @param options Options to be passed through to the superclass.
     */
    constructor (input: PassThrough, output: PassThrough, options?: any) {
        super(options);
        this.input = input;
        this.output = output;
        this.setupInput();
        this.setupOutput();
    }

    public _write(chunk: any, encoding: string, callback: any): boolean {
        const needs_drain = this.input.write(chunk, encoding, () => needs_drain && callback());
        if (!needs_drain) {
            this.input.once('drain', callback);
        }
        return needs_drain;
    }

    public _read(size: number): any {
        const chunk = this.output.read(size);
        if (chunk !== null)
            this.push(chunk);
        else
            this.output.once('readable', size => this._read(size));
    }

    private setupInput(): void {
        this.once('finish', () => this.input.end());
        this.input.on('finish', () => {
            this.end();
            console.log("ok");
        });
        this.input.on('error', error => this.emit('error', error));
    }

    private setupOutput(): void {
        this.output.pause();
        this.output.on('end', () => this.push(null));
        this.output.on('error', error => this.emit('error', error));
    }
}