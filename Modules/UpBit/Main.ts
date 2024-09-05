import { DiscordHelpers } from "../../Helpers/DiscordHelpers";
import { Utils } from "../../Helpers/Utils";
import { GoClient } from "../../HttpClient/GoClient";
import { MainHelper } from "./MainHelper";
import { FrontendRequests, IFrontendRequest } from "./Requests/FrontendRequest";
import fs from 'fs'
import { IDModeRequests } from "./Requests/IDModeRequest";
import path from "path";
import { EmeregencyEpRequest } from "./Requests/EmergencyEpRequest";
import { SearchRequest } from "./Requests/SearchRequest";
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

export class Main extends MainHelper {
    GoClient = new GoClient()
    FrontendRequests = new FrontendRequests(this);
    IDModeRequests = new IDModeRequests(this);
    EmergencyEpRequests = new EmeregencyEpRequest(this);
    SearchRequest = new SearchRequest(this);
    LatestListing = {} as any

    Config = this.getConfig();
    index = 0
    latestAnnouncmentId = 0
    sentData = [] as any 
    async runFrontendMode() {
        let LatestListing
        this.shuffleProxyOrder()
        let index = 0 
        while (true) {
            try {
                const requests = await Promise.race(Array.from({ length: 1 }, () => this.FrontendRequests.getNews()));
                // Process the first response as soon as it finishes and return the result of first request promise 
                const newListingFirst = requests;
                index++;
                if (newListingFirst && newListingFirst.title && newListingFirst.title !== LatestListing?.title) {
                    LatestListing = newListingFirst
                    if (index === 1 || !newListingFirst) continue
                    Utils.log('New Listing Found : ' + JSON.stringify(newListingFirst) + " OLD Listing : " + JSON.stringify(LatestListing) + " Is Equal " + (LatestListing.title === newListingFirst), 'success')
                    this.newListingAlert(newListingFirst, "Frontend")
                }
                Utils.sleep(100)
            } catch (err) {
                Utils.log("Error In Monitor Frontend Mode" + err, 'error')
                await Utils.sleep(200)
            }
        }
    }

    async runEmergencyEpRequests() {
        this.shuffleProxyOrder()
        let LatestListing 
        let index = 0
        while (true) {
            try {
                const requests = await Promise.race(Array.from({ length: 1 }, () => this.EmergencyEpRequests.getNews()));
                // Process the first response as soon as it finishes and return the result of first request promise 
                const newListingFirst = requests;
                index++;
                if (newListingFirst && newListingFirst.title && newListingFirst.title !== LatestListing?.title) {
                    LatestListing = newListingFirst
                    if (index === 1 || !newListingFirst) continue
                    Utils.log('New Listing Found  **Emergency** : ' + JSON.stringify(newListingFirst) + " OLD Listing : " + JSON.stringify(LatestListing) + " Is Equal " + (LatestListing.title === newListingFirst), 'success')
                    this.newListingAlert(newListingFirst, "Emergency")
                }
                Utils.sleep(300)
            } catch (err) {
                Utils.log("Error In Monitor Emergency Mode" + err, 'error')
                await Utils.sleep(200)
            }
        }
    }

    async runSearchRequest() {
        let LatestListing;
        let index = 0
        this.shuffleProxyOrder()
        while (true) {
            try {
                const requests = await Promise.race(Array.from({ length: 1 }, () => this.SearchRequest.getNews()));
                // Process the first response as soon as it finishes and return the result of first request promise 
                const newListingFirst = requests;
                index++;
                if (newListingFirst && newListingFirst.title && newListingFirst.title !== LatestListing?.title) {
                    LatestListing = newListingFirst
                    if (index === 1 || !newListingFirst) continue
                    Utils.log('New Listing Found  **Search** : ' + JSON.stringify(newListingFirst) + " OLD Listing : " + JSON.stringify(LatestListing) + " Is Equal " + (LatestListing.title === newListingFirst), 'success')
                    this.newListingAlert(newListingFirst, "Search")
                }
                Utils.sleep(300)
            } catch (err) {
                Utils.log("Error In Monitor Emerhecyn Mode" + err, 'error')
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


    getConfig() {
        const rootDir = path.resolve(__dirname, "../../");
        // Construct the path to 'logs.txt' in the root directory
        const logFilePath = path.join(rootDir, 'JDatabase\\Config.json');
        const myConfig = JSON.parse(fs.readFileSync(logFilePath, 'utf-8'));
        return myConfig
    }

    newListingAlert(newListingSecond: IFrontendRequest, Mode: "Frontend" | "Tradis" | "IDMode" | "Emergency" | "Search") {
        const params = DiscordHelpers.buildWebhookParamsForNews(newListingSecond as any, { Website: "Upbit", Mode: Mode });
        if(this.sentData.includes(newListingSecond)) {
            Utils.log('Already sent a webhook') ; 
            return ; 
        } 
        this.sentData.push(newListingSecond)
        DiscordHelpers.sendWebhook(this.Config.DiscordWebhook, params);
    }
}

const main = new Main();

// Wait until it's 9pm in Tokyo

main.runFrontendMode();
Utils.sleep(2000).then(async res=>{
    const requests = await new Main().FrontendRequests.getNews();
    if (requests && requests.id) {
        const latestAnnouncmentId = requests.id + 1;
        main.runIdMode(latestAnnouncmentId);
        main.runEmergencyEpRequests();
        main.runSearchRequest()
    }
})
   
