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
    },
  } = Web3UserContext();

  const toEther = (value) =>
    Number(web3Instance.utils.fromWei(value.toString(), "ether")).toFixed(2);

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
      lockedTokens,
      releaseable_vWefiBalance,
      vWefiLockedDuration,
      stakeRewardDuration,
      rWeifTotal,
      rWefiClaimable,
    },
    setState,
  ] = useState({
    referralCode: null,
    wefiBalance: 0,
    rWefiBalance: 0,
    vWefiBalance: 0,
    lockedTokens: 0,
    releaseable_vWefiBalance: 0,
    vWefiLockedDuration: 0,
    rWeifTotal: 0,
    rWefiClaimable: 0,
    rWefiClaimDuration: 0,
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
              methodName: "totalSupply",
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
              methodName: "totalSupply",
              methodParameters: [],
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

      const wefiBalance = parseInt(
        results.wefiTokenContract.callsReturnContext[0].returnValues[0].hex
      ).toLocaleString("fullwide", { useGrouping: false });

      const referralCode = parseInt(
        results.presaleContract.callsReturnContext[0].returnValues[0].hex
      ).toLocaleString("fullwide", { useGrouping: false });
      const rWefiBalance = parseInt(
        results.rWefiContract.callsReturnContext[0].returnValues[0].hex
      ).toLocaleString("fullwide", { useGrouping: false });
      const stakeRewardDuration = parseInt(
        results.rWefiContract.callsReturnContext[1].returnValues[0].hex
      );
      const rWeifTotal = parseInt(
        results.rWefiContract.callsReturnContext[2].returnValues[0].hex
      ).toLocaleString("fullwide", { useGrouping: false });
      const rWefiClaimable = parseInt(
        results.rWefiContract.callsReturnContext[3].returnValues[0]?.hex || 0
      ).toLocaleString("fullwide", { useGrouping: false });
      const rWefiClaimDuration = parseInt(
        results.rWefiContract.callsReturnContext[3].returnValues[0]?.hex || 0
      );
      const vWefiBalance = parseInt(
        results.vwefiTokenContract.callsReturnContext[0].returnValues[0].hex
      ).toLocaleString("fullwide", { useGrouping: false });
      const lockedTokens = parseInt(
        results.vwefiTokenContract.callsReturnContext[1].returnValues[0].hex
      ).toLocaleString("fullwide", { useGrouping: false });

      let releaseable_vWefiBalance =
        results.vwefiTokenContract.callsReturnContext[2].returnValues[0]?.hex ||
        0;
      let vWefiLockedDuration =
        results.vwefiTokenContract.callsReturnContext[3].returnValues[0]?.hex ||
        0;

      releaseable_vWefiBalance = parseInt(
        releaseable_vWefiBalance || 0
      ).toLocaleString("fullwide", { useGrouping: false });
      vWefiLockedDuration = parseInt(vWefiLockedDuration || 0);

      setState((p) => ({
        ...p,
        referralCode,
        wefiBalance: toEther(wefiBalance),
        rWefiBalance: toEther(rWefiBalance),
        vWefiBalance: toEther(vWefiBalance),
        lockedTokens: toEther(lockedTokens),
        rWeifTotal: toEther(rWeifTotal),
        releaseable_vWefiBalance: toEther(releaseable_vWefiBalance),
        vWefiLockedDuration: Math.ceil(vWefiLockedDuration / SECONDS_IN_DAY),
        stakeRewardDuration: Math.ceil(stakeRewardDuration / SECONDS_IN_DAY),
        rWefiClaimable: toEther(rWefiClaimable),
        rWefiClaimDuration: rWefiClaimDuration / SECONDS_IN_DAY,
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
            reason: err.message || err,
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
            reason: err.message || err,
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
              reason: err.message || err,
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
                  reason: err.message || err,
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
            reason: err.message || err,
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
          {referralCode && (
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
        </div>
        <div className="row grid-gap">
          <div className="col-lg-6 col-md-12">
            <DashboardBox>
              <div className="box-1-container">
                <h3 className="dash-heading">Amount of WEFI Tokens</h3>

                <h4 className="dash-text dash-heading">{wefiBalance}</h4>
              </div>
            </DashboardBox>
          </div>

          <div className="col-lg-6 col-md-12">
            <DashboardBox>
              <div className="inner-container">
                <div className="container-top">
                  <div className="inner-row">
                    <h4 className="dash-sub-heading"> Amount of vWEFI</h4>
                    <h4 className="dash-text dash-sub-heading">
                      {vWefiBalance}
                    </h4>
                  </div>
                  <div className="inner-row">
                    <h4 className="dash-sub-heading">Available vWEFI</h4>
                    <h4 className="dash-text dash-sub-heading">
                      {releaseable_vWefiBalance}
                    </h4>
                  </div>
                  <div className="inner-row">
                    <h4 className="dash-sub-heading">Vesting Start Date </h4>
                    <h4 className="dash-text dash-sub-heading">01/15/2023</h4>
                  </div>
                  <div className="inner-row">
                    <h4 className="dash-sub-heading">Locked For </h4>
                    <h4 className="dash-text dash-sub-heading">
                      {vWefiLockedDuration} Day
                      {vWefiLockedDuration > 1 ? "s" : ""}
                    </h4>
                  </div>

                  <div className="inner-row">
                    <h4 className="dash-sub-heading">vWEFI Locked </h4>
                    <h4 className="dash-text dash-sub-heading">
                      {lockedTokens}
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
                      <h4 className="dash-sub-heading">Reward Member For </h4>
                      <h4 className="dash-text dash-sub-heading">
                        {stakeRewardDuration} Days
                      </h4>
                    </div>

                    <div className="inner-row">
                      <h4 className="dash-sub-heading"> Amount of rWEFI</h4>
                      <h4 className="dash-text dash-sub-heading">
                        {rWefiBalance}
                      </h4>
                    </div>

                    <div className="inner-row">
                      <h4 className="dash-sub-heading">Register </h4>
                      <h4 className="dash-text dash-sub-heading">
                        <input
                          value={toRegister}
                          onChange={onInputChange}
                          name="registerWEFI"
                          className="inline-input input"
                          type="number"
                          autoComplete="off"
                          required
                          min="0"
                        />
                        WEFI
                      </h4>
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
                    <h4 className="dash-sub-heading">Eligible rWEFI </h4>
                    <h4 className="dash-text dash-sub-heading">
                      {rWefiClaimable}
                    </h4>
                  </div>
                  <div className="inner-row">
                    <h4 className="dash-sub-heading">Total rWEFI</h4>
                    <h4 className="dash-text dash-sub-heading">{rWeifTotal}</h4>
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
