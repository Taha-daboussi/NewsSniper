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


export class EmeregencyEpRequest {
    Main: Main;
    CacheStats  :any = {revalidated : 0 ,hit : 0}
    counter: number = 0;

    constructor(Main: Main) {
        this.Main = Main
    }

    async getNews(): Promise<any> {
        const userAgents = this.Main.getUserAgents() as Record<any, any>;
        const url = 'https://api-manager.upbit.com/api/v1/emergency_notice?category=all&os=android&per_page=20&page=1'
        const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
        const userAgentData = Utils.parseUserAgent(userAgent)
        Utils.log(`Getting EmergencyEp  Mode announcements ` , "pending");

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
                Utils.log('Got EmeregencyEp announcements ' + response.body.data.content, 'success');
               return {title : response.body.data.content}
            }
            throw new Error(JSON.stringify(response.body))
        } catch (err : any ) {
            Utils.log(`Failed to get EmeregencyEp announcements. UserAgent: ${userAgent}. Error: ${err.message}`, 'error');
        }
    }
}
