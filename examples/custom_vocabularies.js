const revai = require('revai-node-sdk');
const token = require('./config/config.json').access_token;

(async () => {
    // Initialize your client with your revai access token
    var client = new revai.RevAiCustomVocabulariesClient(token);

    cv_job = client.submitCustomVocabularies([{
            phrases: [
                "add",
                "custom",
                "vocabularies",
                "here"
            ]
        }])

    console.log(`Job Id: ${cv_job.id}`);
    console.log(`Status: ${cv_job.status}`);
    console.log(`Created On: ${cv_job.created_on}`);

    /**
     * Waits 5 seconds between each status check to see if job is complete.
     * note: polling for job status is not recommended in a non-testing environment.
     * Use the callback_url option (see: https://www.rev.ai/docs#section/Node-SDK)
     * to receive the response asynchronously on job completion
     */
    while((job = (await client.getCustomVocabulary(cv_job.id))).status == revai.CustomVocabularyStatus.InProgress)
    {
        console.log(`Job ${cv_job.id} is ${jobStatus}`);
        await new Promise( resolve => setTimeout(resolve, 5000));
    }

    if (job.status == revai.CustomVocabularyStatus.Failed)
    {
        console.log(`Job: ${cv_job.id} successfully completed!`)
    }

    if (job.status == revai.CustomVocabularyStatus.Complete)
    {
        console.log(`Job: ${cv_job.id} failed due to: ${job.failure_detail}`)
    }
})();

