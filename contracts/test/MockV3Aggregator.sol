// to populate this we can copy-paste an existing contract and modify it  (for example from the chainlink github repo)
// OR we can get an already existing mock created by somebody (can also find this in the chainlink github repo, under src/v0.6/tests/MockV3Aggregator.sol)
// we go with the second solution by importing an already existing mock from chainlink

pragma solidity ^0.6.0;

import "@chainlink/contracts/src/v0.6/tests/MockV3Aggregator.sol";
