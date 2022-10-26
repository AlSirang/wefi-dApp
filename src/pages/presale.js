import { useEffect, useRef, useState } from "react";
import Layout from "../components/layout";
import { Web3UserContext } from "../context";
import Web3Buttons from "../components/Web3Buttons";
import coinImage from "../assets/img/coin.png";
// import sortImage from "../assets/img/sort.png";

const Presale = () => {
  const {
    contextState: {
      account,
      isWalletConnected,
      isCorrectChain,
      isContractInitialized,
      presaleContractInstance,
      web3Instance,
    },
  } = Web3UserContext();
  const [tokenPrice, setTokenPrice] = useState(0);

  const isComponentMounted = useRef(true);

  useEffect(() => {
    isComponentMounted.current = true;
    isContractInitialized &&
      (async () => {
        const tokenPriceInWei = await presaleContractInstance.methods
          .tokenPriceInWei()
          .call();
        const _tokenPrice = web3Instance.utils.fromWei(
          tokenPriceInWei.toString(),
          "ether"
        );

        if (isComponentMounted.current) setTokenPrice(_tokenPrice);
      })();

    return () => {
      isComponentMounted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isContractInitialized]);

  const [{ referralCode, bnbAmount, wefiAmount }, setInputs] = useState({
    referralCode: "",
    bnbAmount: "",
    wefiAmount: "",
  });

  const onInputChange = (e) => {
    const { value, name } = e.target;

    if (name === "bnbAmount") {
      const _value = Number(value);
      const wefiTokens = _value / tokenPrice;

      setInputs((p) => ({
        ...p,
        bnbAmount: value,
        wefiAmount: wefiTokens,
      }));

      return;
    }

    if (name === "wefiAmount") {
      const _value = Number(value);
      const bnbValue = _value * tokenPrice;

      setInputs((p) => ({
        ...p,
        bnbAmount: bnbValue,
        wefiAmount: value,
      }));

      return;
    }

    setInputs((p) => ({
      ...p,
      [name]: value,
    }));
  };

  const onFormSubmit = async (e) => {
    e.preventDefault();

    let contractInstance = presaleContractInstance;

    const amountInWei = web3Instance.utils.toWei(bnbAmount.toString(), "ether");

    const _referralCode = referralCode || 0;
    contractInstance.methods
      .buyToken(_referralCode)
      .send({
        from: account,
        value: amountInWei,
      })

      .once("transactionHash", async function (txHash) {})
      .once("receipt", async (receipt) => {})
      .on("error", (err) => {});
  };

  return (
    <Layout>
      <div className="container main-section">
        <div className="row mt-5 right-main-section">
          <div className="col-md-6 right-box-left-col">
            <div>
              <h2 className="mb-3 presale-heading-title">Stage 1</h2>

              <h2 className="presale-heading-title presale-heading-title-secondary">
                Presale Tokens
              </h2>
            </div>

            <Web3Buttons walletConnectClasses="buttons-container" />

            {isWalletConnected && isCorrectChain && (
              <form id="checkout-form" onSubmit={onFormSubmit}>
                <div
                  id="button-container"
                  className="mt-5 justify-content-center"
                >
                  <div className="form-group">
                    <div className="icon-relative conversion-inputs">
                      <span>
                        <label className="input-label" htmlFor="bnbAmount ">
                          BNB Amount
                        </label>
                        <input
                          id="bnbAmount"
                          type="number"
                          name="bnbAmount"
                          className="form-control input"
                          aria-describedby="amountHelp"
                          autoComplete="off"
                          placeholder="0"
                          required
                          step="any"
                          onChange={onInputChange}
                          value={bnbAmount}
                        />
                      </span>

                      {/* <div className="icon-container">
                        <img
                          className="sort-icon"
                          src={sortImage}
                          alt="sort icon"
                        />
                      </div> */}

                      <span>
                        <label className="input-label" htmlFor="wefiAmount ">
                          WEFI Tokens Amount
                        </label>

                        <input
                          id="wefiAmount"
                          type="number"
                          name="wefiAmount"
                          className="form-control input"
                          autoComplete="off"
                          aria-describedby="WeFIamountHelp"
                          placeholder="0"
                          required
                          step="any"
                          onChange={onInputChange}
                          value={wefiAmount}
                        />
                      </span>
                    </div>
                  </div>
                  <hr style={{ marginBottom: 15 }} />

                  <div className="form-group">
                    <label className="input-label" htmlFor="referralCode ">
                      Referral Code
                    </label>
                    <input
                      type="number"
                      className="form-control input"
                      id="referralCode"
                      name="referralCode"
                      autoComplete="off"
                      placeholder="Referral Code"
                      aria-describedby="referraltHelp"
                      onChange={onInputChange}
                      value={referralCode}
                    />
                    <small id="referraltHelp" className="form-text text-muted">
                      Referral code (if any)
                    </small>
                  </div>

                  <div className="mt-5">
                    <button
                      className="button-base secondary-button"
                      style={{ maxWidth: 200 }}
                      type="submit"
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>

          <div className="col-md-6 presale-right-container mt-sm-5">
            <img
              height="437"
              width="437"
              className="presale-coin-image"
              src={coinImage}
              alt="coin"
              srcSet={`
                  ${coinImage} 437w,
                  ${coinImage} 300w,
                  ${coinImage} 150w,
                  ${coinImage} 230w,
                  ${coinImage} 400w
                `}
              sizes="(max-width: 437px) 100vw, 437px"
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Presale;
