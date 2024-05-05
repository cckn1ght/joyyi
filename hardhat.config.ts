import {HardhatUserConfig} from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";
import dotenv from 'dotenv';

dotenv.config();

const accounts = [process.env.DEPLOYER_PK ?? ''];

const config: HardhatUserConfig = {
    solidity: {
        compilers: [
            {
                version: "0.8.20",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200,
                    },
                },
            },
        ],
    },
    networks: {
        hardhat: {
            chainId: 1337,
        },
        arbitrum: {
            url: process.env.ARBITRUM_RPC || "https://arb1.arbitrum.io/rpc",
            chainId: 42161,
            accounts,
        },
    },
    paths: {
        sources: "./src",
    },
    etherscan: {
        // Your API key for Etherscan
        // Obtain one at https://etherscan.io/
        apiKey: {
            arbitrumOne: process.env.ARB_API_KEY!,
        },
    }
};

export default config;
