import {ethers, upgrades} from "hardhat";
import {getNetworkConfig} from "../utils";

async function main() {
    const Strategy = await ethers.getContractFactory("StrategyAaveArbUSDC");
    const networkConfig = getNetworkConfig();
    const strategyAddr = networkConfig.Joyyi.Strategies.AAVE_USDC;
    const strategy = await upgrades.upgradeProxy(strategyAddr, Strategy, {kind: 'uups'});
    await strategy.waitForDeployment();
    console.log("tx: ", strategy.deploymentTransaction()?.hash);
    console.log("StrategyAaveArbUSDC upgraded at:", strategy.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });