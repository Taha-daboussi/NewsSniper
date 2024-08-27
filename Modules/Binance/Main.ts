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
        while (true) {
            let index = 0
            const latestAnnouncementId = await this.FrontendRequest.run()
            index++;
            if (index === 1) continue;
            if (latestAnnouncementId.title && latestAnnouncementId !== this.latestAnnouncmentId) {
                Utils.log('New Listing Found : ' + JSON.stringify(latestAnnouncementId), 'success')
                latestAnnouncementId.listed_at = latestAnnouncementId.releaseDate
                this.latestAnnouncmentId = latestAnnouncementId
                const myParas = DiscordHelpers.buildWebhookParams(latestAnnouncementId , {Mode : "Frontend" , Website : "Binance"});
                DiscordHelpers.sendWebhook(this.Config.BinanceWebhook, myParas, false)
            }
            await Utils.sleep(200)

        }
    }

    async backendMonitor() {
        let index = 0
        while (true) {
            const latestAnnouncementId = await this.BackendRequest.run();
            if(index ===0) this.latestAnnouncmentId = latestAnnouncementId.latestData
            index++;
            const data = this.compareArrays(this.latestAnnouncmentId || [], latestAnnouncementId.latestData)
            if (data.length > 0 && data[0].originalItem && data[0].newItem) {
                Utils.log('New Listing Found : ' + JSON.stringify(data), 'success')

                const webhookData  = {
                    ...data[0].newItem,
                    listed_at : data[0].newItem.releaseDate,
                    delay : latestAnnouncementId.delay,
                    cacheStatus : latestAnnouncementId.cacheStatus,
                    skipBypass : latestAnnouncementId.skipBypass
                }
                this.latestAnnouncmentId = latestAnnouncementId.latestData
                const myParas = DiscordHelpers.buildWebhookParams(webhookData , {Mode : "Backend" , Website : "Binance"});
                DiscordHelpers.sendWebhook(this.Config.BinanceWebhook, myParas, false)
            }
        }
    }



}
new Main().frontEndMonitor()
new Main().backendMonitor()