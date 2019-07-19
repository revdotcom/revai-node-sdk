(async () => {	
	const revai = require('../../revai-node-sdk');

	/* Initialize your client with your revai access token */
	const token = '<YOUR-ACCESS-TOKEN>';
	var client = new revai.RevAiApiClient(token);

	/* Get account details */
	var account = await client.getAccount();
	console.log(`Account: ${account.email}`);
	console.log(`Balance: ${account.balance_seconds} seconds`);

	
	const jobOptions = {
	    metadata: "This is an example",
	    skip_diarizationh: true
	};

	/* Media may be submitted from a local file or from a url by using:
	 * client.submitJobUrl("https://www.rev.ai/FTC_Sample_1.mp3");
	 */
	var job = await client.submitJobLocalFile("./example.mp3", jobOptions);

	console.log(`Job Id: ${job.id}`);
	console.log(`Status: ${job.status}`);
	console.log(`Created On: ${job.created_on}`);

	/* Check the status of job */
	var jobDetails = await client.getJobDetails(job.id);
	console.log(`Status for job ${job.id} is ${jobDetails.status}`);

	/* Get # of jobs started after a certain job id
	 * client.getListOfJobs() will default to returning all jobs
	 */
	var listOfJobs = await client.getListOfJobs(5, job.id);

	/* Get transcript as plain text
	 * Transcripts can also be gotten as Object, Text Stream, Object Stream,
	 * or as captions
	 */
	while((await client.getJobDetails(job.id)).status == "in_progress")
	{
	    // Waits 5 seconds between each check
	    console.log("looping");
	    await new Promise( resolve => setTimeout(resolve, 5000));
	}

	var transcriptText = await client.getTranscriptText(job.id);
	// var transcriptTextStream = await client.getTranscriptTextStream(job.id);
	// var transcriptObject = await client.getTranscriptObject(job.id);
	// var transcriptObjectStream = await client.getTranscriptObjectStream(job.id);
	// var captionsStream = await client.getCaptions(job.id);

	console.log(transcriptText);

	/* Delete a job */
	// await client.deleteJob(job.id);
})();

