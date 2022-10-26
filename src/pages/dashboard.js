import { useEffect, useRef, useState } from "react";
import Layout from "../components/layout";
import { DashboardBox } from "../components/dasnboard.units";
import FrostedGlassOverlay from "../components/frostedGlassOverlay";
import Web3Buttons from "../components/Web3Buttons";
import { Web3UserContext } from "../context";
import "../styles/dashboard.css";

/**
Information WRITEABLE for all smart contracts:

TokenVestingWEFI:
1) To claim the releaseable tokens from all the vesting schedules of the user. ( claimFromAllVestings( ) )

TokenRewardsRegisterWEFI:
2) To register(stake) WEFI tokens in the rewards register program. ( registerTokens( ) )

3) To unregister(unstake) the registered tokens from the rewards register program. ( unregisterTokens( ) )

4) To claim the reward tokens from the rewards register program. ( claimRewards( ) )

NOTE: Check information READABLE points (16-20) if they needed to be included in dashboard.
 */

/*****************************************/

/**
 
    #2. This is updated readable information. It contains updated points in last 2 contracts.

    Information readable for all 4 smart contracts:

    TokenWEFI:
    1) Total WEFI balance of the user after CONNECT WALLET. ( balanceOf( ) )
    2) Total reflections distributed among the holders till the current time. ( totalReflectionsDistributed( ) )
    3) Total tokens burnt till the current time. ( tokensBurnt( ) )

    TokenVestingWEFI:
    4) Total vWEFI balance of the user after CONNECT WALLET. ( balanceOf( ) )
    5) Total releasable token amount for the beneficiary as per current time from all his vesting schedules. ( computeReleaseableAmount( ) )
    6) Last vesting schedule of the beneficiary, if he has multiple vesting schedules then the last one will be shown. ( getLastVestingScheduleForBeneficiary( ) )
    7) Number of tokens locked in vesting schedule. ( totalSupply( ) )

    TokenPresaleWEFI:
    8) Total amount of BNBs raised i.e. total BNB balance of the contract. ( getContractBnbBalance( ) )
    9) Total amount of WEFI tokens left in the presale contract for sale. ( getContractTokenBalance( ) )
    10) Vesting schedule for current presale round as per of which tokens will be locked if someone buys. ( getVestingSchedule( ) )
    11) Token price in BNB for 1 token. ( tokenPriceInWei( ) )
    12) To fetch/show the referral code of any account address. ( showReferralCode( ) )
    13) There is an extra bonus percentage as an incentive which the buyer will get if he will use someone's referral code. ( referralCodeBonusPercentage( ) )
    14) Referrer will get that amount of commission percentage if he refers some byer to presale. ( referralCommissionPercentage( ) )
    15) Vesting schedule of Buyer and Referrer could also be accessed. ( getBuyerVestingSchedule( ), getReferrerVestingSchedule( ) )

    TokenRewardsRegisterWEFI:
    16) Total rWEFI balance of the user after CONNECT WALLET. ( balanceOf( ) )
    17) Time duration for getting rewards after registration. ( registeringDurationForRewards( ) )
    18) Total amount of tokens registered in the contract. ( totalRegisteredBalanceWEFI( ) )
    19) Total amount of token rewards which are due for distribution in the contract. ( totalRewardsBalanceWEFI( ) )
    20) Total amount of rewards that the user could claim and what is his release time. ( viewClaimableRewardsAndReleaseTime( ) )
 */

/******************************************* */

/**
     
TokenWEFI:
============
Amount of WEFI Token = Total WEFI balance of the user after CONNECT WALLET. ( balanceOf() )



2)TokenVestingWEFI:
===================
Amount of vWEFI - Total vWEFI balance of the user after CONNECT WALLET. ( balanceOf() )

Available vWEFI - Total releasable token amount for the beneficiary as per current time from all his vesting schedules. ( computeReleaseableAmount() )

Locked For - Last vesting schedule of the beneficiary, if he has multiple vesting schedules then the last one will be shown. ( getLastVestingScheduleForBeneficiary() )

vWEFI Locked - Number of tokens locked in vesting schedule. ( totalSupply() )


4)TokenRewardsRegisterWEFI:
===========================
Reward Member For - Time duration for getting rewards after registration. ( registeringDurationForRewards() )

Amount of rWEFI - Total rWEFI balance of the user after CONNECT WALLET. ( balanceOf() )
     */

