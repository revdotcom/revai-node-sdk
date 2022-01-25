jest.mock('websocket', () => {
    return {
        connection: require('./mocks/websocket-mock').WebSocketConnectionMock,
        client: require('./mocks/websocket-mock').WebSocketClientMock
    };
});

jest.mock('axios', () => {
    return require('./mocks/axios-mock');
});