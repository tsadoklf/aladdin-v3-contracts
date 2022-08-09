// Two Tokens – 
// FRAX is the stablecoin targeting a tight band around $1/coin. 
// Frax Shares (FXS) is the governance token which accrues fees, seigniorage revenue, and excess collateral value.

/* eslint-disable node/no-missing-import */
// @ts-nocheck
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { constants } from "ethers";
import { ethers } from "hardhat";
import { Action, encodePoolHintV2, PoolType } from "../../scripts/utils";
import { AladdinZap, IERC20 } from "../../typechain-types";
// eslint-disable-next-line camelcase
import { request_fork } from "../utils";

const FORK_BLOCK_NUMBER = 14243290;
const DEPLOYER = "0xDA9dfA130Df4dE4673b89022EE50ff26f6EA73Cf";

describe("AladdinZap.spec", async () => {
  
  describe("UniswapV2 FXS/FRAX pool [UniswapV2]", async () => {
    const FXS = "0x3432B6A60D23Ca0dFCa7761B7ab56459D9C964D0";
    const FXS_HOLDER = "0xF977814e90dA44bFA03b6295A0616a897441aceC";
    const FRAX = "0x853d955aCEf822Db058eb8505911ED77F175b99e";
    const FRAX_HOLDER = "0xC564EE9f21Ed8A2d8E7e76c085740d5e4c5FaFbE";
    const FXS_FRAX_POOL = "0xE1573B9D29e2183B1AF0e743Dc2754979A40D237";

    it("should succeed, when swap FXS => FRAX", async () => {
      request_fork(FORK_BLOCK_NUMBER, [DEPLOYER, FXS_FRAX_POOL, FXS, FXS_HOLDER]);
      const deployer = await ethers.getSigner(DEPLOYER);
      const signer = await ethers.getSigner(FXS_HOLDER);
      const amountIn = ethers.utils.parseEther("1000");
      const amountOut = ethers.utils.parseEther("20426.482715012613886488");

      const fxs = await ethers.getContractAt("IERC20", FXS, signer);
      const frax = await ethers.getContractAt("IERC20", FRAX, signer);

      const AladdinZap = await ethers.getContractFactory("AladdinZap", deployer);
      const zap = await AladdinZap.deploy();
      await zap.initialize();
      // await zap.updateRoute(FXS, FRAX, [encodePoolHintV2({
      //   poolAddress: FXS_FRAX_POOL, 
      //   poolType: PoolType.UniswapV2, 
      //   tokens: 2, 
      //   indexIn: 0, 
      //   indexOut: 1, 
      //   action: Action.Swap})
      // ]);
      await zap.updateRoute(FXS, FRAX, [encodePoolHintV2(FXS_FRAX_POOL, PoolType.UniswapV2, 2, 0, 1, Action.Swap)]);
      await zap.deployed();

      // transfer fxs to zap
      await fxs.transfer(zap.address, amountIn);

      // zap it

      // 
      // https://betterprogramming.pub/sending-static-calls-to-a-smart-contract-with-ethers-js-e2b4ceccc9ab
      // 
      // Static Calls
      // ======================================================
      // Rather than executing the state-change of a transaction, 
      // it is possible to ask a node to pretend that a call is not state-changing and return the result.
      // 
      // This does not actually change any state, but is free. 
      // This, in some cases, can be used to determine if a transaction will fail or succeed.
      // 

      //  address _fromToken,
      //  uint256 _amountIn,
      //  address _toToken,
      //  uint256 _minOut
      const output = await zap.callStatic.zap(FXS, amountIn, FRAX, amountOut);

      // check
      const before = await frax.balanceOf(deployer.address);
      await zap.zap(FXS, amountIn, FRAX, amountOut);
      const after = await frax.balanceOf(deployer.address);
      expect(output).to.eq(amountOut);
      expect(after.sub(before)).to.eq(amountOut);
    });

    it("should succeed, when swap FRAX => FXS", async () => {
      request_fork(FORK_BLOCK_NUMBER, [DEPLOYER, FXS_FRAX_POOL, FRAX, FRAX_HOLDER]);
      const deployer = await ethers.getSigner(DEPLOYER);
      const signer = await ethers.getSigner(FRAX_HOLDER);
      const amountIn = ethers.utils.parseEther("20426");
      const amountOut = ethers.utils.parseEther("993.236385083446866442");

      const fxs = await ethers.getContractAt("IERC20", FXS, signer);
      const frax = await ethers.getContractAt("IERC20", FRAX, signer);

      const AladdinZap = await ethers.getContractFactory("AladdinZap", deployer);
      const zap = await AladdinZap.deploy();
      await zap.initialize();
      await zap.updateRoute(FRAX, FXS, [encodePoolHintV2(FXS_FRAX_POOL, PoolType.UniswapV2, 2, 1, 0, Action.Swap)]);
      await zap.deployed();

      await frax.transfer(zap.address, amountIn);
      
      // dry-run
      const output = await zap.callStatic.zap(FRAX, amountIn, FXS, amountOut);
      
      // run
      const before = await fxs.balanceOf(deployer.address);
      await zap.zap(FRAX, amountIn, FXS, amountOut);
      const after = await fxs.balanceOf(deployer.address);
      expect(output).to.eq(amountOut);
      expect(after.sub(before)).to.eq(amountOut);
    });
  });

  describe("UniswapV3 FXS/ETH pool [UniswapV3]", async () => {
    const FXS = "0x3432B6A60D23Ca0dFCa7761B7ab56459D9C964D0";
    const FXS_HOLDER = "0xF977814e90dA44bFA03b6295A0616a897441aceC";
    const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
    const WETH_HOLDER = "0xE78388b4CE79068e89Bf8aA7f218eF6b9AB0e9d0";
    const FXS_WETH_POOL = "0xCD8286b48936cDAC20518247dBD310ab681A9fBf";

    it("should succeed, when swap FXS => ETH", async () => {

      request_fork(FORK_BLOCK_NUMBER, [DEPLOYER, FXS_WETH_POOL, FXS, FXS_HOLDER]);
      
      const deployer = await ethers.getSigner(DEPLOYER);
      const signer = await ethers.getSigner(FXS_HOLDER);
      const amountIn = ethers.utils.parseEther("1000");
      const amountOut = ethers.utils.parseEther("7.741961292003055789");

      const fxs = await ethers.getContractAt("IERC20", FXS, signer);
      const AladdinZap = await ethers.getContractFactory("AladdinZap", deployer);
      const zap = await AladdinZap.deploy();
      await zap.initialize();
      await zap.updateRoute(FXS, WETH, [encodePoolHintV2(FXS_WETH_POOL, PoolType.UniswapV3, 2, 0, 1, Action.Swap)]);
      await zap.deployed();

      await fxs.transfer(zap.address, amountIn);

      // dry-run
      const output = await zap.callStatic.zap(FXS, amountIn, constants.AddressZero, amountOut);
      
      // run
      const before = await deployer.getBalance();
      const tx = await zap.zap(FXS, amountIn, constants.AddressZero, amountOut);
      const receipt = await tx.wait();
      const after = await deployer.getBalance();
      
      expect(output).to.eq(amountOut);
      expect(after.sub(before)).to.eq(amountOut.sub(receipt.gasUsed.mul(receipt.effectiveGasPrice)));
    });

    it("should succeed, when swap FXS => WETH", async () => {

      request_fork(FORK_BLOCK_NUMBER, [DEPLOYER, FXS_WETH_POOL, FXS, FXS_HOLDER]);
      
      const deployer = await ethers.getSigner(DEPLOYER);
      const signer = await ethers.getSigner(FXS_HOLDER);
      const amountIn = ethers.utils.parseEther("1000");
      const amountOut = ethers.utils.parseEther("7.741961292003055789");

      const fxs = await ethers.getContractAt("IERC20", FXS, signer);
      const weth = await ethers.getContractAt("IERC20", WETH, signer);
      const AladdinZap = await ethers.getContractFactory("AladdinZap", deployer);
      const zap = await AladdinZap.deploy();
      await zap.initialize();
      await zap.updateRoute(FXS, WETH, [encodePoolHintV2(FXS_WETH_POOL, PoolType.UniswapV3, 2, 0, 1, Action.Swap)]);
      await zap.deployed();
      await fxs.transfer(zap.address, amountIn);

      // dry-run
      const output = await zap.callStatic.zap(FXS, amountIn, WETH, amountOut);
      
      // run
      const before = await weth.balanceOf(deployer.address);
      await zap.zap(FXS, amountIn, WETH, amountOut);
      const after = await weth.balanceOf(deployer.address);
      
      expect(output).to.eq(amountOut);
      expect(after.sub(before)).to.eq(amountOut);
    });

    it("should succeed, when swap ETH => FXS", async () => {
      request_fork(FORK_BLOCK_NUMBER, [DEPLOYER, FXS_WETH_POOL]);
      const deployer = await ethers.getSigner(DEPLOYER);
      const amountIn = ethers.utils.parseEther("6");
      const amountOut = ethers.utils.parseEther("757.393998811295210898");

      const fxs = await ethers.getContractAt("IERC20", FXS, deployer);
      const AladdinZap = await ethers.getContractFactory("AladdinZap", deployer);
      const zap = await AladdinZap.deploy();
      await zap.initialize();
      await zap.updateRoute(WETH, FXS, [encodePoolHintV2(FXS_WETH_POOL, PoolType.UniswapV3, 2, 1, 0, Action.Swap)]);
      await zap.deployed();

      // dry-run
      const output = await zap.callStatic.zap(constants.AddressZero, amountIn, FXS, amountOut, {
        value: amountIn,
      });
      
      // run
      const before = await fxs.balanceOf(deployer.address);
      await zap.zap(constants.AddressZero, amountIn, FXS, amountOut, {
        value: amountIn,
      });
      const after = await fxs.balanceOf(deployer.address);
      expect(output).to.eq(amountOut);
      expect(after.sub(before)).to.eq(amountOut);
    });

    it("should succeed, when swap WETH => FXS", async () => {
      request_fork(FORK_BLOCK_NUMBER, [DEPLOYER, FXS_WETH_POOL, WETH, WETH_HOLDER]);
      const deployer = await ethers.getSigner(DEPLOYER);
      const signer = await ethers.getSigner(WETH_HOLDER);
      const amountIn = ethers.utils.parseEther("6");
      const amountOut = ethers.utils.parseEther("757.393998811295210898");

      const fxs = await ethers.getContractAt("IERC20", FXS, deployer);
      const weth = await ethers.getContractAt("IERC20", WETH, signer);
      const AladdinZap = await ethers.getContractFactory("AladdinZap", deployer);
      const zap = await AladdinZap.deploy();
      await zap.initialize();
      await zap.updateRoute(WETH, FXS, [encodePoolHintV2(FXS_WETH_POOL, PoolType.UniswapV3, 2, 1, 0, Action.Swap)]);
      await zap.deployed();
      await weth.transfer(zap.address, amountIn);
      const output = await zap.callStatic.zap(WETH, amountIn, FXS, amountOut);
      const before = await fxs.balanceOf(deployer.address);
      await zap.zap(WETH, amountIn, FXS, amountOut);
      const after = await fxs.balanceOf(deployer.address);
      expect(output).to.eq(amountOut);
      expect(after.sub(before)).to.eq(amountOut);
    });
  });

  describe("curve cvxfxs pool [CurveCryptoPool Factory]", async () => {
    // override fork number, since this pool doesn't exsit at original block
    const FORK_BLOCK_NUMBER = 14386700;
    const CURVE_CVXFXS_POOL = "0xd658A338613198204DCa1143Ac3F01A722b5d94A";
    const CURVE_CVXFXS_TOKEN = "0xF3A43307DcAFa93275993862Aae628fCB50dC768";
    const CURVE_CVXFXS_HOLDER = "0x289c23Cd7cACAFD4bFee6344EF376FA14f1bF42D";
    const CVXFXS = "0xFEEf77d3f69374f66429C91d732A244f074bdf74";
    const CVXFXS_HOLDER = "0x5028D77B91a3754fb38B2FBB726AF02d1FE44Db6";
    const FXS = "0x3432B6A60D23Ca0dFCa7761B7ab56459D9C964D0";
    const FXS_HOLDER = "0xF977814e90dA44bFA03b6295A0616a897441aceC";

    it("should succeed, when AddLiquidity FXS => Curve cvxfxs Pool", async () => {
      request_fork(FORK_BLOCK_NUMBER, [DEPLOYER, CURVE_CVXFXS_POOL, FXS, FXS_HOLDER]);
      const deployer = await ethers.getSigner(DEPLOYER);
      const signer = await ethers.getSigner(FXS_HOLDER);
      const amountIn = ethers.utils.parseEther("100");
      const amountOut = ethers.utils.parseEther("51.029733163247604572");

      const cvxfxscrv = await ethers.getContractAt("IERC20", CURVE_CVXFXS_TOKEN, signer);
      const fxs = await ethers.getContractAt("IERC20", FXS, signer);
      const AladdinZap = await ethers.getContractFactory("AladdinZap", deployer);
      const zap = await AladdinZap.deploy();
      await zap.initialize();
      await zap.updatePoolTokens([CURVE_CVXFXS_POOL], [CURVE_CVXFXS_TOKEN]);
      await zap.updateRoute(FXS, CURVE_CVXFXS_TOKEN, [
        encodePoolHintV2(CURVE_CVXFXS_POOL, PoolType.CurveCryptoPool, 2, 0, 0, Action.AddLiquidity),
      ]);
      await zap.deployed();
      await fxs.transfer(zap.address, amountIn);
      const output = await zap.callStatic.zap(FXS, amountIn, CURVE_CVXFXS_TOKEN, amountOut);
      const before = await cvxfxscrv.balanceOf(deployer.address);
      await zap.zap(FXS, amountIn, CURVE_CVXFXS_TOKEN, amountOut);
      const after = await cvxfxscrv.balanceOf(deployer.address);
      expect(after.sub(before)).to.eq(amountOut);
      expect(output).to.eq(amountOut);
    });

    it("should succeed, when AddLiquidity CVXFXS => Curve cvxfxs Pool", async () => {
      request_fork(FORK_BLOCK_NUMBER, [DEPLOYER, CURVE_CVXFXS_POOL, CVXFXS, CVXFXS_HOLDER]);
      const deployer = await ethers.getSigner(DEPLOYER);
      const signer = await ethers.getSigner(CVXFXS_HOLDER);
      const amountIn = ethers.utils.parseEther("100");
      const amountOut = ethers.utils.parseEther("48.914033769572423682");

      const cvxfxscrv = await ethers.getContractAt("IERC20", CURVE_CVXFXS_TOKEN, signer);
      const cvxfxs = await ethers.getContractAt("IERC20", CVXFXS, signer);
      const AladdinZap = await ethers.getContractFactory("AladdinZap", deployer);
      const zap = await AladdinZap.deploy();
      await zap.initialize();
      await zap.updatePoolTokens([CURVE_CVXFXS_POOL], [CURVE_CVXFXS_TOKEN]);
      await zap.updateRoute(CVXFXS, CURVE_CVXFXS_TOKEN, [
        encodePoolHintV2(CURVE_CVXFXS_POOL, PoolType.CurveCryptoPool, 2, 1, 1, Action.AddLiquidity),
      ]);
      await zap.deployed();
      await cvxfxs.transfer(zap.address, amountIn);
      const output = await zap.callStatic.zap(CVXFXS, amountIn, CURVE_CVXFXS_TOKEN, amountOut);
      const before = await cvxfxscrv.balanceOf(deployer.address);
      await zap.zap(CVXFXS, amountIn, CURVE_CVXFXS_TOKEN, amountOut);
      const after = await cvxfxscrv.balanceOf(deployer.address);
      expect(after.sub(before)).to.eq(amountOut);
      expect(output).to.eq(amountOut);
    });

    it("should succeed, when RemoveLiquidity Curve cvxfxs Pool => FXS", async () => {
      request_fork(FORK_BLOCK_NUMBER, [DEPLOYER, CURVE_CVXFXS_POOL, CURVE_CVXFXS_TOKEN, CURVE_CVXFXS_HOLDER]);
      const deployer = await ethers.getSigner(DEPLOYER);
      const signer = await ethers.getSigner(CURVE_CVXFXS_HOLDER);
      const amountIn = ethers.utils.parseEther("50");
      const amountOut = ethers.utils.parseEther("97.691736873124356606");

      const cvxfxscrv = await ethers.getContractAt("IERC20", CURVE_CVXFXS_TOKEN, signer);
      const fxs = await ethers.getContractAt("IERC20", FXS, signer);
      const AladdinZap = await ethers.getContractFactory("AladdinZap", deployer);
      const zap = await AladdinZap.deploy();
      await zap.initialize();
      await zap.updatePoolTokens([CURVE_CVXFXS_POOL], [CURVE_CVXFXS_TOKEN]);
      await zap.updateRoute(CURVE_CVXFXS_TOKEN, FXS, [
        encodePoolHintV2(CURVE_CVXFXS_POOL, PoolType.CurveCryptoPool, 2, 0, 0, Action.RemoveLiquidity),
      ]);
      await zap.deployed();
      await cvxfxscrv.transfer(zap.address, amountIn);
      const output = await zap.callStatic.zap(CURVE_CVXFXS_TOKEN, amountIn, FXS, amountOut);
      const before = await fxs.balanceOf(deployer.address);
      await zap.zap(CURVE_CVXFXS_TOKEN, amountIn, FXS, amountOut);
      const after = await fxs.balanceOf(deployer.address);
      expect(output).to.eq(amountOut);
      expect(after.sub(before)).to.eq(amountOut);
    });

    it("should succeed, when RemoveLiquidity Curve cvxfxs Pool => CVXFXS", async () => {
      request_fork(FORK_BLOCK_NUMBER, [DEPLOYER, CURVE_CVXFXS_POOL, CURVE_CVXFXS_TOKEN, CURVE_CVXFXS_HOLDER]);
      const deployer = await ethers.getSigner(DEPLOYER);
      const signer = await ethers.getSigner(CURVE_CVXFXS_HOLDER);
      const amountIn = ethers.utils.parseEther("50");
      const amountOut = ethers.utils.parseEther("101.917549894100147150");

      const cvxfxscrv = await ethers.getContractAt("IERC20", CURVE_CVXFXS_TOKEN, signer);
      const cvxfxs = await ethers.getContractAt("IERC20", CVXFXS, signer);
      const AladdinZap = await ethers.getContractFactory("AladdinZap", deployer);
      const zap = await AladdinZap.deploy();
      await zap.initialize();
      await zap.updatePoolTokens([CURVE_CVXFXS_POOL], [CURVE_CVXFXS_TOKEN]);
      await zap.updateRoute(CURVE_CVXFXS_TOKEN, CVXFXS, [
        encodePoolHintV2(CURVE_CVXFXS_POOL, PoolType.CurveCryptoPool, 2, 1, 1, Action.RemoveLiquidity),
      ]);
      await zap.deployed();
      await cvxfxscrv.transfer(zap.address, amountIn);
      const output = await zap.callStatic.zap(CURVE_CVXFXS_TOKEN, amountIn, CVXFXS, amountOut);
      const before = await cvxfxs.balanceOf(deployer.address);
      await zap.zap(CURVE_CVXFXS_TOKEN, amountIn, CVXFXS, amountOut);
      const after = await cvxfxs.balanceOf(deployer.address);
      expect(output).to.eq(amountOut);
      expect(after.sub(before)).to.eq(amountOut);
    });

    it("should succeed, when Swap FXS => CVXFXS", async () => {
      request_fork(FORK_BLOCK_NUMBER, [DEPLOYER, CURVE_CVXFXS_POOL, FXS, FXS_HOLDER]);
      const deployer = await ethers.getSigner(DEPLOYER);
      const signer = await ethers.getSigner(FXS_HOLDER);
      const amountIn = ethers.utils.parseEther("100");
      const amountOut = ethers.utils.parseEther("104.017141457504494199");

      const cvxfxs = await ethers.getContractAt("IERC20", CVXFXS, signer);
      const fxs = await ethers.getContractAt("IERC20", FXS, signer);
      const AladdinZap = await ethers.getContractFactory("AladdinZap", deployer);
      const zap = await AladdinZap.deploy();
      await zap.initialize();
      await zap.updateRoute(FXS, CVXFXS, [
        encodePoolHintV2(CURVE_CVXFXS_POOL, PoolType.CurveCryptoPool, 2, 0, 1, Action.Swap),
      ]);
      await zap.deployed();
      await fxs.transfer(zap.address, amountIn);
      const output = await zap.callStatic.zap(FXS, amountIn, CVXFXS, amountOut);
      const before = await cvxfxs.balanceOf(deployer.address);
      await zap.zap(FXS, amountIn, CVXFXS, amountOut);
      const after = await cvxfxs.balanceOf(deployer.address);
      expect(output).to.eq(amountOut);
      expect(after.sub(before)).to.eq(amountOut);
    });

    it("should succeed, when Swap CVXFXS => FXS", async () => {
      request_fork(FORK_BLOCK_NUMBER, [DEPLOYER, CURVE_CVXFXS_POOL, CVXFXS, CVXFXS_HOLDER]);
      const deployer = await ethers.getSigner(DEPLOYER);
      const signer = await ethers.getSigner(CVXFXS_HOLDER);
      const amountIn = ethers.utils.parseEther("100");
      const amountOut = ethers.utils.parseEther("95.570530725154749812");

      const cvxfxs = await ethers.getContractAt("IERC20", CVXFXS, signer);
      const fxs = await ethers.getContractAt("IERC20", FXS, signer);
      const AladdinZap = await ethers.getContractFactory("AladdinZap", deployer);
      const zap = await AladdinZap.deploy();
      await zap.initialize();
      await zap.updateRoute(CVXFXS, FXS, [
        encodePoolHintV2(CURVE_CVXFXS_POOL, PoolType.CurveCryptoPool, 2, 1, 0, Action.Swap),
      ]);
      await zap.deployed();
      await cvxfxs.transfer(zap.address, amountIn);
      const output = await zap.callStatic.zap(CVXFXS, amountIn, FXS, amountOut);
      const before = await fxs.balanceOf(deployer.address);
      await zap.zap(CVXFXS, amountIn, FXS, amountOut);
      const after = await fxs.balanceOf(deployer.address);
      expect(output).to.eq(amountOut);
      expect(after.sub(before)).to.eq(amountOut);
    });
  });

  describe("curve frax pool [CurveFactoryMetaPool, with 3crv]", async () => {
    const FORK_BLOCK_NUMBER = 14412700;
    const CURVE_FRAX3CRV_POOL = "0xd632f22692FaC7611d2AA1C0D552930D43CAEd3B";
    const CURVE_FRAX3CRV_TOKEN = "0xd632f22692FaC7611d2AA1C0D552930D43CAEd3B";
    const CURVE_FRAX3CRV_HOLDER = "0xca436e14855323927d6e6264470ded36455fc8bd";
    const FRAX = "0x853d955aCEf822Db058eb8505911ED77F175b99e";
    const FRAX_HOLDER = "0x10c6b61DbF44a083Aec3780aCF769C77BE747E23";
    const TRICRV = "0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490";
    const CURVE_TRICRV_HOLDER = "0x5c00977a2002a3C9925dFDfb6815765F578a804f";

    it("should succeed, when AddLiquidity FRAX => FRAX3CRV", async () => {
      request_fork(FORK_BLOCK_NUMBER, [DEPLOYER, CURVE_FRAX3CRV_POOL, FRAX, FRAX_HOLDER]);
      const deployer = await ethers.getSigner(DEPLOYER);
      const signer = await ethers.getSigner(FRAX_HOLDER);
      const amountIn = ethers.utils.parseUnits("10000", 18);
      const amountOut = ethers.utils.parseEther("9923.863722498112354092");

      const frax3crv = await ethers.getContractAt("IERC20", CURVE_FRAX3CRV_TOKEN, signer);
      const frax = await ethers.getContractAt("IERC20", FRAX, signer);
      const AladdinZap = await ethers.getContractFactory("AladdinZap", deployer);
      const zap = await AladdinZap.deploy();
      await zap.initialize();
      await zap.updatePoolTokens([CURVE_FRAX3CRV_POOL], [CURVE_FRAX3CRV_TOKEN]);
      await zap.updateRoute(FRAX, CURVE_FRAX3CRV_TOKEN, [
        encodePoolHintV2(CURVE_FRAX3CRV_POOL, PoolType.CurveFactoryMetaPool, 2, 0, 0, Action.AddLiquidity),
      ]);
      await zap.deployed();
      await frax.transfer(zap.address, amountIn);
      const output = await zap.callStatic.zap(FRAX, amountIn, CURVE_FRAX3CRV_TOKEN, amountOut);
      const before = await frax3crv.balanceOf(deployer.address);
      await zap.zap(FRAX, amountIn, CURVE_FRAX3CRV_TOKEN, amountOut);
      const after = await frax3crv.balanceOf(deployer.address);
      expect(after.sub(before)).to.eq(amountOut);
      expect(output).to.eq(amountOut);
    });

    it("should succeed, when AddLiquidity TRICRV => FRAX3CRV", async () => {
      request_fork(FORK_BLOCK_NUMBER, [DEPLOYER, CURVE_FRAX3CRV_POOL, TRICRV, CURVE_TRICRV_HOLDER]);
      const deployer = await ethers.getSigner(DEPLOYER);
      const signer = await ethers.getSigner(CURVE_TRICRV_HOLDER);
      const amountIn = ethers.utils.parseUnits("10000", 18);
      const amountOut = ethers.utils.parseEther("10128.738489162536809134");

      const frax3crv = await ethers.getContractAt("IERC20", CURVE_FRAX3CRV_TOKEN, signer);
      const tricrv = await ethers.getContractAt("IERC20", TRICRV, signer);
      const AladdinZap = await ethers.getContractFactory("AladdinZap", deployer);
      const zap = await AladdinZap.deploy();
      await zap.initialize();
      await zap.updatePoolTokens([CURVE_FRAX3CRV_POOL], [CURVE_FRAX3CRV_TOKEN]);
      await zap.updateRoute(TRICRV, CURVE_FRAX3CRV_TOKEN, [
        encodePoolHintV2(CURVE_FRAX3CRV_POOL, PoolType.CurveFactoryMetaPool, 2, 1, 1, Action.AddLiquidity),
      ]);
      await zap.deployed();
      await tricrv.transfer(zap.address, amountIn);
      const output = await zap.callStatic.zap(TRICRV, amountIn, CURVE_FRAX3CRV_TOKEN, amountOut);
      const before = await frax3crv.balanceOf(deployer.address);
      await zap.zap(TRICRV, amountIn, CURVE_FRAX3CRV_TOKEN, amountOut);
      const after = await frax3crv.balanceOf(deployer.address);
      expect(after.sub(before)).to.eq(amountOut);
      expect(output).to.eq(amountOut);
    });

    context("RemoveLiquidity from FRAX3CRV", async () => {
      const amountIn = ethers.utils.parseUnits("10000", 18);
      let deployer: SignerWithAddress;
      let signer: SignerWithAddress;
      let frax3crv: IERC20;
      let zap: AladdinZap;

      beforeEach(async () => {
        request_fork(FORK_BLOCK_NUMBER, [DEPLOYER, CURVE_FRAX3CRV_POOL, CURVE_FRAX3CRV_TOKEN, CURVE_FRAX3CRV_HOLDER]);
        deployer = await ethers.getSigner(DEPLOYER);
        signer = await ethers.getSigner(CURVE_FRAX3CRV_HOLDER);

        await deployer.sendTransaction({
          to: signer.address,
          value: ethers.utils.parseEther("10"),
        });

        const AladdinZap = await ethers.getContractFactory("AladdinZap", deployer);
        zap = await AladdinZap.deploy();
        await zap.deployed();
        await zap.initialize();
        await zap.updatePoolTokens([CURVE_FRAX3CRV_POOL], [CURVE_FRAX3CRV_TOKEN]);

        frax3crv = await ethers.getContractAt("IERC20", CURVE_FRAX3CRV_TOKEN, signer);
        await frax3crv.transfer(zap.address, amountIn);
      });

      it("should succeed, when RemoveLiquidity frax3crv => FRAX", async () => {
        const amountOut = ethers.utils.parseUnits("10073.161115823482038258", 18);
        const frax = await ethers.getContractAt("IERC20", FRAX, signer);
        await zap.updateRoute(CURVE_FRAX3CRV_TOKEN, FRAX, [
          encodePoolHintV2(CURVE_FRAX3CRV_POOL, PoolType.CurveFactoryMetaPool, 2, 0, 0, Action.RemoveLiquidity),
        ]);
        await frax3crv.transfer(zap.address, amountIn);
        const output = await zap.callStatic.zap(CURVE_FRAX3CRV_TOKEN, amountIn, FRAX, amountOut);
        const before = await frax.balanceOf(deployer.address);
        await zap.zap(CURVE_FRAX3CRV_TOKEN, amountIn, FRAX, amountOut);
        const after = await frax.balanceOf(deployer.address);
        expect(after.sub(before)).to.eq(amountOut);
        expect(output).to.eq(amountOut);
      });

      it("should succeed, when RemoveLiquidity frax3crv => TRICRV", async () => {
        const amountOut = ethers.utils.parseUnits("9868.487528376312253157", 18);
        const tricrv = await ethers.getContractAt("IERC20", TRICRV, signer);
        await zap.updateRoute(CURVE_FRAX3CRV_TOKEN, TRICRV, [
          encodePoolHintV2(CURVE_FRAX3CRV_POOL, PoolType.CurveFactoryMetaPool, 2, 1, 1, Action.RemoveLiquidity),
        ]);
        await frax3crv.transfer(zap.address, amountIn);
        const output = await zap.callStatic.zap(CURVE_FRAX3CRV_TOKEN, amountIn, TRICRV, amountOut);
        const before = await tricrv.balanceOf(deployer.address);
        await zap.zap(CURVE_FRAX3CRV_TOKEN, amountIn, TRICRV, amountOut);
        const after = await tricrv.balanceOf(deployer.address);
        expect(after.sub(before)).to.eq(amountOut);
        expect(output).to.eq(amountOut);
      });
    });

    context("Swap from FRAX", async () => {
      const amountIn = ethers.utils.parseUnits("10000", 18);
      let deployer: SignerWithAddress;
      let signer: SignerWithAddress;
      let frax: IERC20;
      let zap: AladdinZap;

      beforeEach(async () => {
        request_fork(FORK_BLOCK_NUMBER, [DEPLOYER, CURVE_FRAX3CRV_POOL, FRAX, FRAX_HOLDER]);
        deployer = await ethers.getSigner(DEPLOYER);
        signer = await ethers.getSigner(FRAX_HOLDER);

        await deployer.sendTransaction({
          to: signer.address,
          value: ethers.utils.parseEther("10"),
        });

        const AladdinZap = await ethers.getContractFactory("AladdinZap", deployer);
        zap = await AladdinZap.deploy();
        await zap.deployed();
        await zap.initialize();

        frax = await ethers.getContractAt("IERC20", FRAX, signer);
        await frax.transfer(zap.address, amountIn);
      });

      it("should succeed, when Swap FRAX => TRICRV", async () => {
        const amountOut = ethers.utils.parseUnits("9793.352128669244552812", 18);
        const tricrv = await ethers.getContractAt("IERC20", TRICRV, signer);
        await zap.updateRoute(FRAX, TRICRV, [
          encodePoolHintV2(CURVE_FRAX3CRV_POOL, PoolType.CurveFactoryMetaPool, 2, 0, 1, Action.Swap),
        ]);
        const output = await zap.callStatic.zap(FRAX, amountIn, TRICRV, amountOut);
        const before = await tricrv.balanceOf(deployer.address);
        await zap.zap(FRAX, amountIn, TRICRV, amountOut);
        const after = await tricrv.balanceOf(deployer.address);
        expect(after.sub(before)).to.eq(amountOut);
        expect(output).to.eq(amountOut);
      });
    });

    context("Swap from TRICRV", async () => {
      const amountIn = ethers.utils.parseUnits("10000", 18);
      let deployer: SignerWithAddress;
      let signer: SignerWithAddress;
      let tricrv: IERC20;
      let zap: AladdinZap;

      beforeEach(async () => {
        request_fork(FORK_BLOCK_NUMBER, [DEPLOYER, CURVE_FRAX3CRV_POOL, TRICRV, CURVE_TRICRV_HOLDER]);
        deployer = await ethers.getSigner(DEPLOYER);
        signer = await ethers.getSigner(CURVE_TRICRV_HOLDER);

        await deployer.sendTransaction({
          to: signer.address,
          value: ethers.utils.parseEther("10"),
        });

        const AladdinZap = await ethers.getContractFactory("AladdinZap", deployer);
        zap = await AladdinZap.deploy();
        await zap.deployed();
        await zap.initialize();

        tricrv = await ethers.getContractAt("IERC20", TRICRV, signer);
        await tricrv.transfer(zap.address, amountIn);
      });

      it("should succeed, when Swap TRICRV => FRAX", async () => {
        const amountOut = ethers.utils.parseUnits("10202.841043093473386193", 18);
        const frax = await ethers.getContractAt("IERC20", FRAX, signer);
        await zap.updateRoute(TRICRV, FRAX, [
          encodePoolHintV2(CURVE_FRAX3CRV_POOL, PoolType.CurveFactoryMetaPool, 2, 1, 0, Action.Swap),
        ]);
        const output = await zap.callStatic.zap(TRICRV, amountIn, FRAX, amountOut);
        const before = await frax.balanceOf(deployer.address);
        await zap.zap(TRICRV, amountIn, FRAX, amountOut);
        const after = await frax.balanceOf(deployer.address);
        expect(after.sub(before)).to.eq(amountOut);
        expect(output).to.eq(amountOut);
      });
    });
  });

  describe("curve frax pool [CurveFactoryUSDMetaPoolUnderlying]", async () => {
    const FORK_BLOCK_NUMBER = 14412700;
    const CURVE_FRAX3CRV_POOL = "0xd632f22692FaC7611d2AA1C0D552930D43CAEd3B";
    const CURVE_FRAX3CRV_TOKEN = "0xd632f22692FaC7611d2AA1C0D552930D43CAEd3B";
    const CURVE_FRAX3CRV_HOLDER = "0xca436e14855323927d6e6264470ded36455fc8bd";
    const FRAX = "0x853d955aCEf822Db058eb8505911ED77F175b99e";
    const FRAX_HOLDER = "0x10c6b61DbF44a083Aec3780aCF769C77BE747E23";
    const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
    const DAI_HOLDER = "0xE78388b4CE79068e89Bf8aA7f218eF6b9AB0e9d0";
    const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
    const USDC_HOLDER = "0xE78388b4CE79068e89Bf8aA7f218eF6b9AB0e9d0";
    const USDT = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
    const USDT_HOLDER = "0xE78388b4CE79068e89Bf8aA7f218eF6b9AB0e9d0";

    it("should succeed, when AddLiquidity FRAX => FRAX3CRV", async () => {
      request_fork(FORK_BLOCK_NUMBER, [DEPLOYER, CURVE_FRAX3CRV_POOL, FRAX, FRAX_HOLDER]);
      const deployer = await ethers.getSigner(DEPLOYER);
      const signer = await ethers.getSigner(FRAX_HOLDER);
      const amountIn = ethers.utils.parseUnits("10000", 18);
      const amountOut = ethers.utils.parseEther("9923.863722498112354092");

      const tricrv = await ethers.getContractAt("IERC20", CURVE_FRAX3CRV_TOKEN, signer);
      const frax = await ethers.getContractAt("IERC20", FRAX, signer);
      const AladdinZap = await ethers.getContractFactory("AladdinZap", deployer);
      const zap = await AladdinZap.deploy();
      await zap.initialize();
      await zap.updatePoolTokens([CURVE_FRAX3CRV_POOL], [CURVE_FRAX3CRV_TOKEN]);
      await zap.updateRoute(FRAX, CURVE_FRAX3CRV_TOKEN, [
        encodePoolHintV2(CURVE_FRAX3CRV_POOL, PoolType.CurveFactoryUSDMetaPoolUnderlying, 4, 0, 0, Action.AddLiquidity),
      ]);
      await zap.deployed();
      await frax.transfer(zap.address, amountIn);
      const output = await zap.callStatic.zap(FRAX, amountIn, CURVE_FRAX3CRV_TOKEN, amountOut);
      const before = await tricrv.balanceOf(deployer.address);
      await zap.zap(FRAX, amountIn, CURVE_FRAX3CRV_TOKEN, amountOut);
      const after = await tricrv.balanceOf(deployer.address);
      expect(after.sub(before)).to.eq(amountOut);
      expect(output).to.eq(amountOut);
    });

    it("should succeed, when AddLiquidity DAI => FRAX3CRV", async () => {
      request_fork(FORK_BLOCK_NUMBER, [DEPLOYER, CURVE_FRAX3CRV_POOL, DAI, DAI_HOLDER]);
      const deployer = await ethers.getSigner(DEPLOYER);
      const signer = await ethers.getSigner(DAI_HOLDER);
      const amountIn = ethers.utils.parseUnits("10000", 18);
      const amountOut = ethers.utils.parseEther("9922.811372804320764078");

      const tricrv = await ethers.getContractAt("IERC20", CURVE_FRAX3CRV_TOKEN, signer);
      const dai = await ethers.getContractAt("IERC20", DAI, signer);
      const AladdinZap = await ethers.getContractFactory("AladdinZap", deployer);
      const zap = await AladdinZap.deploy();
      await zap.initialize();
      await zap.updatePoolTokens([CURVE_FRAX3CRV_POOL], [CURVE_FRAX3CRV_TOKEN]);
      await zap.updateRoute(DAI, CURVE_FRAX3CRV_TOKEN, [
        encodePoolHintV2(CURVE_FRAX3CRV_POOL, PoolType.CurveFactoryUSDMetaPoolUnderlying, 4, 1, 1, Action.AddLiquidity),
      ]);
      await zap.deployed();
      await dai.transfer(zap.address, amountIn);
      const output = await zap.callStatic.zap(DAI, amountIn, CURVE_FRAX3CRV_TOKEN, amountOut);
      const before = await tricrv.balanceOf(deployer.address);
      await zap.zap(DAI, amountIn, CURVE_FRAX3CRV_TOKEN, amountOut);
      const after = await tricrv.balanceOf(deployer.address);
      expect(after.sub(before)).to.eq(amountOut);
      expect(output).to.eq(amountOut);
    });

    it("should succeed, when AddLiquidity USDC => FRAX3CRV", async () => {
      request_fork(FORK_BLOCK_NUMBER, [DEPLOYER, CURVE_FRAX3CRV_POOL, USDC, USDC_HOLDER]);
      const deployer = await ethers.getSigner(DEPLOYER);
      const signer = await ethers.getSigner(USDC_HOLDER);
      const amountIn = ethers.utils.parseUnits("10000", 6);
      const amountOut = ethers.utils.parseEther("9922.655813438739325194");

      const tricrv = await ethers.getContractAt("IERC20", CURVE_FRAX3CRV_TOKEN, signer);
      const usdc = await ethers.getContractAt("IERC20", USDC, signer);
      const AladdinZap = await ethers.getContractFactory("AladdinZap", deployer);
      const zap = await AladdinZap.deploy();
      await zap.initialize();
      await zap.updatePoolTokens([CURVE_FRAX3CRV_POOL], [CURVE_FRAX3CRV_TOKEN]);
      await zap.updateRoute(USDC, CURVE_FRAX3CRV_TOKEN, [
        encodePoolHintV2(CURVE_FRAX3CRV_POOL, PoolType.CurveFactoryUSDMetaPoolUnderlying, 4, 2, 2, Action.AddLiquidity),
      ]);
      await zap.deployed();
      await usdc.transfer(zap.address, amountIn);
      const output = await zap.callStatic.zap(USDC, amountIn, CURVE_FRAX3CRV_TOKEN, amountOut);
      const before = await tricrv.balanceOf(deployer.address);
      await zap.zap(USDC, amountIn, CURVE_FRAX3CRV_TOKEN, amountOut);
      const after = await tricrv.balanceOf(deployer.address);
      expect(after.sub(before)).to.eq(amountOut);
      expect(output).to.eq(amountOut);
    });

    it("should succeed, when AddLiquidity USDT => FRAX3CRV", async () => {
      request_fork(FORK_BLOCK_NUMBER, [DEPLOYER, CURVE_FRAX3CRV_POOL, USDT, USDT_HOLDER]);
      const deployer = await ethers.getSigner(DEPLOYER);
      const signer = await ethers.getSigner(USDT_HOLDER);
      const amountIn = ethers.utils.parseUnits("10000", 6);
      const amountOut = ethers.utils.parseEther("9927.139047594986992958");

      const tricrv = await ethers.getContractAt("IERC20", CURVE_FRAX3CRV_TOKEN, signer);
      const usdt = await ethers.getContractAt("IERC20", USDT, signer);
      const AladdinZap = await ethers.getContractFactory("AladdinZap", deployer);
      const zap = await AladdinZap.deploy();
      await zap.initialize();
      await zap.updatePoolTokens([CURVE_FRAX3CRV_POOL], [CURVE_FRAX3CRV_TOKEN]);
      await zap.updateRoute(USDT, CURVE_FRAX3CRV_TOKEN, [
        encodePoolHintV2(CURVE_FRAX3CRV_POOL, PoolType.CurveFactoryUSDMetaPoolUnderlying, 4, 3, 3, Action.AddLiquidity),
      ]);
      await zap.deployed();
      await usdt.transfer(zap.address, amountIn);
      const output = await zap.callStatic.zap(USDT, amountIn, CURVE_FRAX3CRV_TOKEN, amountOut);
      const before = await tricrv.balanceOf(deployer.address);
      await zap.zap(USDT, amountIn, CURVE_FRAX3CRV_TOKEN, amountOut);
      const after = await tricrv.balanceOf(deployer.address);
      expect(after.sub(before)).to.eq(amountOut);
      expect(output).to.eq(amountOut);
    });

    context("RemoveLiquidity from FRAX3CRV", async () => {
      const amountIn = ethers.utils.parseUnits("10000", 18);
      let deployer: SignerWithAddress;
      let signer: SignerWithAddress;
      let frax3crv: IERC20;
      let zap: AladdinZap;

      beforeEach(async () => {
        request_fork(FORK_BLOCK_NUMBER, [DEPLOYER, CURVE_FRAX3CRV_POOL, CURVE_FRAX3CRV_TOKEN, CURVE_FRAX3CRV_HOLDER]);
        deployer = await ethers.getSigner(DEPLOYER);
        signer = await ethers.getSigner(CURVE_FRAX3CRV_HOLDER);

        await deployer.sendTransaction({ to: signer.address, value: ethers.utils.parseEther("10") });

        const AladdinZap = await ethers.getContractFactory("AladdinZap", deployer);
        zap = await AladdinZap.deploy();
        await zap.deployed();
        await zap.initialize();
        await zap.updatePoolTokens([CURVE_FRAX3CRV_POOL], [CURVE_FRAX3CRV_TOKEN]);

        frax3crv = await ethers.getContractAt("IERC20", CURVE_FRAX3CRV_TOKEN, signer);
        await frax3crv.transfer(zap.address, amountIn);
      });

      it("should succeed, when RemoveLiquidity FRAX3CRV => FRAX", async () => {
        const amountOut = ethers.utils.parseUnits("10073.161115823482038258", 18);
        const frax = await ethers.getContractAt("IERC20", FRAX, signer);
        await zap.updateRoute(CURVE_FRAX3CRV_TOKEN, FRAX, [
          encodePoolHintV2(
            CURVE_FRAX3CRV_POOL,
            PoolType.CurveFactoryUSDMetaPoolUnderlying,
            4,
            0,
            0,
            Action.RemoveLiquidity
          ),
        ]);
        const output = await zap.callStatic.zap(CURVE_FRAX3CRV_TOKEN, amountIn, FRAX, amountOut);
        const before = await frax.balanceOf(deployer.address);
        await zap.zap(CURVE_FRAX3CRV_TOKEN, amountIn, FRAX, amountOut);
        const after = await frax.balanceOf(deployer.address);
        expect(after.sub(before)).to.eq(amountOut);
        expect(output).to.eq(amountOut);
      });

      it("should succeed, when RemoveLiquidity FRAX3CRV => DAI", async () => {
        const amountOut = ethers.utils.parseUnits("10070.601201457344715035", 18);
        const dai = await ethers.getContractAt("IERC20", DAI, signer);
        await zap.updateRoute(CURVE_FRAX3CRV_TOKEN, DAI, [
          encodePoolHintV2(
            CURVE_FRAX3CRV_POOL,
            PoolType.CurveFactoryUSDMetaPoolUnderlying,
            4,
            1,
            1,
            Action.RemoveLiquidity
          ),
        ]);
        const output = await zap.callStatic.zap(CURVE_FRAX3CRV_TOKEN, amountIn, DAI, amountOut);
        const before = await dai.balanceOf(deployer.address);
        await zap.zap(CURVE_FRAX3CRV_TOKEN, amountIn, DAI, amountOut);
        const after = await dai.balanceOf(deployer.address);
        expect(after.sub(before)).to.eq(amountOut);
        expect(output).to.eq(amountOut);
      });

      it("should succeed, when RemoveLiquidity FRAX3CRV => USDC", async () => {
        const amountOut = ethers.utils.parseUnits("10070.993109", 6);
        const usdc = await ethers.getContractAt("IERC20", USDC, signer);
        await zap.updateRoute(CURVE_FRAX3CRV_TOKEN, USDC, [
          encodePoolHintV2(
            CURVE_FRAX3CRV_POOL,
            PoolType.CurveFactoryUSDMetaPoolUnderlying,
            4,
            2,
            2,
            Action.RemoveLiquidity
          ),
        ]);
        const output = await zap.callStatic.zap(CURVE_FRAX3CRV_TOKEN, amountIn, USDC, amountOut);
        const before = await usdc.balanceOf(deployer.address);
        await zap.zap(CURVE_FRAX3CRV_TOKEN, amountIn, USDC, amountOut);
        const after = await usdc.balanceOf(deployer.address);
        expect(after.sub(before)).to.eq(amountOut);
        expect(output).to.eq(amountOut);
      });

      it("should succeed, when RemoveLiquidity FRAX3CRV => USDT", async () => {
        const amountOut = ethers.utils.parseUnits("10064.970262", 6);
        const usdt = await ethers.getContractAt("IERC20", USDT, signer);
        await zap.updateRoute(CURVE_FRAX3CRV_TOKEN, USDT, [
          encodePoolHintV2(
            CURVE_FRAX3CRV_POOL,
            PoolType.CurveFactoryUSDMetaPoolUnderlying,
            4,
            3,
            3,
            Action.RemoveLiquidity
          ),
        ]);
        const output = await zap.callStatic.zap(CURVE_FRAX3CRV_TOKEN, amountIn, USDT, amountOut);
        const before = await usdt.balanceOf(deployer.address);
        await zap.zap(CURVE_FRAX3CRV_TOKEN, amountIn, USDT, amountOut);
        const after = await usdt.balanceOf(deployer.address);
        expect(after.sub(before)).to.eq(amountOut);
        expect(output).to.eq(amountOut);
      });
    });

    context("Swap from FRAX", async () => {
      const amountIn = ethers.utils.parseUnits("10000", 18);
      let deployer: SignerWithAddress;
      let signer: SignerWithAddress;
      let frax: IERC20;
      let zap: AladdinZap;

      beforeEach(async () => {
        request_fork(FORK_BLOCK_NUMBER, [DEPLOYER, CURVE_FRAX3CRV_POOL, FRAX, FRAX_HOLDER]);
        deployer = await ethers.getSigner(DEPLOYER);
        signer = await ethers.getSigner(FRAX_HOLDER);

        await deployer.sendTransaction({
          to: signer.address,
          value: ethers.utils.parseEther("10"),
        });

        const AladdinZap = await ethers.getContractFactory("AladdinZap", deployer);
        zap = await AladdinZap.deploy();
        await zap.deployed();
        await zap.initialize();

        frax = await ethers.getContractAt("IERC20", FRAX, signer);
        await frax.transfer(zap.address, amountIn);
      });

      it("should succeed, when Swap FRAX => DAI", async () => {
        const amountOut = ethers.utils.parseUnits("9993.926975144123080758", 18);
        const dai = await ethers.getContractAt("IERC20", DAI, signer);
        await zap.updateRoute(FRAX, DAI, [
          encodePoolHintV2(CURVE_FRAX3CRV_POOL, PoolType.CurveFactoryUSDMetaPoolUnderlying, 4, 0, 1, Action.Swap),
        ]);
        const output = await zap.callStatic.zap(FRAX, amountIn, DAI, amountOut);
        const before = await dai.balanceOf(deployer.address);
        await zap.zap(FRAX, amountIn, DAI, amountOut);
        const after = await dai.balanceOf(deployer.address);
        expect(after.sub(before)).to.eq(amountOut);
        expect(output).to.eq(amountOut);
      });

      it("should succeed, when Swap FRAX => USDC", async () => {
        const amountOut = ethers.utils.parseUnits("9994.315899", 6);
        const usdc = await ethers.getContractAt("IERC20", USDC, signer);
        await zap.updateRoute(FRAX, USDC, [
          encodePoolHintV2(CURVE_FRAX3CRV_POOL, PoolType.CurveFactoryUSDMetaPoolUnderlying, 4, 0, 2, Action.Swap),
        ]);
        const output = await zap.callStatic.zap(FRAX, amountIn, USDC, amountOut);
        const before = await usdc.balanceOf(deployer.address);
        await zap.zap(FRAX, amountIn, USDC, amountOut);
        const after = await usdc.balanceOf(deployer.address);
        expect(after.sub(before)).to.eq(amountOut);
        expect(output).to.eq(amountOut);
      });

      it("should succeed, when Swap FRAX => USDT", async () => {
        const amountOut = ethers.utils.parseUnits("9988.338908", 6);
        const usdt = await ethers.getContractAt("IERC20", USDT, signer);
        await zap.updateRoute(FRAX, USDT, [
          encodePoolHintV2(CURVE_FRAX3CRV_POOL, PoolType.CurveFactoryUSDMetaPoolUnderlying, 4, 0, 3, Action.Swap),
        ]);
        const output = await zap.callStatic.zap(FRAX, amountIn, USDT, amountOut);
        const before = await usdt.balanceOf(deployer.address);
        await zap.zap(FRAX, amountIn, USDT, amountOut);
        const after = await usdt.balanceOf(deployer.address);
        expect(after.sub(before)).to.eq(amountOut);
        expect(output).to.eq(amountOut);
      });
    });

    context("Swap from DAI", async () => {
      const amountIn = ethers.utils.parseUnits("10000", 18);
      let deployer: SignerWithAddress;
      let signer: SignerWithAddress;
      let dai: IERC20;
      let zap: AladdinZap;

      beforeEach(async () => {
        request_fork(FORK_BLOCK_NUMBER, [DEPLOYER, CURVE_FRAX3CRV_POOL, DAI, DAI_HOLDER]);
        deployer = await ethers.getSigner(DEPLOYER);
        signer = await ethers.getSigner(DAI_HOLDER);

        await deployer.sendTransaction({
          to: signer.address,
          value: ethers.utils.parseEther("10"),
        });

        const AladdinZap = await ethers.getContractFactory("AladdinZap", deployer);
        zap = await AladdinZap.deploy();
        await zap.deployed();
        await zap.initialize();

        dai = await ethers.getContractAt("IERC20", DAI, signer);
        await dai.transfer(zap.address, amountIn);
      });

      it("should succeed, when Swap DAI => FRAX", async () => {
        const amountOut = ethers.utils.parseUnits("9995.407349332552658494", 18);
        const frax = await ethers.getContractAt("IERC20", FRAX, signer);
        await zap.updateRoute(DAI, FRAX, [
          encodePoolHintV2(CURVE_FRAX3CRV_POOL, PoolType.CurveFactoryUSDMetaPoolUnderlying, 4, 1, 0, Action.Swap),
        ]);
        const output = await zap.callStatic.zap(DAI, amountIn, FRAX, amountOut);
        const before = await frax.balanceOf(deployer.address);
        await zap.zap(DAI, amountIn, FRAX, amountOut);
        const after = await frax.balanceOf(deployer.address);
        expect(after.sub(before)).to.eq(amountOut);
        expect(output).to.eq(amountOut);
      });

      it("should succeed, when Swap DAI => USDC", async () => {
        const amountOut = ethers.utils.parseUnits("9997.272869", 6);
        const usdc = await ethers.getContractAt("IERC20", USDC, signer);
        await zap.updateRoute(DAI, USDC, [
          encodePoolHintV2(CURVE_FRAX3CRV_POOL, PoolType.CurveFactoryUSDMetaPoolUnderlying, 4, 1, 2, Action.Swap),
        ]);
        const output = await zap.callStatic.zap(DAI, amountIn, USDC, amountOut);
        const before = await usdc.balanceOf(deployer.address);
        await zap.zap(DAI, amountIn, USDC, amountOut);
        const after = await usdc.balanceOf(deployer.address);
        expect(after.sub(before)).to.eq(amountOut);
        expect(output).to.eq(amountOut);
      });

      it("should succeed, when Swap DAI => USDT", async () => {
        const amountOut = ethers.utils.parseUnits("9992.025908", 6);
        const usdt = await ethers.getContractAt("IERC20", USDT, signer);
        await zap.updateRoute(DAI, USDT, [
          encodePoolHintV2(CURVE_FRAX3CRV_POOL, PoolType.CurveFactoryUSDMetaPoolUnderlying, 4, 1, 3, Action.Swap),
        ]);
        const output = await zap.callStatic.zap(DAI, amountIn, USDT, amountOut);
        const before = await usdt.balanceOf(deployer.address);
        await zap.zap(DAI, amountIn, USDT, amountOut);
        const after = await usdt.balanceOf(deployer.address);
        expect(after.sub(before)).to.eq(amountOut);
        expect(output).to.eq(amountOut);
      });
    });

    context("Swap from USDC", async () => {
      const amountIn = ethers.utils.parseUnits("10000", 6);
      let deployer: SignerWithAddress;
      let signer: SignerWithAddress;
      let usdc: IERC20;
      let zap: AladdinZap;

      beforeEach(async () => {
        request_fork(FORK_BLOCK_NUMBER, [DEPLOYER, CURVE_FRAX3CRV_POOL, USDC, USDC_HOLDER]);
        deployer = await ethers.getSigner(DEPLOYER);
        signer = await ethers.getSigner(USDC_HOLDER);

        await deployer.sendTransaction({
          to: signer.address,
          value: ethers.utils.parseEther("10"),
        });

        const AladdinZap = await ethers.getContractFactory("AladdinZap", deployer);
        zap = await AladdinZap.deploy();
        await zap.deployed();
        await zap.initialize();

        usdc = await ethers.getContractAt("IERC20", USDC, signer);
        await usdc.transfer(zap.address, amountIn);
      });

      it("should succeed, when Swap USDC => FRAX", async () => {
        const amountOut = ethers.utils.parseUnits("9995.250651971250738864", 18);
        const frax = await ethers.getContractAt("IERC20", FRAX, signer);
        await zap.updateRoute(USDC, FRAX, [
          encodePoolHintV2(CURVE_FRAX3CRV_POOL, PoolType.CurveFactoryUSDMetaPoolUnderlying, 4, 2, 0, Action.Swap),
        ]);
        const output = await zap.callStatic.zap(USDC, amountIn, FRAX, amountOut);
        const before = await frax.balanceOf(deployer.address);
        await zap.zap(USDC, amountIn, FRAX, amountOut);
        const after = await frax.balanceOf(deployer.address);
        expect(after.sub(before)).to.eq(amountOut);
        expect(output).to.eq(amountOut);
      });

      it("should succeed, when Swap USDC => DAI", async () => {
        const amountOut = ethers.utils.parseUnits("9996.727108968933586433", 18);
        const dai = await ethers.getContractAt("IERC20", DAI, signer);
        await zap.updateRoute(USDC, DAI, [
          encodePoolHintV2(CURVE_FRAX3CRV_POOL, PoolType.CurveFactoryUSDMetaPoolUnderlying, 4, 2, 1, Action.Swap),
        ]);
        const output = await zap.callStatic.zap(USDC, amountIn, DAI, amountOut);
        const before = await dai.balanceOf(deployer.address);
        await zap.zap(USDC, amountIn, DAI, amountOut);
        const after = await dai.balanceOf(deployer.address);
        expect(after.sub(before)).to.eq(amountOut);
        expect(output).to.eq(amountOut);
      });

      it("should succeed, when Swap USDC => USDT", async () => {
        const amountOut = ethers.utils.parseUnits("9991.753165", 6);
        const usdt = await ethers.getContractAt("IERC20", USDT, signer);
        await zap.updateRoute(USDC, USDT, [
          encodePoolHintV2(CURVE_FRAX3CRV_POOL, PoolType.CurveFactoryUSDMetaPoolUnderlying, 4, 2, 3, Action.Swap),
        ]);
        const output = await zap.callStatic.zap(USDC, amountIn, USDT, amountOut);
        const before = await usdt.balanceOf(deployer.address);
        await zap.zap(USDC, amountIn, USDT, amountOut);
        const after = await usdt.balanceOf(deployer.address);
        expect(after.sub(before)).to.eq(amountOut);
        expect(output).to.eq(amountOut);
      });
    });

    context("Swap from USDT", async () => {
      const amountIn = ethers.utils.parseUnits("10000", 6);
      let deployer: SignerWithAddress;
      let signer: SignerWithAddress;
      let usdt: IERC20;
      let zap: AladdinZap;

      beforeEach(async () => {
        request_fork(FORK_BLOCK_NUMBER, [DEPLOYER, CURVE_FRAX3CRV_POOL, USDT, USDT_HOLDER]);
        deployer = await ethers.getSigner(DEPLOYER);
        signer = await ethers.getSigner(USDT_HOLDER);

        await deployer.sendTransaction({
          to: signer.address,
          value: ethers.utils.parseEther("10"),
        });

        const AladdinZap = await ethers.getContractFactory("AladdinZap", deployer);
        zap = await AladdinZap.deploy();
        await zap.deployed();
        await zap.initialize();

        usdt = await ethers.getContractAt("IERC20", USDT, signer);
        await usdt.transfer(zap.address, amountIn);
      });

      it("should succeed, when Swap USDT => FRAX", async () => {
        const amountOut = ethers.utils.parseUnits("9999.766685216543622042", 18);
        const frax = await ethers.getContractAt("IERC20", FRAX, signer);
        await zap.updateRoute(USDT, FRAX, [
          encodePoolHintV2(CURVE_FRAX3CRV_POOL, PoolType.CurveFactoryUSDMetaPoolUnderlying, 4, 3, 0, Action.Swap),
        ]);
        const output = await zap.callStatic.zap(USDT, amountIn, FRAX, amountOut);
        const before = await frax.balanceOf(deployer.address);
        await zap.zap(USDT, amountIn, FRAX, amountOut);
        const after = await frax.balanceOf(deployer.address);
        expect(after.sub(before)).to.eq(amountOut);
        expect(output).to.eq(amountOut);
      });

      it("should succeed, when Swap USDT => DAI", async () => {
        const amountOut = ethers.utils.parseUnits("10001.976336433627877987", 18);
        const dai = await ethers.getContractAt("IERC20", DAI, signer);
        await zap.updateRoute(USDT, DAI, [
          encodePoolHintV2(CURVE_FRAX3CRV_POOL, PoolType.CurveFactoryUSDMetaPoolUnderlying, 4, 3, 1, Action.Swap),
        ]);
        const output = await zap.callStatic.zap(USDT, amountIn, DAI, amountOut);
        const before = await dai.balanceOf(deployer.address);
        await zap.zap(USDT, amountIn, DAI, amountOut);
        const after = await dai.balanceOf(deployer.address);
        expect(after.sub(before)).to.eq(amountOut);
        expect(output).to.eq(amountOut);
      });

      it("should succeed, when Swap USDT => USDC", async () => {
        const amountOut = ethers.utils.parseUnits("10002.249354", 6);
        const usdc = await ethers.getContractAt("IERC20", USDC, signer);
        await zap.updateRoute(USDT, USDC, [
          encodePoolHintV2(CURVE_FRAX3CRV_POOL, PoolType.CurveFactoryUSDMetaPoolUnderlying, 4, 3, 2, Action.Swap),
        ]);
        const output = await zap.callStatic.zap(USDT, amountIn, USDC, amountOut);
        const before = await usdc.balanceOf(deployer.address);
        await zap.zap(USDT, amountIn, USDC, amountOut);
        const after = await usdc.balanceOf(deployer.address);
        expect(after.sub(before)).to.eq(amountOut);
        expect(output).to.eq(amountOut);
      });
    });
  });

  describe("curve cvxcrv pool [CurveFactoryPlainPool, 2 tokens]", async () => {
    describe("curve cvxcrv pool [CurveFactoryPlainPool, 2 tokens]", async () => {
      const CURVE_CVXCRV_POOL = "0x9D0464996170c6B9e75eED71c68B99dDEDf279e8";
      const CURVE_CVXCRV_TOKEN = "0x9D0464996170c6B9e75eED71c68B99dDEDf279e8";
      const CURVE_CVXCRV_HOLDER = "0x4786C6690904CBEE4a6C2b5673Bfa90BE8AbADab";
      const CRV = "0xD533a949740bb3306d119CC777fa900bA034cd52";
      const CRV_HOLDER = "0x7a16fF8270133F063aAb6C9977183D9e72835428";
      const CVXCRV = "0x62B9c7356A2Dc64a1969e19C23e4f579F9810Aa7";
      const CVXCRV_HOLDER = "0x2612A04a4aa6f440AB32c63dBEd46cF06b0C3329";

      it("should succeed, when AddLiquidity CRV => CVXCRV-f", async () => {
        request_fork(FORK_BLOCK_NUMBER, [DEPLOYER, CURVE_CVXCRV_POOL, CRV, CRV_HOLDER]);
        const deployer = await ethers.getSigner(DEPLOYER);
        const signer = await ethers.getSigner(CRV_HOLDER);
        const amountIn = ethers.utils.parseUnits("10", 18);
        const amountOut = ethers.utils.parseEther("10.185284747715546057");

        const cvxcrvcrv = await ethers.getContractAt("IERC20", CURVE_CVXCRV_TOKEN, signer);
        const crv = await ethers.getContractAt("IERC20", CRV, signer);
        const AladdinZap = await ethers.getContractFactory("AladdinZap", deployer);
        const zap = await AladdinZap.deploy();
        await zap.initialize();
        await zap.updatePoolTokens([CURVE_CVXCRV_POOL], [CURVE_CVXCRV_TOKEN]);
        await zap.updateRoute(CRV, CURVE_CVXCRV_TOKEN, [
          encodePoolHintV2(CURVE_CVXCRV_POOL, PoolType.CurveBasePool, 2, 0, 0, Action.AddLiquidity),
        ]);
        await zap.deployed();
        await crv.transfer(zap.address, amountIn);
        const output = await zap.callStatic.zap(CRV, amountIn, CURVE_CVXCRV_TOKEN, amountOut);
        const before = await cvxcrvcrv.balanceOf(deployer.address);
        await zap.zap(CRV, amountIn, CURVE_CVXCRV_TOKEN, amountOut);
        const after = await cvxcrvcrv.balanceOf(deployer.address);
        expect(after.sub(before)).to.eq(amountOut);
        expect(output).to.eq(amountOut);
      });

      it("should succeed, when AddLiquidity CVXCRV => CVXCRV-f", async () => {
        request_fork(FORK_BLOCK_NUMBER, [DEPLOYER, CURVE_CVXCRV_POOL, CVXCRV, CVXCRV_HOLDER]);
        const deployer = await ethers.getSigner(DEPLOYER);
        const signer = await ethers.getSigner(CVXCRV_HOLDER);
        await deployer.sendTransaction({ to: signer.address, value: ethers.utils.parseEther("10") });
        const amountIn = ethers.utils.parseUnits("10", 18);
        const amountOut = ethers.utils.parseEther("9.772018616692141811");

        const cvxcrvcrv = await ethers.getContractAt("IERC20", CURVE_CVXCRV_TOKEN, signer);
        const cvxcrv = await ethers.getContractAt("IERC20", CVXCRV, signer);
        const AladdinZap = await ethers.getContractFactory("AladdinZap", deployer);
        const zap = await AladdinZap.deploy();
        await zap.initialize();
        await zap.updatePoolTokens([CURVE_CVXCRV_POOL], [CURVE_CVXCRV_TOKEN]);
        await zap.updateRoute(CVXCRV, CURVE_CVXCRV_TOKEN, [
          encodePoolHintV2(CURVE_CVXCRV_POOL, PoolType.CurveBasePool, 2, 1, 1, Action.AddLiquidity),
        ]);
        await zap.deployed();
        await cvxcrv.transfer(zap.address, amountIn);
        const output = await zap.callStatic.zap(CVXCRV, amountIn, CURVE_CVXCRV_TOKEN, amountOut);
        const before = await cvxcrvcrv.balanceOf(deployer.address);
        await zap.zap(CVXCRV, amountIn, CURVE_CVXCRV_TOKEN, amountOut);
        const after = await cvxcrvcrv.balanceOf(deployer.address);
        expect(after.sub(before)).to.eq(amountOut);
        expect(output).to.eq(amountOut);
      });

      context("RemoveLiquidity from CVXCRV-f", async () => {
        const amountIn = ethers.utils.parseUnits("10", 18);
        let deployer: SignerWithAddress;
        let signer: SignerWithAddress;
        let cvxcrvcrv: IERC20;
        let zap: AladdinZap;

        beforeEach(async () => {
          request_fork(FORK_BLOCK_NUMBER, [DEPLOYER, CURVE_CVXCRV_POOL, CURVE_CVXCRV_TOKEN, CURVE_CVXCRV_HOLDER]);
          deployer = await ethers.getSigner(DEPLOYER);
          signer = await ethers.getSigner(CURVE_CVXCRV_HOLDER);

          await deployer.sendTransaction({ to: signer.address, value: ethers.utils.parseEther("10") });

          const AladdinZap = await ethers.getContractFactory("AladdinZap", deployer);
          zap = await AladdinZap.deploy();
          await zap.deployed();
          await zap.initialize();
          await zap.updatePoolTokens([CURVE_CVXCRV_POOL], [CURVE_CVXCRV_TOKEN]);

          cvxcrvcrv = await ethers.getContractAt("IERC20", CURVE_CVXCRV_TOKEN, signer);
          await cvxcrvcrv.transfer(zap.address, amountIn);
        });

        it("should succeed, when RemoveLiquidity CVXCRV-f => CRV", async () => {
          const amountOut = ethers.utils.parseUnits("9.795542488642659763", 18);
          const crv = await ethers.getContractAt("IERC20", CRV, signer);
          await zap.updateRoute(CURVE_CVXCRV_TOKEN, CRV, [
            encodePoolHintV2(CURVE_CVXCRV_POOL, PoolType.CurveFactoryPlainPool, 2, 0, 0, Action.RemoveLiquidity),
          ]);
          const output = await zap.callStatic.zap(CURVE_CVXCRV_TOKEN, amountIn, CRV, amountOut);
          const before = await crv.balanceOf(deployer.address);
          await zap.zap(CURVE_CVXCRV_TOKEN, amountIn, CRV, amountOut);
          const after = await crv.balanceOf(deployer.address);
          expect(after.sub(before)).to.eq(amountOut);
          expect(output).to.eq(amountOut);
        });

        it("should succeed, when RemoveLiquidity CVXCRV-f => CVXCRV", async () => {
          const amountOut = ethers.utils.parseUnits("10.226111342280135792", 18);
          const cvxcrv = await ethers.getContractAt("IERC20", CVXCRV, signer);
          await zap.updateRoute(CURVE_CVXCRV_TOKEN, CVXCRV, [
            encodePoolHintV2(CURVE_CVXCRV_POOL, PoolType.CurveFactoryPlainPool, 2, 1, 1, Action.RemoveLiquidity),
          ]);
          const output = await zap.callStatic.zap(CURVE_CVXCRV_TOKEN, amountIn, CVXCRV, amountOut);
          const before = await cvxcrv.balanceOf(deployer.address);
          await zap.zap(CURVE_CVXCRV_TOKEN, amountIn, CVXCRV, amountOut);
          const after = await cvxcrv.balanceOf(deployer.address);
          expect(after.sub(before)).to.eq(amountOut);
          expect(output).to.eq(amountOut);
        });
      });

      context("Swap from CRV", async () => {
        const amountIn = ethers.utils.parseUnits("10", 18);
        let deployer: SignerWithAddress;
        let signer: SignerWithAddress;
        let crv: IERC20;
        let zap: AladdinZap;

        beforeEach(async () => {
          request_fork(FORK_BLOCK_NUMBER, [DEPLOYER, CURVE_CVXCRV_POOL, CRV, CRV_HOLDER]);
          deployer = await ethers.getSigner(DEPLOYER);
          signer = await ethers.getSigner(CRV_HOLDER);

          await deployer.sendTransaction({
            to: signer.address,
            value: ethers.utils.parseEther("10"),
          });

          const AladdinZap = await ethers.getContractFactory("AladdinZap", deployer);
          zap = await AladdinZap.deploy();
          await zap.deployed();
          await zap.initialize();

          crv = await ethers.getContractAt("IERC20", CRV, signer);
          await crv.transfer(zap.address, amountIn);
        });

        it("should succeed, when Swap CRV => CVXCRV", async () => {
          const amountOut = ethers.utils.parseUnits("10.415581249204002863", 18);
          const cvxcrv = await ethers.getContractAt("IERC20", CVXCRV, signer);
          await zap.updateRoute(CRV, CVXCRV, [
            encodePoolHintV2(CURVE_CVXCRV_POOL, PoolType.CurveFactoryPlainPool, 2, 0, 1, Action.Swap),
          ]);
          const output = await zap.callStatic.zap(CRV, amountIn, CVXCRV, amountOut);
          const before = await cvxcrv.balanceOf(deployer.address);
          await zap.zap(CRV, amountIn, CVXCRV, amountOut);
          const after = await cvxcrv.balanceOf(deployer.address);
          expect(after.sub(before)).to.eq(amountOut);
          expect(output).to.eq(amountOut);
        });
      });

      context("Swap from CVXCRV", async () => {
        const amountIn = ethers.utils.parseUnits("10", 18);
        let deployer: SignerWithAddress;
        let signer: SignerWithAddress;
        let cvxcrv: IERC20;
        let zap: AladdinZap;

        beforeEach(async () => {
          request_fork(FORK_BLOCK_NUMBER, [DEPLOYER, CURVE_CVXCRV_POOL, CVXCRV, CVXCRV_HOLDER]);
          deployer = await ethers.getSigner(DEPLOYER);
          signer = await ethers.getSigner(CVXCRV_HOLDER);

          await deployer.sendTransaction({
            to: signer.address,
            value: ethers.utils.parseEther("10"),
          });

          const AladdinZap = await ethers.getContractFactory("AladdinZap", deployer);
          zap = await AladdinZap.deploy();
          await zap.deployed();
          await zap.initialize();

          cvxcrv = await ethers.getContractAt("IERC20", CVXCRV, signer);
          await cvxcrv.transfer(zap.address, amountIn);
        });

        it("should succeed, when Swap CVXCRV => CRV", async () => {
          const amountOut = ethers.utils.parseUnits("9.572218377604806231", 18);
          const crv = await ethers.getContractAt("IERC20", CRV, signer);
          await zap.updateRoute(CVXCRV, CRV, [
            encodePoolHintV2(CURVE_CVXCRV_POOL, PoolType.CurveFactoryPlainPool, 2, 1, 0, Action.Swap),
          ]);
          const output = await zap.callStatic.zap(CVXCRV, amountIn, CRV, amountOut);
          const before = await crv.balanceOf(deployer.address);
          await zap.zap(CVXCRV, amountIn, CRV, amountOut);
          const after = await crv.balanceOf(deployer.address);
          expect(after.sub(before)).to.eq(amountOut);
          expect(output).to.eq(amountOut);
        });
      });
    });
  });

  // TODO: pending unit tests for the following pools
  //   + CurveMetaCryptoPool: eurtusd
  //   + CurveAPool: saave, aave
  //   + CurveAPoolUnderlying: saave, aave
  //   + CurveYPool: compound, usdt, y
  //   + CurveYPoolUnderlying: compound, usdt, y
  //   + CurveMetaPool: ust
  //   + CurveMetaPoolUnderlying: ust
  //   + CurveFactoryBTCMetaPoolUnderlying: ibbtc

});
