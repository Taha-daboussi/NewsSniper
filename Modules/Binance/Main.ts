import path from "path";
import { DiscordHelpers } from "../../Helpers/DiscordHelpers";
import { Utils } from "../../Helpers/Utils";
import { GoClient } from "../../HttpClient/GoClient";
import { MainHelpers } from "./MainHelpers";
import { FrontendRequest } from "./Requests/FrontendRequest";
import fs from 'fs'
import { BackendRequest } from "./Requests/BackendRequest";
export class Main extends MainHelpers {
    GoClient = new GoClient()
    FrontendRequest = new FrontendRequest(this);
    BackendRequest = new BackendRequest(this);
    index = 0
    latestAnnouncmentId: any;

    async frontEndMonitor() {
        let index = 0

        while (true) {
            try {
                const latestAnnouncementId = await this.FrontendRequest.run()
                if (index === 0) this.latestAnnouncmentId = latestAnnouncementId
                
                if(!latestAnnouncementId  ||  !this.latestAnnouncmentId || !latestAnnouncementId.title ||this.latestAnnouncmentId.title)continue

                if (latestAnnouncementId  && this.latestAnnouncmentId && latestAnnouncementId.title && latestAnnouncementId.title !== this.latestAnnouncmentId.title) {
                    Utils.log('New Listing Found Using **FRONTEND!** Request : ' + JSON.stringify(latestAnnouncementId), 'success')
                    latestAnnouncementId.listed_at = latestAnnouncementId.releaseDate
                    this.latestAnnouncmentId = latestAnnouncementId
                    const myParas = DiscordHelpers.buildWebhookParams(latestAnnouncementId, { Mode: "Frontend", Website: "Binance" });
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
        while (true) {
            try {
                const latestAnnouncementId = await this.BackendRequest.run();
                if (!latestAnnouncementId || !latestAnnouncementId.latestData) continue

                if (index === 0) this.latestAnnouncmentId = latestAnnouncementId.latestData
                index++;
                const data = this.compareArrays(this.latestAnnouncmentId || [], latestAnnouncementId.latestData)
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
                        this.latestAnnouncmentId = latestAnnouncementId.latestData
                        const myParas = DiscordHelpers.buildWebhookParams(webhookData, { Mode: "Backend", Website: "Binance" });
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