/* eslint-disable node/no-missing-import */
// @ts-nocheck
import { expect } from "chai";
import { ethers } from "hardhat";
import { Action, encodePoolHintV2, PoolType } from "../../scripts/utils";
import { AladdinCRV } from "../../typechain-types";
// eslint-disable-next-line camelcase
import { request_fork } from "../utils";

const FORK_BLOCK_NUMBER = 14243290;
const CVX = "0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B";
const CRV = "0xD533a949740bb3306d119CC777fa900bA034cd52";
const CRV_HOLDER = "0x7a16fF8270133F063aAb6C9977183D9e72835428";
const CVXCRV = "0x62B9c7356A2Dc64a1969e19C23e4f579F9810Aa7";
const CVXCRV_HOLDER = "0xE4360E6e45F5b122586BCA3b9d7b222EA69C5568";
const DEPLOYER = "0xDA9dfA130Df4dE4673b89022EE50ff26f6EA73Cf";
const CVXCRV_STAKING = "0x3Fe65692bfCD0e6CF84cB1E7d24108E434A7587e";

const CURVE_TRICRV_POOL = "0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7";
const CURVE_TRICRV_TOKEN = "0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490";
const CURVE_TRICRYPTO_POOL = "0xD51a44d3FaE010294C616388b506AcdA1bfAAE46";
const CURVE_CVXETH_POOL = "0xB576491F1E6e5E62f1d8F26062Ee822B40B0E0d4";
const CURVE_CRVETH_POOL = "0x8301AE4fc9c624d1D396cbDAa1ed877821D7C511";
const CURVE_CVXCRV_POOL = "0x9D0464996170c6B9e75eED71c68B99dDEDf279e8";
const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

const PLATFORM = "0x07dA2d30E26802ED65a52859a50872cfA615bD0A";
const WITHDRAW_FEE_PERCENTAGE = 1e7; // 1%
const PLATFORM_FEE_PERCENTAGE = 2e8; // 20%
const HARVEST_BOUNTY_PERCENTAGE = 5e7; // 5%
const DEPOSIT_AMOUNT = ethers.utils.parseEther("10000");

