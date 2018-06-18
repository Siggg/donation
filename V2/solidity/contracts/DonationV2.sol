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

contract DonationV2 {
	using SafeMath for uint256;

	// address owning the contract
	address superAdmin;

	// address of the certifier
	address certifier;

	// counter of number of beneficiaries
	uint beneficiaryCount;
	uint beneficiaryCountMax;
	// storage of beneficiaries
	mapping (uint => address) beneficiaryPositions;

	struct BeneficiaryData {
		bool active;
	}
	mapping (address => BeneficiaryData) beneficiaries;

	// Events
	event evtSendFailed(address benef, uint amount);
	event evtSendSuccess(address benef, uint amount);
	event evtSpread(uint amount, uint nbBenef);

	// constructor
	constructor (address _certifier) public {
		superAdmin = msg.sender;
		certifier = _certifier;
		beneficiaryCount = 0;
		beneficiaryCountMax = 0;
	}

	// Allows to give wei to this contract via fallback function
	function () public payable {
	}

        /*
  	Transfer contract ownership to a new address
  	param _newAdmin address of the new super admin
  	*/
	function transferAdminRights(address _newAdmin) public onlySuperAdmin {
		superAdmin = _newAdmin;
	}
        /*
        Transfer contract certifier role to a new address
        param _newCertifier address of the new certifier
        */
        function transferCertifierRights(address _newCertifier) public onlySuperAdmin {
                certifier = _newCertifier;
        }
	// Modifier restricting execution of a function to SuperAdmin
	modifier onlySuperAdmin {
		require(msg.sender == superAdmin);
	  _;
	}

    /*
    Kills the contract (Action reserved to super admin)
    */
    function kill() public onlySuperAdmin {
        selfdestruct(this);
    }

	// Modifier restricting execution of a function to Certifier
	modifier onlyCertifier {
		require(msg.sender == certifier);
	  _;
	}

	// Before adding a new beneficiary, the contrat spread its balance among existing beneficiaries
	function registerBeneficiary(address _beneficiary) public onlyCertifier {
		if (beneficiaries[_beneficiary].active == false) {
			// create new beneficiary
			beneficiaries[_beneficiary] = BeneficiaryData(true);
			beneficiaryPositions[beneficiaryCountMax] = _beneficiary;
			beneficiaryCount.add(1);
			beneficiaryCountMax.add(1);
		}
		else if (beneficiaries[_beneficiary].active == true) {
			// reactivate existing beneficiary
			beneficiaryCount.add(1);
		}
	}

	// Before removing an existing beneficiary, the contrat spread its balance among existing beneficiaries
	function unregisterBeneficiary(address _beneficiary) public onlyCertifier {
		if (beneficiaries[_beneficiary].active) {
			beneficiaries[_beneficiary].active = false;
			beneficiaryCount.sub(1);
		}
	}

	function getBeneficiaryCount() public view returns (uint) {
		return beneficiaryCount;
	}

	// Paginate search of beneficiaries that has been registered at least once
	// starting from startIndex and returns 100 max beneficiaries.
	function getPaginateBeneficiaries(uint startIndex, uint size) public view returns (address[100]) {
		address[100] memory res;
		if (size > 100)
			size = 100;
		if (startIndex >= beneficiaryCountMax) {
			return res;
		}
		if (startIndex.add(size) > beneficiaryCountMax) {
			size = beneficiaryCountMax.sub(startIndex);
		}
		for (uint i = 0; i < size; i++) {
			address benef = beneficiaryPositions[startIndex.add(i)];
			res[i] = benef;
		}
		return res;
	}

	// Paginate search of beneficiaries that has been registered at least once
	// starting from startIndex and returns 100 max beneficiaries.
	function getPaginateActiveBeneficiaries(uint startIndex, uint size) public view returns (address[100]) {
		address[100] memory res;
		uint counter = 0;
		if (size > 100)
			size = 100;
		if (startIndex >= beneficiaryCountMax) {
			return res;
		}
		if (startIndex.add(size) > beneficiaryCountMax) {
			size = beneficiaryCountMax.sub(startIndex);
		}
		for (uint i = 0; i < size; i++) {
			address benef = beneficiaryPositions[startIndex.add(i)];
			if (beneficiaries[benef].active) {
				res[counter] = benef;
				counter.add(1);
			}
		}
		return res;
	}

	// Spread balance among beneficiaries
	function flush() public onlyCertifier {
		require(address(this).balance > 0);
		require(beneficiaryCount > 0);
		uint countBenef = beneficiaryCount;
		uint balance = address(this).balance;
		uint dust = balance % countBenef;
		uint realAmount = balance.sub(dust);

		emit evtSpread(realAmount, countBenef);

		uint part = realAmount.div(countBenef);
		for (uint i = 0; i < beneficiaryCountMax; i++) {
			address benef = beneficiaryPositions[i];
			if (beneficiaries[benef].active) {
				if (!benef.send(part)) {
					emit evtSendFailed(benef, part);
				}
				else {
					emit evtSendSuccess(benef, part);
				}
			}
		}

	}
}
