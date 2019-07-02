const clientUtil = require('../src/client-util');
const userUtil = require('../src/user-util');

test('Should return email and balance', async () => {
    const apiKey = userUtil.getApiKey();
    let client = clientUtil.getClient(apiKey);
    const account = await client.getAccount();
    const userEmail = userUtil.getUserEmail();
    expect(account.email).toBe(userEmail);
    expect(account.balance_seconds).not.toBeNull();
});