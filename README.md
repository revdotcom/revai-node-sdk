# Rev.ai Node SDK

[![Build Status](https://img.shields.io/travis/revdotcom/revai-node-sdk.svg?branch=master)](https://travis-ci.org/revdotcom/revai-node-sdk)

## Documentation

See the [API docs](https://www.rev.ai/docs) for more information about the API and
more examples.

## Installation

You don't need this source code unless you want to modify the package. If you just
want to use the package, just run:

    npm install @rev_ai/revai-node-sdk

Install from source with:

    npm install <path/to/source>

## Usage

All you need to get started is your Access Token, which can be generated on
your [Settings Page](https://www.rev.ai/settings). Create a client with the 
given Access Token:

```javascript
import RevAiAPIClient from 'revai-node-sdk';

// create your client
var client = new RevAiAPIClient("ACCESS TOKEN");
```

### Sending a file

Once you've set up your client with your Access Token sending a file is easy!

```javascript
// you can send a local file
var job = client.submitJobLocalFile("FILE PATH");

// or send a link to the file you want transcribed
var job = client.submitJobUrl("https://example.com/file-to-transcribe.mp3");
```

`job` will contain all the information normally found in a successful response from our
[Submit Job](https://www.rev.ai/docs#operation/SubmitTranscriptionJob) endpoint.

If you want to get fancy, both send job methods can take a `RevAiJobOptions` object which contains fields for `metadata`, `callback_url`, and a boolean `skip_diarization` as optional parameters, these are also described in the request body of the [Submit Job](https://www.rev.ai/docs#operation/SubmitTranscriptionJob) endpoint.

### Checking your file's status

You can check the status of your transcription job using its `id`

```javascript
var jobDetails = client.getJobDetails(job.id);
```

`job_details` will contain all information normally found in a successful response from
our [Get Job](https://www.rev.ai/docs#operation/GetJobById) endpoint

### Getting your transcript

Once your file is transcribed, you can get your transcript in a few different forms: 

```javascript
// as text
var transcriptText = client.getTranscriptText(job.id);

// or as a python object
var transcriptObject = client.getTranscriptObject(job.id);
```

The object form of the transcript contains all the information outlined in the response
of the [Get Transcript](https://www.rev.ai/docs#operation/GetTranscriptById) endpoint
when using the json response schema. While the text output is a string containing 
just the text of your transcript