import hardhat, {ethers} from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();
    const dataProvider = '0x69FA688f1Dc47d4B5d8029D5a35FB7a548310654'; // AAve data provider
    const lendingPool = '0x794a61358D6845594F94dc1DB02A252b5b4814aD'; // Aave lending pool
    const commonAddress = {
        vault: ethers.ZeroAddress,
        unirouter: '0xE592427A0AEce92De3Edee1F18E0157C05861564', // uniswap router
        keeper: deployer.address,
        strategist: deployer.address,
        beefyFeeRecipient: deployer.address,
        beefyFeeConfig: '0xD6D754368A3C5Bc4Fc35cC70773Ff13857Ecc7a6'
    }
    const want = '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9'; // USDT
    const Strategy = await ethers.getContractFactory("StrategyAaveArbUSDT");
    const strategy = await Strategy.deploy(dataProvider, lendingPool, commonAddress, want);
    const strategyAddr = await strategy.getAddress();
    console.log("StrategyAaveArbUSDT deployed to:", strategyAddr);
    const feeConfiguratorVerificationArgs = {
        address: strategyAddr,
        constructorArguments: [dataProvider, lendingPool, commonAddress, want]
    };

    await hardhat.run("verify:verify", feeConfiguratorVerificationArgs);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
