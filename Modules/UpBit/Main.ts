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
    latestAnnouncmentId = 0
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

    async runIdMode(latestAnnouncmentId : number ) {
        const longWait = 6000 * 60
        this.shuffleProxyOrder()
        while (true && latestAnnouncmentId) {
            try {
                // Process the first response as soon as it finishes and return the result of first request promise 
                const firstResolved = await this.IDModeRequests.getNews(latestAnnouncmentId) as any
                if (firstResolved.success === false) {
                    Utils.log("No update yet on the next Id " + JSON.stringify((firstResolved)));
                } else if (firstResolved.title) {
                    Utils.log('New Listing Found Using **ID!** Request : ' + JSON.stringify(firstResolved) + " Announcment Id : " + latestAnnouncmentId, 'success')
                    this.newListingAlert(firstResolved, "IDMode")
                    latestAnnouncmentId++
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
        let latestData = ''
        let index = 0
        while (true) {
            try {
                const response = await this.TradisRequest.getNews();
                if (index === 0) latestData = response
                if (JSON.stringify(response) !== JSON.stringify(latestData)) {
                    latestData = response
                    Utils.log('New Listing Found Using **TRADIS!** Request : ' + response, 'success')
                    this.newListingAlert(response, "Tradis")
                }
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
        const params = DiscordHelpers.buildWebhookParamsForNews(newListingSecond as any, { Website: "Upbit", Mode: Mode });
        DiscordHelpers.sendWebhook(this.Config.DiscordWebhook, params);
    }
}

const main = new Main()
main.runFrontendMode()
Utils.sleep(2000).then(async () => {
    const requests = await new Main().FrontendRequests.getNews()
    const  latestAnnouncmentId = requests.id+1
    main.runIdMode(latestAnnouncmentId)
    main.runTradisRequest()
})