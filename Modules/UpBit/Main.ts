import { DiscordHelpers } from "../../Helpers/DiscordHelpers";
import { Utils } from "../../Helpers/Utils";
import { GoClient } from "../../HttpClient/GoClient";
import { MainHelper } from "./MainHelper";
import { FrontendRequests, IFrontendRequest } from "./Requests/FrontendRequest";
import fs from 'fs'
import { IDModeRequests } from "./Requests/IDModeRequest";
import path from "path";
import { TradisRequest } from "./Requests/TradisRequest";
export class Main extends MainHelper {
    GoClient = new GoClient()
    FrontendRequests = new FrontendRequests(this)
    IDModeRequests = new IDModeRequests(this)
    TradisRequest = new TradisRequest(this)
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
                if (newListingFirst && newListingFirst.title && newListingFirst.title !== this.LatestListing?.title) {
                    this.LatestListing = newListingFirst
                    Utils.log('New Listing Found : ' + JSON.stringify(newListingFirst) + " OLD Listing : " + JSON.stringify(this.LatestListing) + " Is Equal " + (this.LatestListing.title === newListingFirst), 'success')
                    if (this.index === 1 || !newListingFirst) continue

                    this.newListingAlert(newListingFirst, "Frontend")
                }
                Utils.sleep(100)
            } catch (err) {
                Utils.log("Error In Monitor Frontend Mode" + err, 'error')
                await Utils.sleep(200)
            }
        }
    }

    async runIdMode() {
        let latestAnnouncementId = 4462
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
                    const params = DiscordHelpers.buildWebhookParams(firstResolved, { Website: "Upbit", Mode: "IDMode" });
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

    async runTradisRequest() {
        let latestCoin = ''
        let index = 0
        while (true) {
            try {
                const response = await this.TradisRequest.getNews();
                if (index === 0) latestCoin = response.id
                if (response !== latestCoin) {
                    latestCoin = response
                    Utils.log('New Listing Found Using **TRADIS!** Request : ' + response, 'success')
                    this.newListingAlert(response, "Tradis")
                }
                await Utils.sleep(100)
            } catch (err) {
                Utils.log("Error In Monitor Tradis Request" + err, 'error')
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

    newListingAlert(newListingSecond: IFrontendRequest, Mode: "Frontend" | "Tradis" | "IDMode") {
        const params = DiscordHelpers.buildWebhookParams(newListingSecond as any, { Website: "Upbit", Mode: Mode });
        DiscordHelpers.sendWebhook(this.Config.DiscordWebhook, params);
    }
}
new Main().runFrontendMode()
Utils.sleep(200).then(() => {
    // new Main().runIdMode()
    // new Main().runTradisRequest()
})