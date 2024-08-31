import axios from 'axios';
import * as crypto from 'crypto';
import { Utils } from '../Helpers/Utils';
import createHmac from 'create-hmac';


// Binance API base URL
const BINANCE_BASE_URL = 'https://api.binance.com';
const BYBIY_BASE_URL = 'https://api.bybit.com';

// Function to create a signature for the request
const createBinanceSignature = (queryString: string, secretKey: string): string => {
    return crypto.createHmac('sha256', secretKey).update(queryString).digest('hex');
};

function getSignature(params: string, secret: string , apiKey : string  , timestamp : any ): string {
    return createHmac('sha256', secret)
    .update([timestamp, apiKey, 5000, params].join(''))
    .digest('hex')
  }

// Interface for the response data
interface OrderResponse {
    symbol: string;
    orderId: number;
    clientOrderId: string;
    transactTime: number;
    price: string;
    origQty: string;
    executedQty: string;
    status: string;
    timeInForce: string;
    type: string;
    side: string;
}

// Function to place a market order to buy a coin
export const buyCoinFromBinance = async (symbol: string, quantity: number, API_KEY: string, SECRET_KEY: string): Promise<string> => {
    const endpoint = '/api/v3/order';
    const timestamp = Date.now();

    // Parameters for the order
    const params = {
        symbol,
        side: 'BUY',
        type: 'MARKET',
        quantity: quantity.toString(),
        timestamp: timestamp.toString(),
    };

    // Create query string for signing
    const queryString = new URLSearchParams(params).toString();
    const signature = createBinanceSignature(queryString, SECRET_KEY);
    // Add signature to the parameters
    const signedQueryString = `${queryString}&signature=${signature}`;

    try {
        // Make a request to the Binance API
        const response = await axios.post<OrderResponse>(`${BINANCE_BASE_URL}${endpoint}?${signedQueryString}`, null, {
            headers: {
                'X-MBX-APIKEY': API_KEY,
            },
        });
        Utils.log('Order placed successfully:' +  JSON.stringify(response.data));
        return 'Order placed successfully:' + response.data.orderId
    } catch (error: any) {
        Utils.log('Error placing order:' +  error.message);
        return "Failed to Place an order" + error.message
    }
};

export const buyCoinFromBybit = async (symbol: string, quantity: string , API_KEY: string  , SECRET_KEY : string ): Promise<string> => {
    const endpoint = '/v5/order/create';
    const timestamp = Date.now().toString();
    const recvWindow = 5000

    // Parameters for the order

    // Generate the signature
  
    // Add the signature to the parameters
    const signedParams = {
        "category" : "spot",
        "symbol": symbol,
        "side": "Buy",
        "orderType": "Market",
        "qty": quantity,
    }
    const signature  = getSignature(JSON.stringify(signedParams), SECRET_KEY , API_KEY , timestamp);

    try {
      // Make a request to the Bybit API
      const response: any  = await axios.post(`${BYBIY_BASE_URL}${endpoint}`, signedParams , {
        headers : { 
            "X-BAPI-SIGN" : signature,
            "X-BAPI-API-KEY" : API_KEY,
            "X-BAPI-TIMESTAMP" : timestamp,
            "X-BAPI-RECV-WINDOW": recvWindow,
            "Content-Type": "application/json; charset=utf-8"
        }
      });
      if(response && response.data && response.data.result && response.data.result.orderId){
        Utils.log('Order placed successfully:' +  JSON.stringify(response.data) , 'success');
        return 'Order placed successfully:' +  JSON.stringify(response.data)
      }
    } catch (error : any ) {
      Utils.log('Error placing order:' +  error.message ? error.message : error.response.data , 'error');
      return 'Error placing order:' +  error.message ? error.message : error.response.data
    }
    return ''
  };
  