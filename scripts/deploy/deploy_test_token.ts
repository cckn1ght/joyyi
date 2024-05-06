import hardhat, {ethers} from "hardhat";
import dotenv from "dotenv";

dotenv.config();
async function main() {
    const [deployer] = await ethers.getSigners();
    console.log({deployer: deployer.address});
    const TestToken = await ethers.getContractFactory("TestToken");
    const initSupply = ethers.parseEther('1000000');
    const name = "Test Arbi"
    const symbol = "TARBI"
    const testToken = await TestToken.deploy(initSupply, name, symbol);
    await testToken.waitForDeployment();
    console.log("TestToken deployed to:", await testToken.getAddress());
    const invokerPk = process.env.INVOKER_PK ?? '';
    const invoker = new ethers.Wallet(invokerPk, deployer.provider);
    const transferTx = await testToken.transfer(invoker.address, ethers.parseEther('1000'));
    console.log('transfer tx:', transferTx.hash);
    await transferTx.wait();

    const verifyArgs = {
        address: await testToken.getAddress(),
        constructorArguments: [initSupply, name, symbol]
    };

    await hardhat.run("verify:verify", verifyArgs);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });