//SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

// npm way of importing; @chainlink/contracts/etc... is actually a path inside a git repository
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

// Libraries are similar to contracts, but you can't declare any state variable and you can't send ether.
// if a method inside a library has a parameter, when you call it like foo.method(), foo is considered the first parameter;
// if it has multiple parameters, you need to declare them from 2nd one onward (ex: 1stParam.method(2ndParam, 3rdParam, etc)
library PriceConverter {
	function getPrice() internal view returns (uint256) {
		// ABI
		// Address 0x8A753747A1Fa494EC906cE90E9f37563A8AF630e
		AggregatorV3Interface priceFeed = AggregatorV3Interface(
			0x8A753747A1Fa494EC906cE90E9f37563A8AF630e
		);
		(, int256 price, , , ) = priceFeed.latestRoundData();
		return uint256(price * 1e10); // price already has 8 extra numbers after it, representing decimals (AggregatorV3Interface.getDecimals() returns this value of 8).
		// This means we need to add 10 more 0's to match the 18 extra digits required for a WEI (hence why we multiply by 1e10)
	}

	function getVersion() internal view returns (uint256) {
		AggregatorV3Interface priceFeed = AggregatorV3Interface(
			0x8A753747A1Fa494EC906cE90E9f37563A8AF630e
		);
		return priceFeed.version();
	}

	function getConversionRate(uint256 ethAmount)
		internal
		view
		returns (uint256)
	{
		uint256 ethPrice = getPrice();
		uint256 ethAmountInUsd = (ethPrice * ethAmount) / 1e18;
		return ethAmountInUsd;
	}
}
