import { useEffect } from "react";
import { Web3UserContext } from "../context";
import { TYPES } from "../context/reducer";

export const useOnAppLoad = () => {
  const { initializePackages } = Web3UserContext();

  useEffect(() => {
    initializePackages();
    // eslint-disable-next-line
  }, []);
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
