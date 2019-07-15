/* Initialize your client with your revai access token */
const token = <YOUR-ACCESS-TOKEN>;
var client = new RevAiApiClient(token);

/* Get account details */
var account = await client.getAccount();
console.log(`Account: {account.email}`);
console.log(`Balance: {account.balance_seconds} seconds`);

/* Submit job and receive job object */
var job = await client.submitJobUrl("https://www.rev.ai/FTC_Sample_1.mp3");
// var job = client.submitJobLocalFile("./path/to/file.mp4");

console.log(`Job Id: {job.id}`);
console.log(`Status: {job.status}`);
console.log(`Created On: {job.created_on}`);

/* Check the status of job */
var jobDetails = await client.getJobDetails(job.id);

/* Get all transcription jobs */
var listOfJobs = await client.getListOfJobs();

/* Get at most # of jobs */
var listOfJobs = await client.getListOfJobs(5);

/* Get all jobs started after a certain job id */
var listOfJobs = await client.getListOfJobs(undefined, job.id);

/* Get transcript as plain text */
var transcriptText = await client.getTranscriptText(job.id);

/* Get transcript as an object */
var transcriptObject = await client.getTranscriptObject(job.id);

/* Get transcript as text stream */
var textStream = await client.getTranscriptTextStream(job.id);

/* Get transcript as object stream */
var transcriptStream = await client.getTranscriptObjectStream(job.id);

/* Get captions */
var captionsStream = await client.getCaptions(job.id);

/* Delete a job */
await client.deleteJob(job.id);

