import {ethers, network} from "hardhat";
import dotenv from "dotenv";
import {getNetworkConfig} from "../utils";

dotenv.config();

async function main() {
    const [deployer] = await ethers.getSigners();
    const networkConfig = getNetworkConfig();
    const invokerPk = process.env.INVOKER_PK ?? '';
    const invoker = new ethers.Wallet(invokerPk, deployer.provider);
    const vaultAddr = networkConfig.Joyyi.Vaults.AAVE_USDC;
    const vault = await ethers.getContractAt("BeefyVaultV7", vaultAddr, invoker);
    const usdcAddr = networkConfig.Assets.USDC;
    const usdc = await ethers.getContractAt('ERC20', usdcAddr, invoker);
    console.log('vault want:', await vault.want());

    const approveTx = await usdc.approve(await vault.getAddress(), ethers.MaxUint256);
    console.log('approve tx:', approveTx.hash);
    await approveTx.wait();
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
