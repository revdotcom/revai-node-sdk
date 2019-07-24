# Rev.ai Node SDK Examples
### Setup:
From the `examples/` directory run `npm install`

In the `config/` directory,  rename `sample.config.json` to `config.json`

Open `config.json` and paste your access token where specified.

## Asynchronous Examples
View the [asynchronous API documentation](https://www.rev.ai/docs)
### Transcription from a Local File
View the [source code](https://github.com/revdotcom/revai-node-sdk/tree/develop/examples/async_transcribe_local_media_file.js).

**Run:**

`node async_transcribe_local_media_file.js`

The output can be found at `outputs/async_file_transcript.txt`

### Transcription from a Media Url
View the [source code](https://github.com/revdotcom/revai-node-sdk/tree/develop/examples/async_transcribe_media_from_url.js).

**Run:**

`node async_transcribe_media_from_url.js`

The output can be found at `examples/outputs/async_url_transcript.txt`

### Retrieve Job Details
View the [source code](https://github.com/revdotcom/revai-node-sdk/tree/develop/examples/async_get_job_details.js).

**Run:**

`node async_get_job_details.js`

## Streaming Examples
View the [streaming API documentation](https://www.rev.ai/docs/streaming)
### Streaming from a Local File
View the [source code](https://github.com/revdotcom/revai-node-sdk/tree/develop/examples/streaming_transcribe_from_local_file.js).

**Run:**

`node streaming_transcribe_from_local_file.js`