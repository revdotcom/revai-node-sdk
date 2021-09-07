const clientHelper = require('../src/client-helper');
const CustomVocabularyStatus = require('../../../dist/src/models/CustomVocabularyStatus').CustomVocabularyStatus;
const client = clientHelper.getCustomVocabulariesClient();

test('Can submit custom vocabulary', async () => {
    const informationSubmit = await client.submitCustomVocabularies([{phrases:['some','custom','vocabularies']}]);

    expect(informationSubmit.status).toBe(CustomVocabularyStatus.InProgress);
    expect(informationSubmit.created_on).not.toBeNull();
    expect(informationSubmit.id).not.toBeNull();
    expect(informationSubmit.failure).toBeUndefined();
}, 30000);

test('Can retrieve submitted custom vocabulary', async (done) => {
    const informationSubmit = await client.submitCustomVocabularies([{phrases:['some','custom','vocabularies']}]);

    var intervalObject = setInterval(function(){
        (async () => {
            const customVocabularyInformation = await client.getCustomVocabularyInformation(informationSubmit.id);
            if (customVocabularyInformation.status === CustomVocabularyStatus.Complete) {
                expect(customVocabularyInformation.status).toBe(CustomVocabularyStatus.Complete);
                expect(customVocabularyInformation.created_on).toBe(informationSubmit.created_on);
                expect(customVocabularyInformation.id).toBe(informationSubmit.id);
                expect(customVocabularyInformation.failure).toBeUndefined();
                clearInterval(intervalObject);
                done();
            }
        })()
    }, 15000);
}, 300000);

test('Can retreive list of custom vocabularies', async (done) => {
    const information1 = await client.submitCustomVocabularies([{phrases:['some','custom','vocabularies']}]);
    const information2 = await client.submitCustomVocabularies([{phrases:['more','custom','vocabularies']}]);

    var intervalObject = setInterval(function(){
        (async () => {
            const vocabularies = await client.getListOfCustomVocabularyInformations();
            const ids = vocabularies.map(vocab => vocab.id);
            expect(ids).toContainEqual(information1.id);
            expect(ids).toContainEqual(information2.id);
            clearInterval(intervalObject);
            done();
        })()
    }, 15000);
}, 300000);

test('Can delete submitted custom vocabulary', async (done) => {
    const informationSubmit = await client.submitCustomVocabularies([{phrases:['some','custom','vocabularies']}]);

    var intervalObject = setInterval(function(){
        (async () => {
            const customVocabularyInformation = await client.getCustomVocabularyInformation(informationSubmit.id);
            if (customVocabularyInformation.status === CustomVocabularyStatus.Complete) {
                const res = await client.deleteCustomVocabulary(informationSubmit.id);
                expect(res).toBeFalsy();
                clearInterval(intervalObject);
                done();
            }
        })()
    }, 15000);
}, 300000);
