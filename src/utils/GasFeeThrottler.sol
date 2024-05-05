// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./IGasPrice.sol";

contract GasFeeThrottler {

    bool public shouldGasThrottle = true;

    address public gasprice = address(0xA43509661141F254F54D9A326E8Ec851A0b95307);
    function _isContract(address account) internal view returns (bool) { return account.code.length > 0; }

    modifier gasThrottle() {
        if (shouldGasThrottle && _isContract(gasprice)) {
            require(tx.gasprice <= IGasPrice(gasprice).maxGasPrice(), "gas is too high!");
        }
        _;
    }
}