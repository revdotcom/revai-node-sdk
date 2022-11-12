/* eslint-disable no-shadow */
export enum RevAiApiDeployment {
    US = 'application/vnd.rev.transcript.v1.0+json',
    EU = 'text/plain'
}

export const RevAiApiDeploymentConfigMap = new Map([
    [RevAiApiDeployment.US, { baseUrl: 'https://api.rev.ai', baseWebsocketUrl: 'wss://api.rev.ai' }],
    [RevAiApiDeployment.EU, { baseUrl: 'https://ec1.api.rev.ai', baseWebsocketUrl: 'wss://ec1.api.rev.ai' }]
]);
