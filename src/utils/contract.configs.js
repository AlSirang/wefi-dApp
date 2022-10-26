import presaleAbi from "../assets/abis/presale-abi.json";
import wefiTokenAbi from "../assets/abis/wefi-token-abi.json";
import vWefiAbi from "../assets/abis/vWefi.abi.json";
import rWefiAbi from "../assets/abis/rWefi.abi.json";

const presaleContract = {
  address: "0xD5B6ADc7Fca70f0330ABB71454c2066d9E91eBF3",
  abi: presaleAbi,
};

const wefiTokenContract = {
  address: "0xFa5b406AF41F2f2bbCd432Db23c11d122701A1DB",
  abi: wefiTokenAbi,
};

const vWEFIContract = {
  address: "0x281a8583378486112169bc9E9860252FA60dFCBe",
  abi: vWefiAbi,
};

const rWEFIContract = {
  address: "0x95507C95d51953420039051719c7fFAb612F956C",
  abi: rWefiAbi,
};
export { presaleContract, wefiTokenContract, vWEFIContract, rWEFIContract };
