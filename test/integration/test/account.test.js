const clientUtil = require('../src/client-util');
const configUtil = require('../src/config-util');

test('Should return email and balance', async () => {
    let client = clientUtil.getClient(configUtil.getApiKey());
    const account = await client.getAccount();
    expect(account.email).toBe(configUtil.getUserEmail());
    expect(account.balance_seconds).not.toBeNull();
});