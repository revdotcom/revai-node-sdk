import { Duplex, PassThrough } from 'stream';

/**
 * Represents a two way buffered stream. Extends Duplex which implements both Readable and Writable
 */
export class BufferedDuplex extends Duplex {
    input: PassThrough;
    output: PassThrough;
    areOutputHandlersSetup: boolean;

    /**
     * @param input Buffer for the Writable side of the stream.
     * @param output Buffer for the Readable side of the stream.
     * @param options Options to be passed through to the superclass.
     */
    constructor (input: PassThrough, output: PassThrough, options?: any) {
        super(options);
        this.input = input;
        this.output = output;
        this.areOutputHandlersSetup = false;
    }

    private _write(chunk: any, encoding: string, callback: any): boolean {
        return this.input.write(chunk, encoding, callback);
    }

    private _read(size: number): any {
        if (!this.areOutputHandlersSetup) {
            return this.setUpOutputHandlersAndRead(size);
        }
        return this.readOutput(size);
    }

    private setUpOutputHandlersAndRead(size: number): void {
        this.output
            .on('readable', () => {
                this.readOutput(size);
            })
            .on('end', () => {
                this.push(null);
            });
        this.areOutputHandlersSetup = true;
    }

    private readOutput(size: number): void {
        let chunk;
        while ((chunk = this.output.read(size)) !== null) {
            if (!this.push(chunk)) {
                break;
            }
        }
    }
}