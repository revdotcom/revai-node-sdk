/* eslint-disable no-shadow */
/**
 * Configuration object to initialize Rev AI clients with
 * @param token Access token used to validate API requests, note access token should match the deployment
 *    associated with the url in @param baseUrl
 * @param version version of the API to be used
 * @param deploymentConfig deployment configurations of the API to be used
 * @param serviceApi Type of api service
 */
export interface RevAiApiClientConfig {
    token?: string;
    version?: string;
    deploymentConfig?: RevAiApiDeploymentConfig;
    serviceApi?: string;
}

/* eslint-disable no-shadow */
/**
 * Rev AI Deployemnt Configuration object to initialize RevAiApiClientConfig with.
 * Note configurations are different for Rev AI deployments in different locations.
 * @param baseUrl base url of the API to be used
 * @param baseWebsocketUrl base urls of the streaming API to be used
 */
interface RevAiApiDeploymentConfig {
    baseUrl: string;
    baseWebsocketUrl: string;
}