import { loadWeb3Packages, switchNetwork } from "./utils";
import { TYPES } from "./reducer";
import { ACCEPTED_CHAIN_ID } from "../utils/constants";
import { presaleContract } from "../utils/contract.configs";

export default function actions(state, dispatch = () => {}) {
  const { web3Instance, web3Modal, Web3, isWalletConnected } = state;
  // loads web packages
  const initializePackages = async () => {
    const { web3Modal, Web3 } = await loadWeb3Packages();
    dispatch({
      type: TYPES.UPDATE_STATE,
      payload: {
        web3Modal,
        Web3,
      },
    });
  };

  const initContract = (web3Instance) => {
    if (!web3Instance) return;

    const presaleContractInstance = new web3Instance.eth.Contract(
      presaleContract.abi,
      presaleContract.address
    );

    dispatch({
      type: TYPES.UPDATE_STATE,
      payload: { presaleContractInstance, isContractInitialized: true },
    });

    return presaleContractInstance;
  };

  const getNetworkInfo = async (provider, _web3Instance) => {
    if (!provider) return;

    const chainId = await provider.request({ method: "eth_chainId" });

    let isCorrectNetworkInfo = false;

    if (parseInt(chainId) === parseInt(ACCEPTED_CHAIN_ID))
      isCorrectNetworkInfo = true;

    dispatch({
      type: TYPES.UPDATE_STATE,
      payload: {
        connectedChainId: chainId,
        isCorrectChain: isCorrectNetworkInfo,
      },
    });

    if (!isCorrectNetworkInfo) return await switchNetwork(provider);

    initContract(_web3Instance);
  };

  /**
   * @dev it will popup web3 modal and gets user wallet address once they select provider.
   * @returns void
   */
  const walletConnect = async () => {
    if (!web3Modal || isWalletConnected) return;
    const provider = await web3Modal.connect();
    const web3Instance = new Web3(provider);
    let account = (await web3Instance.eth.getAccounts())[0];

    if (!account) {
      await provider.request({
        method: "eth_requestAccounts",
      });
      account = (await web3Instance.eth.getAccounts())[0];
    }

    dispatch({
      type: TYPES.UPDATE_STATE,
      payload: {
        isWalletConnected: true,
        account,
        provider,
        web3Instance,
      },
    });

    // on wallet connect success get network info
    getNetworkInfo(provider, web3Instance);
  };

  return {
    // custom actions
    initializePackages,
    walletConnect,
    getNetworkInfo,
    initContract,

    // navtie state and dispatch
    contextState: state,
    dispatch,
  };
}
