// SPDX-License-Identifier: MIT

pragma solidity ^0.8.8;

contract MockCurveGaugeV1V2V3 {
  function claim(address _target) external {
    MockCurveGaugeV1V2V3(_target).claim();
  }

  function claim() external {}
}
