import { useRef } from "react";
import { Link } from "react-router-dom";
import { BuyNowButton, WalletConnect } from "./buttons";
import { DisconnectWallet } from "./Web3Buttons";

const Header = () => {
  const sideMenuRef = useRef(null);
  const onToggle = () => {
    if (sideMenuRef.current.style.right === "0px")
      return (sideMenuRef.current.style.right = "-282px");
    sideMenuRef.current.style.right = "0px";
  };

  return (
    <>
      <div className="overlay"></div>
      <div className="overlay-image">
        <div className="overlay-color"></div>
      </div>

      {/* offcanvas-menu  */}

      <div
        className="offcanvas-wrapper"
        ref={sideMenuRef}
        style={{ right: -282 }}
      >
        <div className="offcanvas-header d-flex align-items-center justify-content-end">
          <div className="offcanvas-close">
            <span className="close" onClick={onToggle}>
              <i aria-hidden="true" className="fas fa-times theme-primary"></i>
            </span>
          </div>
        </div>
        <div className="offcanvas-menu">
          <nav className="d-flex justify-content-end">
            <ul>
              <li>
                <Link className="text-uppercase" to="/dashboard">
                  dashboard
                </Link>
              </li>
              <li>
                <a
                  target="_blank"
                  rel="noreferrer"
                  className="text-uppercase"
                  href="https://wefitoken.com/presale/"
                >
                  Presale
                </a>
              </li>
              <li>
                <a
                  target="_blank"
                  rel="noreferrer"
                  className="text-uppercase"
                  href="https://wefitoken.com/#roadmap"
                >
                  Roadmap
                </a>
              </li>
              <li>
                <a
                  target="_blank"
                  rel="noreferrer"
                  className="text-uppercase"
                  href="https://wefitoken.com/#tokenomics"
                >
                  Tokenomics
                </a>
              </li>
              <li>
                <a
                  target="_blank"
                  rel="noreferrer"
                  className="text-uppercase"
                  href="https://wefitoken.com/#white-paper"
                >
                  white paper
                </a>
              </li>
              <li>
                <a
                  target="_blank"
                  rel="noreferrer"
                  className="text-uppercase"
                  href="https://wefitoken.com/#faq"
                >
                  FAQ
                </a>
              </li>
            </ul>
          </nav>

          <div className="d-flex flex-column mt-5 gap-3">
            <div className="d-flex flex-column gap-3" onClick={onToggle}>
              <WalletConnect className="button-base secondary-button connect-wallet" />
              <DisconnectWallet />
            </div>
            <BuyNowButton />
          </div>
        </div>
      </div>

      {/* offcanvas-menu-end */}
      {/* header */}

      <header className="header header-padding">
        <div className="header-padding">
          <div className="row">
            <div className="col-12">
              <div className="header-wrapper d-flex align-items-center justify-content-md-end justify-content-between padding-around">
                <div className="d-block d-md-none header-logo logo">WEFI</div>

                <div className="header-menu d-flex align-items-center">
                  <div className="header-menu__nav d-none d-xl-block header-padding-right">
                    <nav>
                      <ul className="d-flex align-items-center">
                        <li>
                          <Link className="text-uppercase" to="/dashboard">
                            dashboard
                          </Link>
                        </li>
                        <li>
                          <a
                            target="_blank"
                            rel="noreferrer"
                            className="text-uppercase"
                            href="https://wefitoken.com/presale/"
                          >
                            Presale
                          </a>
                        </li>
                        <li>
                          <a
                            target="_blank"
                            rel="noreferrer"
                            className="text-uppercase"
                            href="https://wefitoken.com/#roadmap"
                          >
                            Roadmap
                          </a>
                        </li>
                        <li>
                          <a
                            target="_blank"
                            rel="noreferrer"
                            className="text-uppercase"
                            href="https://wefitoken.com/#tokenomics"
                          >
                            Tokenomics
                          </a>
                        </li>
                        <li>
                          <a
                            target="_blank"
                            rel="noreferrer"
                            className="text-uppercase"
                            href="https://wefitoken.com/#white-paper"
                          >
                            white paper
                          </a>
                        </li>
                        <li>
                          <a
                            target="_blank"
                            rel="noreferrer"
                            className="text-uppercase"
                            href="https://wefitoken.com/#faq"
                          >
                            FAQ
                          </a>
                        </li>
                      </ul>
                    </nav>
                  </div>
                  <div className="header-right d-flex align-items-center ms-xl-3">
                    <div className="header-mobileBar d-xl-none ms-3 header-padding-right">
                      <span className="bar" onClick={onToggle}>
                        <i
                          aria-hidden="true"
                          className="fas fa-bars theme-primary"
                        ></i>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      {/*  header end  */}
    </>
  );
};

export default Header;
