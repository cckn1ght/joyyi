import {ethers} from "hardhat";
import dotenv from "dotenv";

dotenv.config();

async function main() {
    const [deployer] = await ethers.getSigners();

    const invokerPk = process.env.INVOKER_PK ?? '';
    const invoker = new ethers.Wallet(invokerPk, deployer.provider);
    const vault = await ethers.getContractAt("BeefyVaultV7", "0x1c8eDe544173d3a898409A653dd8268E5d4c3d92", invoker);
    const usdt = await ethers.getContractAt('ERC20', '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9', invoker);
    console.log('vault want:', await vault.want());
    // const approveTx = await usdt.approve(await vault.getAddress(), ethers.MaxUint256);
    // console.log('approve tx:', approveTx.hash);
    // await approveTx.wait();
    const depositTx = await vault.depositAll({gasLimit: 700417});
    console.log('depositAll tx:', depositTx.hash);
    await depositTx.wait();
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
