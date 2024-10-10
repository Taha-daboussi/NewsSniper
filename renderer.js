document.getElementById('encryptButton').addEventListener('click', async () => {
    console.log("Encrypting...");
});

document.getElementById('requestDataButton').addEventListener('click', async () => {
    // Add logic if needed
});

window.electronAPI.onInitData(async (data) => {
    console.log('Received init data from main process:', JSON.stringify(data));
    try {
        // const pointData = '{"totalPointsEarned":161900.12,"basePoints":161900,"multiplierPoints":0.12,"fingers_thrown":250}';
        // const authToken = "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7Im5hbWUiOiJCbGFja2VuIiwicHJvdmlkZXJBY2NvdW50SWQiOiIxMjk5Mjk1NjI4NzMyODg3MDQxIiwiaWQiOiI2NmU5NDA5MThjMWFiMTVkOTU0MWJkNjgifSwiaWF0IjoxNzI4NTU2OTM0LCJleHAiOjE3Mjg2NDMzMzR9.-7vL_m6Nxf79tQUv3pcDIoaBDKG6Lu4ELEAHr62IFh7k3h3cXq7I0r29MmEn2tv2aPHUgmVthG42uGa7n4KAIA";
        const domain = 'https://api.unfk.com';

        const encryptedData = await window.cryptoUtils.Dw(JSON.stringify(data.pointData), data.authToken, domain);
        console.log('Encrypted Data:', encryptedData);
        window.electronAPI.requestData(encryptedData);
    } catch (error) {
        console.log('Encryption failed:', error);
    }
});

window.electronAPI.onResponseData((data) => {
    console.log('Received data from main process:', data);
});