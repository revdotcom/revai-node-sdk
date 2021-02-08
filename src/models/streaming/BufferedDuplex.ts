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
        const needsDrain = this.input.write(chunk, encoding, () => needsDrain && callback());
        if (!needsDrain) {
            this.input.once('drain', callback);
        }
        return needsDrain;
    }

    public _read(size: number): any {
        const chunk = this.output.read(size);
        if (chunk !== null) {
            this.push(chunk);
        } else {
            this.output.once('readable', s => this._read(s));
        }
    }

    private setupInput(): void {
        this.once('finish', () => this.input.end());
        this.input.on('ending', () => this.writable = false);
        this.input.on('finish', () => this.end());
        this.input.on('error', error => this.emit('error', error));
    }

    private setupOutput(): void {
        this.output.pause();
        this.output.on('end', () => this.push(null));
        this.output.on('error', error => this.emit('error', error));
    }
}