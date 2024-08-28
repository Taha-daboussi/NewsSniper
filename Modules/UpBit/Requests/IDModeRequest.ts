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


export class IDModeRequests {
    Main: Main;
    CacheStats  :any = {revalidated : 0 ,hit : 0}
    counter: number = 0;

    constructor(Main: Main) {
        this.Main = Main
    }

    async getNews(latestAnnouncementId : number): Promise<any> {
        const userAgents = this.Main.getUserAgents() as Record<any, any>;
        const skipBypass = false
        const url = `https://api-manager.upbit.com/api/v1/announcements/` + latestAnnouncementId + "?&random=" + Math.random()
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
            const startTime = Date.now();  // Record the start time
            const response = await this.Main.GoClient.sendRequest(payload);
            const endTime = Date.now();  // Record the end time
            const duration = endTime - startTime;  // Calculate the duration

            if (response && response.body) {
                if(!response.body.success){
                    const latestData  : IDModeResponse = response.body
                    return {...latestData , delay : duration , cacheStatus: response?.headers.length > 0 ? response?.headers['Cf-Cache-Status'] :"Uncached" , skipBypass };
                }else if (response.body.success){
                    const latestData  : IDModeResponse = response.body.data
                    return { ...latestData, delay: duration, cacheStatus: response?.headers.length > 0 ? response?.headers['Cf-Cache-Status'] :"Uncached" , skipBypass }
                }
            }
            throw new Error(JSON.stringify(response.body))
        } catch (err : any ) {
            Utils.log(`Failed to get announcements. UserAgent: ${userAgent}. Error: ${err.message}`, 'error');
        }
    }
}