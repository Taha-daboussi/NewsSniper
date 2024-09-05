import WebSocket from 'ws';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { TextDecoder } from 'util';
import { Utils } from './Helpers/Utils';

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

const headers = {
  'Accept-Encoding': 'gzip, deflate, br, zstd',
  'Accept-Language': 'en-US,en;q=0.9',
  'Cache-Control': 'no-cache',
  'Connection': 'Upgrade',
  'Host': 'crix-ws-first.upbit.com',
  'Origin': 'https://upbit.com',
  'Pragma': 'no-cache',
  'Sec-WebSocket-Extensions': 'permessage-deflate; client_max_window_bits',
  'Sec-WebSocket-Version': '13',
  'Upgrade': 'websocket',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
};

class WebSocketClient {
  private url: string;
  private proxyUrl: string;
  private agent: any;
  private socket: WebSocket | null;

  constructor(ep: string, proxyUrl: string) {
    this.url = 'wss://crix-ws-first.upbit.com/' + ep;
    this.proxyUrl = proxyUrl;
    this.agent = new HttpsProxyAgent(proxyUrl);
    this.socket = null;
  }

  public connect(reconnectAttempts = 0): void {
    this.socket = new WebSocket(this.url, { headers});

    const dataToSendAtOpen = [{ "ticket": "ram macbook" }, { "format": "PRTBUF_LIST" }];

    this.socket.onopen = () => {
      this.socket?.send(JSON.stringify(dataToSendAtOpen));
      reconnectAttempts = 0;

      Utils.log('WebSocket connection established');
    };

    this.socket.onmessage = (event) => {
      const message = event.data as ArrayBuffer ;
      const decoder = new TextDecoder('utf-8').decode(message);
      Utils.log(decoder.trim() + " Url " + this.url );
    };

    this.socket.onerror = (error) => {
        Utils.log("Error in websocket " + error);
        return this.connect()
    };

 
    this.socket.onclose = () => {
        Utils.log('WebSocket connection closed');
    
        // Attempt to reconnect with exponential backoff
        const reconnectDelay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000); // Maximum delay is 30 seconds
        Utils.log(`Reconnecting in ${reconnectDelay / 1000} seconds...`);
    
        setTimeout(() => {
          this.connect(reconnectAttempts + 1); // Increment reconnect attempts
        }, reconnectDelay);
      };
  }

  public sendPingMessage(interval: number): void {
    setInterval(() => {
        if(this.socket?.OPEN){
            this.socket?.send('PING');
        }

    }, interval);
  }
}

function main(url: string, proxyUrl: string): void {
  const client = new WebSocketClient(url, proxyUrl);
  client.connect();
  client.sendPingMessage(10000);
}

// Usage
const proxyUrl = 'http://127.0.0.1:8876';
// ["listing_host"].forEach(ep => {
//     main(ep, proxyUrl);
//   });

["listing_host", "manager_host", "manager_s3_host", "static_host", "static_staking_host", "ccx_host", "ccx_oauth_host", "cs_host", "panda_host", "nft_host", "nft_resource_host", "quotation_master_beta_base", "quotation_master_sandbox_base", "quotation_websocket_sandbox_url", "quotation_websocket_beta_url", "crix_tv_api_sandbox_host", "crix_tv_api_beta_host", "quotation_api_sandbox_host"].forEach(ep => {
  main(ep, proxyUrl);
});
