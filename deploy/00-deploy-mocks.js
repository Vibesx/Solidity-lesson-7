const { network } = require("hardhat");
const {
	developmentChains,
	DECIMALS,
	INITIAL_ANSWER,
} = require("../helper-hardhat-config");
const { logSeparator } = require("../utils/log-util");

module.exports = async ({ getNamedAccounts, deployments }) => {
	const { deploy, log } = deployments;
	const { deployer } = await getNamedAccounts();

	if (developmentChains.includes(network.name)) {
		console.log("Local network detected! Deploying mocks...");
		await deploy("MockV3Aggregator", {
			contract: "MockV3Aggregator",
			from: deployer,
			log: true,
			// for this we need to check the constructor of the Mock contract (MockV3Aggregator.sol)
			args: [DECIMALS, INITIAL_ANSWER],
		});
		console.log("Mocks deployed!");
		logSeparator();
	}
};

// this adds a tag to the script so that when we run "yarn hardhat deploy --tags <tag>", only scripts with this <tag> will be deployed;
// ex: scripts A has tags "aa" and "bb", and script B has tags "bb" and "cc". Running "yarn hardhat deploy --tags aa" only deploys script A, while "yarn hardhat deploy --tags bb" runs both
// as a not, "all" will probably be added to other scripts as well, while "mocks" will be added only on mocks (bit confusing, yeah)
module.exports.tags = ["all", "mocks"];