describe("AladdinCRV.spec", async () => {
  let acrv: AladdinCRV;

  beforeEach(async () => {
    request_fork(FORK_BLOCK_NUMBER, [DEPLOYER, PLATFORM, CVXCRV, CVXCRV_HOLDER, CRV, CRV_HOLDER]);
    const deployer = await ethers.getSigner(DEPLOYER);

    const ProxyAdmin = await ethers.getContractFactory("ProxyAdmin", deployer);
    const proxyAdmin = await ProxyAdmin.deploy();
    await proxyAdmin.deployed();

    const AladdinZap = await ethers.getContractFactory("AladdinZap", deployer);
    const zap = await AladdinZap.deploy();
    await zap.initialize();

    // 3CRV => USDT => WETH
    await zap.updateRoute(CURVE_TRICRV_TOKEN, WETH, [
      encodePoolHintV2(CURVE_TRICRV_POOL, PoolType.CurveBasePool, 3, 2, 2, Action.RemoveLiquidity),
      encodePoolHintV2(CURVE_TRICRYPTO_POOL, PoolType.CurveTriCryptoPool, 3, 0, 2, Action.Swap),
    ]);
    // CVX => WETH
    await zap.updateRoute(CVX, WETH, [
      encodePoolHintV2(CURVE_CVXETH_POOL, PoolType.CurveCryptoPool, 2, 1, 0, Action.Swap),
    ]);
    // WETH => CRV
    await zap.updateRoute(WETH, CRV, [
      encodePoolHintV2(CURVE_CRVETH_POOL, PoolType.CurveCryptoPool, 2, 0, 1, Action.Swap),
    ]);
    // cvxCRV => CRV
    await zap.updateRoute(CVXCRV, CRV, [
      encodePoolHintV2(CURVE_CVXCRV_POOL, PoolType.CurveFactoryPlainPool, 2, 1, 0, Action.Swap),
    ]);
    // cvxCRV => CRV => WETH => CVX
    await zap.updateRoute(CVXCRV, CVX, [
      encodePoolHintV2(CURVE_CVXCRV_POOL, PoolType.CurveFactoryPlainPool, 2, 1, 0, Action.Swap),
      encodePoolHintV2(CURVE_CRVETH_POOL, PoolType.CurveCryptoPool, 2, 1, 0, Action.Swap),
      encodePoolHintV2(CURVE_CVXETH_POOL, PoolType.CurveCryptoPool, 2, 0, 1, Action.Swap),
    ]);
    // cvxCRV => CRV => WETH
    await zap.updateRoute(CVXCRV, WETH, [
      encodePoolHintV2(CURVE_CVXCRV_POOL, PoolType.CurveFactoryPlainPool, 2, 1, 0, Action.Swap),
      encodePoolHintV2(CURVE_CRVETH_POOL, PoolType.CurveCryptoPool, 2, 1, 0, Action.Swap),
    ]);
    // CRV => CVXCRV
    await zap.updateRoute(CRV, CVXCRV, [
      encodePoolHintV2(CURVE_CVXCRV_POOL, PoolType.CurveFactoryPlainPool, 2, 0, 1, Action.Swap),
    ]);

    const AladdinCRV = await ethers.getContractFactory("AladdinCRV", deployer);
    const acrvImpl = await AladdinCRV.deploy();
    await acrvImpl.deployed();
    const data = acrvImpl.interface.encodeFunctionData("initialize", [
      zap.address,
      PLATFORM,
      WITHDRAW_FEE_PERCENTAGE,
      PLATFORM_FEE_PERCENTAGE,
      HARVEST_BOUNTY_PERCENTAGE,
    ]);
    const TransparentUpgradeableProxy = await ethers.getContractFactory("TransparentUpgradeableProxy", deployer);
    const proxy = await TransparentUpgradeableProxy.deploy(acrvImpl.address, proxyAdmin.address, data);
    await proxy.deployed();
    acrv = await ethers.getContractAt("AladdinCRV", proxy.address, deployer);
  });

  it("should succeed deposit with CVXCRV withdraw as CVXCRV", async () => {
    const cvxCRVSigner = await ethers.getSigner(CVXCRV_HOLDER);
    const cvxCRV = await ethers.getContractAt("IERC20", CVXCRV, cvxCRVSigner);
    await cvxCRV.approve(acrv.address, DEPOSIT_AMOUNT);
    await acrv.connect(cvxCRVSigner).deposit(CVXCRV_HOLDER, DEPOSIT_AMOUNT);
    expect(await acrv.balanceOf(CVXCRV_HOLDER)).to.eq(DEPOSIT_AMOUNT);
    await acrv.harvest(DEPLOYER, 0);
    const harvestBounty = await acrv.balanceOf(DEPLOYER);
    const platformFee = await acrv.balanceOf(PLATFORM);
    let rewards = (await acrv.totalUnderlying()).sub(DEPOSIT_AMOUNT);
    const p = rewards.mul(PLATFORM_FEE_PERCENTAGE).div(1e9);
    rewards = rewards.sub(p);
    const h = rewards.mul(HARVEST_BOUNTY_PERCENTAGE).div(1e9);
    rewards = rewards.sub(h);
    console.log("harvest bounty:", harvestBounty);
    console.log("platform fee:", platformFee);
    expect(harvestBounty).eq(h.mul(DEPOSIT_AMOUNT).div(DEPOSIT_AMOUNT.add(rewards)));
    expect(platformFee).eq(p.mul(DEPOSIT_AMOUNT).div(DEPOSIT_AMOUNT.add(rewards)));
    const before = await cvxCRV.balanceOf(DEPLOYER);
    await acrv.connect(cvxCRVSigner).withdraw(DEPLOYER, DEPOSIT_AMOUNT, 0, 0);
    const after = await cvxCRV.balanceOf(DEPLOYER);
    const withdrawFee = rewards.add(DEPOSIT_AMOUNT).mul(WITHDRAW_FEE_PERCENTAGE).div(1e9);
    expect(after.sub(before)).to.eq(rewards.add(DEPOSIT_AMOUNT).sub(withdrawFee).add(1));
  });

  it("should succeed deposit with CVXCRV withdraw as CVXCRV and stake", async () => {
    const cvxCRVSigner = await ethers.getSigner(CVXCRV_HOLDER);
    const cvxCRV = await ethers.getContractAt("IERC20", CVXCRV, cvxCRVSigner);
    await cvxCRV.approve(acrv.address, DEPOSIT_AMOUNT);
    await acrv.connect(cvxCRVSigner).deposit(CVXCRV_HOLDER, DEPOSIT_AMOUNT);
    expect(await acrv.balanceOf(CVXCRV_HOLDER)).to.eq(DEPOSIT_AMOUNT);
    await acrv.harvest(DEPLOYER, 0);
    const harvestBounty = await acrv.balanceOf(DEPLOYER);
    const platformFee = await acrv.balanceOf(PLATFORM);
    let rewards = (await acrv.totalUnderlying()).sub(DEPOSIT_AMOUNT);
    const p = rewards.mul(PLATFORM_FEE_PERCENTAGE).div(1e9);
    rewards = rewards.sub(p);
    const h = rewards.mul(HARVEST_BOUNTY_PERCENTAGE).div(1e9);
    rewards = rewards.sub(h);
    console.log("harvest bounty:", harvestBounty);
    console.log("platform fee:", platformFee);
    expect(harvestBounty).eq(h.mul(DEPOSIT_AMOUNT).div(DEPOSIT_AMOUNT.add(rewards)));
    expect(platformFee).eq(p.mul(DEPOSIT_AMOUNT).div(DEPOSIT_AMOUNT.add(rewards)));
    const staking = await ethers.getContractAt("IConvexBasicRewards", CVXCRV_STAKING);
    const before = await staking.balanceOf(DEPLOYER);
    await acrv.connect(cvxCRVSigner).withdraw(DEPLOYER, DEPOSIT_AMOUNT, 0, 1);
    const after = await staking.balanceOf(DEPLOYER);
    const withdrawFee = rewards.add(DEPOSIT_AMOUNT).mul(WITHDRAW_FEE_PERCENTAGE).div(1e9);
    expect(after.sub(before)).to.eq(rewards.add(DEPOSIT_AMOUNT).sub(withdrawFee).add(1));
  });

  it("should succeed deposit with CVXCRV withdraw as CRV", async () => {
    const cvxCRVSigner = await ethers.getSigner(CVXCRV_HOLDER);
    const cvxCRV = await ethers.getContractAt("IERC20", CVXCRV, cvxCRVSigner);
    await cvxCRV.approve(acrv.address, DEPOSIT_AMOUNT);
    await acrv.connect(cvxCRVSigner).deposit(CVXCRV_HOLDER, DEPOSIT_AMOUNT);
    expect(await acrv.balanceOf(CVXCRV_HOLDER)).to.eq(DEPOSIT_AMOUNT);
    await acrv.harvest(DEPLOYER, 0);
    const harvestBounty = await acrv.balanceOf(DEPLOYER);
    const platformFee = await acrv.balanceOf(PLATFORM);
    let rewards = (await acrv.totalUnderlying()).sub(DEPOSIT_AMOUNT);
    const p = rewards.mul(PLATFORM_FEE_PERCENTAGE).div(1e9);
    rewards = rewards.sub(p);
    const h = rewards.mul(HARVEST_BOUNTY_PERCENTAGE).div(1e9);
    rewards = rewards.sub(h);
    console.log("harvest bounty:", harvestBounty);
    console.log("platform fee:", platformFee);
    expect(harvestBounty).eq(h.mul(DEPOSIT_AMOUNT).div(DEPOSIT_AMOUNT.add(rewards)));
    expect(platformFee).eq(p.mul(DEPOSIT_AMOUNT).div(DEPOSIT_AMOUNT.add(rewards)));
    const crv = await ethers.getContractAt("IERC20", CRV);
    const before = await crv.balanceOf(DEPLOYER);
    await acrv.connect(cvxCRVSigner).withdraw(DEPLOYER, DEPOSIT_AMOUNT, 0, 2);
    const after = await crv.balanceOf(DEPLOYER);
    const withdrawFee = rewards.add(DEPOSIT_AMOUNT).mul(WITHDRAW_FEE_PERCENTAGE).div(1e9);
    console.info("crv:", after.sub(before), "cvxcrv:", rewards.add(DEPOSIT_AMOUNT).sub(withdrawFee));
  });

  it("should succeed deposit with CVXCRV withdraw as CVX", async () => {
    const cvxCRVSigner = await ethers.getSigner(CVXCRV_HOLDER);
    const cvxCRV = await ethers.getContractAt("IERC20", CVXCRV, cvxCRVSigner);
    await cvxCRV.approve(acrv.address, DEPOSIT_AMOUNT);
    await acrv.connect(cvxCRVSigner).deposit(CVXCRV_HOLDER, DEPOSIT_AMOUNT);
    expect(await acrv.balanceOf(CVXCRV_HOLDER)).to.eq(DEPOSIT_AMOUNT);
    await acrv.harvest(DEPLOYER, 0);
    const harvestBounty = await acrv.balanceOf(DEPLOYER);
    const platformFee = await acrv.balanceOf(PLATFORM);
    let rewards = (await acrv.totalUnderlying()).sub(DEPOSIT_AMOUNT);
    const p = rewards.mul(PLATFORM_FEE_PERCENTAGE).div(1e9);
    rewards = rewards.sub(p);
    const h = rewards.mul(HARVEST_BOUNTY_PERCENTAGE).div(1e9);
    rewards = rewards.sub(h);
    console.log("harvest bounty:", harvestBounty);
    console.log("platform fee:", platformFee);
    expect(harvestBounty).eq(h.mul(DEPOSIT_AMOUNT).div(DEPOSIT_AMOUNT.add(rewards)));
    expect(platformFee).eq(p.mul(DEPOSIT_AMOUNT).div(DEPOSIT_AMOUNT.add(rewards)));
    const cvx = await ethers.getContractAt("IERC20", CVX);
    const before = await cvx.balanceOf(DEPLOYER);
    await acrv.connect(cvxCRVSigner).withdraw(DEPLOYER, DEPOSIT_AMOUNT, 0, 3);
    const after = await cvx.balanceOf(DEPLOYER);
    const withdrawFee = rewards.add(DEPOSIT_AMOUNT).mul(WITHDRAW_FEE_PERCENTAGE).div(1e9);
    console.info("cvx:", after.sub(before), "cvxcrv:", rewards.add(DEPOSIT_AMOUNT).sub(withdrawFee));
  });

  it("should succeed deposit with CVXCRV withdraw as ETH", async () => {
    const cvxCRVSigner = await ethers.getSigner(CVXCRV_HOLDER);
    const cvxCRV = await ethers.getContractAt("IERC20", CVXCRV, cvxCRVSigner);
    await cvxCRV.approve(acrv.address, DEPOSIT_AMOUNT);
    await acrv.connect(cvxCRVSigner).deposit(CVXCRV_HOLDER, DEPOSIT_AMOUNT);
    expect(await acrv.balanceOf(CVXCRV_HOLDER)).to.eq(DEPOSIT_AMOUNT);
    await acrv.harvest(DEPLOYER, 0);
    const harvestBounty = await acrv.balanceOf(DEPLOYER);
    const platformFee = await acrv.balanceOf(PLATFORM);
    let rewards = (await acrv.totalUnderlying()).sub(DEPOSIT_AMOUNT);
    const p = rewards.mul(PLATFORM_FEE_PERCENTAGE).div(1e9);
    rewards = rewards.sub(p);
    const h = rewards.mul(HARVEST_BOUNTY_PERCENTAGE).div(1e9);
    rewards = rewards.sub(h);
    console.log("harvest bounty:", harvestBounty);
    console.log("platform fee:", platformFee);
    expect(harvestBounty).eq(h.mul(DEPOSIT_AMOUNT).div(DEPOSIT_AMOUNT.add(rewards)));
    expect(platformFee).eq(p.mul(DEPOSIT_AMOUNT).div(DEPOSIT_AMOUNT.add(rewards)));
    const before = await ethers.provider.getBalance(DEPLOYER);
    await acrv.connect(cvxCRVSigner).withdraw(DEPLOYER, DEPOSIT_AMOUNT, 0, 4);
    const after = await ethers.provider.getBalance(DEPLOYER);
    const withdrawFee = rewards.add(DEPOSIT_AMOUNT).mul(WITHDRAW_FEE_PERCENTAGE).div(1e9);
    console.info("eth:", after.sub(before), "cvxcrv:", rewards.add(DEPOSIT_AMOUNT).sub(withdrawFee));
  });

  it("should succeed deposit with CRV withdraw as CVXCRV", async () => {
    const crvSigner = await ethers.getSigner(CRV_HOLDER);
    const crv = await ethers.getContractAt("IERC20", CRV, crvSigner);
    await crv.approve(acrv.address, DEPOSIT_AMOUNT);
    await acrv.connect(crvSigner).depositWithCRV(CRV_HOLDER, DEPOSIT_AMOUNT);
    const extra = (await acrv.totalUnderlying()).sub(DEPOSIT_AMOUNT);
    const shares = DEPOSIT_AMOUNT.add(extra);
    expect(await acrv.balanceOf(CRV_HOLDER)).to.eq(shares);
    await acrv.harvest(DEPLOYER, 0);
    const harvestBounty = await acrv.balanceOf(DEPLOYER);
    const platformFee = await acrv.balanceOf(PLATFORM);
    let rewards = (await acrv.totalUnderlying()).sub(shares);
    const p = rewards.mul(PLATFORM_FEE_PERCENTAGE).div(1e9);
    rewards = rewards.sub(p);
    const h = rewards.mul(HARVEST_BOUNTY_PERCENTAGE).div(1e9);
    rewards = rewards.sub(h);
    console.log("harvest bounty:", harvestBounty);
    console.log("platform fee:", platformFee);
    expect(harvestBounty).eq(h.mul(shares).div(shares.add(rewards)));
    expect(platformFee).eq(p.mul(shares).div(shares.add(rewards)));
    const cvxCRV = await ethers.getContractAt("IERC20", CVXCRV);
    const before = await cvxCRV.balanceOf(DEPLOYER);
    await acrv.connect(crvSigner).withdraw(DEPLOYER, shares, 0, 0);
    const after = await cvxCRV.balanceOf(DEPLOYER);
    const withdrawFee = rewards.add(shares).mul(WITHDRAW_FEE_PERCENTAGE).div(1e9);
    expect(after.sub(before)).to.eq(rewards.add(shares).sub(withdrawFee));
  });

  it("should succeed deposit with CVXCRV withdraw as CVXCRV and stake", async () => {
    const crvSigner = await ethers.getSigner(CRV_HOLDER);
    const crv = await ethers.getContractAt("IERC20", CRV, crvSigner);
    await crv.approve(acrv.address, DEPOSIT_AMOUNT);
    await acrv.connect(crvSigner).depositWithCRV(CRV_HOLDER, DEPOSIT_AMOUNT);
    const extra = (await acrv.totalUnderlying()).sub(DEPOSIT_AMOUNT);
    const shares = DEPOSIT_AMOUNT.add(extra);
    expect(await acrv.balanceOf(CRV_HOLDER)).to.eq(shares);
    await acrv.harvest(DEPLOYER, 0);
    const harvestBounty = await acrv.balanceOf(DEPLOYER);
    const platformFee = await acrv.balanceOf(PLATFORM);
    let rewards = (await acrv.totalUnderlying()).sub(shares);
    const p = rewards.mul(PLATFORM_FEE_PERCENTAGE).div(1e9);
    rewards = rewards.sub(p);
    const h = rewards.mul(HARVEST_BOUNTY_PERCENTAGE).div(1e9);
    rewards = rewards.sub(h);
    console.log("harvest bounty:", harvestBounty);
    console.log("platform fee:", platformFee);
    expect(harvestBounty).eq(h.mul(shares).div(shares.add(rewards)));
    expect(platformFee).eq(p.mul(shares).div(shares.add(rewards)));
    const staking = await ethers.getContractAt("IConvexBasicRewards", CVXCRV_STAKING);
    const before = await staking.balanceOf(DEPLOYER);
    await acrv.connect(crvSigner).withdraw(DEPLOYER, shares, 0, 1);
    const after = await staking.balanceOf(DEPLOYER);
    const withdrawFee = rewards.add(shares).mul(WITHDRAW_FEE_PERCENTAGE).div(1e9);
    expect(after.sub(before)).to.eq(rewards.add(shares).sub(withdrawFee));
  });

  it("should succeed deposit with CVXCRV withdraw as CRV", async () => {
    const crvSigner = await ethers.getSigner(CRV_HOLDER);
    const crv = await ethers.getContractAt("IERC20", CRV, crvSigner);
    await crv.approve(acrv.address, DEPOSIT_AMOUNT);
    await acrv.connect(crvSigner).depositWithCRV(CRV_HOLDER, DEPOSIT_AMOUNT);
    const extra = (await acrv.totalUnderlying()).sub(DEPOSIT_AMOUNT);
    const shares = DEPOSIT_AMOUNT.add(extra);
    expect(await acrv.balanceOf(CRV_HOLDER)).to.eq(shares);
    await acrv.harvest(DEPLOYER, 0);
    const harvestBounty = await acrv.balanceOf(DEPLOYER);
    const platformFee = await acrv.balanceOf(PLATFORM);
    let rewards = (await acrv.totalUnderlying()).sub(shares);
    const p = rewards.mul(PLATFORM_FEE_PERCENTAGE).div(1e9);
    rewards = rewards.sub(p);
    const h = rewards.mul(HARVEST_BOUNTY_PERCENTAGE).div(1e9);
    rewards = rewards.sub(h);
    console.log("harvest bounty:", harvestBounty);
    console.log("platform fee:", platformFee);
    expect(harvestBounty).eq(h.mul(shares).div(shares.add(rewards)));
    expect(platformFee).eq(p.mul(shares).div(shares.add(rewards)));
    const before = await crv.balanceOf(DEPLOYER);
    await acrv.connect(crvSigner).withdraw(DEPLOYER, shares, 0, 2);
    const after = await crv.balanceOf(DEPLOYER);
    const withdrawFee = rewards.add(shares).mul(WITHDRAW_FEE_PERCENTAGE).div(1e9);
    console.info("crv:", after.sub(before), "cvxcrv:", rewards.add(shares).sub(withdrawFee));
  });

  it("should succeed deposit with CVXCRV withdraw as CVX", async () => {
    const crvSigner = await ethers.getSigner(CRV_HOLDER);
    const crv = await ethers.getContractAt("IERC20", CRV, crvSigner);
    await crv.approve(acrv.address, DEPOSIT_AMOUNT);
    await acrv.connect(crvSigner).depositWithCRV(CRV_HOLDER, DEPOSIT_AMOUNT);
    const extra = (await acrv.totalUnderlying()).sub(DEPOSIT_AMOUNT);
    const shares = DEPOSIT_AMOUNT.add(extra);
    expect(await acrv.balanceOf(CRV_HOLDER)).to.eq(shares);
    await acrv.harvest(DEPLOYER, 0);
    const harvestBounty = await acrv.balanceOf(DEPLOYER);
    const platformFee = await acrv.balanceOf(PLATFORM);
    let rewards = (await acrv.totalUnderlying()).sub(shares);
    const p = rewards.mul(PLATFORM_FEE_PERCENTAGE).div(1e9);
    rewards = rewards.sub(p);
    const h = rewards.mul(HARVEST_BOUNTY_PERCENTAGE).div(1e9);
    rewards = rewards.sub(h);
    console.log("harvest bounty:", harvestBounty);
    console.log("platform fee:", platformFee);
    expect(harvestBounty).eq(h.mul(shares).div(shares.add(rewards)));
    expect(platformFee).eq(p.mul(shares).div(shares.add(rewards)));
    const cvx = await ethers.getContractAt("IERC20", CVX);
    const before = await cvx.balanceOf(DEPLOYER);
    await acrv.connect(crvSigner).withdraw(DEPLOYER, shares, 0, 3);
    const after = await cvx.balanceOf(DEPLOYER);
    const withdrawFee = rewards.add(shares).mul(WITHDRAW_FEE_PERCENTAGE).div(1e9);
    console.info("cvx:", after.sub(before), "cvxcrv:", rewards.add(shares).sub(withdrawFee));
  });

  it("should succeed deposit with CVXCRV withdraw as ETH", async () => {
    const crvSigner = await ethers.getSigner(CRV_HOLDER);
    const crv = await ethers.getContractAt("IERC20", CRV, crvSigner);
    await crv.approve(acrv.address, DEPOSIT_AMOUNT);
    await acrv.connect(crvSigner).depositWithCRV(CRV_HOLDER, DEPOSIT_AMOUNT);
    const extra = (await acrv.totalUnderlying()).sub(DEPOSIT_AMOUNT);
    const shares = DEPOSIT_AMOUNT.add(extra);
    expect(await acrv.balanceOf(CRV_HOLDER)).to.eq(shares);
    await acrv.harvest(DEPLOYER, 0);
    const harvestBounty = await acrv.balanceOf(DEPLOYER);
    const platformFee = await acrv.balanceOf(PLATFORM);
    let rewards = (await acrv.totalUnderlying()).sub(shares);
    const p = rewards.mul(PLATFORM_FEE_PERCENTAGE).div(1e9);
    rewards = rewards.sub(p);
    const h = rewards.mul(HARVEST_BOUNTY_PERCENTAGE).div(1e9);
    rewards = rewards.sub(h);
    console.log("harvest bounty:", harvestBounty);
    console.log("platform fee:", platformFee);
    expect(harvestBounty).eq(h.mul(shares).div(shares.add(rewards)));
    expect(platformFee).eq(p.mul(shares).div(shares.add(rewards)));
    const before = await ethers.provider.getBalance(DEPLOYER);
    await acrv.connect(crvSigner).withdraw(DEPLOYER, shares, 0, 4);
    const after = await ethers.provider.getBalance(DEPLOYER);
    const withdrawFee = rewards.add(shares).mul(WITHDRAW_FEE_PERCENTAGE).div(1e9);
    console.info("eth:", after.sub(before), "cvxcrv:", rewards.add(shares).sub(withdrawFee));
  });
});
