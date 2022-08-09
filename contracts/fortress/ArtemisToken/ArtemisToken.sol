// SPDX-License-Identifier: MIT

// pragma solidity >=0.8.0;
pragma solidity >=0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ArtemisToken is ERC20 {

	modifier onlyOwner() {
    	require(msg.sender == admin, "not owner");
        _;
    }

	address public admin;

  	constructor(string memory name, string memory symbol) ERC20(name, symbol) {
    	admin = msg.sender;
  	}

  	function updateAdmin(address newAdmin) external onlyOwner {
    	// require(msg.sender == admin, 'only admin');
    	admin = newAdmin;
  	}

  	function mint(address to, uint amount) external onlyOwner {
    	// require(msg.sender == admin, 'only admin');
    	_mint(to, amount);
  	}

  	function burn(address owner, uint amount) external onlyOwner {
    	// require(msg.sender == admin, 'only admin');
    	_burn(owner, amount);
  	}
}