// SPDX-License-Identifier: MIT
pragma solidity >=0.8.8;

import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";

import "../../interfaces/IUniswapV3Router.sol";
import "../../interfaces/IUniswapV3Pool.sol";
import "../../interfaces/IWETH.sol";

import {CommonLib } from "./CommonLib.sol";

library UniswapV3PoolLib {
	using SafeERC20Upgradeable for IERC20Upgradeable;
	
    /// @dev The address of Uniswap V3 Router
    address private constant UNISWAP_V3_ROUTER = 0xE592427A0AEce92De3Edee1F18E0157C05861564;

	/// @dev The address of WETH token.
    address internal constant WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;

	function swap(address _pool, uint256 _indexIn, uint256 _indexOut, uint256 _amountIn) internal returns (uint256) {
        address _tokenIn;
        address _tokenOut;
        uint24 _fee = IUniswapV3Pool(_pool).fee();
        
        if (_indexIn < _indexOut) {
            _tokenIn = IUniswapV3Pool(_pool).token0();
            _tokenOut = IUniswapV3Pool(_pool).token1();
        } else {
            _tokenIn = IUniswapV3Pool(_pool).token1();
            _tokenOut = IUniswapV3Pool(_pool).token0();
        }
        CommonLib.wrapTokenIfNeeded(_tokenIn, _amountIn);

        CommonLib.approve(_tokenIn, UNISWAP_V3_ROUTER, _amountIn);

        IUniswapV3Router.ExactInputSingleParams memory _params = IUniswapV3Router.ExactInputSingleParams(
            _tokenIn,
            _tokenOut,
            _fee,
            address(this),
            // solhint-disable-next-line not-rely-on-time
            block.timestamp + 1,
            _amountIn,
            1,
            0
        );
        return IUniswapV3Router(UNISWAP_V3_ROUTER).exactInputSingle(_params);
    }
}