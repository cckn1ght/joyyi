import hardhat, {ethers, upgrades} from "hardhat";
import {getImplAddress} from "../utils";

async function main() {
    const [deployer] = await ethers.getSigners();
    const BeefyVaultV7 = await ethers.getContractFactory("BeefyVaultV7");
    const beefyVault = await upgrades.deployProxy(BeefyVaultV7, [
        '0x477d1691Cb810A88769ac558b0b04D5671ab0cDD',
        "AAVE Vault",
        "AVAULT",
        0,
    ]);
    await beefyVault.waitForDeployment();
    console.log("BeefyVaultV7 deployed to:", await beefyVault.getAddress());
    const implAddr = await getImplAddress(deployer.provider, await beefyVault.getAddress());
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
