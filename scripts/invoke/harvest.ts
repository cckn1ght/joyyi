import {ethers} from "hardhat";
import {getNetworkConfig} from "../utils";

async function main() {
    const [deployer] = await ethers.getSigners();
    const networkConfig = getNetworkConfig();
    const stratAddr = networkConfig.Joyyi.Strategies.AAVE_USDC;
    const strategy = await ethers.getContractAt("StrategyAaveArbUSDC", stratAddr, deployer);
    const harvestTx = await strategy["harvest()"]();
    console.log('harvest tx:', harvestTx.hash);
    await harvestTx.wait();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });