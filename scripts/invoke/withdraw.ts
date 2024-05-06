import {ethers} from "hardhat";
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
    const withdrawTx = await vault.withdrawAll({gasLimit: 700417});
    console.log('withdrawAll tx:', withdrawTx.hash);
    await withdrawTx.wait();
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
