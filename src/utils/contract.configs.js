import presaleAbi from "../assets/abis/presale-abi.json";
import wefiTokenAbi from "../assets/abis/wefi-token-abi.json";
import vWefiAbi from "../assets/abis/vWefi.abi.json";
import rWefiAbi from "../assets/abis/rWefi.abi.json";

const presaleContract = {
  address: "0x2482817262DD26C8e8955962913560fCb8A98934",
  abi: presaleAbi,
};

const wefiTokenContract = {
  address: "0x29a11801a2d355c46AF338be6A0B42F32dac220b",
  abi: wefiTokenAbi,
};

const vWEFIContract = {
  address: "0x1b6C5F5761C826Ee421c96d39173cA5cc6b39CC8",
  abi: vWefiAbi,
};

const rWEFIContract = {
  address: "0x8343443d68eA2fb2C6F28b48de433Dc099Ae669F",
  abi: rWefiAbi,
};
export { presaleContract, wefiTokenContract, vWEFIContract, rWEFIContract };
