/* eslint-disable no-shadow */
export enum RevAiApiDeployment {
    US = 'US',
    EU = 'EU'
}

export const RevAiApiDeploymentConfigMap = new Map([
    [RevAiApiDeployment.US, { baseUrl: 'https://api.rev.ai', baseWebsocketUrl: 'wss://api.rev.ai' }],
    [RevAiApiDeployment.EU, { baseUrl: 'https://ec1.api.rev.ai', baseWebsocketUrl: 'wss://ec1.api.rev.ai' }]
]);
