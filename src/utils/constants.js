export const shortenAddress = (address) =>
  `${address.slice(0, 5)}...${address.slice(-5)}`;

export const ACCEPTED_CHAIN_ID = "0x61";
export const blockExplorerUrl = {
  "0x61": "https://testnet.bscscan.com",
  "0x38": "https://bscscan.com",
};

export const TX_STATUS = {
  PENDING: "PENDING",
  FULFILLED: "FULFILLED",
  REJECTED: "REJECTED",
};

export const firstNPostiveNumbersAfterDecimal = (number, n = 4) => {
  const [num, decimals] = number.toString().split(".");
  let finalNumber = num;

  let newDecimals = "";

  for (let i = 0; i < n; i++) {
    if (decimals && decimals[i] && (decimals[i] > 0 || i < n))
      newDecimals += decimals[i];
  }

  if (newDecimals > 0) finalNumber = `${num}.${newDecimals}`;

  return finalNumber;
};
export const networkConfigs = {
  "0x38": {
    chainId: "0x38",
    chainName: "Binance Smart Chain",
    nativeCurrency: {
      name: "BNB",
      symbol: "BNB",
      decimals: 18,
    },
    rpcUrls: ["https://bsc-dataseed.binance.org/"],
    blockExplorerUrls: ["https://bscscan.com/"],
  },
  "0x61": {
    chainId: "0x61",
    chainName: "BNB Smart Chain Testnet",
    nativeCurrency: {
      name: "tBNB",
      symbol: "tBNB",
      decimals: 18,
    },
    rpcUrls: ["https://data-seed-prebsc-1-s1.binance.org:8545/"],
    blockExplorerUrls: ["https://testnet.bscscan.com/"],
  },
};
