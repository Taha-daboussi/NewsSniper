import { HttpsAgent } from './HttpsAgent';
import { Proxy } from './Proxy';
import { initGoClinet } from './initGoClient';
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
    timeout? : number
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
    async sendRequest(requestPayloadData: Payload, myProxyFile: any = this.proxyFile , forcedProxy : string = '') {
        try {
            if (requestPayloadData.sessionId === 'myProxy' && requestPayloadData.proxy)
                requestPayloadData.sessionId = requestPayloadData.proxy.toString();

            const mySelectedProxy = this.Proxy.getMyProxy(this.proxyFile || myProxyFile);
            if (mySelectedProxy) requestPayloadData.proxy = mySelectedProxy

            if (requestPayloadData.sessionId === 'myProxy' && requestPayloadData.proxy) requestPayloadData.sessionId = requestPayloadData.proxy.toString()
            if (!requestPayloadData.Url.includes('magiceden') && !requestPayloadData.Url.includes('opensea')  ) {
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
              const raw = {
                sessionId: requestPayloadData.proxy?.toString(),
                proxyUrl: requestPayloadData.proxy,
                certificatePinningHosts: {},
                headers: requestPayloadData.headers,
                headerOrder: requestPayloadData.headersOrder,
                requestUrl: requestPayloadData.Url,
                requestMethod: requestPayloadData.method,
                requestBody: requestPayloadData.body,
                tlsClientIdentifier: 'chrome_117',
                "skipRedirections": !requestPayloadData.followRedirects,
                timeout : 60000 * 5
            };
            const response: any = await HttpsAgent.sendPostRequest(raw);
            return Promise.resolve(response);
        } catch (e: any) {
            if (e.message && e?.message.includes('connect ECONNREFUSED 127.0.0.1')) {
                _initGoClinet.initMyGoClient(false)
            }
            return Promise.reject(e);

        }
    }

}
