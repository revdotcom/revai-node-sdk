const axios = jest.genMockFromModule('axios');

export const AxiosMock = {
    ...axios,
    create: jest.fn().mockReturnThis(),
    request: jest.fn()
};