import { Readable } from 'stream';

export function createReadStreamMock(fileName: string): Readable {
    return new Readable();
}