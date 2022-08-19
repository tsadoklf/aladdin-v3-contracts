// SPDX-License-Identifier: MIT
pragma solidity >=0.8.8;

import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";

import "../../interfaces/IUniswapV2Pair.sol";
import "../../interfaces/IWETH.sol";

import {CommonLib } from "./CommonLib.sol";

library UniswapV2PairLib {
	using SafeERC20Upgradeable for IERC20Upgradeable;

	/// @dev The address of WETH token.
    address internal constant WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;

	function swap(address _pool, uint256 _indexIn, uint256 _indexOut, uint256 _amountIn) internal returns (uint256) {
        uint256 _rIn;
        uint256 _rOut;
        address _tokenIn;
        
        if (_indexIn < _indexOut) {
            (_rIn, _rOut, ) = IUniswapV2Pair(_pool).getReserves();
            _tokenIn = IUniswapV2Pair(_pool).token0();
        } else {
            (_rOut, _rIn, ) = IUniswapV2Pair(_pool).getReserves();
            _tokenIn = IUniswapV2Pair(_pool).token1();
        }
        // TODO: handle fee on transfer token
        uint256 _amountOut = _amountIn * 997;
        _amountOut = (_amountOut * _rOut) / (_rIn * 1000 + _amountOut);

        CommonLib.wrapTokenIfNeeded(_tokenIn, _amountIn);

        IERC20Upgradeable(_tokenIn).safeTransfer(_pool, _amountIn);

        if (_indexIn < _indexOut) {
            IUniswapV2Pair(_pool).swap(0, _amountOut, address(this), new bytes(0));
        } else {
            IUniswapV2Pair(_pool).swap(_amountOut, 0, address(this), new bytes(0));
        }
        return _amountOut;
    }
}