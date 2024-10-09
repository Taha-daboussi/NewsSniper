document.getElementById('encryptButton').addEventListener('click', async () => {
    const pointData = '{"totalPointsEarned":161900.12,"basePoints":161900,"multiplierPoints":0.12,"fingers_thrown":250}';
    const authToken = "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7Im5hbWUiOiJCbGFja2VuIiwicHJvdmlkZXJBY2NvdW50SWQiOiIxMjk5Mjk1NjI4NzMyODg3MDQxIiwiaWQiOiI2NmU5NDA5MThjMWFiMTVkOTU0MWJkNjgifSwiaWF0IjoxNzI2NzQxNDIzLCJleHAiOjE3MjY4Mjc4MjN9.97CpmaLNxAngd5RUMdUeqX2EMUIW0Pi69NocrbbvdYrDbdro5FeJDNDDofC_oxGKVkL191NXl2ka_N_67iYJKw"
const domain = 'https://api.unfk.com';


console.log("encrypting")
  try {
    const encryptedData = await window.cryptoUtils.Dw(pointData, authToken, domain);
    console.log('Encrypted Data:', encryptedData);
  } catch (error) {
    console.error('Encryption failed:', error);
  }
});