import {
  useInitializeContracts,
  useOnAppLoad,
  useOnProviderChange,
} from "./hooks/web3.hooks";

const Wrapper = () => {
  useOnAppLoad();
  useOnProviderChange();
  useInitializeContracts();
  return null;
};

export default Wrapper;
