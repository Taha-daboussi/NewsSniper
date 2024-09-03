import axios from 'axios'
import { Main } from './Modules/UpBit/Main';
// Function to measure response time
async function benchmarkAPI(url : string , requests = 10) {
    const responseTimes = [];

    for (let i = 0; i < requests; i++) {
        const startTime = Date.now(); // Start time

        try {
            const response : any  = await  new Main().FrontendRequests.getNews() // Make the request
            const endTime = Date.now(); // End time

            const duration = endTime - startTime; // Calculate response time
            responseTimes.push(duration);
            console.log(`Request ${i + 1}: ${duration} ms - Status: ${response.status}`);
        } catch (err : any ) {
            console.error(`Request ${i + 1} failed: ${err.message}`);
        }
    }

    // Calculate average response time
    const totalTime = responseTimes.reduce((acc, time) => acc + time, 0);
    const averageTime = totalTime / responseTimes.length;

    console.log('\nBenchmark Results:');
    console.log(`Total Requests: ${requests}`);
    console.log(`Successful Requests: ${responseTimes.length}`);
    console.log(`Average Response Time: ${averageTime.toFixed(2)} ms`);
    console.log(`Min Response Time: ${Math.min(...responseTimes)} ms`);
    console.log(`Max Response Time: ${Math.max(...responseTimes)} ms`);
    process.exit()
    return ;
}

// Upbit API URL
const url = 'https://api.tardis.dev/v1/exchanges/upbit';

// Run benchmark with 10 requests
benchmarkAPI(url, 100);
