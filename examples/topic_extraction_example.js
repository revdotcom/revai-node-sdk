const revai = require('revai-node-sdk');
const token = require('./config/config.json').access_token;

(async () => {
    // Initialize your client with your Rev AI access token
    var client = new revai.TopicExtractionClient(token);

    var job = await client.submitJob({'text': 'test text text text', 'metadata': 'asdf'});

    console.log(`Job Id: ${job.id}`);

    while((jobStatus = (await client.getJobDetails(job.id)).status) == revai.JobStatus.InProgress)
    {
        console.log(`Job ${job.id} is ${jobStatus}`);
        await new Promise( resolve => setTimeout(resolve, 5000));
    }

    var topics = await client.getResult(job.id);

    console.log(JSON.stringify(topics))
})();
