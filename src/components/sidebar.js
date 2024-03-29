import { BuyNowButton, WalletConnect } from "./buttons";
import { DisconnectWallet } from "./Web3Buttons";

const Sidebar = () => {
  return (
    <div className="col-2 col-md-3 col-sm-12 d-none d-md-block left-section">
      <header className="header header-padding">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="header-wrapper d-flex align-items-center justify-content-start logo-padding-left">
                <div className="header-logo logo">WEFI</div>
              </div>
            </div>

            <div className="col-12 mt-5 np">
              <div className="buttons-container">
                <WalletConnect className="button-base secondary-button connect-wallet" />
                <DisconnectWallet />
                <BuyNowButton />
              </div>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
};

export default Sidebar;
