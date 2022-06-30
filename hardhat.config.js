require("dotenv").config();

require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
require("hardhat-gas-reporter");
require("solidity-coverage");
require("hardhat-deploy");

const RINKEBY_RPC_URL = process.env.RINKEBY_RPC_URL || "";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0xkey";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "key";
const LOCALHOST_RPC_URL = process.env.LOCALHOST_RPC_URL || "";
const CMC_API_KEY = process.env.CMC_API_KEY || "key";

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
	//solidity: "0.8.8",
	solidity: {
		compilers: [{ version: "0.8.8" }, { version: "0.6.6" }],
	},
	defaultNetwork: "hardhat",
	networks: {
		rinkeby: {
			url: RINKEBY_RPC_URL,
			accounts: [PRIVATE_KEY],
			chainId: 4,
			blockConfirmations: 6,
		},
		localhost: {
			url: LOCALHOST_RPC_URL,
			// accounts: [],  // not needed, as the localhost will give us 10 accounts by default
			chainId: 31337,
		},
	},
	gasReporter: {
		enabled: true,
		outputFile: "gas-report.txt",
		noColors: true,
		currency: "USD",
		// coinmarketcap: CMC_API_KEY,
		token: "BNB",
	},
	etherscan: {
		apiKey: ETHERSCAN_API_KEY,
	},
	// here we declare namedAccounts that we will retrieve in the deploy scripts using getNamedAccounts
	namedAccounts: {
		deployer: {
			// grabs the nth account from the named network (by network name or chainId); CAREFUL: you need to have multiple accounts to go over 0!
			// if you put 4: 1 and rinkeby only has one account, it will throw an error; for example, for 31337 we need to have 3 accounts defined for it to work (running yarn hardhat node will give us 20 accounts to work with)
			// 4: ... and rinkeby: ... are similar because 4 is the chain id of rinkeby (as declared in networks)
			default: 0,
			rinkeby: 0,
			31337: 2,
		},
		user: {
			default: 1,
		},
	},
};
