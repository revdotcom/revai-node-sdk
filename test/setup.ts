jest.mock('websocket', () => {
    return require('./mocks/websocket-mock');
});