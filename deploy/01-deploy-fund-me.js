// hre is the Hardhat Runtime Env

// this is the named function method
/* function deployFunc(hre) {
	console.log("Hi!");
}

module.exports.default = deployFunc; */

// anon function method:
/* module.exports = async (hre) => {
	// here we are getting the methods we need from hre
	// as an example, in the previous lesson, in deploy.js, we did: const { ethers, run, network } = require("hardhat"); the equivalent here would be const ethers = hre.ethers and so on for each of the 3
	// this is equivalent to doing const getNamedAccounts = hre.getNamedAccounts; const deployments = hre.deployments
	const { getNamedAccounts, deployments } = hre;
}; */

// a more fancy way of doing this is using something called "syntactic sugar"
// instead of doing it in 2 lines like above, we can extrapolate the {} part and put it as a parameter; that way when the function receives an hre as a parameter, it will take only the bits within the {} from the hre

// using syntactic sugar here as well, as what the following import actually translates to is:
//const helperConfig = require("../helper-hardhat-config");
//const networkConfig = helperConfig.networkConfig;
// so we are basically just extracting one particular exported element from the script
const {
	networkConfig,
	developmentChains,
} = require("../helper-hardhat-config");
const { network } = require("hardhat");
const { logSeparator } = require("../utils/log-util");
const { verify } = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments }) => {
	const { deploy, log } = deployments;
	const { deployer } = await getNamedAccounts();
	const chainId = network.config.chainId;

	let ethUsdPriceFeedAddress;
	if (developmentChains.includes(network.name)) {
		// gets the latest deployment of contract in parameters (MockV3Aggregator in this case)
		// as a side note, we can do:
		// const { deploy, log, get } = deployments;  // basically add get to the const at the beginning of this function
		// const ethUsdAggregator = await get("MockV3Aggregator");
		const ethUsdAggregator = await deployments.get("MockV3Aggregator");
		ethUsdPriceFeedAddress = ethUsdAggregator.address;
	} else {
		ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
	}
	const args = [ethUsdPriceFeedAddress];

	const fundMe = await deploy("FundMe", {
		from: deployer,
		args: args, // price feed address
		log: true,
		waitConfirmations: network.config.blockConfirmations || 1,
	});

	if (
		!developmentChains.includes(network.name) &&
		process.env.ETHERSCAN_API_KEY
	) {
		await verify(fundMe.address, args);
	}
	logSeparator();
};

module.exports.tags = ["all", "fundme"];
