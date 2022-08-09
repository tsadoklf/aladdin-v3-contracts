// SPDX-License-Identifier: MIT

pragma solidity ^0.8.8;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockERC20 is ERC20 {

    uint8 m_decimals;

    constructor(string memory _name, string memory _symbol, uint8 _decimals) ERC20(_name, _symbol) {
        // _setupDecimals(_decimals);
        m_decimals = _decimals;
    }

    function mint(address _recipient, uint256 _amount) external {
        _mint(_recipient, _amount);
    }

    function decimals() public view virtual override returns (uint8) {
        return m_decimals;
    }
}
