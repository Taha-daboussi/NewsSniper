import { DiscordHelpers } from "../../Helpers/DiscordHelpers";
import { Utils } from "../../Helpers/Utils";
import { GoClient } from "../../HttpClient/GoClient";
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

    async runFrontendMode() {
        this.shuffleProxyOrder()
        while (true) {
            try {
                const requests = [this.FrontendRequests.getNews(), this.FrontendRequests.getNews(true)];
                // Process the first response as soon as it finishes and return the result of first request promise 
                const firstResolved = await Promise.race(requests.map(p => p.then(data => ({ resolved: true, data })).catch(error => ({ resolved: false, error })))) as any;
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
                Utils.sleep(200)
            } catch (err) {
                Utils.log("Error In Monitor Frontend Mode" + err, 'error')
                await Utils.sleep(200)
            }
        }
    }

    async runIdMode() {
        let latestAnnouncementId = 4451
        const longWait = 6000 * 30
        this.shuffleProxyOrder()
        while (true) {
            try {
                // Process the first response as soon as it finishes and return the result of first request promise 
                const firstResolved = await this.IDModeRequests.getNews(latestAnnouncementId) as any
                if (firstResolved.success === false) {
                    Utils.log("No update yet on the next Id " + JSON.stringify((firstResolved)));
                } else if (firstResolved.title) {
                    Utils.log('New Listing Found : ' + firstResolved.title + " Announcment Id : " + latestAnnouncementId + " Sleeping 30 Seconds", 'success')
                    const params = DiscordHelpers.buildWebhookParams(firstResolved, "IDMode");
                    DiscordHelpers.sendWebhook(this.Config.DiscordWebhook, params);
                    latestAnnouncementId++
                    await Utils.sleep(longWait)
                    continue;
                } else {
                    Utils.log('Failing to get Id Mode Response , Sleeping 30 Seconds ', 'error')
                    await Utils.sleep(longWait)
                    continue;
                }
                await Utils.sleep(200)
            } catch (err) {
                Utils.log("Error In Monitor ID Mode" + err, 'error')
                await Utils.sleep(200)
            }
        }
    }

    getConfig() {
        const myConfig = JSON.parse(fs.readFileSync(process.cwd() + "\\JDatabase\\Config.json", 'utf-8'));
        return myConfig
    }

    newListingAlert(newListingSecond: IFrontendRequest) {
        this.LatestListing = newListingSecond;
        if (this.index === 1 || !this.LatestListing) return
        Utils.log('New Listing Found : ' + this.LatestListing.title)
        const params = DiscordHelpers.buildWebhookParams(this.LatestListing);
        DiscordHelpers.sendWebhook(this.Config.DiscordWebhook, params);
    }
}
new Main().runFrontendMode()
// Utils.sleep(200).then(() => {
//     new Main().runIdMode()

// })