import {ethers, Provider} from "ethers";


const IMPLEMENTATION_SLOT = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";

export const getImplAddress = async (provider: Provider, contract: string): Promise<string> => {
    const rawAddr = await provider.getStorage(contract, IMPLEMENTATION_SLOT);
    return ethers.getAddress(ethers.dataSlice(rawAddr, 12));
};
