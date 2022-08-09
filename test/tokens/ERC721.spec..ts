// @ts-nocheck
import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import { ERC721 } from "../../typechain-types";

describe("ERC721 Token (vyper)", function () {

    let token: ERC721;
	let owner: SignerWithAddress;
	let addr1: SignerWithAddress;
	let addr2: SignerWithAddress
	let addrs: SignerWithAddress[];

    const name = "Tsadok"
    const symbol = "TLF"
    const decimals = 18

	beforeEach(async function () {

		[ owner, addr1, addr2, ...addrs] = await ethers.getSigners();

        const ERC721 = await ethers.getContractFactory("ERC721");
        const totalSupply = (10 ** 9).toString()

        token = await ERC721.deploy();

        await token.deployed();

	});


	describe("Deployment", function () {

		// it("Should assign the total supply of tokens to the owner", async function () {
		// 	const ownerBalance = await token.balanceOf(owner.address);
			
		// 	expect(await token.totalSupply()).to.equal(ownerBalance);
		// });

        it("Should mint and transfer tokens", async function () {

			let tokenId;
                
			tokenId = 0;
			await token.mint(addr1.address, tokenId);
            expect(await token.balanceOf(addr1.address)).to.equal(1);

			tokenId = 1;
			await token.mint(addr2.address, tokenId);
            expect(await token.balanceOf(addr2.address)).to.equal(1);

			tokenId = 2;
			await token.mint(addr2.address, tokenId);
            expect(await token.balanceOf(addr2.address)).to.equal(2);

			expect(await token.ownerOf(tokenId)).to.equal(addr2.address);

			tokenId = 0;
			await token.connect(addr1).approve(addr2.address, tokenId);

			await token.connect(addr1).transferFrom(addr1.address, addr2.address, tokenId);
			expect(await token.balanceOf(addr2.address)).to.equal(3);


        });
	});
    

    // describe("Transactions", function () {

	// 	it("Should transfer tokens between accounts", async function () {
		
	// 		// Transfer 50 tokens from owner to addr1
	// 		await token.transfer(addr1.address, 50);
	// 		const addr1Balance = await token.balanceOf(addr1.address);
	// 		expect(addr1Balance).to.equal(50);

	// 		// Transfer 50 tokens from addr1 to addr2
	// 		// We use .connect(signer) to send a transaction from another account
	// 		await token.connect(addr1).transfer(addr2.address, 50);
	// 		const addr2Balance = await token.balanceOf(addr2.address);
	// 		expect(addr2Balance).to.equal(50);
	// 	});

	// 	it("Should fail if sender doesn’t have enough tokens", async function () {
	// 		const initialOwnerBalance = await token.balanceOf(owner.address);

	// 		// Try to send 1 token from addr1 (0 tokens) to owner (1000 tokens).
	// 		// `require` will evaluate false and revert the transaction.

    //         // AssertionError: Expected transaction to be reverted with ERC20: transfer amount exceeds balance, 
    //         // but other exception was thrown: Error: Transaction reverted without a reason string
	// 		// await expect(
	// 		// 	token.connect(addr1).transfer(owner.address, 1)
	// 		// ).to.be.revertedWith("ERC20: transfer amount exceeds balance");

    //         await expect(
	// 			token.connect(addr1).transfer(owner.address, 1)
	// 		).to.be.revertedWith("");

	// 		// Owner balance shouldn't have changed.
	// 		expect(await token.balanceOf(owner.address)).to.equal(
	// 			initialOwnerBalance
	// 		);
	// 	});

	// 	it("Should update balances after transfers", async function () {
	// 		const initialOwnerBalance = await token.balanceOf(owner.address);

	// 		// Transfer 100 tokens from owner to addr1.
	// 		await token.transfer(addr1.address, 100);

	// 		// Transfer another 50 tokens from owner to addr2.
	// 		await token.transfer(addr2.address, 50);

	// 		// Check balances.
	// 		const finalOwnerBalance = await token.balanceOf(owner.address);
	// 		expect(finalOwnerBalance).to.equal(initialOwnerBalance.sub(150));

	// 		const addr1Balance = await token.balanceOf(addr1.address);
	// 		expect(addr1Balance).to.equal(100);

	// 		const addr2Balance = await token.balanceOf(addr2.address);
	// 		expect(addr2Balance).to.equal(50);
	// 	});
	// });
});
