const axios = jest.genMockFromModule('axios');

const AxiosMock = {
    ...axios,
    create: jest.fn().mockReturnThis()
};

export default AxiosMock;