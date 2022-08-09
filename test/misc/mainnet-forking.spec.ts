// @ts-nocheck
import { expect } from "chai";
import { ethers } from "hardhat";
import { request_fork } from "../utils";

describe("Mainnet Forking", function () {

    const blockNumber = 4043801;
    const hackerAddress = "0xB3764761E297D6f121e79C32A65829Cd1dDb4D32";

    // before(async function () {
	// });

	// beforeEach(async function () {	
	// });

    it(`should be block number: ${blockNumber}`, async () => {
        console.log(`\n\tRequesting Mainnet fork with block number ${blockNumber} and account 'hackerAddress' ...`);
        request_fork(blockNumber, [ hackerAddress ]);

        const _blockNumber = await ethers.provider.getBlockNumber();
        expect(_blockNumber).to.equal(blockNumber);
    });

	
});
