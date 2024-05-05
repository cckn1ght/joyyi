import {ethers} from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);
    const stratAddr = '0x477d1691Cb810A88769ac558b0b04D5671ab0cDD';
    const start = await ethers.getContractAt('StrategyAaveArbUSDT', stratAddr, deployer);
    const tx = await start.setVault('0x1c8eDe544173d3a898409A653dd8268E5d4c3d92');
    console.log('set vault tx:', tx.hash);
    await tx.wait();
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
