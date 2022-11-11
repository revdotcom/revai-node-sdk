/* eslint-disable no-shadow */
/**
 * Configuration object to initialize RevAiApiClient with
 * @param token Access token used to validate API requests, note access token should match the deployment
 *    associated with the url in @param baseUrl
 * @param version version of the API to be used
 * @param baseUrl base url of the API to be used. Note base urls are different for Rev AI deployments in
 *     different locations. Base urls are also different for asynchronous and streaming APIs.
 * @param serviceApi Type of api service
 */
export interface RevAiApiClientConfig {
    token?: string;
    version?: string;
    baseUrl?: string;
    serviceApi?: string;
}