/**
 * 
 * 
 * TokenWEFI:
https://testnet.bscscan.com/address/0xfa5b406af41f2f2bbcd432db23c11d122701a1db#code

TokenVestingWEFI:
https://testnet.bscscan.com/address/0x281a8583378486112169bc9e9860252fa60dfcbe#code

TokenPresaleWEFI:
https://testnet.bscscan.com/address/0xd5b6adc7fca70f0330abb71454c2066d9e91ebf3#code

TokenRewardsRegisterWEFI:
https://testnet.bscscan.com/address/0x95507c95d51953420039051719c7ffab612f956c#code

 */

let setTimeoutId = null;

const Dashboard = () => {
  const {
    contextState: {
      account,
      isCorrectChain,
      isWalletConnected,
      wefiContractInstance,
      vWefiContractInstance,
      presaleContractInstance,
      rWefiContractInstance,

      web3Instance,
      isContractInitialized,
    },
  } = Web3UserContext();

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
  });

  const toEther = (value) =>
    Number(web3Instance.utils.fromWei(value.toString(), "ether")).toFixed(2);

  const loadData = async () => {
    try {
      const _referralCode = presaleContractInstance.methods
        .showReferralCode(account)
        .call();

      const _wefiBalance = wefiContractInstance.methods
        .balanceOf(account)
        .call();

      const _rWefiBalance = rWefiContractInstance.methods
        .balanceOf(account)
        .call();

      const _vWefiBalance = vWefiContractInstance.methods
        .balanceOf(account)
        .call();

      const _lockedTokens = vWefiContractInstance.methods.totalSupply().call();

      const [
        referralCode,
        wefiBalance,
        rWefiBalance,
        vWefiBalance,
        lockedTokens,
      ] = await Promise.all([
        _referralCode,
        _wefiBalance,
        _rWefiBalance,
        _vWefiBalance,
        _lockedTokens,
      ]);

      setState((p) => ({
        ...p,
        referralCode,
        wefiBalance: toEther(wefiBalance),
        rWefiBalance: toEther(rWefiBalance),
        vWefiBalance: toEther(vWefiBalance),
        lockedTokens: toEther(lockedTokens),
      }));

      vWefiContractInstance.methods
        .computeAllReleasableAmountForBeneficiary(account)
        .call()
        .then((res) => {
          setState((p) => ({
            ...p,
            releaseable_vWefiBalance: toEther(res),
          }));
        })
        .catch(console.log);

      vWefiContractInstance.methods
        .getLastVestingScheduleForBeneficiary(account)
        .call()
        .then((res) => {
          setState((p) => ({
            ...p,
            vWefiLockedDuration: res,
          }));
        })
        .catch(console.log);
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
                      {wefiBalance}
                    </h4>
                  </div>
                </div>

                <div className="container-bottom">
                  <button className="dash-button button-base primary-button ">
                    Claim vWEFI
                  </button>
                </div>
              </div>
            </DashboardBox>
          </div>
          <div className="col-lg-6 col-md-12">
            <DashboardBox>
              <div className="inner-container">
                <div className="container-top">
                  <div className="inner-row">
                    <h4 className="dash-sub-heading">Reward Member For </h4>
                    <h4 className="dash-text dash-sub-heading">0 Days</h4>
                  </div>

                  <div className="inner-row">
                    <h4 className="dash-sub-heading"> Amount of rWEFI</h4>
                    <h4 className="dash-text dash-sub-heading">
                      {rWefiBalance}
                    </h4>
                  </div>

                  <div className="inner-row">
                    <h4 className="dash-sub-heading">Register </h4>
                    <h4 className="dash-text dash-sub-heading">___ WEFI</h4>
                  </div>
                  <div className="inner-row">
                    <h4 className="dash-sub-heading">Unregister </h4>
                    <h4 className="dash-text dash-sub-heading">___ rWEFI</h4>
                  </div>
                </div>
                <div className="container-bottom">
                  <button className="dash-button button-base primary-button ">
                    Submit Now
                  </button>
                </div>
              </div>
            </DashboardBox>
          </div>
          <div className="col-lg-6 col-md-12">
            <DashboardBox>
              <div className="inner-container">
                <div className="container-top">
                  <div className="inner-row">
                    <h4 className="dash-sub-heading">Eligible rWEFI </h4>
                    <h4 className="dash-text dash-sub-heading">0</h4>
                  </div>
                  <div className="inner-row">
                    <h4 className="dash-sub-heading">Total rWEFI</h4>
                    <h4 className="dash-text dash-sub-heading">0</h4>
                  </div>
                </div>

                <div className="container-bottom">
                  <button className="dash-button button-base primary-button ">
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
    </Layout>
  );
};

export default Dashboard;
