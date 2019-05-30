import { EventEmitter } from 'events';

export class WebSocketConnectionMock extends EventEmitter {
    connected: boolean;
    send: any;
    constructor(connected = true){
        super();
        this.connected = connected;
        this.send = jest.fn();
    }
}

export class WebSocketClientMock extends EventEmitter {
    abort: any;
    connect: any
    constructor(){
        super();
        this.connect = jest.fn();
        this.abort = jest.fn();
    }
}