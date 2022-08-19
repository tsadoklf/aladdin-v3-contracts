// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";


import "../../interfaces/IWETH.sol";

// using { SafeERC20Upgradeable } for IERC20Upgradeable;


  /// @dev The address of ETH which is commonly used.
  address  constant ETH = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

	/// @dev The address of WETH token.
  address  constant WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;

  /// @dev The pool type used in this zap contract, a maximum of 256 items
enum PoolType {
    UniswapV2, // with fee 0.3%, add/remove liquidity not supported
    UniswapV3, // add/remove liquidity not supported
    BalancerV2, // add/remove liquidity not supported
    CurveETHPool, // including Factory Pool
    CurveCryptoPool, // including Factory Pool
    CurveMetaCryptoPool,
    CurveTriCryptoPool,
    CurveBasePool,
    CurveAPool,
    CurveAPoolUnderlying,
    CurveYPool,
    CurveYPoolUnderlying,
    CurveMetaPool,
    CurveMetaPoolUnderlying,
    CurveFactoryPlainPool,
    CurveFactoryMetaPool,
    CurveFactoryUSDMetaPoolUnderlying,
    CurveFactoryBTCMetaPoolUnderlying,
    LidoStake, // eth to stETH
    LidoWrap, // stETH to wstETH or wstETH to stETH
    Fraxswap
}

library CommonLib {
    function approve(address _token, address _spender, uint256 _amount) internal {
        if (!isETH(_token) && IERC20Upgradeable(_token).allowance(address(this), _spender) < _amount) {
        // if (!_isETH(_token) && IERC20Upgradeable(_token).allowance(thisAddress, _spender) < _amount) {
            
            // hBTC cannot approve 0
            if (_token != 0x0316EB71485b0Ab14103307bf65a021042c6d380) {
                // IERC20Upgradeable(_token).safeApprove(_spender, 0);
                IERC20Upgradeable(_token).approve(_spender, 0);
            }
            // IERC20Upgradeable(_token).safeApprove(_spender, _amount);
            IERC20Upgradeable(_token).approve(_spender, _amount);
        }
    }
    function unwrapIfNeeded(uint256 _amount) internal {
        if (address(this).balance < _amount) {
        IWETH(WETH).withdraw(_amount);
        }
    }
    function wrapTokenIfNeeded(address _token, uint256 _amount) internal {
        if (_token == WETH && IERC20Upgradeable(_token).balanceOf(address(this)) < _amount) {
        IWETH(_token).deposit{ value: _amount }();
        }
    }
    function isETH(address _token) internal pure returns (bool) {
        return _token == ETH || _token == address(0);
    }
    function getBalance(address _token) internal view returns (uint256) {
        if (CommonLib.isETH(_token)) return address(this).balance;
        else return IERC20Upgradeable(_token).balanceOf(address(this));
    }
}
