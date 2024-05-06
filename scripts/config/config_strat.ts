import {ethers} from "hardhat";
import {getNetworkConfig} from "../utils";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);
    const networkConfig = getNetworkConfig();
    const stratAddr = networkConfig.Joyyi.Strategies.AAVE_USDC;
    const start = await ethers.getContractAt('StrategyAaveArbUSDC', stratAddr, deployer);
    const vaultAddr = networkConfig.Joyyi.Vaults.AAVE_USDC;
    const tx = await start.setVault(vaultAddr);
    console.log('set vault tx:', tx.hash);
    await tx.wait();
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
