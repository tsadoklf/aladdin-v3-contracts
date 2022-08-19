
// SPDX-License-Identifier: MIT
pragma solidity >=0.8.8;

import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";

import "../../interfaces/IBalancerVault.sol";
import "../../interfaces/IBalancerPool.sol";
import "../../interfaces/IWETH.sol";

import {CommonLib } from "./CommonLib.sol";

library BalancerPoolLib {
	using SafeERC20Upgradeable for IERC20Upgradeable;
	
    /// @dev The address of Balancer V2 Vault
    address private constant BALANCER_VAULT = 0xBA12222222228d8Ba445958a75a0704d566BF2C8;

	/// @dev The address of WETH token.
    address internal constant WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;

	function swap(address _pool, uint256 _indexIn, uint256 _indexOut, uint256 _amountIn) internal returns (uint256) {
          
        bytes32 _poolId = IBalancerPool(_pool).getPoolId();
        address _tokenIn;
        address _tokenOut;
        {
            (address[] memory _tokens, , ) = IBalancerVault(BALANCER_VAULT).getPoolTokens(_poolId);
            _tokenIn = _tokens[_indexIn];
            _tokenOut = _tokens[_indexOut];
        }
        CommonLib.wrapTokenIfNeeded(_tokenIn, _amountIn);
        CommonLib.approve(_tokenIn, BALANCER_VAULT, _amountIn);

        return
        IBalancerVault(BALANCER_VAULT).swap(IBalancerVault.SingleSwap(
            {
                poolId: _poolId,
                kind: IBalancerVault.SwapKind.GIVEN_IN,
                assetIn: _tokenIn,
                assetOut: _tokenOut,
                amount: _amountIn,
                userData: new bytes(0)
            }
        ),
        IBalancerVault.FundManagement({
                sender: address(this),
                fromInternalBalance: false,
                recipient: payable(address(this)),
                toInternalBalance: false
            }),
            0,
            // solhint-disable-next-line not-rely-on-time
            block.timestamp
        );
    }
}