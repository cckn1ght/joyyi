import hardhat, {ethers, upgrades} from "hardhat";
import {getImplAddress, getNetworkConfig} from "../utils";

async function main() {
    const [deployer] = await ethers.getSigners();
    const networkConfig = getNetworkConfig();
    const dataProvider = networkConfig.AAVE.DATA_PROVIDER;
    const lendingPool = networkConfig.AAVE.LENDING_POOL;
    const incentiveController = networkConfig.AAVE.INCENTIVE_CONTROLLER;
    const commonAddress = {
        vault: ethers.ZeroAddress,
        unirouter: networkConfig.Joyyi.Common.UNIROUTER, // uniswap router
        keeper: deployer.address,
        strategist: deployer.address,
        beefyFeeRecipient: deployer.address,
        beefyFeeConfig: networkConfig.Joyyi.Common.FeeConfigurator
    }
    const want = networkConfig.Assets.USDC; // USDC
    const output = networkConfig.Assets.ARB; // ARB
    const native = networkConfig.Assets.WETH;
    const outputToNativePath = ethers.solidityPacked(["address", "uint24", "address"], [output, 500, native]);
    const nativeToWantPath = ethers.solidityPacked(["address", "uint24", "address"], [native, 500, want]);

    const Strategy = await ethers.getContractFactory("StrategyAaveArbUSDC");
    const args = [
        dataProvider,
        lendingPool,
        incentiveController,
        commonAddress,
        outputToNativePath,
        nativeToWantPath
    ]
    const strategy = await upgrades.deployProxy(Strategy, args, {kind: 'uups'});
    // const strategy = await Strategy.deploy(dataProvider, lendingPool, commonAddress, want);
    const strategyAddr = await strategy.getAddress();
    console.log("StrategyAaveArbUSDC deployed to:", strategyAddr);
    const implAddr = await getImplAddress(deployer.provider, strategyAddr);
    const verifyConfig = {
        address: implAddr,
    };
    await hardhat.run("verify:verify", verifyConfig);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });