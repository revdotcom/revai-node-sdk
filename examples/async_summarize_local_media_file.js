const revai = require('revai-node-sdk');
const fs = require('fs');
const { JobStatus, SummarizationJobStatus, SummarizationFormattingOptions } = require('revai-node-sdk');
const token = require('./config/config.json').access_token;

(async () => {
    // Initialize your client with your Rev AI access token
    var client = new revai.RevAiApiClient({ token: token });

    // Get account details
    const account = await client.getAccount();
    console.log(`Account: ${account.email}`);
    console.log(`Credits remaining: ${account.balance_seconds} seconds`);

    const jobOptions = {
        metadata: 'InternalOrderNumber=123456789',
        delete_after_seconds: 2592000, // 30 days in seconds
        language: 'en', // Supported ISO 639-1 (2-letter) or ISO 639-3 (3-letter) language code
        summarization_config: {
            type: SummarizationFormattingOptions.Paragraph
        }
    
    };

    // Media may be submitted from a local file
    var job;
    try {
        job = await client.submitJobLocalFile('resources/example.mp3',
            jobOptions);
    } catch (e) {
        console.dir(e);
    }

    console.log(`Job Id: ${job.id}`);
    console.log(`Status: ${job.status}`);
    console.log(`Summarization status: ${job.summarization.status}`);
    console.log(`Created On: ${job.created_on}`);

    /**
     * Waits 5 seconds between each status check to see if job is complete.
     * note: polling for job status is not recommended in a non-testing environment.
     * Use the notification_config option (see: https://docs.rev.ai/sdk/node/)
     * to receive the response asynchronously on job completion
     */
    while((job = await client.getJobDetails(job.id)) && (
            job.status ===  JobStatus.InProgress ||
            job.summarization.status === SummarizationJobStatus.InProgress
        ))
    {
        console.log(`Job ${job.id} is ${job.status}, summarization is ${job.summarization.status}`);
        await new Promise( resolve => setTimeout(resolve, 5000));
    }

    /**
     * Get transcript summary as plain text
     */
    const transcriptSummary = await client.getTranscriptSummaryText(job.id);

    fs.writeFile('./outputs/async_file_translated_transcript_summary.txt', transcriptSummary, (err) => {
        if (err) throw err;
        console.log('Success! Check the examples/outputs/ directory for the transcript summary.')
    });

    /**
     * Delete a job
     * Job deletion will remove all information about the job from the servers
     */
    // await client.deleteJob(job.id);
})();
