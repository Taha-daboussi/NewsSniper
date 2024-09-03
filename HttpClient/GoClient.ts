import { HttpsProxyAgent } from 'https-proxy-agent';
import { Utils } from '../Helpers/Utils';
import { Proxy } from './Proxy';
import { initGoClinet } from './initGoClient';
import axios from 'axios';
const _initGoClinet = new initGoClinet();

interface Payload {
    method: string;
    headers: any;
    Url: string;
    body?: string;
    sessionId?: string;
    proxy?: string;
    headersOrder?: string[];
    withoutCookieJar?: boolean;
    followRedirects?: boolean
    timeout?: number
}

interface IGoClient {
    sperationType: string;
    myProxies: any;
    isSequentialProxyMethod: boolean;
    Proxy: Proxy;
    sendRequest(requestPayloadData: Payload, myProxyFile: any): Promise<any>;
}
// TODO BUILD AN INTERFVAE FOR RESPOSNE AND THE ERROR
export class GoClient implements IGoClient {
    proxyFile: string = '';
    constructor(proxyFile = 'Proxy.txt') {
        if (proxyFile) {
            this.proxyFile = proxyFile
        }
    }
    sperationType = process.platform === 'darwin' ? '/' : '\\';
    myProxies: any;
    isSequentialProxyMethod = true;
    Proxy = new Proxy();
    /**
     * Sends a request and returns the response object
     * @param requestPayloadData The request payload data
     * @param myProxyFile The proxy file
     * @returns The response object
     */
    async sendRequest(requestPayloadData: Payload, myProxyFile: any = this.proxyFile, forcedProxy: string = '') {
        let raw
        try {
            if (requestPayloadData.sessionId === 'myProxy' && requestPayloadData.proxy)
                requestPayloadData.sessionId = requestPayloadData.proxy.toString();

            const mySelectedProxy = this.Proxy.getMyProxy(this.proxyFile || myProxyFile);
            if (mySelectedProxy) requestPayloadData.proxy = mySelectedProxy

            if (requestPayloadData.sessionId === 'myProxy' && requestPayloadData.proxy) requestPayloadData.sessionId = requestPayloadData.proxy.toString()
            if (!requestPayloadData.Url.includes('magiceden') && !requestPayloadData.Url.includes('opensea')) {
                process.env.NODE_ENV === 'development' ? requestPayloadData.proxy = 'http://127.0.0.1:8876' : ''
            }
            if (forcedProxy) {
                try {
                    // Attempt to create a new URL object with forcedProxy
                    new URL(forcedProxy);
                    // If successful, forcedProxy is a valid URL
                    requestPayloadData.proxy = forcedProxy;
                } catch (e) {
                    // If an error is thrown, forcedProxy is not a valid URL
                    console.error('Invalid URL:', forcedProxy);
                }
            }
            let response;
            let httpsAgent
            if(requestPayloadData.proxy){
                httpsAgent = new HttpsProxyAgent(requestPayloadData.proxy as string)
            }
            const configuration = {
                headers: requestPayloadData.headers,
                httpsAgent,
                timeout: 1000,
                signal: AbortSignal.timeout(1000)
            }
            if (requestPayloadData.method === "POST") {
                response = await axios.post(requestPayloadData.Url, requestPayloadData.body , configuration)as any 
            } else if (requestPayloadData.method === "GET") {
                //@ts-ignore
                response = await axios.get(requestPayloadData.Url,configuration) as any 
            } else {
                throw new Error('Method not supported')
            }
            response.body  =  response.data
            return Promise.resolve(response);
        } catch (e: any) {
            if (e.message && e?.message.includes('connect ECONNREFUSED 127.0.0.1')) {
                _initGoClinet.initMyGoClient(false)
            }
            Utils.log('Error while sending request ' + JSON.stringify(e.message), 'error');
            return Promise.reject(e);

        }
    }

}
