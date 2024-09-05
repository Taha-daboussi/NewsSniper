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
        const os = ["ios" , 'web' , 'android']
        const osIndex = os[Math.floor(Math.random() * os.length)]
        const url = `https://api-manager.upbit.com/api/v1/announcements?os=${osIndex}&page=1&per_page=${Utils.randomeNumber(1,20)}&category=all&`+ Utils.implyCacheBypass();
        const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
        Utils.log(`Getting Frontend Mode announcements`, "pending");

        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
            Accept: 'application/json',
            'Accept-Encoding': 'deflate',
            'Accept-Language': 'ko-KR, ko;q=1, en-GB;q=0.1',
            Origin: 'https://upbit.com',
            Referer: 'https://upbit.com/',
            Priority: 'u=1, i',
            'Sec-Ch-Ua': '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
            'Sec-Ch-Ua-Mobile': '?' +  osIndex === 'web' ? "0"  : '1',
            'Sec-Ch-Ua-Platform': '"Windows"',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-site',
            "Upbit-Platform": osIndex === 'web' ?"WEBAPP":"MOBILE_WEB"

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
                Utils.log(`Got Frontend announcements `, "success");
                const latestData = this.parseNews(data)
                return { ...latestData, delay: duration, cacheStatus: response.headers['Cf-Cache-Status'] , skipBypass }
            }
            throw new Error(JSON.stringify(response.body))
        } catch (err : any ) {
            Utils.log('Failed to Get Frontend announcments using os: ' + " UserAgent: " + userAgent + " Error :  " + err, 'error')
          
        }
    }
}

//https://api.binance.com/sapi/v1/capital/config/getall