import fs from 'fs'
import { Utils } from '../../Helpers/Utils'
import path from 'path';
export class MainHelper {

    getUserAgents(){
        const userAgnets = ['Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36']
        return userAgnets
    }

    shuffleProxyOrder(){

        const rootDir = path.resolve(__dirname, "../../");

        // Construct the path to 'logs.txt' in the root directory
        const logFilePath = path.join(rootDir, 'JDatabase\\Proxy.txt');

        const myProxies = fs.readFileSync(logFilePath, 'utf-8').split('\r\n')
        const shuffledProxies = Utils.shuffle(myProxies);
        fs.writeFileSync(logFilePath, shuffledProxies.join('\r\n'), 'utf-8');
    }

}