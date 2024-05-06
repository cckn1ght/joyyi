// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {BeefyVaultV7} from "../src/core/BeefyVaultV7.sol";
import {IStrategyV7} from "../src/interfaces/beefy/IStrategyV7.sol";
import {Path} from "../src/utils/Path.sol";
import {BytesLib} from "../src/utils/BytesLib.sol";
import  {UniswapV3Utils} from "../src/utils/UniswapV3Utils.sol";


contract VaultTest is Test {
//    using Path for bytes;
    using BytesLib for bytes;

    BeefyVaultV7 public vault;
    /// @dev The length of the bytes encoded address
    uint256 private constant ADDR_SIZE = 20;
    /// @dev The length of the bytes encoded fee
    uint256 private constant FEE_SIZE = 3;

    /// @dev The offset of a single token address and pool fee
    uint256 private constant NEXT_OFFSET = ADDR_SIZE + FEE_SIZE;
    /// @dev The offset of an encoded pool key
    uint256 private constant POP_OFFSET = NEXT_OFFSET + ADDR_SIZE;
    /// @dev The minimum length of an encoding that contains 2 or more pools
    uint256 private constant MULTIPLE_POOLS_MIN_LENGTH = POP_OFFSET + NEXT_OFFSET;
    function setUp() public {
    }
//    // Convert encoded path to token route
//    function pathToRoute(bytes memory _path) internal pure returns (address[] memory) {
//        uint256 numPools = _path.numPools();
//        address[] memory route = new address[](numPools + 1);
//        for (uint256 i; i < numPools; i++) {
//            (address tokenA, address tokenB,) = _path.decodeFirstPool();
//            route[i] = tokenA;
//            route[i + 1] = tokenB;
//            _path = _path.skipToken();
//        }
//        return route;
//    }
    function decodeFirstPool(bytes memory path)
    internal
    pure
    returns (
        address tokenA,
        address tokenB,
        uint24 fee
    )
    {
        tokenA = path.toAddress(0);
        fee = path.toUint24(ADDR_SIZE);
        tokenB = path.toAddress(NEXT_OFFSET);
    }
    function toAddress(bytes memory _bytes, uint256 _start) internal pure returns (address) {
        require(_bytes.length >= _start + 20, "toAddress_outOfBounds");
        address tempAddress;

        assembly {
            tempAddress := div(mload(add(add(_bytes, 0x20), _start)), 0x1000000000000000000000000)
        }

        return tempAddress;
    }
    function test_balance() public {
        bytes memory path = hex"912ce59144191c1204e64559fe8253a0e49e65480001f482af49447d8a07e3bd95bd0d56f35241523fbab10001f4fd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9";
//        address firstA = toAddress(path, 0);
//        console.logAddress(firstA);
        address[] memory routes = UniswapV3Utils.pathToRoute(path);
        for (uint i = 0; i < routes.length; i ++) {
            console.logAddress(routes[i]);
        }
//        (address tokenA, address tokenB, uint256 fee) = decodeFirstPool(path);
//        console.log("tokenA: ", tokenA);
//        console.log("tokenB: ", tokenB);
//        console.log("fee: ", fee);
    }
//
//    function testFuzz_SetNumber(uint256 x) public {
//        counter.setNumber(x);
//        assertEq(counter.number(), x);
//    }
}
