const { assert } = require("chai");
const { getNamedAccounts, ethers, network } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

// we only allow describe if we are on a testnet
// staging tests require you deploy the contracts manually first (yarn hardhat deploy --network <preferred_testnet>)
// staging tests are run with: yarn hardhat test --network <preferred_testnet> (the one you deployed to)
developmentChains.includes(network.name)
	? describe.skip
	: describe("FundMe", async function () {
			let fundMe;
			let deployer;
			const sendValue = ethers.utils.parseEther("0.1");
			beforeEach(async function () {
				// we don't deploy the contract because in the staging phase, we are assuming that it is already deployed; also, we don't use mocks because we are assuming we are on a testnet
				deployer = (await getNamedAccounts()).deployer;
				fundMe = await ethers.getContract("FundMe", deployer);
			});
			it("allows people to fund and withdraw", async function () {
				await fundMe.fund({ value: sendValue });
				await fundMe.withdraw();
				const endingBalance = await fundMe.provider.getBalance(
					fundMe.address
				);
				assert.equal(endingBalance.toString(), "0");
			});
	  });
