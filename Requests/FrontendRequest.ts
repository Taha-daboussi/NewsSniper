import { Utils } from "../Helpers/Utils";
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
    os: string
    userAgnet: string
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
    constructor(Main: Main) {
        this.Main = Main
    }

    async run(){
        const getAnnouncments = await this.getNews();
    }



    getLatestListedAt(data: IAnnouncment["data"]["notices"]) {
        return data.reduce((latest, item) => {
            return new Date(item.listed_at) > new Date(latest.listed_at) ? item : latest;
        });
    }

    parseNews(announcmentsData: IAnnouncment["data"]) {
        const tradeAnnouncments = announcmentsData.notices.filter(res => res.category === "Trade" && res.title.includes('Market Support'));
        const latestList = this.getLatestListedAt(tradeAnnouncments);
        return latestList;
    }

    async getNews():Promise<Array<IFrontendRequest>> {
        const osList = ['web', 'ios', 'android'];
        const userAgents = this.Main.getUserAgents() as Record<any, any>;

        // Create an array of promises for all the requests
        const requests = osList.map(async os => {
            const url = `https://api-manager.upbit.com/api/v1/announcements?os=${os}&page=1&per_page=20&category=all`;
            const userAgent = userAgents[os];
            const userAgentData = Utils.parseUserAgent(userAgent);
            Utils.log(`Getting frontend announcements using Os: ${os} UserAgent: ${userAgent}`, "pending");

            const headers = {
                Connection: 'keep-alive',
                'sec-ch-ua': userAgentData["sec-ch-ua"],
                'sec-ch-ua-mobile': userAgentData['sec-ch-ua-mobile'],
                'sec-ch-ua-platform': userAgentData['sec-ch-ua-platform'],
                'Upgrade-Insecure-Requests': '1',
                'User-Agent': userAgent,
                Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                'Sec-Fetch-Site': 'none',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-User': '?1',
                'Sec-Fetch-Dest': 'document',
                'Accept-Encoding': 'gzip, deflate, br, zstd',
                'Accept-Language': 'en-US,en;q=0.9'
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
                    Utils.log(`Got Frontend announcements using os: ${os} UserAgent: ${userAgent} ` + "Response Time : " + duration + " ms", "success");

                    const latestData = this.parseNews(data) 
                    return {...latestData , delay : duration , os , userAgent}
                }
            } catch (err) {
                Utils.log('Failed to Get Frontend announcments using os: ' + os + " UserAgent: " + userAgent , 'error' )
      
            }
        });

        // Wait for all requests to complete
        const results = await Promise.all(requests);

        // Filter out any null results and return the collected data
        return results.filter(result => result !== null) as any ;
    }


}