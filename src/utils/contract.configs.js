import presaleAbi from "../assets/abis/presale-abi.json";
import wefiTokenAbi from "../assets/abis/wefi-token-abi.json";
import vWefiAbi from "../assets/abis/vWefi.abi.json";
import rWefiAbi from "../assets/abis/rWefi.abi.json";

const presaleContract = {
  address: "0x43a3766f810686f6025adbD18B5bF7e877ef40Ba",
  abi: presaleAbi,
};

const wefiTokenContract = {
  address: "0xB08eBf48B2f5e6C6a5F2D21D1dfbb7B9B36ca7BB",
  abi: wefiTokenAbi,
};

const vWEFIContract = {
  address: "0xfD086EFB0C83e42fb4B4CCfC6A9690477faE8bab",
  abi: vWefiAbi,
};

const rWEFIContract = {
  address: "0x357252347b388aa519AA7A9896420EDbb60e9560",
  abi: rWefiAbi,
};
export { presaleContract, wefiTokenContract, vWEFIContract, rWEFIContract };
