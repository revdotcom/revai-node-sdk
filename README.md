# [Rev AI Node SDK](https://docs.rev.ai/sdk/node/) &middot; [![npm version](https://img.shields.io/npm/v/revai-node-sdk.svg?style=flat)](https://www.npmjs.com/package/revai-node-sdk) ![CI](https://github.com/revdotcom/revai-node-sdk/workflows/CI/badge.svg)

## Documentation

See the [API docs](https://docs.rev.ai) for more information about the API.

## Examples

Examples can be found in the [`examples/`](https://github.com/revdotcom/revai-node-sdk/tree/develop/examples) directory

## Installation

To install the package, run:

    npm install revai-node-sdk

## Support

We support Node 8, 10, 12, 14, 16 and 17.

## Usage

All you need to get started is your Access Token, which can be generated on
your [Settings Page](https://www.rev.ai/access_token). Create a client with the
given Access Token:

```javascript
import { RevAiApiClient, RevAiApiDeployment, RevAiApiDeploymentConfigMap } from 'revai-node-sdk';

// Initialize your client with your Rev AI access token
const accessToken = "<ACCESS_TOKEN>";

// Optionally set the specific Rev AI deployment of your account, defaults to the US deployment.
// Learn more about Rev AI's global deployments at https://docs.rev.ai/api/global-deployments.
const client = new RevAiApiClient({ token: accessToken, deploymentConfig: RevAiApiDeploymentConfigMap.get(RevAiApiDeployment.US) });
```

### Checking credits remaining

```javascript
const accountInfo = await client.getAccount();
```

### Submitting a job

Once you've set up your client with your Access Token sending a file is easy!

```javascript
// You can submit a local file
const job = await client.submitJobLocalFile("./path/to/file.mp4");

// or submit via a public url
const jobOptions = { source_config: { url: "https://www.rev.ai/FTC_Sample_1.mp3" } }
const job = await client.submitJob(jobOptions);

// or from audio data, the filename is optional
const stream = fs.createReadStream("./path/to/file.mp3");
const job = await client.submitJobAudioData(stream, "file.mp3");
```

You can also submit a job to be handled by a human transcriber using our [Human Transcription](https://docs.rev.ai/api/asynchronous/transcribers/#human-transcription) option.
```javascript
const job = await client.submitJobLocalFile("./path/to/file.mp4", {
    transcriber: "human",
    verbatim: false,
    rush: false,
    test_mode: true,
    segments_to_transcribe: [{
        start: 1.0,
        end: 2.4
    }],
    speaker_names: [{
        display_name: "Augusta Ada Lovelace"
    },{
        display_name: "Alan Mathison Turing"
    }]
});
```

`job` will contain all the information normally found in a successful response from our
[Submit Job](https://docs.rev.ai/api/asynchronous/reference/#operation/SubmitTranscriptionJob) endpoint.

If you want to get fancy, both send job methods can take a `RevAiJobOptions` object containing optional parameters.
These are described in the request body of the [Submit Job](https://docs.rev.ai/api/asynchronous/reference/#operation/SubmitTranscriptionJob) endpoint.

### Submitting urls with authorization headers

Both the `source_config` and `notification_config` job options support using a customer-provided authorization header to access the URLs.
This optional argument should be in the format `{ "Authorization": "TokenScheme TokenValue" }`

Example:
```
var notificationConfig = { url: 'https://example.com', auth_headers: { "Authorization": "Bearer <token>" } };
```
For more information see https://github.com/revdotcom/revai-node-sdk/blob/develop/examples/async_transcribe_media_from_url.js

### Checking your job's status

You can check the status of your transcription job using its `id`

```javascript
const jobDetails = await client.getJobDetails(job.id);
```

`jobDetails` will contain all information normally found in a successful response from
our [Get Job](https://docs.rev.ai/api/asynchronous/reference/#operation/GetJobById) endpoint

### Checking multiple files

You can retrieve a list of transcription jobs with optional parameters

```javascript
const jobs = await client.getListOfJobs();

// limit amount of retrieved jobs
const jobs = await client.getListOfJobs(3);

// get jobs starting after a certain job id
const jobs = await client.getListOfJobs(undefined, 'Umx5c6F7pH7r');
```

`jobs` will contain a list of job details having all information normally found in a successful response
from our [Get List of Jobs](https://docs.rev.ai/api/asynchronous/reference/#operation/GetListOfJobs) endpoint

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
const transcriptText = await client.getTranscriptText(job.id);

// or as an object
const transcriptObject = await client.getTranscriptObject(job.id);
```

The text output is a string containing just the text of your transcript. The object form of the transcript contains all the information outlined in the response of the [Get Transcript](https://docs.rev.ai/api/asynchronous/reference/#operation/GetTranscriptById) endpoint when using the json response schema.

Any of these outputs can we retrieved as a stream for easy file writing:

```javascript
const textStream = await client.getTranscriptTextStream(job.id);
const transcriptStream = await client.getTranscriptObjectStream(job.id);
```

### Getting captions output

Another way to retrieve your file is captions output. We support both .srt and .vtt outputs. See below for an example showing how you can get captions as a readable stream. If your job was submitted with multiple speaker channels you are required to provide the id of the channel you would like captioned.

```javascript
const captionsStream = await client.getCaptions(job.id, CaptionType.SRT);

// with speaker channels
const channelId = 1;
const captionsStream = await client.getCaptions(job.id, CaptionType.VTT, channelId);
```

## Streaming Audio

In order to stream audio, you will need to setup a streaming client and a media configuration for the audio you will be sending.

```javascript
import { RevAiApiClient, RevAiApiDeployment, RevAiApiDeploymentConfigMap } from 'revai-node-sdk';

 // Initialize audio configuration for the streaming client
const audioConfig = new AudioConfig()

// Optionally set the specific Rev AI deployment of your account, defaults to the US deployment.
// Learn more about Rev AI's global deployments at https://docs.rev.ai/api/global-deployments.
const streamingClient = new RevAiStreamingClient({ token: "<ACCESS_TOKEN>", deploymentConfig: RevAiApiDeploymentConfigMap.get(RevAiApiDeployment.US) }, audioConfig);
```

You can set up event responses for your client's streaming sessions. This allows you to handle events such as the connection closing, failing, or successfully connecting!
Look at the [examples](https://github.com/revdotcom/revai-node-sdk/tree/develop/examples) for more details.

```javascript
streamingClient.on('close', (code, reason) => {
    console.log(`Connection closed, ${code}: ${reason}`);
});

streamingClient.on('connect', connectionMessage => {
    console.log(`Connected with job id: ${connectionMessage.id}`);
})
```

Now you will be able to start the streaming session by simply calling the `streamingClient.start()` method!
You can supply an optional `SessionConfig` object to the function as well in order to provide additional information for that session, such as metadata, or a custom vocabulary's ID to be used with your streaming session.

```javascript
const sessionConfig = new SessionConfig(metadata='my metadata', customVocabularyID='myCustomVocabularyID');

const stream = streamingClient.start(sessionConfig);
```

You can then stream data to this `stream` from a local file or other sources of your choosing and the session will end when the data stream to the `stream` session ends or when you would like to end it, by calling `streamingClient.end()`. For more details, take a look at our [examples](https://github.com/revdotcom/revai-node-sdk/tree/develop/examples).

### Submitting custom vocabularies

You can now submit any custom vocabularies independently through the new CustomVocabularies client! The main benefit is that users of the SDK can now submit their custom vocabularies for preprocessing and then include these processed custom vocabularies in their streaming jobs.

Below you can see an example of how to create, submit and check on the status and other associated information of your submitted custom vocabulary!

For more information, check out our [examples](https://github.com/revdotcom/revai-node-sdk/tree/develop/examples).
```javascript
import { RevAiCustomVocabulariesClient } from 'revai-node-sdk';

// Initialize your client with your Rev AI access token
const accessToken = "<ACCESS_TOKEN>";
const client = new RevAiCustomVocabulariesClient(accessToken);

// Construct custom vocabularies object and submit it through the client
const customVocabularies = [{phrases: ["Noam Chomsky", "Robert Berwick", "Patrick Winston"]}];
const customVocabularySubmission = await client.submitCustomVocabularies(customVocabularies);

// Get information regarding the custom vocabulary submission and its progress
const customVocabularyInformation = await client.getCustomVocabularyInformation(customVocabularySubmission.id)

// Get a list of information on previously submitted custom vocabularies
const customVocabularyInformations = await client.getListOfCustomVocabularyInformations()

// Delete a custom vocabulary
await client.deleteCustomVocabulary(customVocabularySubmission.id)
```

# For Rev AI Node SDK Developers

After cloning and installing required npm modules, you should follow these practices when developing:

1. Use the scripts defined in [package.json](https://github.com/revdotcom/revai-node-sdk/tree/develop/package.json) in this manner `npm run [command_name]`:
    1. `lint` checks that you are not violating any code style standards. This ensures our code's style quality stays high improving readability and reducing room for errors.
    2. `build` transpiles the Typescript into Javascript with the options specified in [tsconfig.json](https://github.com/revdotcom/revai-node-sdk/tree/develop/tsconfig.json)
    3. `unit-test` runs our unit tests which live in the [unit test directory](https://github.com/revdotcom/revai-node-sdk/tree/develop/test/unit).
    * Note that `integration-test` is currently configured to work with a certain account specified in our continuous integration build environment, as such for now you can check the automated continuous integration checks to pass the integration tests.
    4. `build-examples` performs the same action as `build` and in addition, copies the `src` to the `node_modules` directory in `examples` such that you can test examples with local changes.
2. Add any relevant test logic if you add or modify any features in the source code and check that the tests pass using the scripts mentioned above.
3. Update the examples provided to illustrate any relevant changes you made, and check that they work properly with your changed local `revai-node-sdk`.
    * One way to use your changed local package in the examples is to copy the output of the `build` script into the `examples/node_modules/revai-node-sdk`. On Unix, this can be simply done with the following command when in the root directory: `$ cp -r dist/src examples/node_modules/revai-node-sdk/`.
4. Update the documentation to reflect any relevant changes and improve the development section.
