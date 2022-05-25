const revai = require('revai-node-sdk');
const fs = require('fs');
const token = require('./config/config.json').access_token;

(async () => {
    // Initialize your client with your Rev AI access token
    var client = new revai.LanguageIdClient(token);

    const jobOptions = {
        metadata: 'node example language id local file submission',
        notification_config: { url: 'https://jsonplaceholder.typicode.com/posts' },
        delete_after_seconds: 2592000 // 30 days in seconds
    };

    // Media may be submitted from a local file
    var job;
    try {
        job = await client.submitJobLocalFile('./resources/example.mp3',
            jobOptions);
    } catch (e) {
        console.dir(e);
    }

    console.log(`Job Id: ${job.id}`);
    console.log(`Status: ${job.status}`);
    console.log(`Created On: ${job.created_on}`);

    /**
     * Waits 5 seconds between each status check to see if job is complete.
     * note: polling for job status is not recommended in a non-testing environment.
     * Use the notification_config option (see: https://docs.rev.ai/sdk/node/)
     * to receive the response asynchronously on job completion
     */
    while((jobStatus = (await client.getJobDetails(job.id)).status) == revai.JobStatus.InProgress)
    {
        console.log(`Job ${job.id} is ${jobStatus}`);
        await new Promise( resolve => setTimeout(resolve, 5000));
    }

    /**
     * Get language id result as Object
     */
     var languageIdResult = await client.getResult(job.id);
     console.log(JSON.stringify(languageIdResult, null, 2));

    /**
     * Delete a job
     * Job deletion will remove all information about the job from the servers
     */
    // await client.deleteJob(job.id);
})();
