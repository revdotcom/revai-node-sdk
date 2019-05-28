import * as events from 'events';

export class WebSocketConnectionMock extends events.EventEmitter {
    send: any;
    connected: boolean;
    constructor(connected = true){
        super();
        this.send = jest.fn();
        this.connected = connected;
    }
}

export class WebSocketClientMock extends events.EventEmitter {
    connect: any;
    abort: any;
    constructor(){
        super();
        this.connect = jest.fn();
        this.abort = jest.fn();
    }
}