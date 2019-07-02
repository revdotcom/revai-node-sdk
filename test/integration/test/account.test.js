const clientUtil = require('../src/client-helper');
const configUtil = require('../src/config-helper');

test('Should return email and balance', async () => {
    const client = clientUtil.getClient(configUtil.getApiKey());
    const account = await client.getAccount();
    expect(account.email).toBe(configUtil.getUserEmail());
    expect(account.balance_seconds).not.toBeNull();
});