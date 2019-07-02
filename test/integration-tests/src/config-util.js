require('dotenv').config();

module.exports = {
    getApiKey: function() {
        let key = process.env.API_KEY;
        return key;
    },
    getUserEmail: function() {
        return process.env.USER_EMAIL;
    },
    getBaseUrl: function() {
        return process.env.BASE_URL;
    }
}