pragma solidity ^0.4.2;

contract Donation {
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
		bool authorized;
		bool isSet;
	}
	mapping (address => BeneficiaryData) beneficiaries;

	// Events
	event evtDonate(address donator, uint amount);
	event evtSendFailed(address benef, uint amount);

	// constructor
	function Donation(address _certifier) {
		superAdmin = msg.sender;
		certifier = _certifier;
		beneficiaryCount = 0;
		beneficiaryCountMax = 0;
	}

	function () public payable {
		throw;
	}

    /*
  	Transfer contract ownership to a new address
  	param _newAdmin address of the new super admin
  	*/	
	function transferAdminRights(address _newAdmin) onlySuperAdmin {
		superAdmin = _newAdmin;
	}	

	// Modifier restricting execution of a function to SuperAdmin
	modifier onlySuperAdmin {
	    if (msg.sender != superAdmin) throw; 
	    _;
	}

	// Modifier restricting execution of a function to Certifier
	modifier onlyCertifier {
	    if (msg.sender != certifier) throw; 
	    _;
	}

	function registerBeneficiary(address _beneficiary) onlyCertifier {
		if (beneficiaries[_beneficiary].isSet == false) {
			// create new beneficiary
			beneficiaries[_beneficiary] = BeneficiaryData(true, true);
			beneficiaryPositions[beneficiaryCountMax] = _beneficiary;
			beneficiaryCount++;
			beneficiaryCountMax++;
		}
		else if (beneficiaries[_beneficiary].authorized == false) {
			// reactivate existing beneficiary
			beneficiaries[_beneficiary].authorized = true;
			beneficiaryCount++;
		}
	}

	function unregisterBeneficiary(address _beneficiary) onlyCertifier {
		if (beneficiaries[_beneficiary].isSet) {
			if (beneficiaries[_beneficiary].authorized == true) {
				// desactivate beneficiary
				beneficiaries[_beneficiary].authorized = false;
				beneficiaryCount--;
			}
		}
	}

	function getBeneficiaryCount() returns (uint) {
		return beneficiaryCount;
	}

	// Paginate search of beneficiaries that has been registered at least once 
	// starting from startIndex and returns 100 max beneficiaries.
	function getPaginateBeneficiaries(uint startIndex, uint size) returns (address[100]) {
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
	function getPaginateActiveBeneficiaries(uint startIndex, uint size) returns (address[100]) {
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
			if (beneficiaries[benef].authorized) {		
				res[counter] = benef;
				counter++;
			}
		}
		return res;
	}

	// BAD PATTERN (DIRECT TRANSFERT)
	// Donation function that transfers wei amount among beneficiaries (evenly spread, dust of wei are returned to donator)
	// msg.value contains the donation amount in wei
	function donate() public payable {
		if (msg.value <= 0) throw;
		if (beneficiaryCount <= 0) throw;
		if (msg.sender.balance < msg.value) throw;
		uint countBenef = beneficiaryCount;
		uint dust = msg.value % countBenef;
		uint realAmount = msg.value - dust; 

		evtDonate(msg.sender, realAmount);
		address thisContract = this;
		
		if (thisContract.send(realAmount)) {
			if (msg.sender.send(dust)) {

				uint part = realAmount / countBenef;
				for (uint i = 0; i < beneficiaryCountMax; i++) {
					address benef = beneficiaryPositions[i];	
					if (beneficiaries[benef].authorized) {		
						if (!benef.send(part)) {
							evtSendFailed(benef, part);
						}
					}
				}

			}
		}
		
		


		

	}


}