import { DiscordHelpers } from "../../../Helpers/DiscordHelpers";
import { Utils } from "../../../Helpers/Utils";
import { Main } from "../Main";

export interface IDModeResponse {
    listed_at: string
    first_listed_at: string
    id: number
    title: string
    category: string
    need_new_badge: boolean
    need_update_badge: boolean
    body: string
    body_url: string
    attachments: any[]
  }

interface IDModeGetNewsResponse extends IDModeResponse {
    delay : number
    cacheStatus : string
    skipBypass : boolean
}  


export class TradisRequest {
    Main: Main;
    CacheStats  :any = {revalidated : 0 ,hit : 0}
    counter: number = 0;

    constructor(Main: Main) {
        this.Main = Main
    }

    async getNews(): Promise<any> {
        const userAgents = this.Main.getUserAgents() as Record<any, any>;
        const skipBypass = false
        const url = 'https://api.tardis.dev/v1/exchanges/upbit'
        const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
        const userAgentData = Utils.parseUserAgent(userAgent)
        Utils.log(`Getting Id Mode announcements || skipBypass : ` + skipBypass, "pending");

        const headers = {
            Connection: 'keep-alive',
            'sec-ch-ua': userAgentData['sec-ch-ua'],
            Accept: 'application/json',
            'Accept-Language': 'en-KR, en;q=1, en-US;q=0.1',
            'sec-ch-ua-mobile': userAgentData['sec-ch-ua-mobile'],
            'User-Agent': userAgent,
            'sec-ch-ua-platform': userAgentData['sec-ch-ua-platform'],
            'Sec-Fetch-Site': 'same-site',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Dest': 'empty',
            Referer: 'https://upbit.com/',
            'Accept-Encoding': 'gzip, deflate, br, zstd',
          };

        const payload = {
            Url: url,
            method: "GET",
            headers
        };

        try {
            const response = await this.Main.GoClient.sendRequest(payload);
            if (response && response.body) {
                    const latestCoin  = this.getLatestCoin(response.body.availableSymbols)
               return latestCoin
            }
            throw new Error(JSON.stringify(response.body))
        } catch (err : any ) {
            Utils.log(`Failed to get announcements. UserAgent: ${userAgent}. Error: ${err.message}`, 'error');
        }
    }

    getLatestCoin(availableSinceArray : Array<Record<any,any>>){
        const latestAvailableSince = availableSinceArray.reduce((latest, item) => {
            return new Date(item.availableSince) > new Date(latest.availableSince) ? item : latest;
          }, availableSinceArray[0]);
          return latestAvailableSince
    }
}