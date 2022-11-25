import {
  ACCEPTED_CHAIN_ID,
  blockExplorerUrl,
  shortenAddress,
  TX_STATUS,
} from "../utils/constants";
import FrostedGlassOverlay from "./frostedGlassOverlay";
import LineOfDots from "./line-of-dots";
import errorIcon from "../assets/img/warning.png";
import Modal from "./modal";

const TransactionModal = ({
  isOpen,
  txStatus,
  modalText,
  onClose = () => null,
}) => {
  return (
    <Modal isOpen={isOpen}>
      <FrostedGlassOverlay>
        <div className="overlay-content container">
          <div dangerouslySetInnerHTML={{ __html: modalText }} />
          <div className="mt-4 w-100">
            {TX_STATUS.PENDING === txStatus && <LineOfDots />}
            {TX_STATUS.FULFILLED === txStatus && (
              <i className="fa-icon fa fa-check-circle-o"></i>
            )}
            {TX_STATUS.REJECTED === txStatus && (
              <img className="icon-img" src={errorIcon} alt="" />
            )}
          </div>

          <div className="mt-3">
            {(TX_STATUS.REJECTED === txStatus ||
              TX_STATUS.FULFILLED === txStatus) && (
              <button
                className="button-base secondary-button"
                style={{ maxWidth: 100 }}
                onClick={onClose}
              >
                close
              </button>
            )}
          </div>
        </div>
      </FrostedGlassOverlay>
    </Modal>
  );
};

export default TransactionModal;

export const onTxHash = ({ setModalText = () => null, txHash = null }) => {
  setModalText(`
          <h3 className="dash-text">Waiting for tx confirmation</h3>
          <p className="dash-text">Transaction hash: 
            <a target="_blank" rel="noreferrer" href="${
              blockExplorerUrl[ACCEPTED_CHAIN_ID]
            }/tx/${txHash}"> ${shortenAddress(txHash)} </a>
          </p>
          `);
};

export const onPending = ({
  setModalText = () => null,
  setTxStatus = () => null,
}) => {
  setModalText(`
  <h3 className="dash-text">Waiting for transaction Sign</h3>
  <p className="dash-text">Please confrim signature in your wallet</p>
  `);
  setTxStatus(TX_STATUS.PENDING);
};

export const onSuccess = ({
  setModalText = () => null,
  setTxStatus = () => null,
  txHash = null,
}) => {
  setModalText(`
  <h3 className="dash-text">Transaction confirmed</h3>
  <p className="dash-text">Transaction hash: 
  <a target="_blank" rel="noreferrer" href="${
    blockExplorerUrl[ACCEPTED_CHAIN_ID]
  }/tx/${txHash}"> ${shortenAddress(txHash)} </a>
  </p>
  `);
  setTxStatus(TX_STATUS.FULFILLED);
};

export const onRejected = ({
  setModalText = () => null,
  setTxStatus = () => null,
  reason = null,
}) => {
  setModalText(`
  <h3 className="dash-text">Failed</h3>
  <p className="dash-text">${reason}</p> 

  `);
  setTxStatus(TX_STATUS.REJECTED);
};
