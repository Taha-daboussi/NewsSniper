import path from "path";
import { DiscordHelpers } from "../../Helpers/DiscordHelpers";
import { Utils } from "../../Helpers/Utils";
import { GoClient } from "../../HttpClient/GoClient";
import { MainHelper } from "../UpBit/MainHelper";
import { FrontendRequest } from "./Requests/FrontendRequest";
import fs from 'fs'
import { BackendRequest } from "./Requests/BackendRequest";
export class Main extends MainHelper {
    GoClient = new GoClient()
    FrontendRequest = new FrontendRequest(this);
    BackendRequest = new BackendRequest(this);
    index = 0
    latestAnnouncmentId: any;
    Config = this.getConfig();

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
                const myParas = DiscordHelpers.buildWebhookParams(latestAnnouncementId);
                DiscordHelpers.sendWebhook(this.Config.DiscordWebhook, myParas, false)
            }
            await Utils.sleep(200)

        }
    }

    async backendMonitor() {
        let index = 0
        while (true) {
            const latestAnnouncementId = await this.BackendRequest.run();
            index++;
            if (index === 1) continue;
            if (latestAnnouncementId.title && latestAnnouncementId !== this.latestAnnouncmentId) {
                Utils.log('New Listing Found : ' + JSON.stringify(latestAnnouncementId), 'success')
                latestAnnouncementId.listed_at = latestAnnouncementId.releaseDate
                this.latestAnnouncmentId = latestAnnouncementId
                const myParas = DiscordHelpers.buildWebhookParams(latestAnnouncementId);
                DiscordHelpers.sendWebhook(this.Config.DiscordWebhook, myParas, false)
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



}
new Main().frontEndMonitor()
new Main().backendMonitor()