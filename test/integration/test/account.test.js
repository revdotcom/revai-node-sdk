const clientHelper = require('../src/client-helper');
const configHelper = require('../src/config-helper');

test('Can return email and balance', async () => {
    const client = clientHelper.getClient(configHelper.getApiKey());
    const account = await client.getAccount();
    expect(account.email).toBe(configHelper.getUserEmail());
    expect(account.balance_seconds).not.toBeNull();
});

test('Cannot authenticate with fake token', async () => {
    const randomString = Math.random().toString(36).replace('0.', '');
    const client = clientHelper.getClient(randomString);
    try {
        await client.getAccount();
    } catch (error) {
        var revAiError = error;
    } finally {
        expect(revAiError.statusCode).toEqual(401);
        expect(revAiError.title).toBe('Authorization has been denied for this request.');
    }
})