// SPDX-License-Identifier: MIT

pragma solidity ^0.8.8;

// solhint-disable func-name-mixedcase
interface ICVXMining {
  function ConvertCrvToCvx(uint256 _amount) external view returns (uint256);
}
