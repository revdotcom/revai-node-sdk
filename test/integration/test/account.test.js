const clientHelper = require('../src/client-helper');
const configHelper = require('../src/config-helper');

test('Can return email and balance', async () => {
    const client = clientHelper.getAsyncClient();
    const account = await client.getAccount();
    expect(account.email).toBe(configHelper.getUserEmail());
    expect(account.balance_seconds).not.toBeNull();
}, 15000);

test('Cannot authenticate with invalid token', async () => {
    const randomString = Math.random().toString(36).replace('0.', '');
    const client = clientHelper.getAsyncClient(randomString);
    try {
        await client.getAccount();
    } catch (error) {
        console.log(error)
        expect(error.statusCode).toEqual(401);
        expect(error.details.title).toBe('Authorization has been denied for this request.');
    }
}, 15000);
