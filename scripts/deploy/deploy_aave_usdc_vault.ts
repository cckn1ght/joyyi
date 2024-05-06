import hardhat, {ethers, upgrades} from "hardhat";
import {getImplAddress, getNetworkConfig} from "../utils";

async function main() {
    const [deployer] = await ethers.getSigners();
    const BeefyVaultV7 = await ethers.getContractFactory("BeefyVaultV7");
    const networkConfig = getNetworkConfig();
    const usdcStrategy = networkConfig.Joyyi.Strategies.AAVE_USDC;
    const name = "AAVE USDC Vault";
    const symbol = "AAVEUSDC";
    const approvalDelay = 0;
    const args = [
        usdcStrategy,
        name,
        symbol,
        approvalDelay
    ]
    const beefyVault = await upgrades.deployProxy(BeefyVaultV7, args, {kind: 'uups'});
    await beefyVault.waitForDeployment();
    console.log("BeefyVaultV7 deployed to:", await beefyVault.getAddress());
    const implAddr = await getImplAddress(deployer.provider, await beefyVault.getAddress());
    console.log({implAddr})
    const verifyArgs = {
        address: implAddr,
        // constructorArguments: args
    };

    await hardhat.run("verify:verify", verifyArgs);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
