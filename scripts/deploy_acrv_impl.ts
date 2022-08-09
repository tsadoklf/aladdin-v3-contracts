/* eslint-disable node/no-missing-import */
// @ts-nocheck
import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  const AladdinCRV = await ethers.getContractFactory("AladdinCRV", deployer);
  const impl = await AladdinCRV.deploy();
  await impl.deployed();
  console.log("Deploy AladdinCRV Impl at:", impl.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
