import { Web3UserContext } from "../context";
import { shortenAddress } from "../utils/constants";

export const WalletConnect = (props) => {
  const {
    walletConnect,
    contextState: { account, isWalletConnected },
  } = Web3UserContext();

  return (
    <button onClick={walletConnect} {...props}>
      {isWalletConnected && shortenAddress(account)}

      {!isWalletConnected && "Connect Wallet"}
    </button>
  );
};
