import { useNavigate } from "react-router-dom";
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

export const BuyNowButton = () => {
  const navigation = useNavigate();
  const navigateToPresale = () => {
    navigation("/");
  };
  return (
    <button onClick={navigateToPresale} className="button-base primary-button">
      Buy Now
    </button>
  );
};
