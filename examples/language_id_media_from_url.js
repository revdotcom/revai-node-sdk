const revai = require('revai-node-sdk');
const token = require('./config/config.json').access_token;

(async () => {
    // Initialize your client with your Rev AI access token
    var client = new revai.LanguageIdClient({ token: token });

    // Configure your source media url
    // If authorization headers are needed to access the url they can be provided as an argument, e.g.
    // var sourceConfig  {url: 'source url', auth_headers: {"Authorization": "Bearer <token>"}});
    const sourceConfig = { url: 'https://www.rev.ai/FTC_Sample_1.mp3', auth_headers: null };
    // Set an optional notification url 
    // See https://docs.rev.ai/api/asynchronous/webhooks/ for details on setting up a webhook
    // Authorization headers url can also be added to this url, e.g. 
    // var notificationConfig {url: 'webhook url', auth_headers: {"Authorization": "Bearer <token>"}});
    const notificationConfig = {
        url: 'https://www.example.com/callback',
        auth_headers: { "Authorization": "Bearer <token>" }
    };

    const jobOptions = {
        source_config: sourceConfig,
        metadata: 'node example language id url submission',
        notification_config: notificationConfig,
        delete_after_seconds: 30 * 24 * 60 * 60 // 30 days in seconds
    };

    // Submitting job via source config
    var job;
    try {
        var job = await client.submitJob(jobOptions);
        console.log('Language id job submitted.');
        console.log(`Job Id: ${job.id}`);
        console.log(`Status: ${job.status}`);
        console.log(`Created On: ${job.created_on}`);
    } catch (e) {
        console.dir(e);
    }

    /**
     * Waits 5 seconds between each status check to see if job is complete.
     * note: polling for job status is not recommended in a non-testing environment.
     * Use the notification_config option (see: https://docs.rev.ai/sdk/node/)
     * to receive the response asynchronously on job completion
     */
     while((jobStatus = (await client.getJobDetails(job.id)).status) === revai.JobStatus.InProgress) {
        console.log(`Job ${job.id} is ${jobStatus}`);
        await new Promise( resolve => setTimeout(resolve, 5000));
    }

    /**
     * Get language id result as an Object
     */
    var jobStatus = (await client.getJobDetails(job.id)).status;
    if (jobStatus === revai.JobStatus.Completed) {
        var languageIdResult = await client.getResult(job.id);
        console.log(`Language id job ${job.id} completed successfully.`);
        console.log(JSON.stringify(languageIdResult, null, 2));
    } else {
        console.log(`Language id job ${job.id} failed with ${job.failure_detail}.`);
    }

    /**
     * Delete a job
     * Job deletion will remove all information about the job from the servers
     */
    // await client.deleteJob(job.id);
    // console.log(`Deleted language id job ${job.id}`);
})();

