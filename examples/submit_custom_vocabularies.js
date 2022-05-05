const revai = require('revai-node-sdk');
const token = require('./config/config.json').access_token;

(async () => {
    // Initialize your client with your Rev AI access token
    var client = new revai.RevAiCustomVocabulariesClient(token);

    var cv_submission = await client.submitCustomVocabularies([{
        phrases: [
            "enter",
            "your",
            "vocabularies",
            "here"
        ]
    }]);

    console.log(`Custom Vocabulary Id: ${cv_submission.id}`);
    console.log(`Status: ${cv_submission.status}`);
    console.log(`Created On: ${cv_submission.created_on}`);

    /**
     * Waits 5 seconds between each status check to see if the custom vocabulary
     * is complete. note: polling for custom vocabulary status is not recommended in a
     * non-testing environment. Use the notification_config option
     * (see: https://docs.rev.ai/sdk/node/) to receive the response
     * asynchronously on custom vocabulary completion.
     */
    while (
        (cv_submission = await client.getCustomVocabularyInformation(cv_submission.id)).status
            == revai.CustomVocabularyStatus.InProgress
    )
    {
        console.log(`Custom Vocabulary ${cv_submission.id} is ${cv_submission.status}`);
        await new Promise(resolve => setTimeout(resolve, 5000));
        cv_submission = await client.getCustomVocabularyInformation(cv_submission.id);
    }

    if (cv_submission.status == revai.CustomVocabularyStatus.Complete)
    {
        console.log(`Custom Vocabulary: ${cv_submission.id} successfully completed!`)
    }

    if (cv_submission.status == revai.CustomVocabularyStatus.Failed)
    {
        console.log(`Custom Vocabulary: ${cv_submission.id} failed due to: ${cv_submission.failure}
            , details: ${cv_submission.failure_detail}`)
    }

    /**
     * Gets list of custom vocabularies' informations
     */
    console.log("Getting list of submitted custom vocabularies.");
    var customVocabularyInformations = await client.getListOfCustomVocabularyInformations();
    console.log(customVocabularyInformations);
    /**
     * Deletes the custom vocabulary
     */
    // await client.deleteCustomVocabulary(cv_submission.id);
    // console.log(`Custom Vocabulary: ${cv_submission.id} deleted!`)
})();
