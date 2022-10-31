import { Multicall } from "ethereum-multicall";
import { useEffect, useState } from "react";
import { Web3UserContext } from "../context";
import { firstNPostiveNumbersAfterDecimal } from "../utils/constants";
import { vWEFIContract } from "../utils/contract.configs";
import TransactionModal, {
  onPending,
  onRejected,
  onSuccess,
  onTxHash,
} from "./transactionModal";
import "../styles/vesting.css";
import { timeConverter } from "../utils/dateTimeHelper";
import LineOfDots from "./line-of-dots";
const VestingInfo = ({ onTxCompete = () => null }) => {
  const {
    contextState: {
      account,
      isContractInitialized,
      isCorrectChain,
      isWalletConnected,
      vWefiContractInstance,
      web3Instance,
    },
  } = Web3UserContext();

  const toEther = (value) =>
    Number(web3Instance.utils.fromWei(value.toString(), "ether"));

  /**************************  Local States  ******************************/

  const [modalText, setModalText] = useState(null);
  const [txStatus, setTxStatus] = useState(null);

  const [
    { vWefiBalance, releaseable_vWefiBalance, totalVestingSchedules },
    setState,
  ] = useState({
    vWefiBalance: 0,
    releaseable_vWefiBalance: 0,
    vWefiLockedDuration: 0,
    totalVestingSchedules: 0,
  });

  /********************************************************/

  const loadData = async () => {
    try {
      let multicall = new Multicall({
        multicallCustomContractAddress:
          "0x7D44ce82D27eA6D6F19805e152d92807e504367A",
        web3Instance,
        tryAggregate: true,
      });

      const contractCallContext = [
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
              methodName: "getVestingSchedulesCountByBeneficiary",
              methodParameters: [account],
            },
          ],
        },
      ];

      const { results } = await multicall.call(contractCallContext);

      // vesting contract values
      const vWefiBalance = parseInt(
        results.vwefiTokenContract.callsReturnContext[0].returnValues[0].hex
      ).toLocaleString("fullwide", { useGrouping: false });
      const totalVestingSchedules = parseInt(
        results.vwefiTokenContract.callsReturnContext[2].returnValues[0].hex
      ).toLocaleString("fullwide", { useGrouping: false });

      let releaseable_vWefiBalance =
        results.vwefiTokenContract.callsReturnContext[1].returnValues[0]?.hex ||
        0;

      setState((p) => ({
        ...p,
        vWefiBalance: toEther(vWefiBalance),
        releaseable_vWefiBalance: toEther(releaseable_vWefiBalance),
        totalVestingSchedules,
        isDataLoaded: true,
      }));
    } catch (err) {}
  };

  useEffect(() => {
    isContractInitialized &&
      account &&
      isCorrectChain &&
      isWalletConnected &&
      loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, isContractInitialized, isCorrectChain, isWalletConnected]);

  /********************************************************/

  const onModalClose = () => {
    setModalText(null);
    setTxStatus(null);
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
          onTxCompete();
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

  return (
    <>
      <div className="inner-container">
        <div className="container-top">
          {/* Fixed Vesting */}

          <div className="row">
            <div className="col-md-12 col-lg-6 flex-center">
              <div className="inner-row">
                <h4 className="dash-sub-heading">Vested WEFI (vWEFI)</h4>
                <h4 className="dash-text dash-sub-heading">
                  {firstNPostiveNumbersAfterDecimal(vWefiBalance)}
                </h4>
              </div>
            </div>

            <div className="col-md-12 col-lg-6 flex-center">
              <div className="inner-row">
                <h4 className="dash-sub-heading">Claimable vWEFI</h4>
                <h4 className="dash-text dash-sub-heading">
                  {firstNPostiveNumbersAfterDecimal(releaseable_vWefiBalance)}
                </h4>
              </div>
            </div>

            <div className="col-md-12 col-lg-6 flex-center">
              <div className="inner-row">
                <h4 className="dash-sub-heading">Vesting Schedules</h4>
                <h4 className="dash-text dash-sub-heading">
                  {totalVestingSchedules}
                </h4>
              </div>
            </div>
            <div className="col-md-12 col-lg-6 flex-center">
              <button
                // eslint-disable-next-line eqeqeq
                disabled={releaseable_vWefiBalance == 0}
                onClick={claimFromAllVestings}
                className="dash-button button-base primary-button "
              >
                Claim vWEFI
              </button>
            </div>
          </div>

          {/* Fixed Vesting Info  end*/}
        </div>

        {totalVestingSchedules > 0 && (
          <div className="mt-5">
            <h3 className="dash-text dash-sub-heading">Vesting Info</h3>
            <hr style={{ marginTop: 0 }} />

            <div>
              <VestingInfoList vestingCount={totalVestingSchedules} />
            </div>
          </div>
        )}
      </div>

      <TransactionModal
        isOpen={Boolean(modalText)}
        txStatus={txStatus}
        modalText={modalText}
        onClose={onModalClose}
      />
    </>
  );
};

