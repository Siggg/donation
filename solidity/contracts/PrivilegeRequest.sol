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
import "./Privilege.sol";
import "./Donation.sol";

contract PrivilegeRequest {
	using SafeMath for uint256;

	// address of the donation contract
  Donation public donation;
	// storage of beneficiaries addresses
  mapping (address => bool) requests;

  // constructor
  constructor(address _donation) public {
    donation = Donation(_donation);
  }

		// Allows to give wei to this contract via fallback function
	function () payable {
		// check if the msg.sender has already made a request or not
		require(!requests[msg.sender]);
		// instanciate a privilege contract
		Privilege privilege = new Privilege(donation, this);
		// add the msg.sender to the requests list
		requests[msg.sender] = true;
		donation.registerBeneficiary(privilege, msg.sender);
		// retransfer the rest of the amount sent to the msg.sender, via his privilege contract
		privilege.retransfer.value(msg.value)(address(this).balance, msg.sender);
	}

}
