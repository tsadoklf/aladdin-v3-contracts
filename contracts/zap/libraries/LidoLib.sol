// SPDX-License-Identifier: MIT
pragma solidity >=0.8.8;

import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";

import "../../interfaces/ILidoStETH.sol";
import "../../interfaces/ILidoWstETH.sol";
import "../../interfaces/IWETH.sol";

import {CommonLib } from "./CommonLib.sol";

library LidoLib {
	using SafeERC20Upgradeable for IERC20Upgradeable;
    using SafeMathUpgradeable for uint256;
	
    /// @dev The address of Lido's stETH token.
    address private constant stETH = 0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84;

    /// @dev The address of Lido's wstETH token.
    address private constant wstETH = 0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0;

	/// @dev The address of WETH token.
    address internal constant WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;

    function wrapSTETH(uint256 _amountIn, uint256 _action) internal returns (uint256) {
        require(_action == 1, "AladdinZap: not wrap action");
        CommonLib.unwrapIfNeeded(_amountIn);
        uint256 _before = IERC20Upgradeable(stETH).balanceOf(address(this));
        ILidoStETH(stETH).submit{ value: _amountIn }(address(0));
        return IERC20Upgradeable(stETH).balanceOf(address(this)).sub(_before);
    }

    function wrapWSTETH(uint256 _amountIn, uint256 _action) internal returns (uint256) {
        if (_action == 1) {
            CommonLib.approve(stETH, wstETH, _amountIn);
            return ILidoWstETH(wstETH).wrap(_amountIn);
        } else if (_action == 2) {
            return ILidoWstETH(wstETH).unwrap(_amountIn);
        } else {
            revert("AladdinZap: invalid action");
        }
    }
}