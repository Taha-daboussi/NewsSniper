import { DiscordHelpers } from "./Helpers/DiscordHelpers";
import { Utils } from "./Helpers/Utils";
import { GoClient } from "./HttpClient/GoClient";
import { MainHelper } from "./MainHelper";
import { FrontendRequests } from "./Requests/FrontendRequest";
import fs from 'fs'
export class Main extends MainHelper {
    GoClient = new GoClient()
    FrontendRequests = new FrontendRequests(this)
    LatestListing = {} as any 
    index = 0
    Config = this.getConfig();
    async run(){
        while(true){
            const latestListData = await this.FrontendRequests.run()
            if(this.LatestListing.title != latestListData.title){
                this.index++
                this.LatestListing = latestListData
                // skipping the first iteration ( since it will be already an empty LatestListingData )
                if(this.index === 1)continue
                const params = DiscordHelpers.buildWebhookParams(this.LatestListing);
                DiscordHelpers.sendWebhook(this.Config.DiscordWebhook,params)
            }
            await Utils.sleep(100)
        }
    }

    getConfig(){
        const myConfig = JSON.parse(fs.readFileSync(process.cwd() + "\\JDatabase\\Config.json",'utf-8'));
        return myConfig
    }
}
// new Main().run()