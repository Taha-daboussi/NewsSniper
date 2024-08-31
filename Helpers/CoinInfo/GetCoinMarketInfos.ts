
import { Utils } from "../Utils";
import axios from 'axios'

export const getCoinTopExchanges = async (tokenName: string): Promise<any> => {
    const url = `https://api.coinmarketcap.com/data-api/v3/cryptocurrency/market-pairs/latest?slug=${tokenName}&start=1&limit=10&category=spot&centerType=all&sort=cmc_rank_advanced&direction=desc&spotUntracked=true` 
    Utils.log('Getting Coin Entry from CoinMarketCap API' , 'pending'); 
    try{
        const response :any = await axios.get(url)
        if(response && response.data && response.data.data.marketPairs){
            const names = response.data.data.marketPairs.map((pair:any) => {return {name : pair.exchangeName , url: pair.marketUrl} }).filter((data :{name : string  , url : string } )=>data.url.includes("USD"))
            return names.length > 5  ? names.slice(0,5) : names
        }
        throw new Error('Error in fetching data from CoinMarketCap API')
    }catch(err){
        Utils.log('Error in fetching data from CoinMarketCap API' , 'error');
        await Utils.sleep(5000);
        return getCoinTopExchanges(tokenName)
    }
}
