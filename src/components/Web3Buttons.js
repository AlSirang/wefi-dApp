import { WalletConnect } from "./buttons";
import { switchNetwork } from "../context/web3Context/utils";
import { Web3UserContext } from "../context";

const Web3Buttons = ({
  hideWalletConnectButton = false,
  walletConnectClasses = "",
}) => {
  const {
    contextState: {
      isWalletConnected,
      isCorrectChain,

      provider,
    },
  } = Web3UserContext();
  return (
    <>
      {!hideWalletConnectButton && (
        <div className={`${walletConnectClasses} justify-content-center`}>
          <WalletConnect
            className="button-base primary-button connect-wallet"
            style={{ maxWidth: 250 }}
          />
        </div>
      )}

      {isWalletConnected && !isCorrectChain && (
        <div className="mt-3">
          <p>Please switch network to correct chain.</p>
          <button
            onClick={switchNetwork.bind(this, provider)}
            className="button-base secondary-button"
            style={{ maxWidth: 200 }}
          >
            Switch Network
          </button>
        </div>
      )}
    </>
  );
};

export default Web3Buttons;

export const DisconnectWallet = () => {
  const {
    disconnectWallet,
    contextState: { isWalletConnected },
  } = Web3UserContext();

  return (
    <>
      {isWalletConnected && (
        <>
          <button
            className="button-base secondary-button connect-wallet"
            onClick={disconnectWallet}
          >
            Disconnect
          </button>
        </>
      )}
    </>
  );
};
