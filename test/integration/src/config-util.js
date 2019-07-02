require('dotenv').config();

module.exports = {
    getApiKey: function() {
        return process.env.API_KEY;
    },
    getUserEmail: function() {
        return process.env.USER_EMAIL;
    },
    getBaseUrl: function() {
        return process.env.BASE_URL;
    }
}