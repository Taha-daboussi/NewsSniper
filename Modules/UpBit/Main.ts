import { DiscordHelpers } from "../../Helpers/DiscordHelpers";
import { Utils } from "../../Helpers/Utils";
import { GoClient } from "../../HttpClient/GoClient";
import { MainHelper } from "./MainHelper";
import { FrontendRequests, IFrontendRequest } from "./Requests/FrontendRequest";
import fs from 'fs'
import { IDModeRequests } from "./Requests/IDModeRequest";
import path from "path";
export class Main extends MainHelper {
    GoClient = new GoClient()
    FrontendRequests = new FrontendRequests(this)
    IDModeRequests = new IDModeRequests(this)
    LatestListing = {} as any
    Config = this.getConfig();
    index = 0

    async runFrontendMode() {
        this.shuffleProxyOrder()
        while (true) {
            try {
                const requests = await this.FrontendRequests.getNews();
                // Process the first response as soon as it finishes and return the result of first request promise 
                const newListingFirst = requests;
                this.index++;
                if (newListingFirst && newListingFirst.title && newListingFirst.title.toLowerCase().trim() !== this.LatestListing?.title?.toLowerCase().trim()) {
                    Utils.log('New Listing Found Using **FRONTEND!** Request : ' + JSON.stringify(newListingFirst), 'success')
                    this.newListingAlert(newListingFirst)
                }
                Utils.sleep(100)
            } catch (err) {
                Utils.log("Error In Monitor Frontend Mode" + err, 'error')
                await Utils.sleep(200)
            }
        }
    }

    async runIdMode() {
        let latestAnnouncementId = 4459
        const longWait = 6000 * 60
        this.shuffleProxyOrder()
        while (true) {
            try {
                // Process the first response as soon as it finishes and return the result of first request promise 
                const firstResolved = await this.IDModeRequests.getNews(latestAnnouncementId) as any
                if (firstResolved.success === false) {
                    Utils.log("No update yet on the next Id " + JSON.stringify((firstResolved)));
                } else if (firstResolved.title) {
                    Utils.log('New Listing Found Using **ID!** Request : ' + JSON.stringify(firstResolved) + " Announcment Id : " + latestAnnouncementId, 'success')
                    const params = DiscordHelpers.buildWebhookParams(firstResolved, {Website : "Upbit",Mode : "IDMode"});
                    DiscordHelpers.sendWebhook(this.Config.DiscordWebhook, params);
                    latestAnnouncementId++
                    await Utils.sleep(longWait)
                    continue;
                } else {
                    Utils.log('Failing to get Id Mode Response , Sleeping 30 Seconds ', 'error')
                    await Utils.sleep(longWait)
                    continue;
                }
                await Utils.sleep(500)
            } catch (err) {
                Utils.log("Error In Monitor ID Mode" + err, 'error')
                await Utils.sleep(200)
            }
        }
    }

    getConfig() {
        const rootDir = path.resolve(__dirname, "../../");

        // Construct the path to 'logs.txt' in the root directory
        const logFilePath = path.join(rootDir, 'JDatabase\\Config.json');
        const myConfig = JSON.parse(fs.readFileSync(logFilePath, 'utf-8'));
        return myConfig
    }

    newListingAlert(newListingSecond: IFrontendRequest) {
        Utils.log('New Listing Found : '  + JSON.stringify(newListingSecond) + " OLD Listing : " + JSON.stringify(this.LatestListing)   + " Is Equal " + (this.LatestListing.title === newListingSecond) , 'success')

        this.LatestListing = newListingSecond;
        if (this.index === 1 || !this.LatestListing) return
        const params = DiscordHelpers.buildWebhookParams(this.LatestListing, {Website : "Upbit",Mode : "IDMode"});
        DiscordHelpers.sendWebhook(this.Config.DiscordWebhook, params);
    }
}
new Main().runFrontendMode()
Utils.sleep(200).then(() => {
    new Main().runIdMode()

})