import { DiscordHelpers } from "../DiscordHelpers";
import { Utils } from "../Utils";
import axios from 'axios'
import { getCoinTopExchanges } from "./GetCoinMarketInfos";
export interface CoinEntryData { 
    fully_diluted_market_cap: string;
    market_cap: string;
    percent_change_1h: string;
    percent_change_24h: string;
    price: string;
    volume_24h: string;
    tokenName : string 
}
export const getCoinData = async (tokenName : string , webhook : string ) :Promise<void>  => {
    const coinEntryData = await getCoinEntry(tokenName);
    const topExchangesPlatform = await getCoinTopExchanges(coinEntryData.tokenName);
    const formattedMessage = topExchangesPlatform
    .map((item : any , index : any ) => `${index + 1}. [${item.name}](${item.url})`) // Format each item as a Markdown link
    .join('\n'); // Join items with a newline

    const params = DiscordHelpers.buildWebhookParamsForCoinInfo(coinEntryData,formattedMessage)
    DiscordHelpers.sendWebhook(webhook,params)
    return 

}

const getCoinEntry = async (tokenName: string): Promise<CoinEntryData> => {
    const url = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=` + tokenName;
    Utils.log('Getting Coin Entry from CoinMarketCap API' , 'pending'); 
    try{
        const response :any = await axios.get(url , {
            headers  : {
                'X-CMC_PRO_API_KEY': "14a53b54-8b24-4e26-8132-53e775b8ff4a"
            }
        })
        if(response && response.data && response.data.data && response.data.data[tokenName]){
            const {fully_diluted_market_cap , market_cap , percent_change_1h ,  percent_change_24h , price , volume_24h } = response.data.data[tokenName].quote.USD

            return {fully_diluted_market_cap : Utils.formatNumber(fully_diluted_market_cap) , market_cap : Utils.formatNumber(market_cap) , percent_change_1h : percent_change_1h.toFixed(5) ,percent_change_24h :   percent_change_24h.toFixed(5) , price  : price.toFixed(5) ,volume_24h :  Utils.formatNumber(volume_24h) , tokenName : response.data.data[tokenName].slug }
        }
        throw new Error('Error in fetching data from CoinMarketCap API')
    }catch(err){
        Utils.log('Error in fetching data from CoinMarketCap API' , 'error');
        await Utils.sleep(5000);
        return getCoinEntry(tokenName)
    }
}
