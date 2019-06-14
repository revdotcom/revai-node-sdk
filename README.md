# Rev.ai Node SDK

[![Build Status](https://img.shields.io/travis/revdotcom/revai-node-sdk.svg?branch=master)](https://travis-ci.org/revdotcom/revai-node-sdk)

## Documentation

See the [API docs](https://www.rev.ai/docs) for more information about the API and
more examples.

## Installation

To install the package, run:

    npm install revai-node-sdk

## Usage

All you need to get started is your Access Token, which can be generated on
your [Settings Page](https://www.rev.ai/settings). Create a client with the
given Access Token:

```javascript
import { RevAiApiClient } from 'revai-node-sdk';

// Initialize your client with your revai access token
var accessToken = "Your Access Token";
var client = new RevAiApiClient(accessToken);
```

### Checking balance

```javascript
var accountInfo = await client.getAccount();
```

### Submitting a job

Once you've set up your client with your Access Token sending a file is easy!

```javascript
// you can submit a local file
var job = await client.submitJobLocalFile("./path/to/file.mp4");

// or submit via a public url
var job = await client.submitJobUrl("https://www.rev.ai/FTC_Sample_1.mp3");
```

`job` will contain all the information normally found in a successful response from our
[Submit Job](https://www.rev.ai/docs#operation/SubmitTranscriptionJob) endpoint.

If you want to get fancy, both send job methods can take a `RevAiJobOptions` object which contains fields for `metadata`, `callback_url`, a boolean `skip_diarization`, and `custom_vocabularies` as optional parameters. These are also described in the request body of the [Submit Job](https://www.rev.ai/docs#operation/SubmitTranscriptionJob) endpoint.

### Checking your job's status

You can check the status of your transcription job using its `id`

```javascript
var jobDetails = await client.getJobDetails(job.id);
```

`jobDetails` will contain all information normally found in a successful response from
our [Get Job](https://www.rev.ai/docs#operation/GetJobById) endpoint

### Checking multiple files

You can retrieve a list of transcription jobs with optional parameters

```javascript
var jobs = await client.getListOfJobs();

// limit amount of retrieved jobs
var jobs = await client.getListOfJobs(3);

// get jobs starting after a certain job id
var jobs = await client.getListOfJobs(undefined, 'Umx5c6F7pH7r');
```

`jobs` will contain a list of job details having all information normally found in a successful response
from our [Get List of Jobs](https://www.rev.ai/docs#operation/GetListOfJobs) endpoint

### Deleting a job

You can delete a transcription job using its `id`

```javascript
await client.deleteJob(job.id);
```

 All data related to the job, such as input media and transcript, will be permanently deleted.
 A job can only by deleted once it's completed (either with success or failure).


### Getting your transcript

Once your file is transcribed, you can get your transcript in a few different forms:

```javascript
// as plain text
var transcriptText = await client.getTranscriptText(job.id);

// or as an object
var transcriptObject = await client.getTranscriptObject(job.id);
```

The text output is a string containing just the text of your transcript. The object form of the transcript contains all the information outlined in the response of the [Get Transcript](https://www.rev.ai/docs#operation/GetTranscriptById) endpoint when using the json response schema.

Any of these outputs can we retrieved as a stream for easy file writing:

```javascript
await client.getTranscriptTextStream(job.id);

await client.getTranscriptObjectStream(job.id);
```

### Captions

Another way to retrieve your file is captions output. We currently only support .srt output. A readable stream of your srt output can be retrieved as such:

```javascript
await client.getCaptions(job.id);
```