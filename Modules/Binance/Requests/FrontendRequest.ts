import { Utils } from "../../../Helpers/Utils";
import { Main } from "../Main";

export class FrontendRequest {
  Main: Main;
  constructor(Main: Main) {
    this.Main = Main;
  }

  async run(): Promise<any> {
    Utils.log('Getting **FRONTEND** Request for binance', 'pending');
    const headers = {
      Connection: 'keep-alive',
      'sec-ch-ua': '"Not)A;Brand";v="99", "Google Chrome";v="127", "Chromium";v="127"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'Upgrade-Insecure-Requests': '1',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-User': '?1',
      'Sec-Fetch-Dest': 'document',
      'Accept-Encoding': 'gzip, deflate, br, zstd',
      'Accept-Language': 'en-US,en;q=0.9',
      "Cache-Control": "no-store"
      // "Cache-Control": "no-cache"
    }
    const navId = Utils.randomeNumber(1, 48);
    const url = 'https://www.binance.com/en/support/announcement/new-cryptocurrency-listing?c=48&navId='+navId;
    const payload = {
      Url: url,
      method: "GET",
      headers
    };
    let response
    try {
      const startTime = Date.now();  // Record the start time

      response = await this.Main.GoClient.sendRequest(payload).catch(err => {
        throw new Error(err);
      });
      const endTime = Date.now();  // Record the end time


      if (response && response.body) {
        var Data = JSON.parse(response.body.match(/"articles":?([\s\S]*?),"catalogs":/)[1])
        if(Data[0]){
          Utils.log('Binance Frontend Announcments fetched successfully | Cache ' + response.headers['x-cache'] + " | " +  response.headers['x-cache-proxy'] , 'success');
          return {...Data[0] , delay : endTime - startTime , cacheStatus : (response.headers["x-cache"]  + " || " + response.headers['x-cache-proxy']) , skipBypass : false } 
        }
      }

      throw new Error(response.body);
    } catch (err) {
      Utils.log('Error while fetching Binance Announcments' + err, "error");
    }
  }
}