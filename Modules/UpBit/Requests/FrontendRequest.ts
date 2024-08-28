import { DiscordHelpers } from "../../../Helpers/DiscordHelpers";
import { Utils } from "../../../Helpers/Utils";
import { Main } from "../Main";

export interface IFrontendRequest {
    listed_at: string
    first_listed_at: string
    id: number
    title: string
    category: string
    need_new_badge: boolean
    need_update_badge: boolean
    delay: number
    cacheStatus: string
    skipBypass : boolean
}


export interface IAnnouncment {
    success: boolean
    data: Data
}

export interface Data {
    total_pages: number
    total_count: number
    notices: Notice[]
    fixed_notices: FixedNotice[]
}

export interface Notice {
    listed_at: string
    first_listed_at: string
    id: number
    title: string
    category: string
    need_new_badge: boolean
    need_update_badge: boolean
}

export interface FixedNotice {
    listed_at: string
    first_listed_at: string
    id: number
    title: string
    category: string
    need_new_badge: boolean
    need_update_badge: boolean
}


export class FrontendRequests {
    Main: Main;
    CacheStats  :any = {revalidated : 0 ,hit : 0}
    counter: number = 0;
    constructor(Main: Main) {
        this.Main = Main
    }





    getLatestListedAt(data: IAnnouncment["data"]["notices"]) {
        const highestId = data.reduce((max, notice) => {
            return notice.id > max ? notice.id : max;
        }, 0);
    
        return data.filter(res => res.id === highestId)[0];
    }

    parseNews(announcmentsData: IAnnouncment["data"]) {
        // const tradeAnnouncments = announcmentsData.notices.filter(res => res.category === "Trade" && res.title.includes('Market Support'));
        const latestList = this.getLatestListedAt([...announcmentsData.notices, ...announcmentsData.fixed_notices]);
        return latestList;
    }

    async getNews(skipBypass = false): Promise<any> {
        const userAgents = this.Main.getUserAgents() as Record<any, any>;
        // Create an array of promises for all the requests
        const url = `https://api-manager.upbit.com/api/v1/announcements?os=ios&page=1&per_page=20&category=all`+ (skipBypass ? "" : `&bypass-cf-cache=` + Math.random())
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

            if (response && response.body && response.body.success) {
                const duration = endTime - startTime;  // Calculate the duration
                const data = response.body.data
                Utils.log(`Got Frontend announcements ` + " Response Time : " + duration + " MS" + " || skipBypass : " + skipBypass + " || Cache Status : " + response.headers['Cf-Cache-Status'][0] , "success");
                const latestData = this.parseNews(data)
                return { ...latestData, delay: duration, cacheStatus: response.headers['Cf-Cache-Status'] , skipBypass }
            }
            throw new Error(JSON.stringify(response.body))
        } catch (err : any ) {
            Utils.log('Failed to Get Frontend announcments using os: ' + " UserAgent: " + userAgent + " Error :  " + err, 'error')
          
        }
    }
}