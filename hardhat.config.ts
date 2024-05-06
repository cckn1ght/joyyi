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
            {
                version: "0.4.18",
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
        "arbitrum-sepolia": {
            url: process.env.ARB_SEPOLIA_RPC || "https://endpoints.omniatech.io/v1/arbitrum/sepolia/public",
            chainId: 421614,
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
            arbitrumOne: process.env.ARB_API_KEY ?? '',
            arbitrumSepolia: process.env.ARB_API_KEY ?? '',
        },
    }
};

export default config;
