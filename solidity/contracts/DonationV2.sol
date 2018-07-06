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
		bool isSet;
		bool active;
		bool paid;
	}
	mapping (address => BeneficiaryData) beneficiaries;

	// Events
	event evtSendFailed(address benef, uint amount);
	event evtSendSuccess(address benef, uint amount);
	event evtSpread(uint amount, uint nbBenef);

	// constructor
	constructor(address _certifier) public {
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

	// Modifier restricting execution of a function to Certifier
	modifier onlyCertifier {
	    require(msg.sender == certifier);
	    _;
	}

	// Before adding a new beneficiary, the contrat spread its balance among existing beneficiaries
	function registerBeneficiary(address _beneficiary) public onlyCertifier {
		if (beneficiaries[_beneficiary].isSet == false) {
			// create new beneficiary
			beneficiaries[_beneficiary] = BeneficiaryData(true, true, false);
			beneficiaryPositions[beneficiaryCountMax] = _beneficiary;
			beneficiaryCount++;
			beneficiaryCountMax++;
		}
		else if (beneficiaries[_beneficiary].active == false) {
			// reactivate existing beneficiary
			beneficiaries[_beneficiary].active = true;
			beneficiaries[_beneficiary].paid = false;
			beneficiaryCount++;
		}
	}

	// Before removing an existing beneficiary, the contrat spread its balance among existing beneficiaries
	function unregisterBeneficiary(address _beneficiary) public onlyCertifier {
		require(beneficiaries[_beneficiary].isSet == true);
		beneficiaries[_beneficiary].active = false;
		beneficiaries[_beneficiary].paid = false;
		beneficiaryCount--;
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
		if (startIndex + size > beneficiaryCountMax) {
			size = beneficiaryCountMax - startIndex;
		}
		for (uint i = 0; i < size; i++) {
			address benef = beneficiaryPositions[startIndex+i];
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
		if (startIndex + size > beneficiaryCountMax) {
			size = beneficiaryCountMax - startIndex;
		}
		for (uint i = 0; i < size; i++) {
			address benef = beneficiaryPositions[startIndex+i];
			if (beneficiaries[benef].active) {
				res[counter] = benef;
				counter++;
			}
		}
		return res;
	}


function distribute(uint256 _value) public onlyCertifier {
	require(address(this).balance >= _value);
	require(beneficiaryCount > 0);

	uint balance = address(this).balance;
	uint nbBenef = balance.div(_value);
	uint counter = 0;

	// parcours de la liste des beneficiaires
	for(uint i = 0; i < beneficiaryCountMax; i++){
		// check si le nombre exacte des bénéficiaires à payer est atteint
		if(counter != nbBenef && counter < nbBenef){
			address benef = beneficiaryPositions[i];
			// Si le bénéficiaire est payé ou le bénéficiaire n'est pas actif, on passe au suivant
			if(beneficiaries[benef].paid == true || beneficiaries[benef].active == false){
				i++;
			}
			else{
				// on paye le bénéficiaire
				benef.transfer(_value);
				emit evtSendSuccess(benef, _value);
				counter ++;
				beneficiaries[benef].paid = true;
				if(i == beneficiaryCountMax.sub(1) && counter < nbBenef){
					resetPayment();
				}
			}
		}
		else{
			// les bénéficiaires sont payés, on force la sortie de la boucle
			i = beneficiaryCountMax;
		}
	}
}

function resetPayment() internal{
	for(uint i = 0; i < beneficiaryCountMax; i++){
		address benef = beneficiaryPositions[i];
		beneficiaries[benef].paid = false;
	}
}
}
