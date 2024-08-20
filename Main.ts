import { GoClient } from "./HttpClient/GoClient";
import { MainHelper } from "./MainHelper";
import { FrontendRequests } from "./Requests/FrontendRequest";

export class Main extends MainHelper {
    GoClient = new GoClient()
    FrontendRequests = new FrontendRequests(this)

    run(){
        this.FrontendRequests.run()
    }
}
new Main().run()