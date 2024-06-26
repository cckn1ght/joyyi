// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol";

import "../Common/StratFeeManagerInitializable.sol";

import "../../interfaces/aave/IDataProvider.sol";
import "../../interfaces/aave/IAaveV3Incentives.sol";
import "../../interfaces/aave/ILendingPool.sol";
import "../Common/StratFeeManager.sol";
import "../../utils/UniswapV3Utils.sol";

contract StrategyAaveArbUSDC is UUPSUpgradeable, StratFeeManagerInitializable {
    using SafeERC20 for IERC20;

    // Tokens used
    address public native;
    address public output;
    address public want;
    address public aToken;

    // Third party contracts
    address public dataProvider;
    address public lendingPool;
    address public incentivesController;

    // Paths
    bytes public outputToNativePath;
    bytes public nativeToWantPath;

    bool public harvestOnDeposit;
    uint256 public lastHarvest;

    event StratHarvest(address indexed harvester, uint256 wantHarvested, uint256 tvl);
    event Deposit(uint256 tvl);
    event Withdraw(uint256 tvl);
    event ChargedFees(uint256 callFees, uint256 beefyFees, uint256 strategistFees);

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    function initialize(
        address _dataProvider,
        address _lendingPool,
        address _incentivesController,
        CommonAddresses calldata _commonAddresses,
        bytes memory _outputToNativePath,
        bytes memory _nativeToWantPath
    ) external initializer {
        __StratFeeManager_init(_commonAddresses);

        address[] memory outputToNativeRoute = UniswapV3Utils.pathToRoute(_outputToNativePath);
        address[] memory nativeToWantRoute = UniswapV3Utils.pathToRoute(_nativeToWantPath);
        native = nativeToWantRoute[0];
        want = nativeToWantRoute[nativeToWantRoute.length - 1];
        output = outputToNativeRoute[0];

        dataProvider = _dataProvider;
        lendingPool = _lendingPool;
        incentivesController = _incentivesController;

        (aToken,,) = IDataProvider(dataProvider).getReserveTokensAddresses(want);

        outputToNativePath = _outputToNativePath;
        nativeToWantPath = _nativeToWantPath;
        withdrawalFee = 0;
        _giveAllowances();
    }

    // puts the funds to work
    function deposit() public whenNotPaused {
        uint256 wantBal = balanceOfWant();

        if (wantBal > 0) {
            ILendingPool(lendingPool).deposit(want, wantBal, address(this), 0);
            emit Deposit(balanceOf());
        }
    }

    function withdraw(uint256 _amount) external {
        require(msg.sender == vault, "!vault");

        uint256 wantBal = balanceOfWant();
        if (wantBal < _amount) {
            ILendingPool(lendingPool).withdraw(want, _amount - wantBal, address(this));
            wantBal = balanceOfWant();
        }

        if (wantBal > _amount) {
            wantBal = _amount;
        }

        if (tx.origin != owner() && !paused()) {
            uint256 withdrawalFeeAmount = wantBal * withdrawalFee / WITHDRAWAL_MAX;
            wantBal = wantBal - withdrawalFeeAmount;
        }

        IERC20(want).safeTransfer(vault, wantBal);
        emit Withdraw(balanceOf());
    }

    function beforeDeposit() external override {
        if (harvestOnDeposit) {
            require(msg.sender == vault, "!vault");
            _harvest(tx.origin);
        }
    }

    function harvest() external virtual {
        _harvest(tx.origin);
    }

    function harvest(address callFeeRecipient) external virtual {
        _harvest(callFeeRecipient);
    }

    function managerHarvest() external onlyManager {
        _harvest(tx.origin);
    }

    // compounds earnings and charges performance fee
    function _harvest(address callFeeRecipient) internal whenNotPaused {
        address[] memory assets = new address[](1);
        assets[0] = aToken;
        IAaveV3Incentives(incentivesController).claimRewards(assets, type(uint).max, address(this), output);

        uint256 outputBal = IERC20(output).balanceOf(address(this));
        if (outputBal > 0) {
            chargeFees(callFeeRecipient);
            swapRewards();
            uint256 wantHarvested = balanceOfWant();
            deposit();

            lastHarvest = block.timestamp;
            emit StratHarvest(msg.sender, wantHarvested, balanceOf());
        }
    }

    // performance fees
    function chargeFees(address callFeeRecipient) internal {
        IFeeConfig.FeeCategory memory fees = getFees();
        uint256 toNative = IERC20(output).balanceOf(address(this));
        if (output != native) {
            UniswapV3Utils.swap(unirouter, outputToNativePath, toNative);
        }

        uint256 stratFees = IERC20(native).balanceOf(address(this)) * fees.total / DIVISOR;

        uint256 callFeeAmount = stratFees * fees.call / DIVISOR;
        IERC20(native).safeTransfer(callFeeRecipient, callFeeAmount);

        uint256 beefyFeeAmount = stratFees * fees.beefy / DIVISOR;
        IERC20(native).safeTransfer(beefyFeeRecipient, beefyFeeAmount);

        uint256 strategistFeeAmount = stratFees * fees.strategist / DIVISOR;
        IERC20(native).safeTransfer(strategist, strategistFeeAmount);

        emit ChargedFees(callFeeAmount, beefyFeeAmount, strategistFeeAmount);
    }

    // swap rewards to {want}
    function swapRewards() internal {
        uint256 nativeBal = IERC20(native).balanceOf(address(this));
        if (nativeBal > 0 && want != native) {
            UniswapV3Utils.swap(unirouter, nativeToWantPath, nativeBal);
        }
    }

    // return supply and borrow balance
    function userReserves() public view returns (uint256, uint256) {
        (uint256 supplyBal,,uint256 borrowBal,,,,,,) = IDataProvider(dataProvider).getUserReserveData(want, address(this));
        return (supplyBal, borrowBal);
    }

    // returns the user account data across all the reserves
    function userAccountData() public view returns (
        uint256 totalCollateralETH,
        uint256 totalDebtETH,
        uint256 availableBorrowsETH,
        uint256 currentLiquidationThreshold,
        uint256 ltv,
        uint256 healthFactor
    ) {
        return ILendingPool(lendingPool).getUserAccountData(address(this));
    }

    // calculate the total underlaying 'want' held by the strat.
    function balanceOf() public view returns (uint256) {
        return balanceOfWant() + balanceOfPool();
    }

    // it calculates how much 'want' this contract holds.
    function balanceOfWant() public view returns (uint256) {
        return IERC20(want).balanceOf(address(this));
    }

    // it calculates how much 'want' the strategy has working in the farm.
    function balanceOfPool() public view returns (uint256) {
        (uint256 supplyBal, uint256 borrowBal) = userReserves();
        return supplyBal - borrowBal;
    }

    // returns rewards unharvested
    function rewardsAvailable() public view returns (uint256) {
        address[] memory assets = new address[](1);
        assets[0] = aToken;
        return IAaveV3Incentives(incentivesController).getUserRewards(assets, address(this), output);
    }

    // native reward amount for calling harvest
//    function callReward() public view returns (uint256) {
//        IFeeConfig.FeeCategory memory fees = getFees();
//        uint256 outputBal = rewardsAvailable();
//        uint256 nativeOut;
//        if (outputBal > 0) {
//            UniswapV3Utils.swap(unirouter, outputToNativePath, outputBal);
//        }
//
//        return nativeOut * fees.total / DIVISOR * fees.call / DIVISOR;
//    }
//
    function setHarvestOnDeposit(bool _harvestOnDeposit) external onlyManager {
        harvestOnDeposit = _harvestOnDeposit;
        if (harvestOnDeposit) {
            setWithdrawalFee(0);
        } else {
            setWithdrawalFee(10);
        }
    }

    // called as part of strat migration. Sends all the available funds back to the vault.
    function retireStrat() external {
        require(msg.sender == vault, "!vault");

        ILendingPool(lendingPool).withdraw(want, type(uint).max, address(this));

        uint256 wantBal = balanceOfWant();
        IERC20(want).transfer(vault, wantBal);
    }

    // pauses deposits and withdraws all funds from third party systems.
    function panic() public onlyManager {
        ILendingPool(lendingPool).withdraw(want, type(uint).max, address(this));
        pause();
    }

    function pause() public onlyManager {
        _pause();

        _removeAllowances();
    }

    function unpause() external onlyManager {
        _unpause();

        _giveAllowances();

        deposit();
    }

    function _giveAllowances() internal {
        IERC20(want).approve(lendingPool, type(uint).max);
        IERC20(output).approve(unirouter, type(uint).max);
        IERC20(native).approve(unirouter, type(uint).max);
    }

    function _removeAllowances() internal {
        IERC20(want).approve(lendingPool, 0);
        IERC20(output).approve(unirouter, 0);
        IERC20(native).approve(unirouter, 0);
    }
}
