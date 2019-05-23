import { Duplex, PassThrough } from 'stream';

export class BufferedDuplex extends Duplex {
    input: PassThrough;
    output: PassThrough;
    areOutputHandlersSetup: boolean;
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
        if (!this.areOutputHandlersSetup){
            return this.setUpOutputHandlersAndRead(size);
        }
        return this.readOutput(size);
    }

    private setUpOutputHandlersAndRead(size : any): void {
        var self = this;
        self.output
            .on('readable', function () {
                self.readOutput(size);
            })
            .on('end', function () {
                self.push(null);
            });
        self.areOutputHandlersSetup = true;
    }

    private readOutput(size : any): void {
        var chunk = this.output.read(size);
        while(chunk !== null) {
            if (!this.push(chunk)) break;
        }
    }
}