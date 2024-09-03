import { DiscordHelpers } from "../../Helpers/DiscordHelpers";
import { Utils } from "../../Helpers/Utils";
import { GoClient } from "../../HttpClient/GoClient";
import { MainHelper } from "./MainHelper";
import { FrontendRequests, IFrontendRequest } from "./Requests/FrontendRequest";
import fs from 'fs'
import { IDModeRequests } from "./Requests/IDModeRequest";
import path from "path";
import { TradisRequest } from "./Requests/TradisRequest";
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

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
                const requests = await Promise.race(Array.from({ length: 2 }, () => this.FrontendRequests.getNews()));
                // Process the first response as soon as it finishes and return the result of first request promise 
                const newListingFirst = requests;
                this.index++;
                if (newListingFirst && newListingFirst.title && newListingFirst.title !== this.LatestListing?.title) {
                    this.LatestListing = newListingFirst
                    if (this.index === 1 || !newListingFirst) continue
                    Utils.log('New Listing Found : ' + JSON.stringify(newListingFirst) + " OLD Listing : " + JSON.stringify(this.LatestListing) + " Is Equal " + (this.LatestListing.title === newListingFirst), 'success')
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
                
                const firstResolved = await Promise.race(Array.from({ length: 1 }, () => this.IDModeRequests.getNews(latestAnnouncmentId)));
                if (firstResolved && firstResolved.success === false) {
                    Utils.log("No update yet on the next Id " + JSON.stringify((firstResolved)));
                } else if (firstResolved && firstResolved.title) {
                    Utils.log('New Listing Found Using **ID!** Request : ' + JSON.stringify(firstResolved) + " Announcment Id : " + latestAnnouncmentId, 'success')
                    this.newListingAlert(firstResolved, "IDMode")
                    latestAnnouncmentId++
                    await Utils.sleep(longWait)
                    continue;
                } else {
                    Utils.log('Failed to get Id Mode Response , Sleeping 30 Seconds ', 'error')
                    await Utils.sleep(longWait)
                    continue;
                }
                await Utils.sleep(200)
            } catch (err) {
                Utils.log("Error In Monitor ID Mode" + err, 'error')
                await Utils.sleep(longWait)
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

const main = new Main();

// Calculate the time until 9pm in Tokyo
const tokyoTime = new Date().toLocaleString("en-US", { timeZone: "Asia/Tokyo" });
const targetTime = new Date(tokyoTime);
targetTime.setHours(21, 0, 0, 0);
const timeUntilLaunch = targetTime.getTime() - Date.now();

// Wait until it's 9pm in Tokyo
setTimeout(async () => {
    main.runFrontendMode();
    await Utils.sleep(2000);
    const requests = await new Main().FrontendRequests.getNews();
    if (requests && requests.id) {
        const latestAnnouncmentId = requests.id + 1;
        main.runIdMode(latestAnnouncmentId);
    }
}, timeUntilLaunch);