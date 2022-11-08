import { useNavigate } from "react-router-dom";
import { ButtonUserContext, Web3UserContext } from "../context";
import { shortenAddress } from "../utils/constants";
import metamaskIcon from "../assets/img/metamask.svg";
import "../styles/metamaskButton.css";

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

export const AssetManagmentButton = ({ name, options }) => {
  const {
    contextState: { provider },
  } = Web3UserContext();
  const handleClick = async () => {
    try {
      await provider.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20", // Initially only supports ERC20, but eventually more!
          options,
        },
      });
    } catch (e) {}
  };
  return (
    <button
      onClick={handleClick}
      className="btn btn-xss btn-soft-light text-nowrap d-flex align-items-center mr-2"
    >
      <img class="mr-1" width="15" src={metamaskIcon} alt="Metamask" />
      &nbsp;{name}
    </button>
  );
};
