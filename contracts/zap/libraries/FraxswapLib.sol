// SPDX-License-Identifier: MIT
pragma solidity >=0.8.8;

import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";
import "@openzeppelin/contracts/utils/math/SafeCast.sol";

import "../../interfaces/frax/IFraxswapPair.sol";
import "../../interfaces/frax/IUniswapV2FactoryV5.sol";
import "../../interfaces/frax/IUniswapV2PairV5.sol";


import "../../interfaces/frax/IUniswapV2Router.sol";
import "../../interfaces/frax/IUniswapV2Router02V5.sol";


import "../../interfaces/IWETH.sol";

import {CommonLib, PoolType } from "./CommonLib.sol";

import "hardhat/console.sol";

library FraxswapLib {

	using SafeERC20Upgradeable for IERC20Upgradeable;
    using SafeMathUpgradeable for uint256;
    using SafeCast for int256;

    // The address of Fraxswap Factory contract.
    address constant FACTORY = 0xB076b06F669e682609fb4a8C6646D2619717Be4b;
  
    // The address of Fraxswap Router contract.
    address constant ROUTER = 0x1C6cA5DEe97C8C368Ca559892CCce2454c8C35C7;
	

    // function addLiquidity(PoolType _poolType, address _pool, uint256 _tokens, uint256 _indexIn, uint256 _amountIn) internal returns (uint256) {
    // }
    // function removeLiquidity(address _pool, uint256 _indexOut, uint256 _amountIn) internal returns (uint256) {
    // }
	function swap(address _pool, uint256 _indexIn, uint256 _indexOut, uint256 _amountIn) internal returns (uint256) {
 
        (address tokenIn, , uint256 reserveIn, uint256 reserveOut) = _getTokenAndReserves(_pool, _indexIn, _indexOut);

        // TODO: handle fee on transfer token
        uint256 amountOut = _amountIn * 997;
        amountOut = (amountOut * reserveOut) / (reserveIn * 1000 + amountOut);

        console.log("\tFraxswapLib.swap: _amountIn  = %s", _amountIn);
        console.log("\tFraxswapLib.swap: amountOut  = %s", amountOut);
        console.log("\tFraxswapLib.swap: reserveIn  = %s", reserveIn);
        console.log("\tFraxswapLib.swap: reserveOut = %s", reserveOut);
        console.log("\tFraxswapLib.: tokenIn        = %s", tokenIn);
        console.log("");

        // console.log("tokenIn     = %s", tokenIn);
        
        CommonLib.wrapTokenIfNeeded(tokenIn, _amountIn);

        IERC20Upgradeable(tokenIn).safeTransfer(_pool, _amountIn);

        // function swap(uint amount0Out, uint amount1Out, address to, bytes calldata data) external;

        // address to = 
        if (_indexIn < _indexOut) {
            IFraxswapPair(_pool).swap(0, amountOut, address(this), new bytes(0));
        } else {
            IFraxswapPair(_pool).swap(amountOut, 0, address(this), new bytes(0));
        }
        return amountOut;
    }   

     function swapWithRouter(address _pool, uint256 _indexIn, uint256 _indexOut, uint256 _amountIn) internal returns (uint256){

        (address tokenIn, address tokenOut,, ) = _getTokenAndReserves(_pool, _indexIn, _indexOut);
        
        // IERC20(_from).safeApprove(ROUTER, _amountIn);
        CommonLib.approve(tokenIn, ROUTER, _amountIn);

        address[] memory path = new address[](2);
        // path[0] = _from;
        // path[1] = _to;

        path[0] = tokenIn;
        path[1] = tokenOut;

        uint amountOutMin = 1;
        uint deadline = block.timestamp;

        uint[] memory amounts = IUniswapV2Router(ROUTER).swapExactTokensForTokens(_amountIn, amountOutMin, path, address(this), deadline);

        // The amounts array contains the input token amount and all subsequent output token amounts.
        // Hence, we return the 2nd element (the tokenOut amount)

        console.log("swapWithRouter: amounts[0] = ", amounts[0]);
        console.log("swapWithRouter: amounts[1] = ", amounts[1]);
        return amounts[1];
    }

    // swapAndAddliquidity
    // function swapToLPTokens(uint256 _pid, address _tokenA, address _tokenB, uint256 _amountA, uint256 _amountAMin, uint256 _amountBMin) internal {
        // PoolInfo _pool = poolInfo[_pid];

    // function swapToLPTokens(address _pool, address _tokenA, address _tokenB, uint256 _amountA, uint256 _amountAMin, uint256 _amountBMin) internal {    
    // function swapToLPTokens(address _pool, uint _indexIn, uint _indexOut, uint256 _amountIn, uint256 _amountAMin, uint256 _amountBMin) internal {    
    // function swapToLPTokens(address _pool, uint _indexIn, uint _indexOut, uint256 _amountIn) internal {        
    //     address _tokenIn;
    //     address _tokenOut;
    //     // uint24 _fee = IUniswapV3Pool(_pool).fee();
        
    //     if (_indexIn < _indexOut) {
    //         _tokenIn = IFraxswapPair(_pool).token0();
    //         _tokenOut = IFraxswapPair(_pool).token1();
    //     } else {
    //         _tokenIn = IFraxswapPair(_pool).token1();
    //         _tokenOut = IFraxswapPair(_pool).token0();
    //     }

    //     uint256 swapAmount;

    //     (uint256 reserve0, uint256 reserve1,) = IFraxswapPair(_pool).getReserves();
    //     if (IFraxswapPair(_pool).token0() == _tokenIn) {
    //         swapAmount = getSwapAmount(reserve0, _amountIn);
    //     } else {
    //         swapAmount = getSwapAmount(reserve1, _amountIn);
    //     }

    //     // uint256 _beforeTokenA = IERC20(_tokenA).balanceOf(address(this));
    //     // uint256 _beforeTokenB = IERC20(_tokenB).balanceOf(address(this));

    //     uint256 _beforeTokenA = IERC20Upgradeable(_tokenIn).balanceOf(address(this));
    //     uint256 _beforeTokenB = IERC20Upgradeable(_tokenOut).balanceOf(address(this));

    //     swap(_tokenA, _tokenB, swapAmount);
        
    //     uint256 _amountTokenA = IERC20Upgradeable(_tokenA).balanceOf(address(this)) - _beforeTokenA;
    //     uint256 _amountTokenB = IERC20Upgradeable(_tokenB).balanceOf(address(this)) - _beforeTokenB;

    //     // addLiquidity(_tokenA, _tokenB, _amountTokenA, _amountTokenB, _amountAMin, _amountBMin);
    // }

    
    // s = optimal swap amount
    // r = amount of reserve for token a
    // a = amount of token a the user currently has (not added to reserve yet)
    // f = swap fee percent
    // s = (sqrt(((2 - f)r)^2 + 4(1 - f)ar) - (2 - f)r) / (2(1 - f))
    function getSwapAmount(uint256 r, uint256 a) public pure returns (uint256) {
        // return (sqrt(r.mul(r.mul(3988009) + a.mul(3988000))).sub(r.mul(1997))) / 1994;
        // ^^ with 0.3% Uniswap fee
        // Fraxswap has same fee -> swapFee = 3 
        uint swapFee = 3;
        // uint256 _swapFee = swapFee;
        return (sqrt(((2000 - swapFee) * r) ** 2 + 4 * (1000 - swapFee) * a * r) - (2000 - swapFee) * r) / (2 * (1000 - swapFee));
    }

//     function addLiquidity(PoolType _poolType, address _pool, uint256 _tokens, uint256 _indexIn, uint256 _amountIn) 
    // function addLiquidity(address _tokenA, address _tokenB, uint _amountTokenA, uint _amountTokenB, uint256 _amountAMin, uint256 _amountBMin) internal returns (uint256) {
    function addLiquidity(address _pool, uint256 _amountTokenA, uint256 _amountTokenB, uint256 _amountAMin, uint256 _amountBMin) internal returns (uint256) {        
        
        uint256 _indexTokenA = 0;
        uint256 _indexTokenB = 1;
        
        (address tokenA, address tokenB,, ) = _getTokenAndReserves(_pool, _indexTokenA, _indexTokenB);

        // IERC20(_tokenA).safeApprove(ROUTER, _amountTokenA);
        // IERC20(_tokenB).safeApprove(ROUTER, _amountTokenB);

        CommonLib.approve(tokenA, ROUTER, _amountTokenA);
        CommonLib.approve(tokenB, ROUTER, _amountTokenB);

        // (uint amountA, uint amountB, uint liquidity)
        uint deadline = block.timestamp;
        (,, uint liquidity) = IUniswapV2Router(ROUTER).addLiquidity(tokenA, tokenB, _amountTokenA, _amountTokenB, _amountAMin, _amountBMin, address(this), deadline);

        return liquidity;
    }
    function removeLiquidity(address _pool, address _desiredToken, uint256 _amount, uint256 _amountAMinOut, uint256 _amountBMinOut) internal returns  (uint256 amountA, uint256 amountB)  {
        
        IFraxswapPair _fraxPair = IFraxswapPair(_pool);
        require(_fraxPair.token0() == _desiredToken || _fraxPair.token1() == _desiredToken, "desired token not in pair");
        
        _fraxPair.approve(ROUTER, _amount);

        (uint256 amountA, uint256 amountB) = IUniswapV2Router(ROUTER).removeLiquidity(_fraxPair.token0(), _fraxPair.token1(), _amount, _amountAMinOut, _amountBMinOut, address(this), block.timestamp);

        return  (amountA, amountB);
    }

    // function removeLiquidityAndZap(address _pair, address _desiredToken, uint256 _amount, uint256 _amountAMinOut, uint256 _amountBMinOut) internal returns (uint256) {

    //     (uint256 amountA, uint256 amountB) = removeLiquidity(_pair, _desiredToken, _amount, _amountAMinOut, _amountBMinOut);
        
    //     if (_desiredToken == _fraxPair.token0()) {
    //         _swap(_fraxPair.token1(), _fraxPair.token0(), amountB);
    //     } else {
    //         _swap(_fraxPair.token0(), _fraxPair.token1(), amountA);
    //     }
    // }

    function _getTokenAndReserves(address _pool, uint256 _indexIn, uint256 _indexOut) private view returns (address, address, uint256, uint256){
        uint256 reserveIn;
        uint256 reserveOut;
        
        address tokenIn;
        address tokenOut;
        
        if (_indexIn < _indexOut) {
            (reserveIn, reserveOut, ) = IFraxswapPair(_pool).getReserves();
            
            tokenIn  = IFraxswapPair(_pool).token0();
            tokenOut = IFraxswapPair(_pool).token1();
        } else {
            (reserveOut, reserveIn, ) = IFraxswapPair(_pool).getReserves();

            tokenIn  = IFraxswapPair(_pool).token1();
            tokenOut = IFraxswapPair(_pool).token0();
        }
        return (tokenIn, tokenOut, reserveIn, reserveOut);
    }

    function sqrt(uint256 y) internal pure returns (uint256 z) {
        if (y > 3) {
            z = y;
            uint256 x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }          

}