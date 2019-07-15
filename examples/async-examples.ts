import {RevAiApiClient, RevAiJobOptions} from 'revai-node-sdk';

/* Initialize your client with your revai access token */
const token = <YOUR-ACCESS-TOKEN>;
var client = new RevAiApiClient(token);

/* Get account details */
var account = await client.getAccount();
console.log(`Account: ${account.email}`);
console.log(`Balance: ${account.balance_seconds} seconds`);

/* Submit job and receive job object
 * Media may be submitted from a local file or from a url by using:
 * client.submitJobUrl("https://www.rev.ai/FTC_Sample_1.mp3");
 */
var jobOptions = new RevAiJobOptions(
	metadata = "This is an example",
	skip_diarization = true
	);
var job = client.submitJobLocalFile("./example.raw");

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
 * Transcripts can also be gotten as Object, Text Stream, or Object Stream via
 * client.getTranscript{Object, TextStream, ObjectStream}() respectively
 */
while((await client.getJobDetails(job.id)).status == "in_progress")
{
	// Waits 5 seconds between each check
	await new Promise( resolve => setTimeout(resolve, 5000));
}

var transcriptText = await client.getTranscriptText(job.id);
console.log(transcriptText);

/* Transcripts may also be received as captions */
var captionsStream = await client.getCaptions(job.id);

/* Delete a job */
// await client.deleteJob(job.id);

