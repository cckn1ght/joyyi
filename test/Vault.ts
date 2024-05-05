import {
    time,
    loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre, {upgrades} from "hardhat";
import {ethers} from "ethers";
import {BeefyVaultV7} from "../typechain-types";

describe("Vault", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function deployVaultFixture() {
        // const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
        // const ONE_GWEI = 1_000_000_000;
        //
        // const lockedAmount = ONE_GWEI;
        // const unlockTime = (await time.latest()) + ONE_YEAR_IN_SECS;
        //
        // Contracts are deployed using the first signer/account by default
        const [owner, otherAccount] = await hre.ethers.getSigners();

        const Vault = await hre.ethers.getContractFactory("BeefyVaultV7");
        const vaultC = await upgrades.deployProxy(Vault, [hre.ethers.ZeroAddress, "Stargate Vault", "SV", 0], {kind: 'uups'});

        await vaultC.waitForDeployment();
        console.log("Vault deployed to:", await vaultC.getAddress());
        const vault = await hre.ethers.getContractAt('BeefyVaultV7', await vaultC.getAddress());
        return { vault, owner, otherAccount };
    }

    describe("Deployment", function () {
        it("Should deploy", async function () {
            const { vault, owner } = await loadFixture(deployVaultFixture);

            expect(await vault.strategy()).to.equal(hre.ethers.ZeroAddress);
        });

    });
});
