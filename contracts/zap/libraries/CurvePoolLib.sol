// SPDX-License-Identifier: MIT
pragma solidity >=0.8.8;

import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";
import "@openzeppelin/contracts/utils/math/SafeCast.sol";


import "../../interfaces/ICurveAPool.sol";
import "../../interfaces/ICurveBasePool.sol";
import "../../interfaces/ICurveCryptoPool.sol";
import "../../interfaces/ICurveETHPool.sol";
import "../../interfaces/ICurveFactoryMetaPool.sol";
import "../../interfaces/ICurveFactoryPlainPool.sol";
import "../../interfaces/ICurveMetaPool.sol";
import "../../interfaces/ICurveYPool.sol";

import "../../interfaces/IWETH.sol";



import {CommonLib, PoolType } from "./CommonLib.sol";

interface ICurvePoolRegistry {
  // solhint-disable-next-line func-name-mixedcase
  function get_lp_token(address _pool) external view returns (address);
}

library CurvePoolLib {

	using SafeERC20Upgradeable for IERC20Upgradeable;
    using SafeMathUpgradeable for uint256;
    using SafeCast for int256;
	
    /// @dev The address of Curve Pool Registry contract.
    address private constant CURVE_POOL_REGISTRY = 0x90E00ACe148ca3b23Ac1bC8C240C2a7Dd9c2d7f5;

    /// @dev The address of Curve sBTC Deposit Zap
    address private constant CURVE_SBTC_DEPOSIT_ZAP = 0x7AbDBAf29929e7F8621B757D2a7c04d78d633834;

    /// @dev The address of Curve 3pool Deposit Zap
    address private constant CURVE_3POOL_DEPOSIT_ZAP = 0xA79828DF1850E8a3A3064576f380D90aECDD3359;


    /// @dev The address of base tokens for 3pool: DAI, USDC, USDT in increasing order.
    address private constant DAI = 0x6B175474E89094C44Da98b954EedeAC495271d0F;
    address private constant USDC = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;
    address private constant USDT = 0xdAC17F958D2ee523a2206206994597C13D831ec7;

    /// @dev The address of base tokens for crvRenWsBTC: renBTC, WBTC, sBTC in increasing order.
    address private constant renBTC = 0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D;
    address private constant WBTC = 0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599;
    address private constant sBTC = 0xfE18be6b3Bd88A2D2A7f928d00292E7a9963CfC6;

	// /// @dev The address of WETH token.
    // address internal constant WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;

    function exchange(PoolType _poolType, address _pool, uint256 _indexIn, uint256 _indexOut, uint256 _amountIn) internal returns (uint256) {
        address _tokenIn  = _getPoolTokenByIndex(_poolType, _pool, _indexIn);
        address _tokenOut = _getPoolTokenByIndex(_poolType, _pool, _indexOut);

        // console.log("TokenZapLogic._swapCurvePool: _tokenIn  = %s", _tokenIn);
        // console.log("TokenZapLogic._swapCurvePool: _tokenOut = %s", _tokenOut);
        // console.log("TokenZapLogic._swapCurvePool: _amountIn = %s", _amountIn);
        // console.log("PoolType.CurveCryptoPool = ", uint8(PoolType.CurveCryptoPool));

        CommonLib.wrapTokenIfNeeded(_tokenIn, _amountIn);
        
        if (_poolType == PoolType.CurveYPoolUnderlying) {
            CommonLib.approve(_tokenIn, ICurveYPoolDeposit(_pool).curve(), _amountIn);

        } else if (_poolType == PoolType.CurveMetaPoolUnderlying) {
            CommonLib.approve(_tokenIn, ICurveMetaPoolDeposit(_pool).pool(), _amountIn);

        } else {
            CommonLib.approve(_tokenIn, _pool, _amountIn);
        }

        uint256 _before = CommonLib.getBalance(_tokenOut);
        
        if (_poolType == PoolType.CurveETHPool) {
            if (CommonLib.isETH(_tokenIn)) {
                CommonLib.unwrapIfNeeded(_amountIn);
                // ICurveETHPool(_pool).exchange{ value: _amountIn }(int128(_indexIn), int128(_indexOut), _amountIn, 0);
                ICurveETHPool(_pool).exchange{ value: _amountIn }(int256(_indexIn).toInt128(), int256(_indexOut).toInt128(), _amountIn, 0);

            } else {
                // ICurveETHPool(_pool).exchange(int128(_indexIn), int128(_indexOut), _amountIn, 0);
                ICurveETHPool(_pool).exchange(int256(_indexIn).toInt128(), int256(_indexOut).toInt128(), _amountIn, 0);
            }
        } else if (_poolType == PoolType.CurveCryptoPool) {
            // console.log("TokenZapLogic._swapCurvePool: CurveCryptoPool BEFORE");
            ICurveCryptoPool(_pool).exchange(_indexIn, _indexOut, _amountIn, 0);
            // console.log("TokenZapLogic._swapCurvePool: CurveCryptoPool AFTER");
        
        } else if (_poolType == PoolType.CurveMetaCryptoPool) {
            IZapCurveMetaCryptoPool(_pool).exchange_underlying(_indexIn, _indexOut, _amountIn, 0);

        } else if (_poolType == PoolType.CurveTriCryptoPool) {
            ICurveTriCryptoPool(_pool).exchange(_indexIn, _indexOut, _amountIn, 0, false);

        } else if (_poolType == PoolType.CurveBasePool) {
            // ICurveBasePool(_pool).exchange(int128(_indexIn), int128(_indexOut), _amountIn, 0);
            ICurveBasePool(_pool).exchange(int256(_indexIn).toInt128(), int256(_indexOut).toInt128(), _amountIn, 0);

        } else if (_poolType == PoolType.CurveAPool) {
            
            // ICurveAPool(_pool).exchange(int128(_indexIn), int128(_indexOut), _amountIn, 0);
            ICurveAPool(_pool).exchange(int256(_indexIn).toInt128(), int256(_indexOut).toInt128(), _amountIn, 0);

        } else if (_poolType == PoolType.CurveAPoolUnderlying) {
            
            // ICurveAPool(_pool).exchange_underlying(int128(_indexIn), int128(_indexOut), _amountIn, 0);
            ICurveAPool(_pool).exchange_underlying(int256(_indexIn).toInt128(), int256(_indexOut).toInt128(), _amountIn, 0);

        } else if (_poolType == PoolType.CurveYPool) {
            
            // ICurveYPoolSwap(_pool).exchange(int128(_indexIn), int128(_indexOut), _amountIn, 0);
            ICurveYPoolSwap(_pool).exchange(int256(_indexIn).toInt128(), int256(_indexOut).toInt128(), _amountIn, 0);

        } else if (_poolType == PoolType.CurveYPoolUnderlying) {
            _pool = ICurveYPoolDeposit(_pool).curve();
            
            // ICurveYPoolSwap(_pool).exchange_underlying(int128(_indexIn), int128(_indexOut), _amountIn, 0);
            ICurveYPoolSwap(_pool).exchange_underlying(int256(_indexIn).toInt128(), int256(_indexOut).toInt128(), _amountIn, 0);

        } else if (_poolType == PoolType.CurveMetaPool) {
            
            // ICurveMetaPoolSwap(_pool).exchange(int128(_indexIn), int128(_indexOut), _amountIn, 0);
            ICurveMetaPoolSwap(_pool).exchange(int256(_indexIn).toInt128(), int256(_indexOut).toInt128(), _amountIn, 0);

        } else if (_poolType == PoolType.CurveMetaPoolUnderlying) {
            _pool = ICurveMetaPoolDeposit(_pool).pool();
            
            // ICurveMetaPoolSwap(_pool).exchange_underlying(int128(_indexIn), int128(_indexOut), _amountIn, 0);
            ICurveMetaPoolSwap(_pool).exchange_underlying(int256(_indexIn).toInt128(), int256(_indexOut).toInt128(), _amountIn, 0);

        } else if (_poolType == PoolType.CurveFactoryPlainPool) {
            // ICurveFactoryPlainPool(_pool).exchange(int128(_indexIn), int128(_indexOut), _amountIn, 0, address(this));
            ICurveFactoryPlainPool(_pool).exchange(int256(_indexIn).toInt128(), int256(_indexOut).toInt128(), _amountIn, 0, address(this));

        } else if (_poolType == PoolType.CurveFactoryMetaPool) {
            // ICurveMetaPoolSwap(_pool).exchange(int128(_indexIn), int128(_indexOut), _amountIn, 0);
            ICurveMetaPoolSwap(_pool).exchange(int256(_indexIn).toInt128(), int256(_indexOut).toInt128(), _amountIn, 0);

        } else if (_poolType == PoolType.CurveFactoryUSDMetaPoolUnderlying) {
            // ICurveMetaPoolSwap(_pool).exchange_underlying(int128(_indexIn), int128(_indexOut), _amountIn, 0);
            ICurveMetaPoolSwap(_pool).exchange_underlying(int256(_indexIn).toInt128(), int256(_indexOut).toInt128(), _amountIn, 0);

        } else if (_poolType == PoolType.CurveFactoryBTCMetaPoolUnderlying) {
            // ICurveMetaPoolSwap(_pool).exchange_underlying(int128(_indexIn), int128(_indexOut), _amountIn, 0);
            ICurveMetaPoolSwap(_pool).exchange_underlying(int256(_indexIn).toInt128(), int256(_indexOut).toInt128(), _amountIn, 0);

        } else {
            revert("AladdinZap: invalid poolType");
        }
        uint _balanceAfter = CommonLib.getBalance(_tokenOut) - _before;

        // console.log("TokenZapLogic._swapCurvePool: _balanceAfter = ", _balanceAfter );
        return _balanceAfter;
    }

    function addLiquidity(PoolType _poolType, address _pool, uint256 _tokens, uint256 _indexIn, uint256 _amountIn) internal returns (uint256) {
        address _tokenIn = _getPoolTokenByIndex(_poolType, _pool, _indexIn);

        CommonLib.wrapTokenIfNeeded(_tokenIn, _amountIn);

        if (_poolType == PoolType.CurveFactoryUSDMetaPoolUnderlying) {
            CommonLib.approve(_tokenIn, CURVE_3POOL_DEPOSIT_ZAP, _amountIn);

        } else if (_poolType == PoolType.CurveFactoryBTCMetaPoolUnderlying) {
            CommonLib.approve(_tokenIn, CURVE_SBTC_DEPOSIT_ZAP, _amountIn);
        } else {
            CommonLib.approve(_tokenIn, _pool, _amountIn);
        }

        if (_poolType == PoolType.CurveAPool || _poolType == PoolType.CurveAPoolUnderlying) {
            // CurveAPool has different interface
            bool _useUnderlying = _poolType == PoolType.CurveAPoolUnderlying;
            if (_tokens == 2) {
                uint256[2] memory _amounts;
                _amounts[_indexIn] = _amountIn;
                return ICurveA2Pool(_pool).add_liquidity(_amounts, 0, _useUnderlying);

            } else if (_tokens == 3) {
                uint256[3] memory _amounts;
                _amounts[_indexIn] = _amountIn;
                return ICurveA3Pool(_pool).add_liquidity(_amounts, 0, _useUnderlying);

            } else {
                uint256[4] memory _amounts;
                _amounts[_indexIn] = _amountIn;
                return ICurveA4Pool(_pool).add_liquidity(_amounts, 0, _useUnderlying);

            }
        } else if (_poolType == PoolType.CurveFactoryUSDMetaPoolUnderlying) {
            uint256[4] memory _amounts;
            _amounts[_indexIn] = _amountIn;
            return ICurveDepositZap(CURVE_3POOL_DEPOSIT_ZAP).add_liquidity(_pool, _amounts, 0);

        } else if (_poolType == PoolType.CurveFactoryBTCMetaPoolUnderlying) {
            uint256[4] memory _amounts;
            _amounts[_indexIn] = _amountIn;
            return ICurveDepositZap(CURVE_SBTC_DEPOSIT_ZAP).add_liquidity(_pool, _amounts, 0);

        } else if (_poolType == PoolType.CurveETHPool) {
            if (CommonLib.isETH(_tokenIn)) {
                CommonLib.unwrapIfNeeded(_amountIn);
            }
            uint256[2] memory _amounts;
            _amounts[_indexIn] = _amountIn;
            return ICurveETHPool(_pool).add_liquidity{ value: _amounts[0] }(_amounts, 0);

        } else {
            address _tokenOut = getCurvePoolToken(_poolType, _pool);
            uint256 _before = IERC20Upgradeable(_tokenOut).balanceOf(address(this));
            if (_tokens == 2) {
                uint256[2] memory _amounts;
                _amounts[_indexIn] = _amountIn;
                ICurveBase2Pool(_pool).add_liquidity(_amounts, 0);
            } else if (_tokens == 3) {
                uint256[3] memory _amounts;
                _amounts[_indexIn] = _amountIn;
                ICurveBase3Pool(_pool).add_liquidity(_amounts, 0);
            } else {
                uint256[4] memory _amounts;
                _amounts[_indexIn] = _amountIn;
                ICurveBase4Pool(_pool).add_liquidity(_amounts, 0);
            }
            return IERC20Upgradeable(_tokenOut).balanceOf(address(this)) - _before;
        }
    }

    function removeLiquidity(PoolType _poolType, address _pool, uint256 _indexOut, uint256 _amountIn) internal returns (uint256) {
        address _tokenOut = _getPoolTokenByIndex(_poolType, _pool, _indexOut);
        address _tokenIn = getCurvePoolToken(_poolType, _pool);

        uint256 _before = CommonLib.getBalance(_tokenOut);

        if (_poolType == PoolType.CurveAPool || _poolType == PoolType.CurveAPoolUnderlying) {
            // CurveAPool has different interface
            bool _useUnderlying = _poolType == PoolType.CurveAPoolUnderlying;
            
            // ICurveAPool(_pool).remove_liquidity_one_coin(_amountIn, int128(_indexOut), 0, _useUnderlying);
            ICurveAPool(_pool).remove_liquidity_one_coin(_amountIn, int256(_indexOut).toInt128(), 0, _useUnderlying);

        } else if (_poolType == PoolType.CurveCryptoPool) {
            // CurveCryptoPool use uint256 as index
            ICurveCryptoPool(_pool).remove_liquidity_one_coin(_amountIn, _indexOut, 0);

        } else if (_poolType == PoolType.CurveMetaCryptoPool) {
            // CurveMetaCryptoPool use uint256 as index
            CommonLib.approve(_tokenIn, _pool, _amountIn);
            IZapCurveMetaCryptoPool(_pool).remove_liquidity_one_coin(_amountIn, _indexOut, 0);

        } else if (_poolType == PoolType.CurveTriCryptoPool) {
            // CurveTriCryptoPool use uint256 as index
            ICurveTriCryptoPool(_pool).remove_liquidity_one_coin(_amountIn, _indexOut, 0);

        } else if (_poolType == PoolType.CurveFactoryUSDMetaPoolUnderlying) {
            CommonLib.approve(_tokenIn, CURVE_3POOL_DEPOSIT_ZAP, _amountIn);
            // ICurveDepositZap(CURVE_3POOL_DEPOSIT_ZAP).remove_liquidity_one_coin(_pool, _amountIn, int128(_indexOut), 0);
            ICurveDepositZap(CURVE_3POOL_DEPOSIT_ZAP).remove_liquidity_one_coin(_pool, _amountIn, int256(_indexOut).toInt128(), 0);

        } else if (_poolType == PoolType.CurveFactoryBTCMetaPoolUnderlying) {
            CommonLib.approve(_tokenIn, CURVE_SBTC_DEPOSIT_ZAP, _amountIn);
            // ICurveDepositZap(CURVE_SBTC_DEPOSIT_ZAP).remove_liquidity_one_coin(_pool, _amountIn, int128(_indexOut), 0);
            ICurveDepositZap(CURVE_SBTC_DEPOSIT_ZAP).remove_liquidity_one_coin(_pool, _amountIn, int256(_indexOut).toInt128(), 0);

        } else if (_poolType == PoolType.CurveMetaPoolUnderlying) {
            CommonLib.approve(_tokenIn, _pool, _amountIn);
            // ICurveMetaPoolDeposit(_pool).remove_liquidity_one_coin(_amountIn, int128(_indexOut), 0);
            ICurveMetaPoolDeposit(_pool).remove_liquidity_one_coin(_amountIn, int256(_indexOut).toInt128(), 0);

        } else if (_poolType == PoolType.CurveYPoolUnderlying) {
            CommonLib.approve(_tokenIn, _pool, _amountIn);
            // ICurveYPoolDeposit(_pool).remove_liquidity_one_coin(_amountIn, int128(_indexOut), 0, true);
            ICurveYPoolDeposit(_pool).remove_liquidity_one_coin(_amountIn, int256(_indexOut).toInt128(), 0, true);

        } else {
            // ICurveBasePool(_pool).remove_liquidity_one_coin(_amountIn, int128(_indexOut), 0);
            ICurveBasePool(_pool).remove_liquidity_one_coin(_amountIn, int256(_indexOut).toInt128(), 0);
        }
        return CommonLib.getBalance(_tokenOut) - _before;
    }

    /// @dev Only the following pool will call this function
    /// + CurveCryptoPool => use `ICurveCryptoPool.token()`
    //  + CurveMetaCryptoPool => use `ICurveCryptoPool.token()`
    /// + CurveTriCryptoPool => use `ICurveCryptoPool.token()`
    /// + CurveYPool => covered by `CurvePoolRegistry`
    /// + CurveYPoolUnderlying => covered by `CurvePoolRegistry`
    /// + CurveMetaPool => covered by `CurvePoolRegistry`
    /// + CurveMetaPoolUnderlying => covered by `CurvePoolRegistry`
    /// + CurveFactoryPlainPool
    /// + CurveFactoryMetaPool
    /// + CurveFactoryUSDMetaPoolUnderlying
    /// + CurveFactoryBTCMetaPoolUnderlying
    function getCurvePoolToken(PoolType _type, address _pool) internal view returns (address) {
        
        if (_type == PoolType.CurveYPoolUnderlying) {
            _pool = ICurveYPoolDeposit(_pool).curve();
        
        } else if (_type == PoolType.CurveMetaPoolUnderlying) {
            _pool = ICurveMetaPoolDeposit(_pool).pool();
        
        } else if (_type == PoolType.CurveMetaCryptoPool) {
            _pool = ICurveMetaPoolDeposit(_pool).pool();
        
        }
        
        address _token = ICurvePoolRegistry(CURVE_POOL_REGISTRY).get_lp_token(_pool);
        
        if (_token != address(0)) {
            return _token;
        } else if (uint256(_type) >= 4 && uint256(_type) <= 6) {
            return ICurveCryptoPool(_pool).token();
        } else {
            return _pool;
        }
    }

    function _getPoolTokenByIndex(PoolType _type, address _pool, uint256 _index) private view returns (address) {
        
        if (_type == PoolType.CurveMetaCryptoPool) {
            return IZapCurveMetaCryptoPool(_pool).underlying_coins(_index);

        } else if (_type == PoolType.CurveAPoolUnderlying) {
            return ICurveAPool(_pool).underlying_coins(_index);

        } else if (_type == PoolType.CurveYPoolUnderlying) {
            // return ICurveYPoolDeposit(_pool).underlying_coins(int128(_index));
            return ICurveYPoolDeposit(_pool).underlying_coins(int256(_index).toInt128());

        } else if (_type == PoolType.CurveMetaPoolUnderlying) {
        
            if (_index == 0) return ICurveMetaPoolDeposit(_pool).coins(_index);
            else return ICurveMetaPoolDeposit(_pool).base_coins(_index - 1);
        
        } else if (_type == PoolType.CurveFactoryUSDMetaPoolUnderlying) {

            if (_index == 0) return ICurveBasePool(_pool).coins(_index);
            else return _get3PoolTokenByIndex(_index - 1);
        
        } else if (_type == PoolType.CurveFactoryBTCMetaPoolUnderlying) {
            
            if (_index == 0) return ICurveBasePool(_pool).coins(_index);
            else return _getsBTCTokenByIndex(_index - 1);
        
        } else {
      
            // vyper is weird, some use `int128`
            try ICurveBasePool(_pool).coins(_index) returns (address _token) {
                return _token;
            } catch {
                // return ICurveBasePool(_pool).coins(int128(_index));
                return ICurveBasePool(_pool).coins(int256(_index).toInt128());
                
            }
        }
    }

    function _get3PoolTokenByIndex(uint256 _index) private pure returns (address) {
        if (_index == 0) return DAI;
        else if (_index == 1) return USDC;
        else if (_index == 2) return USDT;
        else return address(0);
    }

    function _getsBTCTokenByIndex(uint256 _index) private pure returns (address) {
        if (_index == 0) return renBTC;
        else if (_index == 1) return WBTC;
        else if (_index == 2) return sBTC;
        else return address(0);
    }

}