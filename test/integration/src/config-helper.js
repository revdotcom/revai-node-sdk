require('dotenv').config();

module.exports = {
    getApiKey: () => {
        return process.env.API_KEY;
    },
    getUserEmail: () => {
        return process.env.USER_EMAIL;
    },
    getBaseUrl: () => {
        return process.env.BASE_URL;
    }
}