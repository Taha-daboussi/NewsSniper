import { FrontendRequests } from '../Requests/FrontendRequest';
import { Main } from '../Main';
import { Utils } from "../../../Helpers/Utils";

async function benchmarkRequests() {
    const mainInstance = new Main(); // Assuming you have a Main class instance ready
    const frontendRequests = new FrontendRequests(mainInstance);

    const benchmarkResults: Record<string, number[]> = {
        web: [],
        ios: [],
        android: []
    };

    const iterations = 200;
    let DateMedian = 0
    for (let i = 0; i < iterations; i++) {
        i %50 == 0 ? Utils.log(`Benchmark iteration ${i + 1} of ${iterations}`, 'info') : ''
        
        const results = await frontendRequests.getNews();
        DateMedian= DateMedian + Number(results.delay)
        await Utils.sleep(100)
       
    }
    Utils.log('BenchmarkMedia : ' + DateMedian/iterations)

}

// Run the benchmark
benchmarkRequests().then(() => {
    Utils.log('Benchmarking completed.', 'success');
    process.exit()
}).catch(err => {
    Utils.log(`Benchmarking failed: ${err.message}`, 'error');
});
