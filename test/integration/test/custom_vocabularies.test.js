const clientHelper = require('../src/client-helper');
const configHelper = require('../src/config-helper');
const CustomVocabularyStatus = require('../../../dist/src/models/CustomVocabularyStatus').CustomVocabularyStatus;
const client = clientHelper.getCustomVocabulariesClient(configHelper.getApiKey());

test('Can submit custom vocabulary', async () => {
    const informationSubmit = await client.submitCustomVocabularies([{phrases:['some','custom','vocabularies']}]);

    expect(informationSubmit.status).toBe(CustomVocabularyStatus.InProgress);
    expect(informationSubmit.created_on).not.toBeNull();
    expect(informationSubmit.id).not.toBeNull();
    expect(informationSubmit.failure).toBeUndefined();
});

test('Can retreive submitted custom vocabulary', async () => {
    jest.useRealTimers();

    const informationSubmit = await client.submitCustomVocabularies([{phrases:['some','custom','vocabularies']}]);

    let customVocabularyInformation = await client.getCustomVocabularyInformation(informationSubmit.id);

    while(customVocabularyInformation.status == CustomVocabularyStatus.InProgress)
    {
        await new Promise(resolve => setTimeout(resolve, 5000));
        customVocabularyInformation = await client.getCustomVocabularyInformation(informationSubmit.id);
    }

    expect(customVocabularyInformation.status).toBe(CustomVocabularyStatus.Complete);
    expect(information.created_on).toBe(informationSubmit.created_on);
    expect(information.id).toBe(informationSubmit.id);
    expect(information.failure).toBeUndefined();
});
