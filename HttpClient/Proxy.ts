import path from "path";

// import { RemoteSettings } from "./remoteSettings/remoteSettings";
const RemoteSettings = {} as any;
const fs = require('fs');

interface IProxy {
    sperationType: string;
    myProxies: any;
    proxyPosition: number;
    isSequentialProxyMethod: boolean;
    getMyProxyArray(myProxyFile: string): boolean;
    getRandomProxies(): string;
    getProxiesSequentially(): string;
    getMyProxy(myProxyFile: string, sessionId: string): string | undefined;
}

export class Proxy implements IProxy {
    sperationType = process.platform === 'darwin' ? '/' : '\\';
    myProxies: any;
    proxyPosition = 0;
    isSequentialProxyMethod = true;
    sessionProxyMap: Map<string, string> = new Map();

    /**
     * Retrieves the array of proxies from the proxy file
     * @returns True if the proxies are retrieved successfully, false otherwise
     */
    getMyProxyArray() {
        if (!this.myProxies) {
            try {
                const rootDir = path.resolve(__dirname,'../');
                const logFilePath = path.join(rootDir, 'JDatabase\\Proxy.txt');

                const myProxies = fs.readFileSync(logFilePath, 'utf-8').split('\r\n')
                this.myProxies = myProxies.map((res: any) => {
                    const proxy = res.split(':');
                    if(proxy.length === 4){
                        return `http://${proxy[2]}:${proxy[3]}@${proxy[0]}:${proxy[1]}`;
                    }else{
                        return `http://${proxy[0]}:${proxy[1]}`;
                    }
                });
                return true;
            } catch (err) {
                this.myProxies = []
                return  false ;
            }
        }
        return false;
    }

    /**
     * Retrieves a random proxy from the proxy array
     * @returns The random proxy
     */
    getRandomProxies() {
        const myProxy = this.myProxies[Math.floor(Math.random() * this.myProxies?.length)];
        return myProxy;
    }

    /**
     * Retrieves proxies sequentially
     * @returns The proxy
     */
    getProxiesSequentially() {
        if (this.proxyPosition >= this.myProxies.length) this.proxyPosition = 0;
        const myProxy = this.myProxies[this.proxyPosition];
        this.proxyPosition++;
        return myProxy;
    }

    /**
     * Retrieves the proxy based on the proxy file and session ID
     * @param myProxyFile The proxy file
     * @param sessionId The session ID
     * @returns The proxy
     */
    getMyProxy(myProxyFile: string) {
        if (myProxyFile) {
            if (!this.myProxies) this.getMyProxyArray();
            if (this.myProxies.length > 0) {
                    const assignedProxy = this.getProxiesSequentially();
                    return assignedProxy
            }
        }
    }

    

  


}
