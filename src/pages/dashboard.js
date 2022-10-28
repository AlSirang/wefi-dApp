import { useEffect, useRef, useState } from "react";
import { Multicall } from "ethereum-multicall";
import Layout from "../components/layout";
import { DashboardBox } from "../components/dasnboard.units";
import FrostedGlassOverlay from "../components/frostedGlassOverlay";
import Web3Buttons from "../components/Web3Buttons";
import { Web3UserContext } from "../context";
import "../styles/dashboard.css";
import {
  presaleContract,
  rWEFIContract,
  vWEFIContract,
  wefiTokenContract,
} from "../utils/contract.configs";
import TransactionModal, {
  onPending,
  onRejected,
  onSuccess,
  onTxHash,
} from "../components/transactionModal";
import { firstNPostiveNumbersAfterDecimal } from "../utils/constants";
import { timeConverter } from "../utils/dateTimeHelper";

// todo:

// update the tx fee suggestions

// use gaseEstimate function from web3.

let setTimeoutId = null;
const SECONDS_IN_DAY = 60 * 60 * 24;

const Dashboard = () => {
  const {
    contextState: {
      account,
      isCorrectChain,
      isWalletConnected,
      wefiContractInstance,
      vWefiContractInstance,
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
      vWefiBalance,
      releaseable_vWefiBalance,
      vWefiLockedDuration,
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
    vWefiBalance: 0,
    releaseable_vWefiBalance: 0,
    vWefiLockedDuration: 0,
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

        {
          reference: "vwefiTokenContract",
          contractAddress: vWEFIContract.address,
          abi: vWEFIContract.abi,
          calls: [
            {
              reference: "vWefiContract",
              methodName: "balanceOf",
              methodParameters: [account],
            },

            {
              reference: "vWefiContract",
              methodName: "computeAllReleasableAmountForBeneficiary",
              methodParameters: [account],
            },
            {
              reference: "vWefiContract",
              methodName: "getLastVestingScheduleForBeneficiary",
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

      // vesting contract values
      const vWefiBalance = parseInt(
        results.vwefiTokenContract.callsReturnContext[0].returnValues[0].hex
      ).toLocaleString("fullwide", { useGrouping: false });

      let releaseable_vWefiBalance =
        results.vwefiTokenContract.callsReturnContext[1].returnValues[0]?.hex ||
        0;
      let vWefiLockedDuration =
        results.vwefiTokenContract.callsReturnContext[2].returnValues[4]?.hex ||
        0;

      releaseable_vWefiBalance = parseInt(
        releaseable_vWefiBalance || 0
      ).toLocaleString("fullwide", { useGrouping: false });
      vWefiLockedDuration = parseInt(vWefiLockedDuration || 0);

      setState((p) => ({
        ...p,
        referralCode,
        wefiBalance: toEther(wefiBalance, 4),
        rWefiBalance: toEther(rWefiBalance),
        vWefiBalance: toEther(vWefiBalance),
        rWeifTotal: toEther(rWeifTotal),
        releaseable_vWefiBalance: toEther(releaseable_vWefiBalance),
        vWefiLockedDuration: Math.ceil(vWefiLockedDuration / SECONDS_IN_DAY),
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
  const claimFromAllVestings = () => {
    try {
      onPending({
        setModalText,
        setTxStatus,
      });
      vWefiContractInstance.methods
        .claimFromAllVestings()
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
    <Layout>
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
          <div className="col-lg-6 col-md-12">
            <DashboardBox>
              <div className="box-1-container">
                <h3 className="dash-heading">Amount of WEFI Tokens</h3>

                <h4 className="dash-text dash-heading">
                  {firstNPostiveNumbersAfterDecimal(wefiBalance)}
                </h4>
              </div>
            </DashboardBox>
          </div>

          <div className="col-lg-6 col-md-12">
            <DashboardBox>
              <div className="inner-container">
                <div className="container-top">
                  <div className="inner-row">
                    <h4 className="dash-sub-heading">Vested WEFI (vWEFI)</h4>
                    <h4 className="dash-text dash-sub-heading">
                      {firstNPostiveNumbersAfterDecimal(vWefiBalance)}
                    </h4>
                  </div>
                  <div className="inner-row">
                    <h4 className="dash-sub-heading">Claimable vWEFI</h4>
                    <h4 className="dash-text dash-sub-heading">
                      {firstNPostiveNumbersAfterDecimal(
                        releaseable_vWefiBalance
                      )}
                    </h4>
                  </div>
                  <div className="inner-row">
                    <h4 className="dash-sub-heading">Vesting Start Date </h4>
                    <h4 className="dash-text dash-sub-heading">01/15/2023</h4>
                  </div>
                  <div className="inner-row">
                    <h4 className="dash-sub-heading">Last Vested Duration </h4>
                    <h4 className="dash-text dash-sub-heading">
                      {vWefiLockedDuration} Day
                      {vWefiLockedDuration > 1 ? "s" : ""}
                    </h4>
                  </div>
                </div>

                <div className="container-bottom">
                  <button
                    onClick={claimFromAllVestings}
                    className="dash-button button-base primary-button "
                  >
                    Claim vWEFI
                  </button>
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
                      {timeConverter(rWefiClaimDuration)}
                    </h4>
                  </div>
                </div>

                <div className="container-bottom">
                  <button
                    onClick={claimRWEFI}
                    className="dash-button button-base primary-button "
                  >
                    Claim rWEFI
                  </button>
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
    </Layout>
  );
};

export default Dashboard;
