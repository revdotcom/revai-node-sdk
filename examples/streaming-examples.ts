/* Initialize your client with your audio configuration and access token */
const audioConfig = new AudioConfig(<YOUR-CONTENT-TYPE-PARAMS>);
const token = <YOUR-ACCESS-TOKEN>;
var client = new RevAiStreamingClient(token, audioConfig);

/* Create your event responses */
client.on('close', (code, reason) => {
	console.log(`Connection closed, ${code}: ${reason}`);
});
client.on('httpResponse', code => {
	console.log(code);
})
client.on('connectFailed', error => {
	console.log(error);
})
client.on('connect', connectionMessage => {
	console.log(connectionMessage);
})

/* Begin streaming session */
var stream = client.start();

/* Establish file for streaming and streaming responses */
var file = fs.createReadStream(<YOUR-AUDIO-FILE>);
stream.on('data', data => {
	console.log(data);
});
stream.on('end', function () {
	console.log("End of Stream");
});

/* Stream the file */
file.pipe(stream);
 
