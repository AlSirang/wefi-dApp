import binanceIcon from "../../assets/img/binance-logo.png";
import { ACCEPTED_CHAIN_ID, networkConfigs } from "../../utils/constants";

// dynamic import to reduce bundle size
export const loadWeb3Packages = async () => {
  let Web3Modal = import(
    "web3modal"
    /* webpackPreload: true */
    /* webpackChunkName: "web3modal" */
  );
  let WalletConnectProvider = import(
    "@walletconnect/web3-provider"
    /* webpackPreload: true */
    /* webpackChunkName: "web3-provider" */
  );
  let _Web3 = import(
    "web3" /* webpackPreload: true */
    /* webpackChunkName: "Web3" */
  );
  let Web3 = null;
  [
    { default: Web3Modal },
    { default: WalletConnectProvider },
    { default: Web3 },
  ] = await Promise.all([Web3Modal, WalletConnectProvider, _Web3]);

  const providerOptions = {
    walletconnect: {
      package: WalletConnectProvider, // required
      options: {
        infuraId: "12803c9f5919455ba1ac0be83197d502", // required
        chainId: 56,
        network: "binance",
        rpc: {
          56: "https://bsc-dataseed.binance.org/", // BSC
          97: "https://data-seed-prebsc-2-s1.binance.org:8545", // BSC Testnet
          137: "https://polygon-mainnet.g.alchemy.com/v2/ma3nP6ZZCpI81yCWIBz2fPOD2BNBrVP5", // Polygon
          250: "https://rpc.ftm.tools", // Fantom
          4002: "https://rpc.testnet.fantom.network", // Fantom Testnet
          42161: "https://arb1.arbitrum.io/rpc", // Arbitrum
          80001: "https://rpc-mumbai.matic.today", // Mumbai
          421611: "https://rinkeby.arbitrum.io/rpc", // Arbitrum Testnet Rinkeby
        },
      },
    },

    "custom-binancechainwallet": {
      display: {
        logo: binanceIcon,
        name: "Binance Chain Wallet",
        description: "Connect to your Binance Chain Wallet",
      },
      package: true,
      connector: async () => {
        let provider = null;
        if (typeof window.BinanceChain !== "undefined") {
          provider = window.BinanceChain;
          try {
            await provider.request({ method: "eth_requestAccounts" });
          } catch (error) {
            throw new Error("User Rejected");
          }
        } else {
          throw new Error("No Binance Chain Wallet found");
        }
        return provider;
      },
    },
  };

  const web3Modal = new Web3Modal({
    network: "mainnet", // optional
    cacheProvider: true, // optional
    providerOptions, // required
  });

  return { web3Modal, Web3 };
};

export const switchNetwork = async (provider) => {
  if (!provider) return;
  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: ACCEPTED_CHAIN_ID }],
    });
  } catch (err) {
    // if no chain found request to add
    if (err.code === 4902 || /Unrecognized chain ID/.test(err.message || err))
      return await provider.request({
        method: "wallet_addEthereumChain",
        params: [networkConfigs[ACCEPTED_CHAIN_ID]],
      });

    console.log("switchNetwork", err);
  }
};
