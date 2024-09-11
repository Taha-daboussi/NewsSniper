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
    this.url =  ep;
    this.proxyUrl = proxyUrl;
    this.agent = new HttpsProxyAgent(proxyUrl);
    this.socket = null;
  }

  public connect(reconnectAttempts = 0): void {
    this.socket = new WebSocket(this.url, { headers , agent: this.agent });


    this.socket.onopen = () => {
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
          this.socket?.ping()
        }

    }, interval);
    this.socket?.ping()
  }
}

function main(url: string, proxyUrl: string): void {
  const client = new WebSocketClient(url, proxyUrl);
  client.sendPingMessage(5000);
  client.connect();
}

// Usage
const proxyUrl = 'http://127.0.0.1:8876';
// ["listing_host"].forEach(ep => {
//     main(ep, proxyUrl);
//   });

["wss://nbstream.binance.com/market?uuid=9c1abb70-7379-4dbe-8498-10d9508d6f9b&lang=en&clienttype=web" , "wss://nbstream.binance.com/market?channel=emergency_announcement2_en" , "wss://nbstream.binance.com/market?channel=announcement_en"].forEach(ep => {
  main(ep, proxyUrl);
});
