/* eslint-disable node/no-missing-import */
import { TOKENS } from "./tokens";

export const ADDRESS: { [name: string]: string } = {
  // Curve USDC/EURS
  CURVE_USDCEURS_POOL: "0x98a7F18d4E56Cfe84E3D081B40001B3d5bD3eB8B",
  // Curve stETH/ETH
  CURVE_stETH_POOL: "0xDC24316b9AE028F1497c275EB9192a3Ea0f67022",
  CURVE_stETH_TOKEN: "0x06325440D014e39736583c165C2963BA99fAf14E",
  // Curve Frax/3CRV(DAI/USDC/USDT)
  CURVE_FRAX3CRV_POOL: "0xd632f22692FaC7611d2AA1C0D552930D43CAEd3B",
  CURVE_FRAX3CRV_TOKEN: "0xd632f22692FaC7611d2AA1C0D552930D43CAEd3B",
  // Curve WBTC/WETH/USDT
  CURVE_TRICRYPTO_POOL: "0xD51a44d3FaE010294C616388b506AcdA1bfAAE46",
  CURVE_TRICRYPTO_TOKEN: "0xc4AD29ba4B3c580e6D59105FFf484999997675Ff",
  // Curve cvxCRV/CRV
  CURVE_CVXCRV_POOL: "0x9D0464996170c6B9e75eED71c68B99dDEDf279e8",
  CURVE_CVXCRV_TOKEN: "0x9D0464996170c6B9e75eED71c68B99dDEDf279e8",
  // Curve ETH/CRV
  CURVE_CRVETH_POOL: "0x8301AE4fc9c624d1D396cbDAa1ed877821D7C511",
  CURVE_CRVETH_TOKEN: "0xEd4064f376cB8d68F770FB1Ff088a3d0F3FF5c4d",
  // Curve ETH/CVX
  CURVE_CVXETH_POOL: "0xB576491F1E6e5E62f1d8F26062Ee822B40B0E0d4",
  CURVE_CVXETH_TOKEN: "0x3A283D9c08E8b55966afb64C515f5143cf907611",
  // Curve cvxFXS/FXS
  CURVE_cvxFXS_POOL: "0xd658A338613198204DCa1143Ac3F01A722b5d94A",
  CURVE_cvxFXS_TOKEN: "0xF3A43307DcAFa93275993862Aae628fCB50dC768",
  // Curve 3pool(DAI/USDC/USDT)
  CURVE_TRICRV_POOL: "0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7",
  CURVE_TRICRV_TOKEN: "0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490",
  // Curve UST/3CRV(DAI/USDC/USDT)
  CURVE_UST_WORMHOLE_POOL: "0xCEAF7747579696A2F0bb206a14210e3c9e6fB269",
  CURVE_UST_WORMHOLE_TOKEN: "0xCEAF7747579696A2F0bb206a14210e3c9e6fB269",
  // Curve rETH/wstETH
  CURVE_ROCKETETH_POOL: "0x447Ddd4960d9fdBF6af9a790560d0AF76795CB08",
  CURVE_ROCKETETH_TOKEN: "0x447Ddd4960d9fdBF6af9a790560d0AF76795CB08",
  // Curve renBTC/WBTC
  CURVE_REN_POOL: "0x93054188d876f558f4a66B2EF1d97d16eDf0895B",
  CURVE_REN_TOKEN: "0x49849C98ae39Fff122806C06791Fa73784FB3675",
  // Curve STG/USDC
  CURVE_STGUSDC_POOL: "0x3211C6cBeF1429da3D0d58494938299C92Ad5860",
  // Curve USDN/3CRV(DAI/USDC/USDT)
  CURVE_USDN_TOKEN: "0x4f3E8F405CF5aFC05D68142F3783bDfE13811522",
  CURVE_USDN_POOL: "0x0f9cb53Ebe405d49A0bbdBD291A65Ff571bC83e1",
  CURVE_USDN_DEPOSIT: "0x094d12e5b541784701FD8d65F11fc0598FBC6332",
  // Curve PUSD/3CRV(DAI/USDC/USDT)
  CURVE_PUSD3CRV_POOL: "0x8EE017541375F6Bcd802ba119bdDC94dad6911A1",
  CURVE_PUSD3CRV_TOKEN: "0x8EE017541375F6Bcd802ba119bdDC94dad6911A1",
  // Curve sUSD/DAI/USDC/USDT
  CURVE_sUSD_POOL: "0xA5407eAE9Ba41422680e2e00537571bcC53efBfD",
  CURVE_sUSD_DEPOSIT: "0xFCBa3E75865d2d561BE8D220616520c171F12851",
  CURVE_sUSD_TOKEN: "0xC25a3A3b969415c80451098fa907EC722572917F",
  // Curve renBTC/WBTC/sBTC
  CURVE_sBTC_POOL: "0x7fC77b5c7614E1533320Ea6DDc2Eb61fa00A9714",
  CURVE_sBTC_TOKEN: "0x075b1bb99792c9E1041bA13afEf80C91a1e70fB3",
  // Curve ETH/sETH
  CURVE_sETH_POOL: "0xc5424B857f758E906013F3555Dad202e4bdB4567",
  CURVE_sETH_TOKEN: "0xA3D87FffcE63B53E0d54fAa1cc983B7eB0b74A9c",
  // Curve FRAX/USDC
  CURVE_FRAXUSDC_POOL: "0xDcEF968d416a41Cdac0ED8702fAC8128A64241A2",
  CURVE_FRAXUSDC_TOKEN: "0x3175Df0976dFA876431C2E9eE6Bc45b65d3473CC",
  // Curve MIM/3CRV(DAI/USDC/USDT)
  CURVE_MIM3CRV_POOL: "0x5a6A4D54456819380173272A5E8E9B9904BdF41B",
  CURVE_MIM3CRV_TOKEN: "0x5a6A4D54456819380173272A5E8E9B9904BdF41B",
  // Curve DAI/USDC/USDT, IronBank
  CURVE_IRONBANK_POOL: "0x2dded6Da1BF5DBdF597C45fcFaa3194e53EcfeAF",
  CURVE_IRONBANK_TOKEN: "0x5282a4eF67D9C33135340fB3289cc1711c13638C",
  // Curve FRAX/FPI
  CURVE_FPIFRAX_POOL: "0xf861483fa7E511fbc37487D91B6FAa803aF5d37c",
  CURVE_FPIFRAX_TOKEN: "0x4704aB1fb693ce163F7c9D3A31b3FF4eaF797714",
  // Curve alUSD/3CRV(DAI/USDC/USDT)
  CURVE_alUSD3CRV_POOL: "0x43b4FdFD4Ff969587185cDB6f0BD875c5Fc83f8c",
  CURVE_alUSD3CRV_TOKEN: "0x43b4FdFD4Ff969587185cDB6f0BD875c5Fc83f8c",
  // Curve DAI/USDC, Compound
  CURVE_COMPOUND_POOL: "0xA2B47E3D5c44877cca798226B7B8118F9BFb7A56",
  CURVE_COMPOUND_DEPOSIT: "0xeB21209ae4C2c9FF2a86ACA31E123764A3B6Bc06",
  CURVE_COMPOUND_TOKEN: "0x845838DF265Dcd2c412A1Dc9e959c7d08537f8a2",
  // Curve DOLA/3CRV(DAI/USDC/USDT)
  CURVE_DOLA3CRV_POOL: "0xAA5A67c256e27A5d80712c51971408db3370927D",
  CURVE_DOLA3CRV_TOKEN: "0xAA5A67c256e27A5d80712c51971408db3370927D",
  // Curve BUSD/3CRV(DAI/USDC/USDT)
  CURVE_BUSD3CRV_POOL: "0x4807862AA8b2bF68830e4C8dc86D0e9A998e085a",
  CURVE_BUSD3CRV_TOKEN: "0x4807862AA8b2bF68830e4C8dc86D0e9A998e085a",
  // Curve ETH/alETH
  CURVE_alETH_POOL: "0xC4C319E2D4d66CcA4464C0c2B32c9Bd23ebe784e",
  CURVE_alETH_TOKEN: "0xC4C319E2D4d66CcA4464C0c2B32c9Bd23ebe784e",
  // Curve agEUR/EURT/EURS
  CURVE_3EUR_POOL: "0xb9446c4Ef5EBE66268dA6700D26f96273DE3d571",
  CURVE_3EUR_TOKEN: "0xb9446c4Ef5EBE66268dA6700D26f96273DE3d571",
  // Curve LUSD/3CRV(DAI/USDC/USDT)
  CURVE_LUSD3CRV_POOL: "0xEd279fDD11cA84bEef15AF5D39BB4d4bEE23F0cA",
  CURVE_LUSD3CRV_TOKEN: "0xEd279fDD11cA84bEef15AF5D39BB4d4bEE23F0cA",
  // Curve ETH/CLEV, to be changed
  CURVE_CLEVETH_POOL: "0x342D1C4Aa76EA6F5E5871b7f11A019a0eB713A4f",
  CURVE_CLEVETH_TOKEN: "0x6C280dB098dB673d30d5B34eC04B6387185D3620",
  // Curve clevCVX/CVX, to be changed
  CURVE_CLEVCVX_POOL: "0xF9078Fb962A7D13F55d40d49C8AA6472aBD1A5a6",
  CURVE_CLEVCVX_TOKEN: "0xF9078Fb962A7D13F55d40d49C8AA6472aBD1A5a6",
  // Curve SILO/FRAX
  CURVE_SILOFRAX_POOL: "0x9a22CDB1CA1cdd2371cD5BB5199564C4E89465eb",
  CURVE_SILOFRAX_TOKEN: "0x2302aaBe69e6E7A1b0Aa23aAC68fcCB8A4D2B460",
  // Curve TUSD/3CRV(DAI/USDC/USDT)
  CURVE_TUSD3CRV_POOL: "0xEcd5e75AFb02eFa118AF914515D6521aaBd189F1",
  CURVE_TUSD3CRV_TOKEN: "0xEcd5e75AFb02eFa118AF914515D6521aaBd189F1",
  // Curve sUSD/crvFRAX(FRAX/USDC)
  CURVE_sUSDFRAXBP_POOL: "0xe3c190c57b5959Ae62EfE3B6797058B76bA2f5eF",
  CURVE_sUSDFRAXBP_TOKEN: "0xe3c190c57b5959Ae62EfE3B6797058B76bA2f5eF",
  // Curve BUSD/crvFRAX(FRAX/USDC)
  CURVE_BUSDFRAXBP_POOL: "0x8fdb0bB9365a46B145Db80D0B1C5C5e979C84190",
  CURVE_BUSDFRAXBP_TOKEN: "0x8fdb0bB9365a46B145Db80D0B1C5C5e979C84190",
  // Curve alUSD/crvFRAX(FRAX/USDC)
  CURVE_alUSDFRAXBP_POOL: "0xB30dA2376F63De30b42dC055C93fa474F31330A5",
  CURVE_alUSDFRAXBP_TOKEN: "0xB30dA2376F63De30b42dC055C93fa474F31330A5",
  // Curve TUSD/crvFRAX(FRAX/USDC)
  CURVE_TUSDFRAXBP_POOL: "0x33baeDa08b8afACc4d3d07cf31d49FC1F1f3E893",
  CURVE_TUSDFRAXBP_TOKEN: "0x33baeDa08b8afACc4d3d07cf31d49FC1F1f3E893",
  // Curve USDD/3CRV(DAI/USDC/USDT)
  CURVE_USDD3CRV_POOL: "0xe6b5CC1B4b47305c58392CE3D359B10282FC36Ea",
  CURVE_USDD3CRV_TOKEN: "0xe6b5CC1B4b47305c58392CE3D359B10282FC36Ea",
  // Curve LUSD/crvFRAX(FRAX/USDC)
  CURVE_LUSDFRAXBP_POOL: "0x497CE58F34605B9944E6b15EcafE6b001206fd25",
  CURVE_LUSDFRAXBP_TOKEN: "0x497CE58F34605B9944E6b15EcafE6b001206fd25",
  // Curve ETH/pETH
  CURVE_pETH_POOL: "0x9848482da3Ee3076165ce6497eDA906E66bB85C5",
  CURVE_pETH_TOKEN: "0x9848482da3Ee3076165ce6497eDA906E66bB85C5",
  // Curve ETH/cbETH
  CURVE_cbETH_POOL: "0x5FAE7E604FC3e24fd43A72867ceBaC94c65b404A",
  CURVE_cbETH_TOKEN: "0x5b6C539b224014A09B3388e51CaAA8e354c959C8",
  // Curve ETH/frxETH
  CURVE_frxETH_POOL: "0xa1F8A6807c402E4A15ef4EBa36528A3FED24E577",
  CURVE_frxETH_TOKEN: "0xf43211935C781D5ca1a41d2041F397B8A7366C7A",
  // Curve ETH/T
  CURVE_TETH_POOL: "0x752eBeb79963cf0732E9c0fec72a49FD1DEfAEAC",
  CURVE_TETH_TOKEN: "0xCb08717451aaE9EF950a2524E33B6DCaBA60147B",
  // Uniswap V2 pool
  LDO_WETH_UNIV2: "0xC558F600B34A5f69dD2f0D06Cb8A88d829B7420a",
  FXS_WETH_UNIV2: "0x61eB53ee427aB4E007d78A9134AaCb3101A2DC23",
  FXS_FRAX_UNIV2: "0xE1573B9D29e2183B1AF0e743Dc2754979A40D237",
  WETH_ALCX_UNIV2: "0xC3f279090a47e80990Fe3a9c30d24Cb117EF91a8",
  SPELL_WETH_UNIV2: "0xb5De0C3753b6E1B4dBA616Db82767F17513E6d4E",
  LYRA_WETH_UNIV2: "0x52DaC05FC0000e9F01CE9A1E91592BfbFcE87350",
  GRO_USDC_UNIV2: "0x21C5918CcB42d20A2368bdCA8feDA0399EbfD2f6",
  FLX_WETH_UNIV2: "0xd6F3768E62Ef92a9798E5A8cEdD2b78907cEceF9",
  ANGLE_WETH_UNIV2: "0xFb55AF0ef0DcdeC92Bd3752E7a9237dfEfB8AcC0",
  INV_WETH_UNIV2: "0x328dFd0139e26cB0FEF7B0742B49b0fe4325F821",
  FEI_TRIBE_UNIV2: "0x9928e4046d7c6513326cCeA028cD3e7a91c7590A",
  JPEG_WETH_UNIV2: "0xdB06a76733528761Eda47d356647297bC35a98BD",
  MTA_WETH_UNIV2: "0x0d0d65E7A7dB277d3E0F5E1676325E75f3340455",
  APEFI_WETH_UNIV2: "0x84ab278A8140A8a9759de17895a8Da8D756618f3",
  // Uniswap V3 pool
  USDC_WETH_UNIV3: "0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640",
  USDC_USDT_UNIV3: "0x3416cF6C708Da44DB2624D63ea0AAef7113527C6",
  WETH_USDT_UNIV3: "0x4e68Ccd3E89f51C3074ca5072bbAC773960dFa36",
  USDC_UST_TERRA_UNIV3: "0x18D96B617a3e5C42a2Ada4bC5d1B48e223f17D0D",
  USDC_UST_WORMHOLE_UNIV3: "0xA87B2FF0759f5B82c7EC86444A70f25C6BfFCCbf",
  FRAX_USDC_UNIV3_500: "0xc63B0708E2F7e69CB8A1df0e1389A98C35A76D52",
  FRAX_USDC_UNIV3_100: "0x9A834b70C07C81a9fcD6F22E842BF002fBfFbe4D",
  WBTC_WETH_UNIV3_500: "0x4585FE77225b41b697C938B018E2Ac67Ac5a20c0",
  USDC_EURS_POOL_500: "0xbd5fDda17bC27bB90E37Df7A838b1bFC0dC997F5",
  GNO_WETH_UNIV3_3000: "0xf56D08221B5942C428Acc5De8f78489A97fC5599",
  agEUR_USDC_UNIV3_100: "0x735a26a57A0A0069dfABd41595A970faF5E1ee8b",
  OGN_WETH_UNIV3_3000: "0x70BB8E6844DFB681810FD557DD741bCaF027bF94",
  // Balancer V2
  SNX_WETH_BALANCER: "0x072f14B85ADd63488DDaD88f855Fda4A99d6aC9B",
  FEI_WETH_BALANCER: "0x90291319F1D4eA3ad4dB0Dd8fe9E12BAF749E845",
};

Object.entries(TOKENS).forEach(([symbol, { address }]) => {
  ADDRESS[symbol] = address;
});
