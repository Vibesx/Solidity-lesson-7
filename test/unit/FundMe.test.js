const { assert, expect } = require("chai");
const { deployments, ethers, getNamedAccounts } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

// we only allow describe if we are on development chains
!developmentChains.includes(network.name)
	? describe.skip
	: describe("FundMe", async function () {
			let fundMe;
			let deployer;
			let mockV3Aggregator;
			// this is equivalent to 1e18 wei (1 * 10^18):
			//const sendValue = "1000000000000000000"
			// can check docs for parseUnits as well for more options
			const sendValue = ethers.utils.parseEther("1");
			beforeEach(async function () {
				deployer = (await getNamedAccounts()).deployer;
				// another way to get accounts from hardhat:
				//const accounts = await ethers.getSigners();

				// deployments.fixture([..tags]) lets us run whole deploy folder with as many tags as we want
				await deployments.fixture(["all"]);
				// ethers.getContract(<contract_name>, <deployer_account>) gets the latest deployed <contract_name> contract
				fundMe = await ethers.getContract("FundMe", deployer);
				mockV3Aggregator = await ethers.getContract(
					"MockV3Aggregator",
					deployer
				);
			});
			describe("constructor", async function () {
				it("Sets the aggregator addresses correctly", async function () {
					const response = await fundMe.getPriceFeed();
					assert.equal(response, mockV3Aggregator.address);
				});
			});
			describe("fund", async function () {
				it("Fails if you dont send enough ETH", async function () {
					// way to check if a require fails and the transaction is reverted
					// can use .to.be.reverted() or can be more specific with .to.be.reveertedWith("error_message") to check for the error message as well (in cases of require(<condition>, <error_message>))
					await expect(fundMe.fund()).to.be.revertedWith(
						"Didn't send enough!"
					);
				});
				it("Updates the amount funded data structure", async function () {
					await fundMe.fund({ value: sendValue });
					const response = await fundMe.getAddressToAmountFunded(
						deployer
					);
					assert.equal(response.toString(), sendValue.toString());
				});
				it("Adds funder to array of getFunder", async function () {
					await fundMe.fund({ value: sendValue });
					const funder = await fundMe.getFunder(0);
					assert.equal(funder, deployer);
				});
			});
			describe("withdraw", async function () {
				// first fund account with eth to be able to withdraw
				beforeEach(async function () {
					await fundMe.fund({ value: sendValue });
				});
				// Arrange Act Assert are steps in a test; like Java had when do expect or whatever
				it("Withdraw ETH from a single founder", async function () {
					// Arrange
					const startingFundMeBalance =
						await fundMe.provider.getBalance(fundMe.address);
					const startingDeployerBalance =
						await fundMe.provider.getBalance(deployer);
					// Act
					const transactionResponse = await fundMe.withdraw();
					const transactionReceipt = await transactionResponse.wait(
						1
					);

					// fancier way of doing this: const { gasUsed, effectiveGasPrice } = transactionReceipt; const gasCost = gasUsed.mul(effectiveGasPrice)
					// just trying to get used to this syntax sugar :P
					const gasCost = transactionReceipt.gasUsed.mul(
						transactionReceipt.effectiveGasPrice
					);
					const endingFundMeBalance =
						await fundMe.provider.getBalance(fundMe.address);
					const endingDeployerBalance =
						await fundMe.provider.getBalance(deployer);

					// Assert
					assert.equal(endingFundMeBalance, 0);
					assert.equal(
						// because returned numbers from the blockchain are of type BigNumber, we should use .add instead of + ; this stands true for the rest of the operations as well
						startingFundMeBalance
							.add(startingDeployerBalance)
							.toString(),
						// because the transaction costs gas, we need to take that into account when doing the assert
						endingDeployerBalance.add(gasCost).toString()
					);
				});
				it("Allows us to withdraw with multiple getFunder", async function () {
					// Arrange
					const accounts = await ethers.getSigners();
					// start from 1 because 0 is the deployer; 6 is just random, put whatever
					for (let i = 1; i < 6; i++) {
						// the fundMe const is connected to the deployer account, so we need to connect each other account to their own separate contract
						const fundMeConnectedContract = await fundMe.connect(
							accounts[i]
						);
						await fundMeConnectedContract.fund({
							value: sendValue,
						});
					}
					const startingFundMeBalance =
						await fundMe.provider.getBalance(fundMe.address);
					const startingDeployerBalance =
						await fundMe.provider.getBalance(deployer);
					// Act
					const transactionResponse = await fundMe.withdraw();
					const transactionReceipt = await transactionResponse.wait(
						1
					);
					const { gasUsed, effectiveGasPrice } = transactionReceipt;
					const gasCost = gasUsed.mul(effectiveGasPrice);
					const endingFundMeBalance =
						await fundMe.provider.getBalance(fundMe.address);
					const endingDeployerBalance =
						await fundMe.provider.getBalance(deployer);
					// Assert
					assert.equal(endingFundMeBalance, 0);
					assert.equal(
						startingFundMeBalance
							.add(startingDeployerBalance)
							.toString(),
						endingDeployerBalance.add(gasCost).toString()
					);

					// Make sure that the getFunder are reset properly
					await expect(fundMe.getFunder(0)).to.be.reverted;

					for (i = 1; i < 6; i++) {
						assert.equal(
							await fundMe.getAddressToAmountFunded(
								accounts[i].address
							),
							0
						);
					}
				});

				it("Allows us to withdraw with multiple getFunder", async function () {
					// Arrange
					const accounts = await ethers.getSigners();
					// start from 1 because 0 is the deployer; 6 is just random, put whatever
					for (let i = 1; i < 6; i++) {
						// the fundMe const is connected to the deployer account, so we need to connect each other account to their own separate contract
						const fundMeConnectedContract = await fundMe.connect(
							accounts[i]
						);
						await fundMeConnectedContract.fund({
							value: sendValue,
						});
					}
					const startingFundMeBalance =
						await fundMe.provider.getBalance(fundMe.address);
					const startingDeployerBalance =
						await fundMe.provider.getBalance(deployer);
					// Act
					const transactionResponse = await fundMe.withdraw();
					const transactionReceipt = await transactionResponse.wait(
						1
					);
					const { gasUsed, effectiveGasPrice } = transactionReceipt;
					const gasCost = gasUsed.mul(effectiveGasPrice);
					const endingFundMeBalance =
						await fundMe.provider.getBalance(fundMe.address);
					const endingDeployerBalance =
						await fundMe.provider.getBalance(deployer);
					// Assert
					assert.equal(endingFundMeBalance, 0);
					assert.equal(
						startingFundMeBalance
							.add(startingDeployerBalance)
							.toString(),
						endingDeployerBalance.add(gasCost).toString()
					);

					// Make sure that the getFunder are reset properly
					await expect(fundMe.getFunder(0)).to.be.reverted;

					for (i = 1; i < 6; i++) {
						assert.equal(
							await fundMe.getAddressToAmountFunded(
								accounts[i].address
							),
							0
						);
					}
				});

				it("Only allows the owner to withdraw", async function () {
					const accounts = await ethers.getSigners();
					const attacker = accounts[1];
					const attackerConnectedContract = await fundMe.connect(
						attacker
					);
					await expect(
						attackerConnectedContract.withdraw()
					).to.be.revertedWith("FundMe__NotOwner");
				});

				it("Cheaper Withdraw testing", async function () {
					// Arrange
					const accounts = await ethers.getSigners();
					// start from 1 because 0 is the deployer; 6 is just random, put whatever
					for (let i = 1; i < 6; i++) {
						// the fundMe const is connected to the deployer account, so we need to connect each other account to their own separate contract
						const fundMeConnectedContract = await fundMe.connect(
							accounts[i]
						);
						await fundMeConnectedContract.fund({
							value: sendValue,
						});
					}
					const startingFundMeBalance =
						await fundMe.provider.getBalance(fundMe.address);
					const startingDeployerBalance =
						await fundMe.provider.getBalance(deployer);
					// Act
					const transactionResponse = await fundMe.cheaperWithdraw();
					const transactionReceipt = await transactionResponse.wait(
						1
					);
					const { gasUsed, effectiveGasPrice } = transactionReceipt;
					const gasCost = gasUsed.mul(effectiveGasPrice);
					const endingFundMeBalance =
						await fundMe.provider.getBalance(fundMe.address);
					const endingDeployerBalance =
						await fundMe.provider.getBalance(deployer);
					// Assert
					assert.equal(endingFundMeBalance, 0);
					assert.equal(
						startingFundMeBalance
							.add(startingDeployerBalance)
							.toString(),
						endingDeployerBalance.add(gasCost).toString()
					);

					// Make sure that the getFunder are reset properly
					await expect(fundMe.getFunder(0)).to.be.reverted;

					for (i = 1; i < 6; i++) {
						assert.equal(
							await fundMe.getAddressToAmountFunded(
								accounts[i].address
							),
							0
						);
					}
				});
			});
	  });
