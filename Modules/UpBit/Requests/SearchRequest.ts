import { Utils } from "../../../Helpers/Utils";
import { Main } from "../Main";


export class SearchRequest {
    Main: Main;
    CacheStats  :any = {revalidated : 0 ,hit : 0}
    counter: number = 0;

    constructor(Main: Main) {
        this.Main = Main
    }

    async getNews(): Promise<any> {
        const userAgents = this.Main.getUserAgents() as Record<any, any>;
        const url = 'https://api-manager.upbit.com/api/v1/announcements/news/search?category=all&os=android&per_page=20&page=1&search='
        const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
        const userAgentData = Utils.parseUserAgent(userAgent)
        Utils.log(`Getting Search  Mode announcements ` , "pending");

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
                Utils.log('Got Search announcements ' + response.body.data.content, 'success');
               return  response.body.data.notices[0]
            }
            throw new Error(JSON.stringify(response.body))
        } catch (err : any ) {
            Utils.log(`Failed to get Search announcements. UserAgent: ${userAgent}. Error: ${err.message}`, 'error');
        }
    }
}
