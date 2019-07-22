const revai = require('revai-node-sdk');
const fs = require('fs');
const token = require('../config/config.json').access_token;

(async () => {  
    /* Initialize your client with your revai access token */
    var client = new revai.RevAiApiClient(token);

    /* Get account details */
    var account = await client.getAccount();
    console.log(`Account: ${account.email}`);
    console.log(`Balance: ${account.balance_seconds} seconds`);

    const jobOptions = {
        metadata: "InternalOrderNumber=123456789",
        skip_diarization: true
    };

    /* Media may be submitted from a local file or from a url by using:
     * client.submitJobUrl("https://www.rev.ai/FTC_Sample_1.mp3");
     */
    var job = await client.submitJobLocalFile("../resources/example.mp3", jobOptions);

    console.log(`Job Id: ${job.id}`);
    console.log(`Status: ${job.status}`);
    console.log(`Created On: ${job.created_on}`);

    // Waits 5 seconds between each status check to see if job is complete
    while((jobStatus = (await client.getJobDetails(job.id)).status) == "in_progress")
    {  
        console.log(`Job ${job.id} is ${jobStatus}`);
        await new Promise( resolve => setTimeout(resolve, 5000));
    }

    /* Get transcript as plain text
     * Transcripts can also be gotten as Object, Text Stream, Object Stream,
     * or as captions
     */
    var transcriptText = await client.getTranscriptText(job.id);
    // var transcriptTextStream = await client.getTranscriptTextStream(job.id);
    // var transcriptObject = await client.getTranscriptObject(job.id);
    // var transcriptObjectStream = await client.getTranscriptObjectStream(job.id);
    // var captionsStream = await client.getCaptions(job.id);

    fs.writeFile("./transcript.txt", transcriptText, (err) => {
        if (err) throw err;
        console.log("Success! Check you directory for the transcript.")
    });

    /* Delete a job */
    // await client.deleteJob(job.id);
})();

