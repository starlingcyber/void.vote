export const PRAX_ORIGIN =
  "chrome-extension://lkpmkhpnhknhmibgnmmhdhgdilepfghe";
export const CHROME_EXTENSION_BASE_URL =
  "https://chrome.google.com/webstore/detail/";
export const PRAX_EXTENSION_ID = PRAX_ORIGIN.split("//")[1];
export const PRAX_CHROME_STORE_URL = `${CHROME_EXTENSION_BASE_URL}${PRAX_EXTENSION_ID}`;

// FIXME: BEFORE DEPLOYING ON MAINNET, CHANGE THIS TO THE MAINNET VALIDATOR ADDRESS
export const VALIDATOR_ADDRESS =
  //   "RJrJv4eg0faC1OtTk09TqQ7VbitP+0rDFUcLQzgihA0="; // Mainnet address
  "bHD2UDcjV+Y3tuyEYLn7yz0sI4O3s547Qq4AC0FOMQY="; // Testnet validator address
