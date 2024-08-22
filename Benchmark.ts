import { FrontendRequests } from './Requests/FrontendRequest';
import { Main } from './Main';
import { Utils } from "./Helpers/Utils";

async function benchmarkRequests() {
    const mainInstance = new Main(); // Assuming you have a Main class instance ready
    const frontendRequests = new FrontendRequests(mainInstance);

    const benchmarkResults: Record<string, number[]> = {
        web: [],
        ios: [],
        android: []
    };

    const iterations = 200;

    for (let i = 0; i < iterations; i++) {
        Utils.log(`Benchmark iteration ${i + 1} of ${iterations}`, 'info');
        
        const results = await frontendRequests.getNews();

        // results.forEach((result:any) => {
        //     if (result) {
        //         // result.delay contains the request duration in milliseconds
        //         benchmarkResults[result.os].push(result.delay);
        //     }
        // });
        // await Utils.sleep(2000)
    }

    // Calculate average times for each os
    const averageTimes = Object.keys(benchmarkResults).reduce((acc, os) => {
        const times = benchmarkResults[os];
        const average = times.reduce((sum, time) => sum + time, 0) / times.length;
        acc[os] = average;
        return acc;
    }, {} as Record<string, number>);

    Utils.log('Benchmark Results:', 'info');
    Utils.log(`Average time for web: ${averageTimes['web']} ms`, 'info');
    Utils.log(`Average time for ios: ${averageTimes['ios']} ms`, 'info');
    Utils.log(`Average time for android: ${averageTimes['android']} ms`, 'info');
}

// Run the benchmark
benchmarkRequests().then(() => {
    Utils.log('Benchmarking completed.', 'success');
}).catch(err => {
    Utils.log(`Benchmarking failed: ${err.message}`, 'error');
});
