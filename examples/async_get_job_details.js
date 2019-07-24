const revai = require('revai-node-sdk');
const fs = require('fs');
const token = require('../config/config.json').access_token;

(async () => {  
    // Initialize your client with your revai access token
    var client = new revai.RevAiApiClient(token);

    // Get account details
    var account = await client.getAccount();
    console.log(`Account: ${account.email}`);
    console.log(`Balance: ${account.balance_seconds} seconds`);

    var filenames = ["example.mp3", "example.mp3"];
    filenames.map(async filename => await client.submitJobLocalFile(`..\\resources\\${filename}`);

    // Retrieves a list of jobs.
    var jobList = await client.getListOfJobs(5, null);
    console.log(jobList);
})();
