// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test} from "forge-std/Test.sol";
import {BeefyVaultV7} from "../src/core/BeefyVaultV7.sol";
import {IStrategyV7} from "../src/interfaces/beefy/IStrategyV7.sol";
import {Upgrades} from "openzeppelin-foundry-upgrades/Upgrades.sol";

contract VaultTest is Test {
    BeefyVaultV7 public vault;

    function setUp() public {
        address proxy = Upgrades.deployUUPSProxy(
            "BeefyVaultV7.sol",
            abi.encodeCall(BeefyVaultV7.initialize, (IStrategyV7(address(0x0)), "Stargate Vault", "SV", 0))
        );
        vault = BeefyVaultV7(proxy);
    }

    function test_balance() public {
        assertEq(vault.balance(), 0);
    }
//
//    function testFuzz_SetNumber(uint256 x) public {
//        counter.setNumber(x);
//        assertEq(counter.number(), x);
//    }
}
