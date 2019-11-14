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

test('Can retreive submitted custom vocabulary', async (done) => {
    jest.useRealTimers();

    const informationSubmit = await client.submitCustomVocabularies([{phrases:['some','custom','vocabularies']}]);

    var intervalObject = setInterval(function(){
        (async () => {
            const customVocabularyInformation = await client.getCustomVocabularyInformation(informationSubmit.id);
            if (customVocabularyInformation.status === CustomVocabularyStatus.Complete) {
                expect(customVocabularyInformation.status).toBe(CustomVocabularyStatus.Complete);
                expect(informationSubmit.created_on).toBe(informationSubmit.created_on);
                expect(informationSubmit.id).toBe(informationSubmit.id);
                expect(informationSubmit.failure).toBeUndefined();
                clearInterval(intervalObject);
                done();
            }
        })()
    }, 15000);
}, 600000);
