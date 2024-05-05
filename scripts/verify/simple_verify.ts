import {run} from "hardhat";
import "@nomiclabs/hardhat-ethers/internal/type-extensions";

async function main() {
    const contract = `contracts/projects/tcq/TheCalderQuestion.sol:TheCalderQuestion`;
    // const constructorArguments = [config.ProxyImplementations.SimpleERC721AProject];
    await run("verify:verify", {
        // address,
        contract,
        // constructorArguments,
    });
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
