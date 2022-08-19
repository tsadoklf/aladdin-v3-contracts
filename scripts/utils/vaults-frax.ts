/* eslint-disable node/no-missing-import */
import { BigNumber } from "ethers";
import { Action, ADDRESS, encodePoolHintV2, PoolType } from ".";

// constant pitchFXS = "0x11EBe21e9d7BF541A18e1E3aC94939018Ce88F0b";

export const FRAX_VAULT_CONFIG: {
  [name: string]: {
    token: string;
    convexId: number;
    rewards: string[];
    deposit: {
      [token: string]: BigNumber[];
    };
    withdraw: {
      [token: string]: BigNumber[];
    };
  };
} = {
  frax: {
    token: "CURVE_FRAX3CRV",
    convexId: 32,
    rewards: [ADDRESS.CRV, ADDRESS.CVX, ADDRESS.FXS],
    deposit: {
      FRAX: [
        encodePoolHintV2(ADDRESS.CURVE_FRAX3CRV_POOL, PoolType.CurveFactoryMetaPool, 2, 0, 0, Action.AddLiquidity),
      ],
      TRICRV: [
        encodePoolHintV2(ADDRESS.CURVE_FRAX3CRV_POOL, PoolType.CurveFactoryMetaPool, 2, 1, 1, Action.AddLiquidity),
      ],
      DAI:  [encodePoolHintV2(ADDRESS.CURVE_FRAX3CRV_POOL, PoolType.CurveFactoryUSDMetaPoolUnderlying, 4, 1, 1, Action.AddLiquidity),],
      USDC: [encodePoolHintV2(ADDRESS.CURVE_FRAX3CRV_POOL, PoolType.CurveFactoryUSDMetaPoolUnderlying, 4, 2, 2, Action.AddLiquidity),],
      USDT: [encodePoolHintV2(ADDRESS.CURVE_FRAX3CRV_POOL, PoolType.CurveFactoryUSDMetaPoolUnderlying, 4, 3, 3, Action.AddLiquidity),],
      // WETH ==(UniV3)==> USDC
      WETH: [
          encodePoolHintV2(ADDRESS.USDC_WETH_UNIV3, PoolType.UniswapV3, 2, 1, 0, Action.Swap),
          encodePoolHintV2(ADDRESS.CURVE_FRAX3CRV_POOL, PoolType.CurveFactoryUSDMetaPoolUnderlying, 4, 2, 2, Action.AddLiquidity),
      ],
    },
    withdraw: {
      FRAX: [
        encodePoolHintV2(ADDRESS.CURVE_FRAX3CRV_POOL, PoolType.CurveFactoryMetaPool, 2, 0, 0, Action.RemoveLiquidity),
      ],
      TRICRV: [
        encodePoolHintV2(ADDRESS.CURVE_FRAX3CRV_POOL, PoolType.CurveFactoryMetaPool, 2, 1, 1, Action.RemoveLiquidity),
      ],
      DAI: [
        encodePoolHintV2(ADDRESS.CURVE_FRAX3CRV_POOL, PoolType.CurveFactoryUSDMetaPoolUnderlying, 4, 1, 1, Action.RemoveLiquidity),
      ],
      USDC: [
        encodePoolHintV2(ADDRESS.CURVE_FRAX3CRV_POOL, PoolType.CurveFactoryUSDMetaPoolUnderlying, 4, 2, 2, Action.RemoveLiquidity),
      ],
      USDT: [
        encodePoolHintV2(ADDRESS.CURVE_FRAX3CRV_POOL, PoolType.CurveFactoryUSDMetaPoolUnderlying, 4, 3, 3, Action.RemoveLiquidity),
      ],
      // USDC ==(UniV3)==> WETH
      WETH: [
        encodePoolHintV2(ADDRESS.CURVE_FRAX3CRV_POOL, PoolType.CurveFactoryUSDMetaPoolUnderlying,4, 2, 2, Action.RemoveLiquidity),
        encodePoolHintV2(ADDRESS.USDC_WETH_UNIV3, PoolType.UniswapV3, 2, 0, 1, Action.Swap),
      ],
    },
  },
  cvxeth: {
    token: "CURVE_CVXETH",
    convexId: 64,
    rewards: [ADDRESS.CRV, ADDRESS.CVX],
    deposit: {
      WETH: [encodePoolHintV2(ADDRESS.CURVE_CVXETH_POOL, PoolType.CurveCryptoPool, 2, 0, 0, Action.AddLiquidity)],
      CVX: [encodePoolHintV2(ADDRESS.CURVE_CVXETH_POOL, PoolType.CurveCryptoPool, 2, 1, 1, Action.AddLiquidity)],
      // USDC ==(UniV3)==> WETH
      USDC: [
        encodePoolHintV2(ADDRESS.USDC_WETH_UNIV3, PoolType.UniswapV3, 2, 0, 1, Action.Swap),
        encodePoolHintV2(ADDRESS.CURVE_CVXETH_POOL, PoolType.CurveCryptoPool, 2, 0, 0, Action.AddLiquidity),
      ],
    },
    withdraw: {
      WETH: [encodePoolHintV2(ADDRESS.CURVE_CVXETH_POOL, PoolType.CurveCryptoPool, 2, 0, 0, Action.RemoveLiquidity)],
      CVX: [encodePoolHintV2(ADDRESS.CURVE_CVXETH_POOL, PoolType.CurveCryptoPool, 2, 1, 1, Action.RemoveLiquidity)],
      // WETH ==(UniV3)==> USDC
      USDC: [
        encodePoolHintV2(ADDRESS.CURVE_CVXETH_POOL, PoolType.CurveCryptoPool, 2, 0, 0, Action.RemoveLiquidity),
        encodePoolHintV2(ADDRESS.USDC_WETH_UNIV3, PoolType.UniswapV3, 2, 1, 0, Action.Swap),
      ],
    },
  },
  cvxfxs: {
    token: "CURVE_CVXFXS",
    convexId: 72,
    rewards: [ADDRESS.CRV, ADDRESS.CVX, ADDRESS.FXS],
    deposit: {
      FXS: [encodePoolHintV2(ADDRESS.CURVE_CVXFXS_POOL, PoolType.CurveCryptoPool, 2, 0, 0, Action.AddLiquidity)],
      cvxFXS: [encodePoolHintV2(ADDRESS.CURVE_CVXFXS_POOL, PoolType.CurveCryptoPool, 2, 1, 1, Action.AddLiquidity)],
      // WETH ==(UniV3)==> USDC ==(UniV3)==> FRAX ==(UniV2)==> FXS
      WETH: [
        encodePoolHintV2(ADDRESS.USDC_WETH_UNIV3, PoolType.UniswapV3, 2, 1, 0, Action.Swap),
        encodePoolHintV2(ADDRESS.FRAX_USDC_UNIV3, PoolType.UniswapV3, 2, 1, 0, Action.Swap),
        encodePoolHintV2(ADDRESS.FXS_FRAX_UNIV2, PoolType.UniswapV2, 2, 1, 0, Action.Swap),
        encodePoolHintV2(ADDRESS.CURVE_CVXFXS_POOL, PoolType.CurveCryptoPool, 2, 0, 0, Action.AddLiquidity),
      ],
      // USDC ==(UniV3)==> FRAX ==(UniV2)==> FXS
      USDC: [
        encodePoolHintV2(ADDRESS.FRAX_USDC_UNIV3, PoolType.UniswapV3, 2, 1, 0, Action.Swap),
        encodePoolHintV2(ADDRESS.FXS_FRAX_UNIV2, PoolType.UniswapV2, 2, 1, 0, Action.Swap),
        encodePoolHintV2(ADDRESS.CURVE_CVXFXS_POOL, PoolType.CurveCryptoPool, 2, 0, 0, Action.AddLiquidity),
      ],
    },
    withdraw: {
      FXS: [encodePoolHintV2(ADDRESS.CURVE_CVXFXS_POOL, PoolType.CurveCryptoPool, 2, 0, 0, Action.RemoveLiquidity)],
      cvxFXS: [encodePoolHintV2(ADDRESS.CURVE_CVXFXS_POOL, PoolType.CurveCryptoPool, 2, 1, 1, Action.RemoveLiquidity)],
      // FXS ==(UniV2)==> FRAX ==(UniV3)==> USDC ==(UniV3)==> WETH
      WETH: [
        encodePoolHintV2(ADDRESS.CURVE_CVXFXS_POOL, PoolType.CurveCryptoPool, 2, 0, 0, Action.RemoveLiquidity),
        encodePoolHintV2(ADDRESS.FXS_FRAX_UNIV2, PoolType.UniswapV2, 2, 0, 1, Action.Swap),
        encodePoolHintV2(ADDRESS.FRAX_USDC_UNIV3, PoolType.UniswapV3, 2, 0, 1, Action.Swap),
        encodePoolHintV2(ADDRESS.USDC_WETH_UNIV3, PoolType.UniswapV3, 2, 0, 1, Action.Swap),
      ],
      // FXS ==(UniV2)==> FRAX ==(UniV3)==> USDC
      USDC: [
        encodePoolHintV2(ADDRESS.CURVE_CVXFXS_POOL, PoolType.CurveCryptoPool, 2, 0, 0, Action.RemoveLiquidity),
        encodePoolHintV2(ADDRESS.FXS_FRAX_UNIV2, PoolType.UniswapV2, 2, 0, 1, Action.Swap),
        encodePoolHintV2(ADDRESS.FRAX_USDC_UNIV3, PoolType.UniswapV3, 2, 0, 1, Action.Swap),
      ],
    },
  },
  fraxusdc: {
    token: "CURVE_FRAXUSDC",
    convexId: 100,
    rewards: [ADDRESS.CVX, ADDRESS.CRV],
    deposit: {
      FRAX: [encodePoolHintV2(ADDRESS.CURVE_FRAXUSDC_POOL, PoolType.CurveBasePool, 2, 0, 0, Action.AddLiquidity)],
      USDC: [encodePoolHintV2(ADDRESS.CURVE_FRAXUSDC_POOL, PoolType.CurveBasePool, 2, 1, 1, Action.AddLiquidity)],
      // WETH ==(UniV3)==> USDC
      WETH: [
        encodePoolHintV2(ADDRESS.USDC_WETH_UNIV3, PoolType.UniswapV3, 2, 1, 0, Action.Swap),
        encodePoolHintV2(ADDRESS.CURVE_FRAXUSDC_POOL, PoolType.CurveBasePool, 2, 1, 0, Action.AddLiquidity),
      ],
    },
    withdraw: {
      FRAX: [encodePoolHintV2(ADDRESS.CURVE_FRAXUSDC_POOL, PoolType.CurveBasePool, 2, 0, 0, Action.RemoveLiquidity)],
      USDC: [encodePoolHintV2(ADDRESS.CURVE_FRAXUSDC_POOL, PoolType.CurveBasePool, 2, 1, 1, Action.RemoveLiquidity)],
      // USDC ==(UniV3)==> WETH
      WETH: [
        encodePoolHintV2(ADDRESS.CURVE_FRAXUSDC_POOL, PoolType.CurveBasePool, 2, 1, 1, Action.RemoveLiquidity),
        encodePoolHintV2(ADDRESS.USDC_WETH_UNIV3, PoolType.UniswapV3, 2, 0, 1, Action.Swap),
      ],
    },
  },
  fpifrax: {
    token: "FRAX_FPIFRAX",
    convexId: 82,
    rewards: [ADDRESS.CRV, ADDRESS.CVX],
    deposit: {
      // https://app.frax.finance/swap/main?from=0x853d955aCEf822Db058eb8505911ED77F175b99e&to=0x5Ca135cB8527d76e932f34B5145575F9d8cbE08E
      FRAX: [encodePoolHintV2(ADDRESS.CURVE_FPIFRAX_POOL, PoolType.Fraxswap, 2, 0, 0, Action.AddLiquidity)],
      FPI: [encodePoolHintV2(ADDRESS.CURVE_FPIFRAX_POOL, PoolType.Fraxswap, 2, 1, 1, Action.AddLiquidity)],
      // WETH ==(UniV3)==> USDC ==(UniV3)==> FRAX
      WETH: [
        encodePoolHintV2(ADDRESS.USDC_WETH_UNIV3, PoolType.UniswapV3, 2, 1, 0, Action.Swap),
        encodePoolHintV2(ADDRESS.FRAX_USDC_UNIV3, PoolType.UniswapV3, 2, 1, 0, Action.Swap),
        encodePoolHintV2(ADDRESS.CURVE_FPIFRAX_POOL, PoolType.CurveCryptoPool, 2, 0, 0, Action.AddLiquidity),
      ],
      // USDC ==(UniV3)==> FRAX
      USDC: [
        encodePoolHintV2(ADDRESS.FRAX_USDC_UNIV3, PoolType.UniswapV3, 2, 1, 0, Action.Swap),
        encodePoolHintV2(ADDRESS.CURVE_FPIFRAX_POOL, PoolType.CurveCryptoPool, 2, 0, 0, Action.AddLiquidity),
      ],
    },
    withdraw: {
      FRAX: [encodePoolHintV2(ADDRESS.CURVE_FPIFRAX_POOL, PoolType.CurveCryptoPool, 2, 0, 0, Action.RemoveLiquidity)],
      FPI: [encodePoolHintV2(ADDRESS.CURVE_FPIFRAX_POOL, PoolType.CurveCryptoPool, 2, 1, 1, Action.RemoveLiquidity)],
      // FRAX ==(UniV3)==> USDC ==(UniV3)==> WETH
      WETH: [
        encodePoolHintV2(ADDRESS.CURVE_FPIFRAX_POOL, PoolType.CurveCryptoPool, 2, 0, 0, Action.RemoveLiquidity),
        encodePoolHintV2(ADDRESS.FRAX_USDC_UNIV3, PoolType.UniswapV3, 2, 0, 1, Action.Swap),
        encodePoolHintV2(ADDRESS.USDC_WETH_UNIV3, PoolType.UniswapV3, 2, 0, 1, Action.Swap),
      ],
      // FRAX ==(UniV3)==> USDC
      USDC: [
        encodePoolHintV2(ADDRESS.CURVE_FPIFRAX_POOL, PoolType.CurveCryptoPool, 2, 0, 0, Action.RemoveLiquidity),
        encodePoolHintV2(ADDRESS.FRAX_USDC_UNIV3, PoolType.UniswapV3, 2, 0, 1, Action.Swap),
      ],
    },
  },
  compound: {
    token: "CURVE_COMPOUND",
    convexId: 0,
    rewards: [ADDRESS.CRV, ADDRESS.CVX],
    deposit: {
      DAI: [
        encodePoolHintV2(ADDRESS.CURVE_COMPOUND_DEPOSIT, PoolType.CurveYPoolUnderlying, 2, 0, 0, Action.AddLiquidity),
      ],
      USDC: [
        encodePoolHintV2(ADDRESS.CURVE_COMPOUND_DEPOSIT, PoolType.CurveYPoolUnderlying, 2, 1, 1, Action.AddLiquidity),
      ],
      // WETH ==(UniV3)==> USDC
      WETH: [
        encodePoolHintV2(ADDRESS.USDC_WETH_UNIV3, PoolType.UniswapV3, 2, 1, 0, Action.Swap),
        encodePoolHintV2(ADDRESS.CURVE_COMPOUND_DEPOSIT, PoolType.CurveYPoolUnderlying, 2, 1, 1, Action.AddLiquidity),
      ],
    },
    withdraw: {
      DAI: [
        encodePoolHintV2(
          ADDRESS.CURVE_COMPOUND_DEPOSIT,
          PoolType.CurveYPoolUnderlying,
          2,
          0,
          0,
          Action.RemoveLiquidity
        ),
      ],
      USDC: [
        encodePoolHintV2(
          ADDRESS.CURVE_COMPOUND_DEPOSIT,
          PoolType.CurveYPoolUnderlying,
          2,
          1,
          1,
          Action.RemoveLiquidity
        ),
      ],
      // WETH ==(UniV3)==> USDC
      WETH: [
        encodePoolHintV2(
          ADDRESS.CURVE_COMPOUND_DEPOSIT,
          PoolType.CurveYPoolUnderlying,
          2,
          1,
          1,
          Action.RemoveLiquidity
        ),
        encodePoolHintV2(ADDRESS.USDC_WETH_UNIV3, PoolType.UniswapV3, 2, 0, 1, Action.Swap),
      ],
    },
  },
  busdv2: {
    token: "CURVE_BUSD3CRV",
    convexId: 34,
    rewards: [ADDRESS.CRV, ADDRESS.CVX],
    deposit: {
      BUSD: [
        encodePoolHintV2(ADDRESS.CURVE_BUSD3CRV_POOL, PoolType.CurveFactoryMetaPool, 2, 0, 0, Action.AddLiquidity),
      ],
      TRICRV: [
        encodePoolHintV2(ADDRESS.CURVE_BUSD3CRV_POOL, PoolType.CurveFactoryMetaPool, 2, 1, 1, Action.AddLiquidity),
      ],
      DAI: [
        encodePoolHintV2(
          ADDRESS.CURVE_BUSD3CRV_POOL,
          PoolType.CurveFactoryUSDMetaPoolUnderlying,
          4,
          1,
          1,
          Action.AddLiquidity
        ),
      ],
      USDC: [
        encodePoolHintV2(
          ADDRESS.CURVE_BUSD3CRV_POOL,
          PoolType.CurveFactoryUSDMetaPoolUnderlying,
          4,
          2,
          2,
          Action.AddLiquidity
        ),
      ],
      USDT: [
        encodePoolHintV2(
          ADDRESS.CURVE_BUSD3CRV_POOL,
          PoolType.CurveFactoryUSDMetaPoolUnderlying,
          4,
          3,
          3,
          Action.AddLiquidity
        ),
      ],
      // WETH ==(UniV3)==> USDC
      WETH: [
        encodePoolHintV2(ADDRESS.USDC_WETH_UNIV3, PoolType.UniswapV3, 2, 1, 0, Action.Swap),
        encodePoolHintV2(
          ADDRESS.CURVE_BUSD3CRV_POOL,
          PoolType.CurveFactoryUSDMetaPoolUnderlying,
          4,
          2,
          2,
          Action.AddLiquidity
        ),
      ],
    },
    withdraw: {
      BUSD: [
        encodePoolHintV2(ADDRESS.CURVE_BUSD3CRV_POOL, PoolType.CurveFactoryMetaPool, 2, 0, 0, Action.RemoveLiquidity),
      ],
      TRICRV: [
        encodePoolHintV2(ADDRESS.CURVE_BUSD3CRV_POOL, PoolType.CurveFactoryMetaPool, 2, 1, 1, Action.RemoveLiquidity),
      ],
      DAI: [
        encodePoolHintV2(
          ADDRESS.CURVE_BUSD3CRV_POOL,
          PoolType.CurveFactoryUSDMetaPoolUnderlying,
          4,
          1,
          1,
          Action.RemoveLiquidity
        ),
      ],
      USDC: [
        encodePoolHintV2(
          ADDRESS.CURVE_BUSD3CRV_POOL,
          PoolType.CurveFactoryUSDMetaPoolUnderlying,
          4,
          2,
          2,
          Action.RemoveLiquidity
        ),
      ],
      USDT: [
        encodePoolHintV2(
          ADDRESS.CURVE_BUSD3CRV_POOL,
          PoolType.CurveFactoryUSDMetaPoolUnderlying,
          4,
          3,
          3,
          Action.RemoveLiquidity
        ),
      ],
      // USDC ==(UniV3)==> WETH
      WETH: [
        encodePoolHintV2(
          ADDRESS.CURVE_BUSD3CRV_POOL,
          PoolType.CurveFactoryUSDMetaPoolUnderlying,
          4,
          2,
          2,
          Action.RemoveLiquidity
        ),
        encodePoolHintV2(ADDRESS.USDC_WETH_UNIV3, PoolType.UniswapV3, 2, 0, 1, Action.Swap),
      ],
    },
  },
  silofrax: {
    token: "CURVE_SILOFRAX",
    convexId: 78,
    rewards: [ADDRESS.CRV, ADDRESS.CVX],
    deposit: {
      SILO: [encodePoolHintV2(ADDRESS.CURVE_SILOFRAX_POOL, PoolType.CurveCryptoPool, 2, 0, 0, Action.AddLiquidity)],
      FRAX: [encodePoolHintV2(ADDRESS.CURVE_SILOFRAX_POOL, PoolType.CurveCryptoPool, 2, 1, 1, Action.AddLiquidity)],
      // USDC ==(UniV3)==> FRAX
      USDC: [
        encodePoolHintV2(ADDRESS.FRAX_USDC_UNIV3, PoolType.UniswapV3, 2, 1, 0, Action.Swap),
        encodePoolHintV2(ADDRESS.CURVE_SILOFRAX_POOL, PoolType.CurveCryptoPool, 2, 1, 1, Action.AddLiquidity),
      ],
      // WETH ==(UniV3)==> USDC ==(UniV3)==> FRAX
      WETH: [
        encodePoolHintV2(ADDRESS.USDC_WETH_UNIV3, PoolType.UniswapV3, 2, 1, 0, Action.Swap),
        encodePoolHintV2(ADDRESS.FRAX_USDC_UNIV3, PoolType.UniswapV3, 2, 1, 0, Action.Swap),
        encodePoolHintV2(ADDRESS.CURVE_SILOFRAX_POOL, PoolType.CurveCryptoPool, 2, 1, 1, Action.AddLiquidity),
      ],
    },
    withdraw: {
      SILO: [encodePoolHintV2(ADDRESS.CURVE_SILOFRAX_POOL, PoolType.CurveCryptoPool, 2, 0, 0, Action.RemoveLiquidity)],
      FRAX: [encodePoolHintV2(ADDRESS.CURVE_SILOFRAX_POOL, PoolType.CurveCryptoPool, 2, 1, 1, Action.RemoveLiquidity)],
      // FRAX ==(UniV3)==> USDC
      USDC: [
        encodePoolHintV2(ADDRESS.CURVE_SILOFRAX_POOL, PoolType.CurveCryptoPool, 2, 1, 1, Action.RemoveLiquidity),
        encodePoolHintV2(ADDRESS.FRAX_USDC_UNIV3, PoolType.UniswapV3, 2, 0, 1, Action.Swap),
      ],
      // FRAX  ==(UniV3)==> USDC ==(UniV3)==> WETH
      WETH: [
        encodePoolHintV2(ADDRESS.CURVE_SILOFRAX_POOL, PoolType.CurveCryptoPool, 2, 1, 1, Action.RemoveLiquidity),
        encodePoolHintV2(ADDRESS.FRAX_USDC_UNIV3, PoolType.UniswapV3, 2, 0, 1, Action.Swap),
        encodePoolHintV2(ADDRESS.USDC_WETH_UNIV3, PoolType.UniswapV3, 2, 0, 1, Action.Swap),
      ],
    },
  },
  susdfraxbp: {
    token: "CURVE_SUSDFRAXBP",
    convexId: 101,
    rewards: [ADDRESS.CRV, ADDRESS.CVX],
    deposit: {
      sUSD: [
        encodePoolHintV2(ADDRESS.CURVE_SUSDFRAXBP_POOL, PoolType.CurveFactoryMetaPool, 2, 0, 0, Action.AddLiquidity),
      ],
      crvFRAX: [
        encodePoolHintV2(ADDRESS.CURVE_SUSDFRAXBP_POOL, PoolType.CurveFactoryMetaPool, 2, 1, 1, Action.AddLiquidity),
      ],
      FRAX: [
        encodePoolHintV2(
          ADDRESS.CURVE_SUSDFRAXBP_POOL,
          PoolType.CurveFactoryUSDMetaPoolUnderlying,
          3,
          1,
          1,
          Action.AddLiquidity
        ),
      ],
      USDC: [
        encodePoolHintV2(
          ADDRESS.CURVE_SUSDFRAXBP_POOL,
          PoolType.CurveFactoryUSDMetaPoolUnderlying,
          3,
          2,
          2,
          Action.AddLiquidity
        ),
      ],
      // WETH ==(UniV3)==> USDC
      WETH: [
        encodePoolHintV2(ADDRESS.USDC_WETH_UNIV3, PoolType.UniswapV3, 2, 1, 0, Action.Swap),
        encodePoolHintV2(
          ADDRESS.CURVE_SUSDFRAXBP_POOL,
          PoolType.CurveFactoryUSDMetaPoolUnderlying,
          3,
          2,
          2,
          Action.AddLiquidity
        ),
      ],
    },
    withdraw: {
      sUSD: [
        encodePoolHintV2(ADDRESS.CURVE_SUSDFRAXBP_POOL, PoolType.CurveFactoryMetaPool, 2, 0, 0, Action.RemoveLiquidity),
      ],
      crvFRAX: [
        encodePoolHintV2(ADDRESS.CURVE_SUSDFRAXBP_POOL, PoolType.CurveFactoryMetaPool, 2, 1, 1, Action.RemoveLiquidity),
      ],
      FRAX: [
        encodePoolHintV2(
          ADDRESS.CURVE_SUSDFRAXBP_POOL,
          PoolType.CurveFactoryUSDMetaPoolUnderlying,
          3,
          1,
          1,
          Action.RemoveLiquidity
        ),
      ],
      USDC: [
        encodePoolHintV2(
          ADDRESS.CURVE_SUSDFRAXBP_POOL,
          PoolType.CurveFactoryUSDMetaPoolUnderlying,
          3,
          2,
          2,
          Action.RemoveLiquidity
        ),
      ],
      // USDC ==(UniV3)==> WETH
      WETH: [
        encodePoolHintV2(
          ADDRESS.CURVE_SUSDFRAXBP_POOL,
          PoolType.CurveFactoryUSDMetaPoolUnderlying,
          3,
          2,
          2,
          Action.RemoveLiquidity
        ),
        encodePoolHintV2(ADDRESS.USDC_WETH_UNIV3, PoolType.UniswapV3, 2, 0, 1, Action.Swap),
      ],
    },
  },
  busdfraxbp: {
    token: "CURVE_BUSDFRAXBP",
    convexId: 105,
    rewards: [ADDRESS.CRV, ADDRESS.CVX],
    deposit: {
      BUSD: [
        encodePoolHintV2(ADDRESS.CURVE_BUSDFRAXBP_POOL, PoolType.CurveFactoryMetaPool, 2, 0, 0, Action.AddLiquidity),
      ],
      crvFRAX: [
        encodePoolHintV2(ADDRESS.CURVE_BUSDFRAXBP_POOL, PoolType.CurveFactoryMetaPool, 2, 1, 1, Action.AddLiquidity),
      ],
      FRAX: [
        encodePoolHintV2(
          ADDRESS.CURVE_BUSDFRAXBP_POOL,
          PoolType.CurveFactoryUSDMetaPoolUnderlying,
          3,
          1,
          1,
          Action.AddLiquidity
        ),
      ],
      USDC: [
        encodePoolHintV2(
          ADDRESS.CURVE_BUSDFRAXBP_POOL,
          PoolType.CurveFactoryUSDMetaPoolUnderlying,
          3,
          2,
          2,
          Action.AddLiquidity
        ),
      ],
      // WETH ==(UniV3)==> USDC
      WETH: [
        encodePoolHintV2(ADDRESS.USDC_WETH_UNIV3, PoolType.UniswapV3, 2, 1, 0, Action.Swap),
        encodePoolHintV2(
          ADDRESS.CURVE_BUSDFRAXBP_POOL,
          PoolType.CurveFactoryUSDMetaPoolUnderlying,
          3,
          2,
          2,
          Action.AddLiquidity
        ),
      ],
    },
    withdraw: {
      BUSD: [
        encodePoolHintV2(ADDRESS.CURVE_BUSDFRAXBP_POOL, PoolType.CurveFactoryMetaPool, 2, 0, 0, Action.RemoveLiquidity),
      ],
      crvFRAX: [
        encodePoolHintV2(ADDRESS.CURVE_BUSDFRAXBP_POOL, PoolType.CurveFactoryMetaPool, 2, 1, 1, Action.RemoveLiquidity),
      ],
      FRAX: [
        encodePoolHintV2(
          ADDRESS.CURVE_BUSDFRAXBP_POOL,
          PoolType.CurveFactoryUSDMetaPoolUnderlying,
          3,
          1,
          1,
          Action.RemoveLiquidity
        ),
      ],
      USDC: [
        encodePoolHintV2(
          ADDRESS.CURVE_BUSDFRAXBP_POOL,
          PoolType.CurveFactoryUSDMetaPoolUnderlying,
          3,
          2,
          2,
          Action.RemoveLiquidity
        ),
      ],
      // USDC ==(UniV3)==> WETH
      WETH: [
        encodePoolHintV2(
          ADDRESS.CURVE_BUSDFRAXBP_POOL,
          PoolType.CurveFactoryUSDMetaPoolUnderlying,
          3,
          2,
          2,
          Action.RemoveLiquidity
        ),
        encodePoolHintV2(ADDRESS.USDC_WETH_UNIV3, PoolType.UniswapV3, 2, 0, 1, Action.Swap),
      ],
    },
  },
  alusdfraxbp: {
    token: "CURVE_ALUSDFRAXBP",
    convexId: 106,
    rewards: [ADDRESS.CRV, ADDRESS.CVX],
    deposit: {
      alUSD: [
        encodePoolHintV2(ADDRESS.CURVE_ALUSDFRAXBP_POOL, PoolType.CurveFactoryMetaPool, 2, 0, 0, Action.AddLiquidity),
      ],
      crvFRAX: [
        encodePoolHintV2(ADDRESS.CURVE_ALUSDFRAXBP_POOL, PoolType.CurveFactoryMetaPool, 2, 1, 1, Action.AddLiquidity),
      ],
      FRAX: [
        encodePoolHintV2(
          ADDRESS.CURVE_ALUSDFRAXBP_POOL,
          PoolType.CurveFactoryUSDMetaPoolUnderlying,
          3,
          1,
          1,
          Action.AddLiquidity
        ),
      ],
      USDC: [
        encodePoolHintV2(
          ADDRESS.CURVE_ALUSDFRAXBP_POOL,
          PoolType.CurveFactoryUSDMetaPoolUnderlying,
          3,
          2,
          2,
          Action.AddLiquidity
        ),
      ],
      // WETH ==(UniV3)==> USDC
      WETH: [
        encodePoolHintV2(ADDRESS.USDC_WETH_UNIV3, PoolType.UniswapV3, 2, 1, 0, Action.Swap),
        encodePoolHintV2(
          ADDRESS.CURVE_ALUSDFRAXBP_POOL,
          PoolType.CurveFactoryUSDMetaPoolUnderlying,
          3,
          2,
          2,
          Action.AddLiquidity
        ),
      ],
    },
    withdraw: {
      alUSD: [
        encodePoolHintV2(
          ADDRESS.CURVE_ALUSDFRAXBP_POOL,
          PoolType.CurveFactoryMetaPool,
          2,
          0,
          0,
          Action.RemoveLiquidity
        ),
      ],
      crvFRAX: [
        encodePoolHintV2(
          ADDRESS.CURVE_ALUSDFRAXBP_POOL,
          PoolType.CurveFactoryMetaPool,
          2,
          1,
          1,
          Action.RemoveLiquidity
        ),
      ],
      FRAX: [
        encodePoolHintV2(
          ADDRESS.CURVE_ALUSDFRAXBP_POOL,
          PoolType.CurveFactoryUSDMetaPoolUnderlying,
          3,
          1,
          1,
          Action.RemoveLiquidity
        ),
      ],
      USDC: [
        encodePoolHintV2(
          ADDRESS.CURVE_ALUSDFRAXBP_POOL,
          PoolType.CurveFactoryUSDMetaPoolUnderlying,
          3,
          2,
          2,
          Action.RemoveLiquidity
        ),
      ],
      // USDC ==(UniV3)==> WETH
      WETH: [
        encodePoolHintV2(
          ADDRESS.CURVE_ALUSDFRAXBP_POOL,
          PoolType.CurveFactoryUSDMetaPoolUnderlying,
          3,
          2,
          2,
          Action.RemoveLiquidity
        ),
        encodePoolHintV2(ADDRESS.USDC_WETH_UNIV3, PoolType.UniswapV3, 2, 0, 1, Action.Swap),
      ],
    },
  },
  tusdfraxbp: {
    token: "CURVE_TUSDFRAXBP",
    convexId: 108,
    rewards: [ADDRESS.CRV, ADDRESS.CVX],
    deposit: {
      TUSD: [
        encodePoolHintV2(ADDRESS.CURVE_TUSDFRAXBP_POOL, PoolType.CurveFactoryMetaPool, 2, 0, 0, Action.AddLiquidity),
      ],
      crvFRAX: [
        encodePoolHintV2(ADDRESS.CURVE_TUSDFRAXBP_POOL, PoolType.CurveFactoryMetaPool, 2, 1, 1, Action.AddLiquidity),
      ],
      FRAX: [
        encodePoolHintV2(
          ADDRESS.CURVE_TUSDFRAXBP_POOL,
          PoolType.CurveFactoryUSDMetaPoolUnderlying,
          3,
          1,
          1,
          Action.AddLiquidity
        ),
      ],
      USDC: [
        encodePoolHintV2(
          ADDRESS.CURVE_TUSDFRAXBP_POOL,
          PoolType.CurveFactoryUSDMetaPoolUnderlying,
          3,
          2,
          2,
          Action.AddLiquidity
        ),
      ],
      // WETH ==(UniV3)==> USDC
      WETH: [
        encodePoolHintV2(ADDRESS.USDC_WETH_UNIV3, PoolType.UniswapV3, 2, 1, 0, Action.Swap),
        encodePoolHintV2(
          ADDRESS.CURVE_TUSDFRAXBP_POOL,
          PoolType.CurveFactoryUSDMetaPoolUnderlying,
          3,
          2,
          2,
          Action.AddLiquidity
        ),
      ],
    },
    withdraw: {
      TUSD: [
        encodePoolHintV2(ADDRESS.CURVE_TUSDFRAXBP_POOL, PoolType.CurveFactoryMetaPool, 2, 0, 0, Action.RemoveLiquidity),
      ],
      crvFRAX: [
        encodePoolHintV2(ADDRESS.CURVE_TUSDFRAXBP_POOL, PoolType.CurveFactoryMetaPool, 2, 1, 1, Action.RemoveLiquidity),
      ],
      FRAX: [
        encodePoolHintV2(
          ADDRESS.CURVE_TUSDFRAXBP_POOL,
          PoolType.CurveFactoryUSDMetaPoolUnderlying,
          3,
          1,
          1,
          Action.RemoveLiquidity
        ),
      ],
      USDC: [
        encodePoolHintV2(
          ADDRESS.CURVE_TUSDFRAXBP_POOL,
          PoolType.CurveFactoryUSDMetaPoolUnderlying,
          3,
          2,
          2,
          Action.RemoveLiquidity
        ),
      ],
      // USDC ==(UniV3)==> WETH
      WETH: [
        encodePoolHintV2(
          ADDRESS.CURVE_TUSDFRAXBP_POOL,
          PoolType.CurveFactoryUSDMetaPoolUnderlying,
          3,
          2,
          2,
          Action.RemoveLiquidity
        ),
        encodePoolHintV2(ADDRESS.USDC_WETH_UNIV3, PoolType.UniswapV3, 2, 0, 1, Action.Swap),
      ],
    },
  },
};

