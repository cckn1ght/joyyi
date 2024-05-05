import hardhat from 'hardhat';
import {ethers, upgrades} from "hardhat";
import {getImplAddress} from "../utils";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log({deployer: deployer.address});
    const BeefyFeeConfigurator = await ethers.getContractFactory("BeefyFeeConfigurator", deployer);
    const keeper = deployer.address;
    const totalLimit = ethers.parseEther('0.095');
    const args = [
        keeper,
        totalLimit
    ]
    const feeConfigurator = await upgrades.deployProxy(BeefyFeeConfigurator, args);
    await feeConfigurator.waitForDeployment();
    console.log("feeConfigurator deployed to:", await feeConfigurator.getAddress());

    const implAddr = await getImplAddress(deployer.provider, await feeConfigurator.getAddress());
    console.log({implAddr})
    const feeConfiguratorVerificationArgs = {
        address: implAddr,
        // constructorArguments: args
    };

    await hardhat.run("verify:verify", feeConfiguratorVerificationArgs);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
