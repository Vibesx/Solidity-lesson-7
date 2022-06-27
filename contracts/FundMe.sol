// Get funds from users
// Withdraw funds
// Set a minimum funding value in USD

//SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "./PriceConverter.sol";

error NotOwner();

contract FundMe {
	using PriceConverter for uint256;

	// constants cannot be modified (like Java) and also do not cost gas; naming convention is all caps (again like Java)
	// constants don't take up a storage spot
	uint256 public constant MINIMUM_USD = 50 * 1e18;

	address[] public funders;
	mapping(address => uint256) public addressToAmountFunded;

	// immutable is similar to constant, but it doesn't require the property to be populate in the same line (ex: can be populated in a constructor or function);
	// once it is populated, though, it cannot be changed
	// naming convention is i_<name>
	address public immutable i_owner;

	constructor() {
		i_owner = msg.sender;
	}

	function fund() public payable {
		// require can take a second argument that is an error message that is sent in case of failure
		require(
			msg.value.getConversionRate() >= MINIMUM_USD,
			"Didn't send enough!"
		); //1e18 == 1*10 ** 18; msg.value is in wei and 1 ether = 1 * 10^18 wei
		funders.push(msg.sender);
		addressToAmountFunded[msg.sender] = msg.value;
	}

	function withdraw() public onlyOwner {
		// reset the mapping
		for (
			uint256 funderIndex = 0;
			funderIndex < funders.length;
			funderIndex = funderIndex + 1
		) {
			address funder = funders[funderIndex];
			addressToAmountFunded[funder] = 0;
		}
		// reset the array to a new address array with (0) elements in it. (1) would mean 1 elements, (2) would mean 2 elements, etc; basically <type>[](0) is an empty array of <type>
		funders = new address[](0);
		// actually withdraw the funds
		// 3 ways to send funds: transfer, send and call
		// transfer - we need to cast msg.sender to a payable address; msg.sender is an address, while payable(msg.sender) becomes a payable address through casting
		// address(this).balance takes the whole balance of the contract; transfer can take any uint256(? I guess) values

		//payable(msg.sender).transfer(address(this).balance));

		// both transfer and send cost 2300 gas; the problem with transfer, though is that it throws an error if the gas limit is exceeded, while send returns a boolean whether it succeeded or not
		// send - returns a bool with success status and it is adviseable to store it in a bool and follow up with a require for it to be true, so that the transaction is reverted in case of failure

		//bool sendSuccess = payable(msg.sender).send(address(this).balance);
		//require(sendSuccess, "Send failed!");

		// call - allows us to call methods by their name
		// in the next example, we treat the call as a transaction by leaving the parameters blank and hardcoding the details (val ue)
		// call returns two values: a bool that stores whether the call was successfull or not and a bytes variable that stores the returned data
		// in our case, we don't need dataReturned as we aren't calling an actual function
		// as with send, we should check the success of the call with a require
		(
			bool callSuccess, /*bytes memory dataReturned*/

		) = payable(msg.sender).call{value: address(this).balance}("");
		require(callSuccess, "Call failed!");

		// currently, call is the prefered way of withdrawing tokens
	}

	// _; is a placeholder for "run the rest of the code"; it can be before or after the require, or inbetween two requires; basically <operations...>; _; <otherOperations...> means that
	// the first operations will be executed, then the code in the method, the otherOperations
	modifier onlyOwner() {
		//require(msg.sender == i_owner, "Sender is not owner!");

		// this is similar to the require, but it uses a custom error (NotOwner) so it costs less gas (the string in the require takes up a lot of space)
		// revert does the same thing as require does in case of failure; it can be used in any cases to revert the transaction
		if (msg.sender != i_owner) {
			revert NotOwner();
		}
		_;
	}

	receive() external payable {
		fund();
	}

	fallback() external payable {
		fund();
	}
}
