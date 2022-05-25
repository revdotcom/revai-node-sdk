const revai = require('revai-node-sdk');
const token = require('./config/config.json').access_token;

(async () => {
    // Initialize your client with your Rev AI access token.
    const client = new revai.TopicExtractionClient(token);

    // Configure job submission options.
    const jobOptions = {
        metadata: 'Node SDK Topic Extraction example',
        delete_after_seconds: 2592000, // 30 days in seconds
        notification_config: { url: 'https://jsonplaceholder.typicode.com/posts' }
    };
    
    /** Submit a job with whatever text you want by changing this input */
    const text = "An umbrella or parasol is a folding canopy supported by wooden or metal ribs that is  \
        usually mounted on a wooden, metal, or plastic pole. It is designed to protect a person \
        against rain or sunlight. The term umbrella is traditionally used when protecting oneself from \
        rain, with parasol used when protecting oneself from sunlight, though the terms continue to be \
        used interchangeably. Often the difference is the material used for the canopy; some parasols \
        are not waterproof, and some umbrellas are transparent. Umbrella canopies may be made of \
        fabric or flexible plastic. There are also combinations of parasol and umbrella that are \
        called en-tout-cas (French for 'in any case').";
    const job = await client.submitJobFromText(text, jobOptions);

    /** Or submit from an existing transcript from a completed speech to text job */
    // const asyncJobId = 'your_job_id';
    // const asyncApiClient = new revai.RevAiApiClient(token);
    // const transcript = await asyncApiClient.getTranscriptObject(asyncJobId);
    // console.log(`Pulling transcript from async job ${asyncJobId}...`);
    // const job = await client.submitJobFromTranscript(transcript, jobOptions);

    console.log('Topic extraction job submitted.');
    console.log(`Job Id: ${job.id}`);
    console.log('Polling for job completion...');

    while((jobStatus = (await client.getJobDetails(job.id)).status) === revai.JobStatus.InProgress) {
        console.log(`Job ${job.id} is ${jobStatus}`);
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const topics = await client.getResult(job.id, { threshold: 0 });
    console.log(JSON.stringify(topics, null, 2));

    /**
     * Delete a job.
     * Job deletion will remove all information about the job from the servers
     */
    // await client.deleteJob(job.id);
})();
