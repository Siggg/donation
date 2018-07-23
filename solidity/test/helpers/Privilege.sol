/*
Copyright 2017, 2018 Conseil départemental des Hauts-de-Seine

This file is part of Donation.

Donation is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Donation is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

pragma solidity ^0.4.24;

import "./SafeMath.sol";
import "./Donation.sol";

contract Privilege {
	using SafeMath for uint256;

  Donation public donation;
  address public privilegeRequest;

  // Modifier restricting execution of a function to PrivilegeRequest
	modifier onlyPrivilegeRequest {
    require(msg.sender == privilegeRequest);
	  _;
	}

  // constructor
  constructor(address _donation, address _privilegeRequest) public {
    donation = Donation(_donation);
    privilegeRequest = _privilegeRequest;
  }

		// Allows to give wei to this contract via fallback function
	function () public payable {
				if(msg.sender != privilegeRequest){
						don(msg.value);
				}
	}

	// transfer funds to the donation contract and update privileges
	function don(uint256 _value) internal {
		// make a transfer to the donation contract
		donation.transfer(_value);
		// update privileges
		donation.updatePrivileges(_value.div(1 ether));
	}

	// retransfer ether to the msg.sender, when creating the contract
	function retransfer(uint256 _value, address _to) onlyPrivilegeRequest payable {
		_to.transfer(_value);
	}
}
