import { Duplex, PassThrough } from 'stream';

export default class BufferedDuplex extends Duplex {
    input: PassThrough;
    output: PassThrough;
    outputHandlersSetup: boolean;
    constructor (input: PassThrough, output: PassThrough, options?: any) {
        super(options);
        this.input = input;
        this.output = output;
        this.outputHandlersSetup = false;
    }

    _write (chunk: any, encoding: any, callback: any) : boolean {
        return this.input.write(chunk, encoding, callback);
    }

    _read (size: any): any {
        if (!this.outputHandlersSetup){
            return this.setUpOutputHandlersAndRead(size);
        }
        return this.readOutput(size);
    }

    setUpOutputHandlersAndRead (size : any): void {
        var self = this;
        self.outputHandlersSetup = true;
        self.output
        .on('readable', function () {
            self.readOutput(size);
        })
        .on('end', function () {
            self.push(null);
        });
    }

    readOutput (size : any): void {
        var chunk;
        while(null !== (chunk = this.output.read(size))) {
            if (!this.push(chunk)) break;
        }
    }
}