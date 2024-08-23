import { DiscordHelpers } from "./Helpers/DiscordHelpers";
import { Utils } from "./Helpers/Utils";
import { GoClient } from "./HttpClient/GoClient";
import { MainHelper } from "./MainHelper";
import { FrontendRequests, IFrontendRequest } from "./Requests/FrontendRequest";
import fs from 'fs'
import { IDModeRequests } from "./Requests/IDModeRequest";
export class Main extends MainHelper {
    GoClient = new GoClient()
    FrontendRequests = new FrontendRequests(this)
    IDModeRequests = new IDModeRequests(this)
    LatestListing = {} as any 
    Config = this.getConfig();
    index = 0
    async runFrontendMode(){
        while (true) {
            const requests = [this.FrontendRequests.getNews(),this.FrontendRequests.getNews(true)];
            // Process the first response as soon as it finishes and return the result of first request promise 
            const firstResolved = await Promise.race(requests.map(p => p.then(data => ({ resolved: true, data })).catch(error => ({ resolved: false, error })))) as any ;
            const newListingFirst = firstResolved.data;
            this.index++;
            if (newListingFirst.title !== this.LatestListing.title) {
                this.newListingAlert(newListingFirst)
                continue;
            }
            // this will process the unfinished promise , and check if there is any change in the new announcnments 
            const [_, ...restResolved] = await Promise.allSettled(requests);
            const newListingSecond = restResolved[0].status === 'fulfilled' ? restResolved[0].value : null;
        
            if (newListingSecond && newListingSecond.title !== this.LatestListing.title) {
                this.newListingAlert(newListingFirst)
            }
        }
    }

    async runIdMode(){
        let latestAnnouncementId = 4451
        while(true){
            const requests = Array(20).fill(null).map(() => this.IDModeRequests.getNews(latestAnnouncementId));
            // Process the first response as soon as it finishes and return the result of first request promise 
            const firstResolved = await Promise.race(requests.map(p => p.then(data => ({ resolved: true, data })) .catch(error => ({ resolved: false, error })))) as { resolved: boolean, data?: any, error?: any };

            if (!firstResolved.resolved) {
                Utils.log("Request failed: " + JSON.stringify(firstResolved.error));
                continue;
            }
        
            if(firstResolved.data.success === false){
                Utils.log("No update yet on the next Id " + JSON.stringify((firstResolved.data)));
                continue;
            }else if(firstResolved.data.title ){
                Utils.log('New Listing Found : ' + JSON.stringify(firstResolved.data) + " Response Time : " + firstResolved.data.delay + " MS" + " || skipBypass : " + firstResolved.data.skipBypass + " || Cache Status : " + firstResolved.data.cacheStatus  , 'success')
                const params = DiscordHelpers.buildWebhookParams(firstResolved.data,"IDMode");
                DiscordHelpers.sendWebhook(this.Config.DiscordWebhook, params);
                latestAnnouncementId++
            }
            await Utils.sleep(100)
        }
    }

    getConfig(){
        const myConfig = JSON.parse(fs.readFileSync(process.cwd() + "\\JDatabase\\Config.json",'utf-8'));
        return myConfig
    }

    newListingAlert(newListingSecond : IFrontendRequest ){
        this.LatestListing = newListingSecond;
        if(this.index ===1) return
        Utils.log('New Listing Found : ' + this.LatestListing.title)
        const params = DiscordHelpers.buildWebhookParams(this.LatestListing);
        DiscordHelpers.sendWebhook(this.Config.DiscordWebhook, params);
    }


}
new Main().runFrontendMode()
new Main().runIdMode()