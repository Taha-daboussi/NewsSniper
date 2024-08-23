import { DiscordHelpers } from "../Helpers/DiscordHelpers";
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
        return data.reduce((latest, item) => {
            return new Date(item.listed_at) > new Date(latest.listed_at) ? item : latest;
        });
    }

    parseNews(announcmentsData: IAnnouncment["data"]) {
        // const tradeAnnouncments = announcmentsData.notices.filter(res => res.category === "Trade" && res.title.includes('Market Support'));
        const latestList = this.getLatestListedAt(announcmentsData.notices);
        return latestList;
    }

    async getNews(skipBypass = false): Promise<IFrontendRequest> {
        const userAgents = this.Main.getUserAgents() as Record<any, any>;
        // Create an array of promises for all the requests
        const url = `https://api-manager.upbit.com/api/v1/announcements?os=ios&page=1&per_page=20&category=all`+ (skipBypass ? "" : `&bypass-cf-cache=` + Math.random())
        const userAgent = userAgents["web"];
        const userAgentData = Utils.parseUserAgent(userAgent);
        Utils.log(`Getting frontend announcements || skipBypass : ` + skipBypass, "pending");

        const headers = {
            "Host": "api-manager.upbit.com",
            "Cookie": "__cf_bm=8p_5YQ3dmJp7XC42y774_s9Sq7d4z3CADIiBd3Adlwo-1723905842-1.0.1.1-MVa.1qS3HrfvnhnONNkzzjih7JvNZebr98YReO.U1h4D2.zUHF2v8Uqtg8J0YwttJYhD10O.9ahW3rke6jGWyQ; _ga_06DYP5R5CN=GS1.1.1711562142.4.1.1711563184.60.0.0; amplitude_id_5f3aa052f4cc92657d57c39eba45a896_totalupbit.com=eyJkZXZpY2VJZCI6IjhlMjMyZGIzLWNiOWQtNDQ5Mi1hMGU2LTc2MGIzMDFlZjhhZFIiLCJ1c2VySWQiOm51bGwsIm9wdE91dCI6ZmFsc2UsInNlc3Npb25JZCI6MTcxMTU2MjE0MTU5NiwibGFzdEV2ZW50VGltZSI6MTcxMTU2MzExNjY5OCwiZXZlbnRJZCI6MzAsImlkZW50aWZ5SWQiOjAsInNlcXVlbmNlTnVtYmVyIjozMH0=; _ga=GA1.1.115337781.1711130117; _ga_LKK0Q2MJXC=GS1.1.1711559032.1.1.1711559044.0.0.0; amplitude_id_35ad0ef42657135fc6ef8150911e5dea_totalupbit.com=eyJkZXZpY2VJZCI6IjA1ZmM5ZTFlLWIxYTEtNDY2NC04MzgzLTUxYmM2MzUwNDJiZVIiLCJ1c2VySWQiOm51bGwsIm9wdE91dCI6ZmFsc2UsInNlc3Npb25JZCI6MTcxMTU1OTAzMTQzOSwibGFzdEV2ZW50VGltZSI6MTcxMTU1OTAzMTQzOSwiZXZlbnRJZCI6MCwiaWRlbnRpZnlJZCI6MSwic2VxdWVuY2VOdW1iZXIiOjF9",
            "accept": "*/*",
            "authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJub25jZSI6MTcyMzkwNjIyMjkyNCwiYWNjZXNzX2tleSI6InZ3bDVleHVDc3g1djJJSjBtZHhMT2hUdk5qYUJsb1liNUdHOGljU0kiLCJkZXZpY2VfaWQiOiI3Njc5MzExNS1BQzQwLTQ1MTUtQTc2Ny01MURDOEYwQzdCNzEifQ.4Ch2__28aKboZ8Lp3mEkawqcMlTJAvAnaozy9UdX39o",
            "upbit-platform": "iOS",
            "user-agent": "Upbit-iOS/1.27.17 (com.dunamu.upbit; build:1.27.17; iOS 16.3.1; iPhone13,1) Alamofire/5.9.0",
            "accept-language": "ko-KR, ko;q=1, en;q=0.1",
            "cache-control": "no-store"

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
                this.buildCacheStats(response.headers['Cf-Cache-Status'][0])
                return { ...latestData, delay: duration, cacheStatus: response.headers['Cf-Cache-Status'] , skipBypass }
            }
            throw new Error(JSON.stringify(response.body))
        } catch (err : any ) {
            Utils.log('Failed to Get Frontend announcments using os: ' + " UserAgent: " + userAgent + " Error :  " + err, 'error')
            const params = DiscordHelpers.buildErrorWebhookParams(err.message)
            DiscordHelpers.sendWebhook(this.Main.Config.DiscordWebhook,params)
            await Utils.sleep();
            return this.getNews();
        }
    }

    buildCacheStats(cacheStatus : string ){
        if(cacheStatus === 'REVALIDATED'){
            this.CacheStats.revalidated++
        }else if(cacheStatus ==="HIT"){
            this.CacheStats.hit++
        }else{
            if(!this.CacheStats[cacheStatus]){
                this.CacheStats[cacheStatus]=0
            }
            this.CacheStats[cacheStatus]++
        }
        this.counter ++
        if(this.counter >10){
        Utils.log(JSON.stringify(this.CacheStats));
        this.counter = 0
        }
    }
}