import { DiscordHelpers } from "./Helpers/DiscordHelpers";
import { Utils } from "./Helpers/Utils";
import { GoClient } from "./HttpClient/GoClient";
import { MainHelper } from "./MainHelper";
import { FrontendRequests, IFrontendRequest } from "./Requests/FrontendRequest";
import fs from 'fs'
export class Main extends MainHelper {
    GoClient = new GoClient()
    FrontendRequests = new FrontendRequests(this)
    LatestListing = {} as any 
    Config = this.getConfig();
    index = 0
    async run(){

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
new Main().run()