export default VestingInfo;

const VestingInfoList = ({ vestingCount = 0 }) => {
  const perPage = 10;

  const {
    contextState: { account, web3Instance },
  } = Web3UserContext();

  const toEther = (value) =>
    Number(web3Instance.utils.fromWei(value.toString(), "ether"));

  const [{ currentPage, vestingSchedulesInfo, onLoading }, setState] = useState(
    {
      currentPage: 0,
      vestingSchedulesInfo: [],
      onLoading: false,
    }
  );

  const loadVestingScheulesInfo = async (to = 0) => {
    setState((p) => ({ ...p, onLoading: true }));
    try {
      let multicall = new Multicall({
        multicallCustomContractAddress:
          "0x7D44ce82D27eA6D6F19805e152d92807e504367A",
        web3Instance,
        tryAggregate: true,
      });

      const calls = [];

      for (let i = vestingCount; i > to; i--) {
        calls.push({
          reference: "vWefiContract",
          methodName: "getVestingScheduleByBeneficiaryAndIndex",
          methodParameters: [account, i - 1],
        });
      }

      const contractCallContext = [
        {
          reference: "vwefiTokenContract",
          contractAddress: vWEFIContract.address,
          abi: vWEFIContract.abi,
          calls,
        },
      ];

      const { results } = await multicall.call(contractCallContext);

      const vestingSchedulesInfo =
        results.vwefiTokenContract.callsReturnContext.map((context) => {
          const [, , , start, duration, , amountTotal, released] =
            context.returnValues;

          const amountTotalEth = toEther(
            parseInt(amountTotal.hex).toLocaleString("fullwide", {
              useGrouping: false,
            })
          );
          const releasedEth = toEther(
            parseInt(released.hex).toLocaleString("fullwide", {
              useGrouping: false,
            })
          );
          const startDateInUnix = parseInt(start.hex).toLocaleString(
            "fullwide",
            { useGrouping: false }
          );
          const startDate = timeConverter(startDateInUnix);

          const durationInUnix = parseInt(duration.hex).toLocaleString(
            "fullwide",
            { useGrouping: false }
          );
          const endDate = timeConverter(
            Number(durationInUnix) + Number(startDateInUnix)
          );

          return {
            amountTotalEth,
            releasedEth,
            startDate,
            endDate,
          };
        });

      setState((p) => ({
        ...p,
        vestingSchedulesInfo,
        currentPage: vestingCount - perPage,
      }));
    } catch (e) {
      console.log({ e });
    }

    setState((p) => ({ ...p, onLoading: false }));
  };

  useEffect(() => {
    const initialPages = vestingCount > perPage ? vestingCount - perPage : 0;
    account && vestingCount && loadVestingScheulesInfo(initialPages);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, vestingCount]);

  // pagination loadMore
  const onLoadMore = async () => {
    let newPage = currentPage - perPage;

    const toPage = newPage < 0 ? 0 : newPage;

    await loadVestingScheulesInfo(toPage);
    setState((p) => ({
      ...p,
      currentPage: newPage,
    }));
  };
  return (
    <>
      <div className="row">
        <div className="col-12">
          <div className="row">
            <h5 className="col-1">VS#</h5>
            <h5 className="col-4 text-center">
              Released/Total
              <br /> (vWEFI)
            </h5>
            <h5 className="col-3">Started date</h5>
            <h5 className="col-4 text-center">End date</h5>
          </div>
        </div>
        <div className="col-12">
          <hr style={{ marginTop: 5 }} />
        </div>
        <div className="col-12">
          {vestingSchedulesInfo.map(
            ({ amountTotalEth, releasedEth, startDate, endDate }, index) => (
              <div className="row" key={index}>
                <p className="col-1">{index + 1})</p>
                <p className="col-4  text-center">
                  {firstNPostiveNumbersAfterDecimal(releasedEth)} /{" "}
                  {firstNPostiveNumbersAfterDecimal(amountTotalEth)}
                </p>
                <p className="col-3">{startDate}</p>
                <p className="col-4 text-center">{endDate}</p>
              </div>
            )
          )}
        </div>
      </div>

      {!onLoading && currentPage > 0 && (
        <div className="text-center mt-3">
          <button
            onClick={onLoadMore}
            style={{ maxWidth: "fit-content" }}
            className="button-base secondary-button"
          >
            <i className="fa fa-plus"></i>
          </button>
        </div>
      )}

      {onLoading && <LineOfDots />}
    </>
  );
};
