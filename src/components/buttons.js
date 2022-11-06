import { useNavigate } from "react-router-dom";
import { ButtonUserContext, Web3UserContext } from "../context";
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
  const {
    contextState: { name, path },
  } = ButtonUserContext();

  const navigation = useNavigate();
  const navigateToPresale = () => {
    navigation(path);
  };
  return (
    <button onClick={navigateToPresale} className="button-base primary-button">
      {name}
    </button>
  );
};
