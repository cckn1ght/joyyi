import hardhat, {ethers} from "hardhat";
import dotenv from "dotenv";

dotenv.config();
async function main() {
    const [deployer] = await ethers.getSigners();
    console.log({deployer: deployer.address});
    const WETH = await ethers.getContractFactory("WETH9");
    const weth = await WETH.deploy();
    await weth.waitForDeployment();
    console.log("weth deployed to:", await weth.getAddress());

    const verifyArgs = {
        address: await weth.getAddress(),
        constructorArguments: []
    };

    await hardhat.run("verify:verify", verifyArgs);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });