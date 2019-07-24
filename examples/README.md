# Rev.ai Node SDK Examples
### Setup:
From the `examples/` directory run `npm install`
In the `config/` directory,  copy `sample.config.json` as `config.json`
Open `config.json` and paste your access token where it say `<YOUR-ACCESS-TOKEN>`
    
## Asynchronous Examples
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
View the [source code](https://github.com/revdotcom/revai-node-sdk/tree/develop/samples/async_transcribe_local_media_file.js).
**Run:**
`node async_get_job_details.js`

## Streaming Examples
### Streaming from a Local File
View the [source code](https://github.com/revdotcom/revai-node-sdk/tree/develop/samples/streaming_transcribe_from_local_file.js).
**Run:**
`node streaming_transcribe_from_local_file.js`