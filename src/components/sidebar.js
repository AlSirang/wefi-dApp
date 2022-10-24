import { useNavigate } from "react-router-dom";
import { WalletConnect } from "./buttons";

const Sidebar = () => {
  const navigation = useNavigate();
  const navigateToPresale = () => {
    navigation("/");
  };
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

                <button
                  onClick={navigateToPresale}
                  className="button-base primary-button"
                >
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
};

export default Sidebar;
