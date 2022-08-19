// SPDX-License-Identifier: MIT

pragma solidity ^0.8.8;
pragma abicoder v2;

import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";
import "@openzeppelin/contracts/utils/math/SafeCast.sol";

import "hardhat/console.sol";

import "../interfaces/IWETH.sol";

// NEW
import "./libraries/UniswapV2PairLib.sol";
import "./libraries/UniswapV3PoolLib.sol";
import "./libraries/BalancerPoolLib.sol";
import "./libraries/LidoLib.sol";
import "./libraries/CurvePoolLib.sol";
import "./libraries/FraxswapLib.sol";

import "./libraries/CommonLib.sol";

// solhint-disable reason-string, const-name-snakecase

contract TokenZapLogic {
    
    using SafeERC20Upgradeable for IERC20Upgradeable;
    using SafeMathUpgradeable for uint256;
    using SafeCast for int256;

    /// @dev The address of ETH which is commonly used.
    // address private constant ETH = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

    /// @dev The address of WETH token.
    // address internal constant WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;

    /// @dev The address of Lido's stETH token.
    address private constant stETH = 0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84;

    /// @dev The address of Lido's wstETH token.
    address private constant wstETH = 0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0;

    // TSADOK
    //  https://docs.frax.finance/smart-contracts/fraxswap#ethereum
    address private constant FACTORY = 0xB076b06F669e682609fb4a8C6646D2619717Be4b;
    address private constant ROUTER = 0x1C6cA5DEe97C8C368Ca559892CCce2454c8C35C7;

    function swap(uint256 _route, uint256 _amountIn) public payable returns (uint256) {
        // https://stackoverflow.com/questions/70601460/solidity-casting-from-uint256-to-address
        // address _pool = address(_route & uint256(1461501637330902918203684832716283019655932542975));
        // address _pool = address(uint160(_route & uint256(1461501637330902918203684832716283019655932542975)));
        address _pool = address(uint160(_route));
        
        PoolType _poolType = PoolType((_route >> 160) & 255);
        uint256 _indexIn = (_route >> 170) & 3;
        uint256 _indexOut = (_route >> 172) & 3;
        uint256 _action = (_route >> 174) & 3;

        // console.log("TokenZapLogic.swap: _route     = ", _route);
        // console.log("TokenZapLogic.swap: _pool      = ", _pool);
        // console.log("TokenZapLogic.swap: _poolType  = ", uint8(_poolType));
        // console.log("TokenZapLogic.swap: _indexIn   = %s", _indexIn);
        // console.log("TokenZapLogic.swap: _indexOut  = %s", _indexOut);
        // console.log("TokenZapLogic.swap: _action    = %s", _action);

        if (_poolType == PoolType.UniswapV2) {
            // return _swapUniswapV2Pair(_pool, _indexIn, _indexOut, _amountIn);
            return UniswapV2PairLib.swap(_pool, _indexIn, _indexOut, _amountIn);
            
            // return UniswapLibrary.swapUniswapV2Pair(_pool, _indexIn, _indexOut, _amountIn);

        } else if (_poolType == PoolType.UniswapV3) {
            // return _swapUniswapV3Pool(_pool, _indexIn, _indexOut, _amountIn);
            return UniswapV3PoolLib.swap(_pool, _indexIn, _indexOut, _amountIn);

        // TSADOK: 
        } else if (_poolType == PoolType.Fraxswap) {
            
            if (_action == 0) {
                // return FraxswapLib.swap(_poolType, _pool, _indexIn, _indexOut, _amountIn);
                // return FraxswapLib.swap(_poolType, _pool, _indexIn, _indexOut, _amountIn);
                return FraxswapLib.swap(_pool, _indexIn, _indexOut, _amountIn);
                // return FraxswapLib.swapWithRouter(_pool, _indexIn, _indexOut, _amountIn);    

            } else if (_action == 1) {
                uint256 _tokens = ((_route >> 168) & 3) + 1;
                // return FraxswapLib.addLiquidity(_poolType, _pool, _tokens, _indexIn, _amountIn);
                // return FraxswapLib.addLiquidity(_poolType, _pool, _tokens, _indexIn, _amountIn);
                return 1;

            } else if (_action == 2) {
                // return CurvePoolLib.removeLiquidity(_poolType, _pool, _indexOut, _amountIn);
                // return FraxswapLib.removeLiquidity(_poolType, _pool, _indexOut, _amountIn);
                return 2;

            } else {
                revert("AladdinZap: invalid action for Fraxswap");
            } 

        } else if (_poolType == PoolType.BalancerV2) {
            // return _swapBalancerPool(_pool, _indexIn, _indexOut, _amountIn);
            return BalancerPoolLib.swap(_pool, _indexIn, _indexOut, _amountIn);

        } else if (_poolType == PoolType.LidoStake) {
            require(_pool == stETH, "AladdinZap: pool not stETH");
            // return _wrapLidoSTETH(_amountIn, _action);
            return LidoLib.wrapSTETH(_amountIn, _action);

        } else if (_poolType == PoolType.LidoWrap) {
            require(_pool == wstETH, "AladdinZap: pool not wstETH");
            // return _wrapLidoWSTETH(_amountIn, _action);
            return LidoLib.wrapWSTETH(_amountIn, _action);

        } else {
        
            // all other is curve pool
            if (_action == 0) {
                return CurvePoolLib.exchange(_poolType, _pool, _indexIn, _indexOut, _amountIn);

            } else if (_action == 1) {
                uint256 _tokens = ((_route >> 168) & 3) + 1;
                return CurvePoolLib.addLiquidity(_poolType, _pool, _tokens, _indexIn, _amountIn);

            } else if (_action == 2) {
                return CurvePoolLib.removeLiquidity(_poolType, _pool, _indexOut, _amountIn);

            } else {
                revert("AladdinZap: invalid action");
            }
        }
    }

    function getCurvePoolToken(PoolType _type, address _pool) public view virtual returns (address) {
        return CurvePoolLib.getCurvePoolToken(_type, _pool);
    }

    // solhint-disable-next-line no-empty-blocks
    receive() external payable {}
}
