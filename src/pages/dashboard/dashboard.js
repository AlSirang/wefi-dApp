import { useEffect, useRef, useState } from "react";
import { Multicall } from "ethereum-multicall";
import { DashboardBox } from "../../components/dasnboard.units";
import FrostedGlassOverlay from "../../components/frostedGlassOverlay";
import Web3Buttons from "../../components/Web3Buttons";
import { Web3UserContext } from "../../context";
import "../../styles/dashboard.css";
import {
  presaleContract,
  rWEFIContract,
  tokenWEFI,
  token_rWEFI,
  token_vWEFI,
  wefiTokenContract,
} from "../../utils/contract.configs";
import TransactionModal, {
  onPending,
  onRejected,
  onSuccess,
  onTxHash,
} from "../../components/transactionModal";
import {
  firstNPostiveNumbersAfterDecimal,
  SECONDS_IN_DAY,
} from "../../utils/constants";
import { timeConverter } from "../../utils/dateTimeHelper";
import VestingInfo from "../../components/vestingInfo";
import { AssetManagmentButton } from "../../components/buttons";

let setTimeoutId = null;

const Dashboard = () => {
  const {
    contextState: {
      account,
      isCorrectChain,
      isWalletConnected,
      wefiContractInstance,
      rWefiContractInstance,
      web3Instance,
      isContractInitialized,
      presaleContractInstance,
    },
  } = Web3UserContext();

  const toEther = (value) =>
    Number(web3Instance.utils.fromWei(value.toString(), "ether"));

  /***** Local States *****/
  const [modalText, setModalText] = useState(null);
  const [txStatus, setTxStatus] = useState(null);
  /*************/

  const onModalClose = () => {
    setModalText(null);
    setTxStatus(null);
  };

  const copyIconRef = useRef();
  const onCopy = (paload) => {
    navigator.clipboard.writeText(paload).then(
      function () {
        copyIconRef.current.classList.add("dash-text");
        clearTimeout(setTimeoutId);
        setTimeoutId = setTimeout(() => {
          copyIconRef.current.classList.remove("dash-text");
        }, 2000);
      },
      function (err) {
        console.error("Async: Could not copy text: ", err);
      }
    );
  };

  const [
    {
      referralCode,
      wefiBalance,
      rWefiBalance,
      stakeRewardDuration,
      rWeifTotal,
      rWefiClaimable,
      rWefiClaimDuration,
      isDataLoaded,
    },
    setState,
  ] = useState({
    referralCode: null,
    wefiBalance: 0,
    rWefiBalance: 0,
    rWeifTotal: 0,
    rWefiClaimable: 0,
    rWefiClaimDuration: 0,
    isDataLoaded: false,
  });

  const loadData = async () => {
    try {
      let multicall = new Multicall({
        multicallCustomContractAddress:
          "0x7D44ce82D27eA6D6F19805e152d92807e504367A",
        web3Instance: web3Instance,
        tryAggregate: true,
      });

      const contractCallContext = [
        {
          reference: "presaleContract",
          contractAddress: presaleContract.address,
          abi: presaleContract.abi,
          calls: [
            {
              reference: "presaleContract",
              methodName: "showReferralCode",
              methodParameters: [account],
            },
          ],
        },
        {
          reference: "wefiTokenContract",
          contractAddress: wefiTokenContract.address,
          abi: wefiTokenContract.abi,
          calls: [
            {
              reference: "wefiToken",
              methodName: "balanceOf",
              methodParameters: [account],
            },
          ],
        },

        {
          reference: "rWefiContract",
          contractAddress: rWEFIContract.address,
          abi: rWEFIContract.abi,
          calls: [
            {
              reference: "rwefiContract",
              methodName: "balanceOf",
              methodParameters: [account],
            },
            {
              reference: "rwefiContract",
              methodName: "registerDurationForRewards",
              methodParameters: [],
            },
            {
              reference: "rwefiContract",
              methodName: "viewClaimableRewardsAndReleaseTime",
              methodParameters: [account],
            },
          ],
        },
      ];

      const { results } = await multicall.call(contractCallContext);

      // wefi token contract
      const wefiBalance = parseInt(
        results.wefiTokenContract.callsReturnContext[0].returnValues[0].hex
      ).toLocaleString("fullwide", { useGrouping: false });
      // presale contract
      const referralCode = parseInt(
        results.presaleContract.callsReturnContext[0].returnValues[0].hex
      ).toLocaleString("fullwide", { useGrouping: false });

      // Rewards contract values
      const rWefiBalance = parseInt(
        results.rWefiContract.callsReturnContext[0].returnValues[0].hex
      ).toLocaleString("fullwide", { useGrouping: false });

      const stakeRewardDuration = parseInt(
        results.rWefiContract.callsReturnContext[1].returnValues[0].hex
      );

      const rWefiClaimable = parseInt(
        results.rWefiContract.callsReturnContext[2].returnValues[0]?.hex || 0
      ).toLocaleString("fullwide", { useGrouping: false });

      const rWefiClaimDuration = parseInt(
        results.rWefiContract.callsReturnContext[2].returnValues[1]?.hex || 0
      );

      setState((p) => ({
        ...p,
        referralCode,
        wefiBalance: toEther(wefiBalance, 4),
        rWefiBalance: toEther(rWefiBalance),
        rWeifTotal: toEther(rWeifTotal),
        stakeRewardDuration: Math.floor(stakeRewardDuration / SECONDS_IN_DAY),
        rWefiClaimable: toEther(rWefiClaimable),
        rWefiClaimDuration,
        isDataLoaded: true,
      }));
    } catch (err) {
      console.log({ loadDataErr: err });
    }
  };

  useEffect(() => {
    isContractInitialized &&
      account &&
      isCorrectChain &&
      isWalletConnected &&
      loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, isContractInitialized, isCorrectChain, isWalletConnected]);

  const generateReferralCode = () => {
    try {
      onPending({
        setModalText,
        setTxStatus,
      });

      presaleContractInstance.methods
        .generateReferralCode(account)
        .send({
          from: account,
        })
        .once("transactionHash", async function (txHash) {
          onTxHash({ setModalText, txHash });
        })
        .once("receipt", async (receipt) => {
          const { transactionHash } = receipt;
          const referralCode =
            receipt.events.ReferralCodeGenerated.returnValues[1];

          onSuccess({
            setModalText,
            setTxStatus,
            txHash: transactionHash,
          });
          setState((p) => ({
            ...p,
            referralCode,
          }));
        })
        .on("error", (err) => {
          onRejected({
            setModalText,
            setTxStatus,
            reason: err.message || "Transaction has been reverted by the EVM",
          });
        });
    } catch (err) {
      onRejected({
        setModalText,
        setTxStatus,
        reason: err.message || err,
      });
    }
  };

  const claimRWEFI = () => {
    try {
      onPending({
        setModalText,
        setTxStatus,
      });
      rWefiContractInstance.methods
        .claimRewards()
        .send({ from: account })
        .once("transactionHash", async function (txHash) {
          onTxHash({ setModalText, txHash });
        })
        .once("receipt", async (receipt) => {
          loadData();
          const { transactionHash } = receipt;
          onSuccess({
            setModalText,
            setTxStatus,
            txHash: transactionHash,
          });
        })
        .on("error", (err) => {
          onRejected({
            setModalText,
            setTxStatus,
            reason: err.message || "Transaction has been reverted by the EVM",
          });
        });
    } catch (err) {
      onRejected({
        setModalText,
        setTxStatus,
        reason: err.message || err,
      });
    }
  };

  const [{ toRegister }, setInputs] = useState({
    toRegister: "",
  });

  const onInputChange = (e) => {
    const { value } = e.target;
    setInputs({
      toRegister: value,
    });
  };

  const registerTokens = (value) => {
    try {
      onPending({
        setModalText,
        setTxStatus,
      });

      const stakeTokens = () => {
        // stake tokens
        rWefiContractInstance.methods
          .registerTokens(web3Instance.utils.toWei(value.toString(), "ether"))
          .send({ from: account })
          .once("transactionHash", async function (txHash) {
            onTxHash({ setModalText, txHash });
          })
          .once("receipt", async (receipt) => {
            loadData();
            setInputs({
              toRegister: "",
            });

            const { transactionHash } = receipt;
            onSuccess({
              setModalText,
              setTxStatus,
              txHash: transactionHash,
            });
          })
          .on("error", (err) => {
            onRejected({
              setModalText,
              setTxStatus,
              reason: err.message || "Transaction has been reverted by the EVM",
            });
          });
      };

      wefiContractInstance.methods
        .allowance(account, rWEFIContract.address)
        .call()
        .then((allowance) => {
          // if allowance is less than stake amount ask for approve
          if (allowance < value) {
            return wefiContractInstance.methods
              .approve(
                rWEFIContract.address,
                web3Instance.utils.toWei(
                  (1e50).toLocaleString("fullwide", { useGrouping: false })
                )
              )
              .send({ from: account })

              .once("transactionHash", async function (txHash) {
                onTxHash({ setModalText, txHash });
              })
              .once("receipt", async (receipt) => {
                stakeTokens();
              })
              .on("error", (err) => {
                onRejected({
                  setModalText,
                  setTxStatus,
                  reason:
                    err.message || "Transaction has been reverted by the EVM",
                });
              });
          }

          // else just run stake function
          stakeTokens();
        });
    } catch (err) {
      onRejected({
        setModalText,
        setTxStatus,
        reason: err.message || err,
      });
    }
  };

  const unregisterTokens = () => {
    try {
      onPending({
        setModalText,
        setTxStatus,
      });
      rWefiContractInstance.methods
        .unregisterTokens()
        .send({ from: account })
        .once("transactionHash", async function (txHash) {
          onTxHash({ setModalText, txHash });
        })
        .once("receipt", async (receipt) => {
          loadData();
          const { transactionHash } = receipt;
          onSuccess({
            setModalText,
            setTxStatus,
            txHash: transactionHash,
          });
        })
        .on("error", (err) => {
          onRejected({
            setModalText,
            setTxStatus,
            reason: err.message || "Transaction has been reverted by the EVM",
          });
        });
    } catch (err) {
      onRejected({
        setModalText,
        setTxStatus,
        reason: err.message || err,
      });
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    registerTokens(toRegister);
  };

  return (
    <>
      <div className="container dash-main">
        <div className="referral-container">
          {Boolean(Number(referralCode)) && (
            <h2 className="dash-sub-heading">
              Referral Code: {referralCode}&nbsp;
              <span
                onClick={onCopy.bind(this, referralCode)}
                className="pointer-icon"
              >
                <i ref={copyIconRef} className="fas fa-copy"></i>
              </span>
            </h2>
          )}

          {isDataLoaded && !Boolean(Number(referralCode)) && (
            <button
              onClick={generateReferralCode}
              style={{ maxWidth: 200 }}
              className="button-base secondary-button "
            >
              Get referral code
            </button>
          )}
        </div>
        <div className="row grid-gap">
          <div className="col-12">
            <DashboardBox>
              <div className="box-innerContainer">
                <div className="box-1-container">
                  <h3 className="dash-heading">Amount of WEFI Tokens</h3>

                  <h4 className="dash-text dash-heading">
                    {firstNPostiveNumbersAfterDecimal(wefiBalance)}
                  </h4>
                </div>

                <div className="button-container">
                  <div className="button-container-abs">
                    <AssetManagmentButton
                      name="Add Token WEFI"
                      options={tokenWEFI}
                    />
                  </div>
                </div>
              </div>
            </DashboardBox>
          </div>

          <div className="col-lg-6 col-md-12">
            <DashboardBox>
              <form onSubmit={onSubmit}>
                <div className="inner-container">
                  <div className="container-top">
                    <div className="inner-row">
                      <h4 className="dash-sub-heading">
                        Register Duration for Rewards
                      </h4>
                      <h4
                        className="dash-text dash-sub-heading"
                        style={{ whiteSpace: "nowrap" }}
                      >
                        {stakeRewardDuration} Days
                      </h4>
                    </div>

                    <div className="inner-row">
                      <h4 className="dash-sub-heading">
                        Registered WEFI (rWEFI)
                      </h4>
                      <h4 className="dash-text dash-sub-heading">
                        {firstNPostiveNumbersAfterDecimal(rWefiBalance)}
                      </h4>
                    </div>

                    <div
                      className="inner-row mt-4"
                      style={{
                        alignItems: "center",
                      }}
                    >
                      <h4
                        className="dash-sub-heading"
                        style={{
                          width: "70%",
                        }}
                      >
                        WEFI to Register
                      </h4>
                      <input
                        value={toRegister}
                        onChange={onInputChange}
                        name="registerWEFI"
                        className="form-control input slim-input"
                        type="number"
                        autoComplete="off"
                        placeholder="0"
                        required
                        step="any"
                        min="0"
                      />
                    </div>
                  </div>
                  <div className="container-bottom buttons-grid">
                    <button
                      type="submit"
                      className="dash-button button-base primary-button "
                    >
                      Register
                    </button>
                    <button
                      type="button"
                      onClick={unregisterTokens}
                      className="dash-button button-base secondary-button "
                    >
                      Unregister
                    </button>
                  </div>
                </div>
              </form>
            </DashboardBox>
          </div>
          <div className="col-lg-6 col-md-12">
            <DashboardBox>
              <div className="box-innerContainer">
                <div className="inner-container">
                  <div className="container-top">
                    <div className="inner-row">
                      <h4 className="dash-sub-heading">
                        Claimable Rewards (WEFI)
                      </h4>
                      <h4 className="dash-text dash-sub-heading">
                        {firstNPostiveNumbersAfterDecimal(rWefiClaimable)}
                      </h4>
                    </div>
                    <div className="inner-row">
                      <h4 className="dash-sub-heading">Due after</h4>
                      <h4 className="dash-text dash-sub-heading">
                        {rWefiClaimDuration > 0
                          ? timeConverter(rWefiClaimDuration)
                          : "-"}
                      </h4>
                    </div>
                  </div>

                  <div className="container-bottom">
                    <button
                      disabled={
                        // eslint-disable-next-line eqeqeq
                        rWefiClaimDuration == 0 ||
                        rWefiClaimDuration * 1000 < Date.now()
                      }
                      onClick={claimRWEFI}
                      className="dash-button button-base primary-button "
                    >
                      Claim rWEFI
                    </button>
                  </div>
                </div>

                <div className="button-container">
                  <div className="button-container-abs">
                    <AssetManagmentButton
                      name="Add Registered rWEFI"
                      options={token_rWEFI}
                    />
                  </div>
                </div>
              </div>
            </DashboardBox>
          </div>

          <div className="col-12">
            <DashboardBox>
              <div className="box-innerContainer">
                <div>
                  <VestingInfo onTxCompete={loadData} />
                </div>

                <div className="button-container">
                  <div className="button-container-abs">
                    <AssetManagmentButton
                      name="Add Vested vWEFI"
                      options={token_vWEFI}
                    />
                  </div>
                </div>
              </div>
            </DashboardBox>
          </div>
        </div>

        {(!isWalletConnected || !isCorrectChain) && (
          <FrostedGlassOverlay>
            <div className="overlay-content container">
              {!isWalletConnected && (
                <p>Please Connect your wallet to access dashboard</p>
              )}

              <Web3Buttons hideWalletConnectButton={isWalletConnected} />
            </div>
          </FrostedGlassOverlay>
        )}
      </div>
      <TransactionModal
        isOpen={Boolean(modalText)}
        txStatus={txStatus}
        modalText={modalText}
        onClose={onModalClose}
      />

      <div style={{ marginBttom: 30 }} />
    </>
  );
};

export default Dashboard;
