const revai = require('revai-node-sdk');
const token = require('./config/config.json').access_token;

(async () => {
    // Initialize your client with your Rev AI access token
    var client = new revai.LanguageIdClient({ token: token });

    const jobOptions = {
        metadata: 'node example language id local file submission',
        delete_after_seconds: 30 * 24 * 60 * 60 // 30 days in seconds
    };

    // Submitting job via local media file
    var job;
    try {
        job = await client.submitJobLocalFile('./resources/example.mp3',
            jobOptions);
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
     * Get language id result as Object
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
