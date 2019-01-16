const axios = require('axios');

class RevAiApiClient {
    apiKey: string;
    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    test(): string {
        return this.apiKey; 
    }
}

// Uncomment this, compile the typescript and run "node ./dist/api-client.ts" to test changes
// const client = new RevAiApiClient("im a key");
// console.log(client.test());