jest.mock('websocket', () => {
    return {
        WebSocketClient: require('./mocks/websocket-mock').WebSocketClientMock,
        WebSocketConnection: require('./mocks/websocket-mock').WebSocketConnectionMock,
        client: require('./mocks/websocket-mock').WebSocketClientMock
    };
});

jest.mock('axios', () => {
    return require('./mocks/axios-mock').AxiosMock;
});