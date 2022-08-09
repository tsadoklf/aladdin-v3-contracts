/* eslint-disable node/no-missing-import */
// @ts-nocheck
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { DEPLOYED_CONTRACTS, TOKENS } from "../utils";
import { RoundClaimParams } from "./config";

async function main() {
  for (const item of RoundClaimParams[21]) {
    const symbol: string = Object.entries(TOKENS).filter(
      ([, { address }]) => address.toLowerCase() === item.token.toLowerCase()
    )[0][0];
    console.log(
      `token[${symbol}], address[${item.token}], amount[${ethers.utils.formatUnits(
        item.amount,
        TOKENS[symbol].decimals
      )}]`
    );
  }

  const [deployer] = await ethers.getSigners();
  const cvxLocker = await ethers.getContractAt("CLeverCVXLocker", DEPLOYED_CONTRACTS.CLeverForCVX, deployer);

  const estimate = BigNumber.from(
    await ethers.provider.call({
      from: "0x11E91BB6d1334585AA37D8F4fde3932C7960B938",
      to: cvxLocker.address,
      data: cvxLocker.interface.encodeFunctionData("harvestVotium", [RoundClaimParams[21], 0]),
    })
  );
  console.log("estimate CVX:", ethers.utils.formatEther(estimate.toString()));
  const gasEstimate = await ethers.provider.estimateGas({
    from: deployer.address,
    to: cvxLocker.address,
    data: cvxLocker.interface.encodeFunctionData("harvestVotium", [RoundClaimParams[21], 0]),
  });
  console.log("gas estimate:", gasEstimate.toString());
  const tx = await cvxLocker.harvestVotium(RoundClaimParams[21], estimate.mul(9).div(10), {
    gasLimit: gasEstimate.mul(12).div(10),
  });
  console.log("waiting for tx:", tx.hash);
  const receipt = await tx.wait();
  console.log("confirmed, gas used:", receipt.gasUsed.toString());
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
