import {ethers} from "hardhat";
import type {AddressLike} from "ethers";

async function main() {
    const [deployer] = await ethers.getSigners();

    const Strategy = await ethers.getContractFactory("StrategyStargateArb");
    const want = '0xB6CfcF89a7B22988bfC96632aC2A9D6daB60d641' // Stargate USDT LP
    const poolId = 1; // Stargate USDT LP Pool
    const chef = '0x9774558534036Ff2E236331546691b4eB70594b1' // stargate LPStakingTime
    const stargateRouter = '0x53bf833a5d6c4dda888f69c22c88c9f356a41614'; // Stargate Router
    const routerPoolId = 2; // Stargate Router USDT Pool
    const commonAddress = {
        vault: '',
        unirouter: '0xE592427A0AEce92De3Edee1F18E0157C05861564', // uniswap router
        keeper: deployer.address,
        strategist: deployer.address,
        beefyFeeRecipient: deployer.address,
        beefyFeeConfig: '0xD6D754368A3C5Bc4Fc35cC70773Ff13857Ecc7a6'
    }
    const outputToNativeRoute = [
        '0x912CE59144191C1204E64559FE8253a0e49E6548', // ARB
        '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1' // WETH
    ];
    const outputToDepositRoute = [
        '0x912CE59144191C1204E64559FE8253a0e49E6548', // ARB
        '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9' // USDT
    ]
    // const outputToNativePools =
    // Strategy.deploy(
    //
    // );
    // console.log("BeefyVaultV7 deployed to:", await beefyVault.getAddress());
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
