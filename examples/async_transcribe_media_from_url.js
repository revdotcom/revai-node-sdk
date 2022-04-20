const revai = require('revai-node-sdk');
const fs = require('fs');
const token = require('./config/config.json').access_token;

(async () => {
    // Initialize your client with your Rev AI access token
    var client = new revai.RevAiApiClient(token);

    // Get account details
    var account = await client.getAccount();
    console.log(`Account: ${account.email}`);
    console.log(`Credits remaining: ${account.balance_seconds} seconds`);

    // Configure your source media url
    // See https://docs.rev.ai/api/asynchronous/webhooks/ for details on adding auth headers
    var sourceConfig = CustomerUrlData('https://www.rev.ai/FTC_Sample_1.mp3');
    // Optionally configure a callback url, which can also take auth headers
    var notificationConfig = CustomerUrlData('https://jsonplaceholder.typicode.com/posts');


    const jobOptions = {
        source_config: sourceConfig,
        metadata: 'InternalOrderNumber=123456789',
        notification_config: notificationConfig,
        skip_diarization: false,
        skip_punctuation: false,
        speaker_channels_count: null, // Optional value available with some languages
        custom_vocabulary_id: null, // Optional value available with some languages
        custom_vocabularies: [{
            phrases: [
                'add',
                'custom',
                'vocabularies',
                'here'
            ]
        }],
        filter_profanity: false, // Optional value available with some languages
        remove_disfluencies: false, // Optional value available with some languages
        delete_after_seconds: 2592000, // 30 days in seconds
        language: 'en', // Supported ISO 639-1 (2-letter) or ISO 639-3 (3-letter) language code
        transcriber: 'machine_v2' // Optional value for transcriber
    };

    // Media may be submitted from a url
    var job = await client.submitJob(jobOptions);

    console.log(`Job Id: ${job.id}`);
    console.log(`Status: ${job.status}`);
    console.log(`Created On: ${job.created_on}`);

    /**
     * Waits 5 seconds between each status check to see if job is complete.
     * note: polling for job status is not recommended in a non-testing environment.
     * Use the callback_url option (see: https://docs.rev.ai/sdk/node/)
     * to receive the response asynchronously on job completion
     */
    while((jobStatus = (await client.getJobDetails(job.id)).status) == revai.JobStatus.InProgress)
    {
        console.log(`Job ${job.id} is ${jobStatus}`);
        await new Promise( resolve => setTimeout(resolve, 5000));
    }

    /**
     * Get transcript as plain text
     * Transcripts can also be gotten as Object, Text Stream, Object Stream,
     * or as captions
     */
    var transcriptText = await client.getTranscriptText(job.id);
    // var transcriptTextStream = await client.getTranscriptTextStream(job.id);
    // var transcriptObject = await client.getTranscriptObject(job.id);
    // var transcriptObjectStream = await client.getTranscriptObjectStream(job.id);
    // var captionsStream = await client.getCaptions(job.id);

    fs.writeFile('./outputs/async_url_transcript.txt', transcriptText, (err) => {
        if (err) throw err;
        console.log('Success! Check the examples/outputs/ directory for the transcript.')
    });

    /**
     * Delete a job
     * Job deletion will remove all information about the job from the servers
     */
    // await client.deleteJob(job.id);
})();

