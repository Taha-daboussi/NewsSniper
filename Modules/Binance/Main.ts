import path from "path";
import { DiscordHelpers } from "../../Helpers/DiscordHelpers";
import { Utils } from "../../Helpers/Utils";
import { GoClient } from "../../HttpClient/GoClient";
import { MainHelper } from "../UpBit/MainHelper";
import { FrontendRequest } from "./Requests/FrontendRequest";
import fs from 'fs'
export class Main extends MainHelper {
    GoClient = new GoClient()
    FrontendRequest = new FrontendRequest(this);
    index = 0
    latestAnnouncmentId: any;
    Config = this.getConfig();

    async run() {
        while(true) {
        const latestAnnouncementId = await this.FrontendRequest.run()
        this.index++;
        if(this.index === 1 ) continue;
        if(latestAnnouncementId.title && latestAnnouncementId !== this.latestAnnouncmentId) {
            Utils.log('New Listing Found : ' + JSON.stringify(latestAnnouncementId) , 'success')
            latestAnnouncementId.listed_at = latestAnnouncementId.releaseDate 
            this.latestAnnouncmentId = latestAnnouncementId
            const myParas = DiscordHelpers.buildWebhookParams(latestAnnouncementId);
            DiscordHelpers.sendWebhook(this.Config.DiscordWebhook, myParas, false)
        }
        await Utils.sleep(200)

    }
    }

    getConfig() {
        const rootDir = path.resolve(__dirname,"../../");

        // Construct the path to 'logs.txt' in the root directory
        const logFilePath = path.join(rootDir, 'JDatabase\\Config.json');
        const myConfig = JSON.parse(fs.readFileSync(logFilePath, 'utf-8'));
        return myConfig
    }



}
new Main().run()