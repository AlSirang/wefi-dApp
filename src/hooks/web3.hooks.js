import { useEffect } from "react";
import { Web3UserContext } from "../context";
import { TYPES } from "../context/reducer";
import {
  presaleContract,
  rWEFIContract,
  vWEFIContract,
  wefiTokenContract,
} from "../utils/contract.configs";

export const useOnAppLoad = () => {
  const { initializePackages } = Web3UserContext();

  useEffect(() => {
    initializePackages();
    // eslint-disable-next-line
  }, []);
};

export const useInitializeContracts = () => {
  const {
    dispatch,
    contextState: { web3Instance, isCorrectChain },
  } = Web3UserContext();

  useEffect(() => {
    const initContract = () => {
      const presaleContractInstance = new web3Instance.eth.Contract(
        presaleContract.abi,
        presaleContract.address
      );

      const wefiContractInstance = new web3Instance.eth.Contract(
        wefiTokenContract.abi,
        wefiTokenContract.address
      );

      const vWefiContractInstance = new web3Instance.eth.Contract(
        vWEFIContract.abi,
        vWEFIContract.address
      );
      const rWefiContractInstance = new web3Instance.eth.Contract(
        rWEFIContract.abi,
        rWEFIContract.address
      );
      dispatch({
        type: TYPES.UPDATE_STATE,
        payload: {
          presaleContractInstance,
          wefiContractInstance,
          vWefiContractInstance,
          rWefiContractInstance,
          isContractInitialized: true,
        },
      });
    };
    web3Instance && isCorrectChain && initContract();
    // eslint-disable-next-line
  }, [web3Instance, isCorrectChain]);
};

/**
 * @dev it will listen to provder events and update the states.
 * @returns void
 */
export const useOnProviderChange = () => {
  const {
    getNetworkInfo,
    dispatch,
    contextState: { provider, web3Instance },
  } = Web3UserContext();

  useEffect(() => {
    provider &&
      (() => {
        // Subscribe to accounts change

        provider.on("accountsChanged", (accounts) => {
          if (accounts && accounts.length)
            return dispatch({
              type: TYPES.UPDATE_STATE,
              payload: { account: accounts[0], isWalletConnected: true },
            });
          dispatch({
            type: TYPES.UPDATE_STATE,
            payload: {
              account: null,
              isWalletConnected: false,
            },
          });
        });

        // Subscribe to chainId change
        provider.on(
          "chainChanged",
          getNetworkInfo.bind(this, provider, web3Instance)
        );
      })();

    // eslint-disable-next-line
  }, [provider]);
};
