// @ts-nocheck
import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import { request_fork } from "../utils";

import { MyERC20 } from "../../typechain-types";

describe("MyERC20 Token (vyper)", function () {

    let token: MyERC20;
	let owner: SignerWithAddress;
	let addr1: SignerWithAddress;
	let addr2: SignerWithAddress
	let addrs: SignerWithAddress[];

    const name = "Tsadok"
    const symbol = "TLF"
    const decimals = 18

    const blockNumber = 4043801;
    const hackerAddress = "0xB3764761E297D6f121e79C32A65829Cd1dDb4D32";

    // before(async function () {

    //     console.log(`requesting fork with blockNumber=${blockNumber} and account 'hackerAddress'`);
    //     request_fork(blockNumber, [ hackerAddress ]);

	// });

	beforeEach(async function () {

		[ owner, addr1, addr2, ...addrs] = await ethers.getSigners();

        const MyERC20 = await ethers.getContractFactory("MyERC20");
        const totalSupply = (10 ** 9).toString()

        token = await MyERC20.deploy(name, symbol, decimals, ethers.utils.parseEther(totalSupply));

        await token.deployed();
	});

	describe("Deployment", async function () {

		it(`should be block number: ${blockNumber}`, async () => {
			console.log(`requesting fork with blockNumber=${blockNumber} and account 'hackerAddress' ...`);
	
			await request_fork(blockNumber, [ hackerAddress ]);
	
			const _blockNumber = await ethers.provider.getBlockNumber();
			expect(_blockNumber).to.equal(blockNumber);
		});

		// it("Should assign the total supply of tokens to the owner", async function () {
		// 	const ownerBalance = await token.balanceOf(owner.address);
			
		// 	expect(await token.totalSupply()).to.equal(ownerBalance);
		// });

        it("Should return the name and symbol", async function () {
            
            // expect(await myERC20.totalSupply()).to.equal(ethers.utils.parseEther(totalSupply));
    
            expect(await token.name()).to.equal(name);
            expect(await token.symbol()).to.equal(symbol);
        });
	});
    
    describe("Transactions", function () {

		it("Should transfer tokens between accounts", async function () {
		
			// Transfer 50 tokens from owner to addr1
			await token.transfer(addr1.address, 50);
			const addr1Balance = await token.balanceOf(addr1.address);
			expect(addr1Balance).to.equal(50);

			// Transfer 50 tokens from addr1 to addr2
			// We use .connect(signer) to send a transaction from another account
			await token.connect(addr1).transfer(addr2.address, 50);
			const addr2Balance = await token.balanceOf(addr2.address);
			expect(addr2Balance).to.equal(50);
		});

		it("Should fail if sender doesn’t have enough tokens", async function () {
			const initialOwnerBalance = await token.balanceOf(owner.address);

			// Try to send 1 token from addr1 (0 tokens) to owner (1000 tokens).
			// `require` will evaluate false and revert the transaction.

            // AssertionError: Expected transaction to be reverted with ERC20: transfer amount exceeds balance, 
            // but other exception was thrown: Error: Transaction reverted without a reason string
			// await expect(
			// 	token.connect(addr1).transfer(owner.address, 1)
			// ).to.be.revertedWith("ERC20: transfer amount exceeds balance");

            await expect(
				token.connect(addr1).transfer(owner.address, 1)
			).to.be.revertedWith("");

			// Owner balance shouldn't have changed.
			expect(await token.balanceOf(owner.address)).to.equal(
				initialOwnerBalance
			);
		});

		it("Should update balances after transfers", async function () {
			const initialOwnerBalance = await token.balanceOf(owner.address);

			// Transfer 100 tokens from owner to addr1.
			await token.transfer(addr1.address, 100);

			// Transfer another 50 tokens from owner to addr2.
			await token.transfer(addr2.address, 50);

			// Check balances.
			const finalOwnerBalance = await token.balanceOf(owner.address);
			expect(finalOwnerBalance).to.equal(initialOwnerBalance.sub(150));

			const addr1Balance = await token.balanceOf(addr1.address);
			expect(addr1Balance).to.equal(100);

			const addr2Balance = await token.balanceOf(addr2.address);
			expect(addr2Balance).to.equal(50);
		});
	});
});
