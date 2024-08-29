import { Utils } from "../../../Helpers/Utils";
import { Main } from "../Main";

export class BackendRequest {
    Main: Main;
    LatestCategoriesNews = []
    constructor(Main: Main) {
        this.Main = Main;
    }
    async run(pageSize : number ): Promise<any> {
        Utils.log('Getting **BACKEND** Request for binance ', 'pending');
        const headers = {
            Connection: 'keep-alive',
            'sec-ch-ua': '"Not)A;Brand";v="99", "Google Chrome";v="127", "Chromium";v="127"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'Upgrade-Insecure-Requests': '1',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-User': '?1',
            'Sec-Fetch-Dest': 'document',
            'Accept-Encoding': 'gzip, deflate, br, zstd',
            'Accept-Language': 'en-US,en;q=0.9'
        }
        const url = 'https://www.binance.com/bapi/composite/v1/public/cms/article/list/query?type=1&pageNo=1&pageSize=' + pageSize;
        const payload = {
            Url: url,
            method: "GET",
            headers
        };

        try {
            const startTime = Date.now();  // Record the start time

            const response = await this.Main.GoClient.sendRequest(payload).catch(err => {
                throw new Error(err);
            });
            const endTime = Date.now();  // Record the end time


            if (response && response.body) {
                if (response.body?.data?.catalogs) {
                    Utils.log('Binance Announcments fetched successfully', 'success');
                    const myData = response.body.data.catalogs.map((res : any )=>{
                        return res.articles[0]
                    })
                    return { latestData  : myData, delay: endTime - startTime, cacheStatus: response.headers["X-Cache"], skipBypass: false }
                }
            }

            throw new Error('Error while fetching Binance Announcments');
        } catch (err) {
            // Utils.log('Error while fetching Binance Announcments' + err, "error");
        }
    }



}