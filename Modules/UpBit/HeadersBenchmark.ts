import { IDModeRequests } from "./Requests/IDModeRequest";
import { Utils } from "../../Helpers/Utils";
import { Main } from "./Main";

const headersSets = [
    {
        name: "No Headers",
        headers: {}
    },
    {
        name: "Cache-Control",
        headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        }
    },
    {
        name: "User-Agent",
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
        }
    },
    {
        name: "High Priority",
        headers: {
            'X-MSMail-Priority': 'High',
            'Importance': 'High'
        }
    },
    {
        name: "Accept",
        headers: {
            'Accept': 'application/json'
        }
    },
    {
        name: "Accept-Language",
        headers: {
            'Accept-Language': 'en-US,en;q=0.9'
        }
    },
    {
        name: "Connection",
        headers: {
            'Connection': 'keep-alive'
        }
    },
    {
        name: "Bypass Cache",
        headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            'Surrogate-Control': 'no-store',
            'X-Accel-Expires': '0',
            'X-Cache-Bypass': '1'
        }
    },
    {
        name: "Combined",
        headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
            'Accept': 'application/json',
            'Accept-Language': 'en-US,en;q=0.9',
            'Connection': 'keep-alive',
            'Surrogate-Control': 'no-store',
            'X-Accel-Expires': '0',
            'X-Cache-Bypass': '1'
        }
    }
];

async function benchmarkHeaders() {
    const main = new Main();
    const idModeRequests = new IDModeRequests(main);
    const results = [];

    for (const headerSet of headersSets) {
        const times = [];
        for (let i = 0; i < 100; i++) {
            const start = Date.now();
            try {
                await idModeRequests.getNews(1, { headers: headerSet.headers });
            } catch (err) {
                Utils.log("Failed to get news", "error");
                // Handle error if needed
            }
            const end = Date.now();
            times.push(end - start);
            await Utils.sleep(100); // To avoid rate limiting
        }
        const averageTime = times.reduce((a, b) => a + b, 0) / times.length;
        results.push({ name: headerSet.name, averageTime });
    }

    return results;
}

async function runBenchmarks() {
    const aggregatedResults = {} as any ;

    for (let i = 0; i < 20; i++) {
        console.log(`Running benchmark iteration ${i + 1}`);
        const results = await benchmarkHeaders();
        results.forEach(result => {
            if (!aggregatedResults[result.name]) {
                aggregatedResults[result.name] = [];
            }
            aggregatedResults[result.name].push(result.averageTime);
        });
        if (i < 19) {
            console.log("Waiting for 1 minute before next iteration...");
            await Utils.sleep(60000); // 1 minute delay
        }
    }

    console.log("Aggregated Benchmark Results:");
    for (const [name, times] of Object.entries(aggregatedResults) as any ) {
        const total = times.reduce((a: any , b: any ) => a + b, 0);
        const average = total / times.length;
        console.log(`${name}: ${average} ms (over ${times.length} runs)`);
    }

    // Find the best header set
    const bestHeaderSet = Object.entries(aggregatedResults).reduce((best : any , current: any ) => {
        const [currentName, currentTimes] = current as any ;
        const currentAverage = currentTimes.reduce((a: any , b: any ) => a + b, 0) / currentTimes.length;
        if (!best || currentAverage < best.average) {
            return { name: currentName, average: currentAverage };
        }
        return best;
    }, null);

    console.log(`Best Header Set: ${bestHeaderSet.name} with an average time of ${bestHeaderSet.average} ms`);
}

runBenchmarks();