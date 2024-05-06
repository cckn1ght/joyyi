import {ethers, Provider} from "ethers";
import ArbiMainnet from "../.arbitrum.json";
import ArbiSepolia from "../.arbitrum.sepolia.json";
import {network} from "hardhat";


const IMPLEMENTATION_SLOT = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";

export const getImplAddress = async (provider: Provider, contract: string): Promise<string> => {
    const rawAddr = await provider.getStorage(contract, IMPLEMENTATION_SLOT);
    return ethers.getAddress(ethers.dataSlice(rawAddr, 12));
};


export function getNetworkConfig() {
    console.log("on network: ", network.name);
    if (network.name == "arbitrum") {
        console.log("\n");
        return ArbiMainnet;
    } else if (network.name == "arbitrum-sepolia") {
        return ArbiSepolia;
    }
    throw new Error("network not supported");
}
