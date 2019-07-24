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

    var filenames = [".\\resources\\example.mp3", ".\\resources\\example.mp3"];
    filenames.map(async filename => await client.submitJobLocalFile(`${filename}`));

    /**
     * Retrieves a list of jobs in order from newest to oldest.
     * The first parameter limits the number of jobs returned.
     * The second parameter allows for a job id to be set, indicating that only jobs
     * submitted after that job will be returned.
     */
    var jobList = await client.getListOfJobs(5, null);
    console.log(jobList);
})();

