jest.mock('websocket', () => {
    return {
        WebSocketClient: require('./mocks/websocket-mock').WebSocketClientMock,
        WebSocketConnection: require('./mocks/websocket-mock').WebSocketConnectionMock,
        client: require('./mocks/websocket-mock').WebSocketClientMock
    };
});
jest.mock('fs', () => {
    return {
        createReadStream: require('./mocks/fs-mock').createReadStreamMock,
        writeFile: jest.fn()
    };
})