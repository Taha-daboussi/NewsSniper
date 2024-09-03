import { HttpsProxyAgent } from 'https-proxy-agent';
import { Utils } from '../Helpers/Utils';
import { Proxy } from './Proxy';
import { initGoClinet } from './initGoClient';
import axios from 'axios';
import { request, Dispatcher, ProxyAgent } from 'undici';

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
            let httpsAgent
            if(requestPayloadData.proxy){
                httpsAgent = new HttpsProxyAgent(requestPayloadData.proxy as string)
            }
 
            let  agentOptions: any = {};
            if (requestPayloadData.proxy) {
                agentOptions = new ProxyAgent(requestPayloadData.proxy);

            }

            
            const requestOptions: any = {
                method: requestPayloadData.method,
                headers: requestPayloadData.headers,
                body: requestPayloadData.body,
                dispatcher: agentOptions,
              };

              const response = await request(requestPayloadData.Url, requestOptions) as any ;
              const responseData = await response.body.json();
              response.body = responseData;
        
              return Promise.resolve(response);
        } catch (e: any) {
            if (e.message && e?.message.includes('connect ECONNREFUSED 127.0.0.1')) {
                _initGoClinet.initMyGoClient(false)
            }
            return Promise.reject(e);

        }
    }

}