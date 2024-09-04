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
        const url = `https://api-manager.upbit.com/api/v1/announcements/` + latestAnnouncementId + `?&` + Utils.implyCacheBypass();
        const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
        const userAgentData = Utils.parseUserAgent(userAgent)
        Utils.log(`Getting Id Mode announcements`, "pending");

        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
            Accept: 'application/json',
            'Accept-Encoding': 'gzip, deflate, br, zstd',
            'Accept-Language': 'ko-KR, ko;q=1, en-GB;q=0.1',
            Origin: 'https://upbit.com',
            Priority: 'u=1, i',
            Referer: 'https://upbit.com/',
            'Sec-Ch-Ua': '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
            'Sec-Ch-Ua-Mobile': '?0',
            'Sec-Ch-Ua-Platform': '"Windows"',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-site'
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
                    return {...latestData, delay: duration, cacheStatus: response?.headers.length > 0 ? response?.headers['cf-cache-status'] :"Uncached" , skipBypass};
                }else if (response.body.success){
                    const latestData  : IDModeResponse = response.body.data
                    return {...latestData, delay: duration, cacheStatus: response?.headers.length > 0 ? response?.headers['cf-cache-status'] :"Uncached" , skipBypass};
                }
            }
            throw new Error(JSON.stringify(response.body))
        } catch (err : any ) {
            if(err && err.response && err.response.data && err.response.data.success === false){
                 return {success : false }
            }
            Utils.log(`Failed to get **ID MODE** announcements. UserAgent: ${userAgent}. Error: ${err.message}` + url, 'error');
        }
    }
}