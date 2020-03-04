const revai = require('revai-node-sdk');
const fs = require('fs');
const token = require('./config/config.json').access_token;

(async () => {
    // Initialize your client with your revai access token
    var client = new revai.RevAiApiClient(token);

    // Get account details
    var account = await client.getAccount();
    console.log(`Account: ${account.email}`);
    console.log(`Balance: ${account.balance_seconds} seconds`);

    const jobOptions = {
        metadata: "InternalOrderNumber=123456789",
        callback_url: "https://jsonplaceholder.typicode.com/posts",
        skip_diarization: false,
        skip_punctuation: false,
        speaker_channels_count: 1,
        custom_vocabularies: [{
            phrases: [
                "add",
                "custom",
                "vocabularies",
                "here"
            ]
        }],
        filter_profanity: false
    };

    // Media may be submitted from a local file
    var job = await client.submitJobLocalFile("./resources/example.mp3", jobOptions);

    console.log(`Job Id: ${job.id}`);
    console.log(`Status: ${job.status}`);
    console.log(`Created On: ${job.created_on}`);

    /**
     * Waits 5 seconds between each status check to see if job is complete.
     * note: polling for job status is not recommended in a non-testing environment.
     * Use the callback_url option (see: https://www.rev.ai/docs#section/Node-SDK)
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

    fs.writeFile("./outputs/async_file_transcript.txt", transcriptText, (err) => {
        if (err) throw err;
        console.log("Success! Check the examples/outputs/ directory for the transcript.")
    });

    /**
     * Delete a job
     * Job deletion will remove all information about the job from the servers
     */
    // await client.deleteJob(job.id);
})();

