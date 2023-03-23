const revai = require('revai-node-sdk');
const fs = require('fs');
const token = require('./config/config.json').access_token;

// Initialize your client with your audio configuration and access token
const audioConfig = new revai.AudioConfig(
    /* contentType */ 'audio/x-raw',
    /* layout */      'interleaved',
    /* sample rate */ 16000,
    /* format */      'S16LE',
    /* channels */    1
);

var client = new revai.RevAiStreamingClient({ token: token }, audioConfig);

// Create your event responses
client.on('close', (code, reason) => {
    console.log(`Connection closed, ${code}: ${reason}`);
});
client.on('httpResponse', code => {
    console.log(`Streaming client received http response with code: ${code}`);
})
client.on('connectFailed', error => {
    console.log(`Connection failed with error: ${error}`);
})
client.on('connect', connectionMessage => {
    console.log(`Connected with job id: ${connectionMessage.id}`);
})

// Optional config to be provided.
const sessionConfig = new revai.SessionConfig(
    metadata='my example metadata', /* (optional) metadata */
    customVocabularyID=null,  /* (optional) custom_vocabulary_id */
    filterProfanity=false,    /* (optional) filter_profanity */
    removeDisfluencies=false, /* (optional) remove_disfluencies */
    deleteAfterSeconds=0,     /* (optional) delete_after_seconds */
    startTs=0,                /* (optional) start_ts */
    transcriber='machine',    /* (optional) transcriber */
    detailedPartials=false,   /* (optional) detailed_partials */
    language='en',            /* (optional) language */
    skipPostprocessing=false, /* (optional) skip_postprocessing */
    enableSpeakerSwitch=false /* (optional) enable_speaker_switch */
);

// Begin streaming session
var stream = client.start(sessionConfig);

// Read file from disk
var file = fs.createReadStream('./resources/example.raw');

stream.on('data', data => {
    console.log(data);
});
stream.on('end', function () {
    console.log('End of Stream');
});

// Once your file has been sent, signal to the API that you have finished sending audio
file.on('end', () => {
    client.end();
});

// Stream the file
file.pipe(stream);

// Forcibly ends the streaming session
// stream.unsafeEnd();
