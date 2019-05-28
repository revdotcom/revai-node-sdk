import { Duplex, PassThrough } from 'stream';

/**
 * Represents a two way buffered stream. Extends Duplex which implements both Readable and Writable
 */
export class BufferedDuplex extends Duplex {
    input: PassThrough;
    output: PassThrough;
    areOutputHandlersSetup: boolean;

    /**
     * @param input {PassThrough} Buffer for the Writable side of the stream.
     * @param output {PassThrough} Buffer for the Readable side of the stream.
     * @param options {object} Options to be passed through to the superclass.
     */
    constructor (input: PassThrough, output: PassThrough, options?: any) {
        super(options);
        this.input = input;
        this.output = output;
        this.areOutputHandlersSetup = false;
    }

    _write(chunk: any, encoding: any, callback: any): boolean {
        return this.input.write(chunk, encoding, callback);
    }

    _read(size: any): any {
        if (!this.areOutputHandlersSetup) {
            return this.setUpOutputHandlersAndRead(size);
        }
        return this.readOutput(size);
    }

    private setUpOutputHandlersAndRead(size: any): void {
        this.output
            .on('readable', () => {
                this.readOutput(size);
            })
            .on('end', () => {
                this.push(null);
            });
        this.areOutputHandlersSetup = true;
    }

    private readOutput(size: any): void {
        let chunk = this.output.read(size);
        while (chunk !== null) {
            if (!this.push(chunk)) {
                break;
            }
        }
    }
}