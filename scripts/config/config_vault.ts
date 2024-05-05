import {ethers} from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);
    const vault = await ethers.getContractAt("BeefyVaultV7", "", deployer);
    const strat = '0x477d1691Cb810A88769ac558b0b04D5671ab0cDD';
    const tx = await vault.proposeStrat(strat);
    console.log('proposeStrat tx:', tx.hash);
    await tx.wait();
    const upgradeStrat = await vault.upgradeStrat();
    console.log('upgradeStrat tx:', upgradeStrat.hash);
    await upgradeStrat.wait();
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
