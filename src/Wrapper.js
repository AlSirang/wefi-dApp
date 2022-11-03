import {
  useCheckWalletConnection,
  useInitializeContracts,
  useOnAppLoad,
  useOnProviderChange,
} from "./hooks/web3.hooks";

const Wrapper = () => {
  useOnAppLoad();
  useOnProviderChange();
  useInitializeContracts();
  useCheckWalletConnection();
  return null;
};

export default Wrapper;
