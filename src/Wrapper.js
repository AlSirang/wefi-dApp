import { useOnAppLoad, useOnProviderChange } from "./hooks/web3.hooks";

const Wrapper = () => {
  useOnAppLoad();
  useOnProviderChange();
  return null;
};

export default Wrapper;
