import path from "path";
import { DiscordHelpers } from "../../Helpers/DiscordHelpers";
import { Utils } from "../../Helpers/Utils";
import { GoClient } from "../../HttpClient/GoClient";
import { MainHelpers } from "./MainHelpers";
import { FrontendRequest } from "./Requests/FrontendRequest";
import { BackendRequest } from "./Requests/BackendRequest";
// process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

export class Main extends MainHelpers {
    GoClient = new GoClient()
    FrontendRequest = new FrontendRequest(this);
    BackendRequest = new BackendRequest(this);
    index = 0

    async frontEndMonitor() {
        let index = 0
        let oldLatestAnnouncmentData
        while (true) {
            try {
                const latestAnnouncementData = await this.FrontendRequest.run()

                if (index === 0) oldLatestAnnouncmentData = latestAnnouncementData

                if (!latestAnnouncementData || !oldLatestAnnouncmentData || !latestAnnouncementData.title || !oldLatestAnnouncmentData.title){
                     Utils.log('Failed to get the latest Announcment Data' , 'error')
                     continue;
                }

                if (latestAnnouncementData && oldLatestAnnouncmentData && latestAnnouncementData.title && latestAnnouncementData.title !== oldLatestAnnouncmentData.title) {
                    Utils.log('New Listing Found Using **FRONTEND!** Request : ' + JSON.stringify(latestAnnouncementData), 'success')
                    latestAnnouncementData.listed_at = latestAnnouncementData.releaseDate
                    oldLatestAnnouncmentData = latestAnnouncementData
                    const myParas = DiscordHelpers.buildWebhookParamsForNews(latestAnnouncementData, { Mode: "Frontend", Website: "Binance" });
                    DiscordHelpers.sendWebhook(this.Config.BinanceWebhook, myParas, false)
                }
                index++;

                await Utils.sleep(100)
            } catch (err) {
                Utils.log("Error In Monitor Frontend Mode" + err, 'error')
                continue;
            }

        }
    }

    async backendMonitor() {
        let index = 0
        let pageSize = 1
        let oldLatestAnnouncmentData

        while (true) {
            try {
                const latestAnnouncementId = await this.BackendRequest.run(pageSize);
                pageSize === 3 ? pageSize = 1 : pageSize++

                if (!latestAnnouncementId || !latestAnnouncementId.latestData) continue

                if (index === 0) oldLatestAnnouncmentData = latestAnnouncementId.latestData
                index++;
                const data = this.compareArrays(oldLatestAnnouncmentData || [], latestAnnouncementId.latestData)
                for (const dataItem of data) {
                    if (dataItem.originalItem && dataItem.newItem) {
                        Utils.log('New Listing Found Using **BACKEND!** Request : ' + JSON.stringify(dataItem), 'success')

                        const webhookData = {
                            ...dataItem.newItem,
                            listed_at: dataItem.newItem.releaseDate,
                            delay: latestAnnouncementId.delay,
                            cacheStatus: latestAnnouncementId.cacheStatus,
                            skipBypass: latestAnnouncementId.skipBypass
                        }
                        oldLatestAnnouncmentData = latestAnnouncementId.latestData
                        const myParas = DiscordHelpers.buildWebhookParamsForNews(webhookData, { Mode: "Backend", Website: "Binance" });
                        DiscordHelpers.sendWebhook(this.Config.BinanceWebhook, myParas, false)
                    }
                }

                await Utils.sleep(100)

            } catch (err) {
                Utils.log("Error In Monitor Backend Mode" + err, 'error')
                continue;
            }
        }
    }



}
new Main().frontEndMonitor()
// new Main().backendMonitor()