pragma solidity ^0.4.18;

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
		uint pendingReturn;
	}
	mapping (address => BeneficiaryData) beneficiaries;

	// Events
	event evtDonate(address donator, uint amount);
	event evtSendFailed(address benef, uint amount);
	event evtSendSuccess(address benef, uint amount);

	event evtGive(address donator, uint amount);

	// constructor
	function Donation(address _certifier) public {
		superAdmin = msg.sender;
		certifier = _certifier;
		beneficiaryCount = 0;
		beneficiaryCountMax = 0;
	}

	function () public payable {
		revert();
	}

    /*
  	Transfer contract ownership to a new address
  	param _newAdmin address of the new super admin
  	*/	
	function transferAdminRights(address _newAdmin) public onlySuperAdmin {
		superAdmin = _newAdmin;
	}	

	// Modifier restricting execution of a function to SuperAdmin
	modifier onlySuperAdmin {
	    if (msg.sender != superAdmin) revert(); 
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
	    if (msg.sender != certifier) revert(); 
	    _;
	}

	function registerBeneficiary(address _beneficiary) public onlyCertifier {
		if (beneficiaries[_beneficiary].isSet == false) {
			// create new beneficiary
			beneficiaries[_beneficiary] = BeneficiaryData(true, true, 0);
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

	function unregisterBeneficiary(address _beneficiary) public onlyCertifier {
		if (beneficiaries[_beneficiary].isSet) {
			if (beneficiaries[_beneficiary].authorized == true) {
				// desactivate beneficiary
				beneficiaries[_beneficiary].authorized = false;
				beneficiaryCount--;
			}
		}
	}

	function getBeneficiaryCount() public constant returns (uint) {
		return beneficiaryCount;
	}

	// Paginate search of beneficiaries that has been registered at least once 
	// starting from startIndex and returns 100 max beneficiaries.
	function getPaginateBeneficiaries(uint startIndex, uint size) public constant returns (address[100]) {
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
	function getPaginateActiveBeneficiaries(uint startIndex, uint size) public constant returns (address[100]) {
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

	// (DIRECT TRANSFERT)
	// Donation function that transfers wei amount among beneficiaries (evenly spread, dust of wei are returned to donator)
	// msg.value contains the donation amount in wei
	function donate() public payable {
		if (msg.value <= 0) revert();
		if (beneficiaryCount <= 0) revert();
		uint countBenef = beneficiaryCount;
		uint dust = msg.value % countBenef;
		uint realAmount = msg.value - dust; 

		evtDonate(msg.sender, realAmount);
		address thisContract = this;
		
		uint part = realAmount / countBenef;
		for (uint i = 0; i < beneficiaryCountMax; i++) {
			address benef = beneficiaryPositions[i];	
			if (beneficiaries[benef].authorized) {		
				if (!benef.send(part)) {
					evtSendFailed(benef, part);
				}
				else {
					evtSendSuccess(benef, part);
				}
			}
		}

		if (msg.sender.send(dust)) {

		}
	}

	// (PROMISE/withdraW TRANSFERT)
	// donate
	function give() public payable {
		if (msg.value <= 0) revert();
		if (beneficiaryCount <= 0) revert();
		uint countBenef = beneficiaryCount;
		uint dust = msg.value % countBenef;
		uint realAmount = msg.value - dust; 

		evtGive(msg.sender, realAmount);

		uint part = realAmount / countBenef;
		for (uint i = 0; i < beneficiaryCountMax; i++) {
			address benef = beneficiaryPositions[i];	
			if (beneficiaries[benef].authorized) {		
				beneficiaries[benef].pendingReturn += part;
			}
		}
		if (!msg.sender.send(dust)) {

		}

	}

	// Withdraw due wei from contract 
	function withdraw() public returns (bool) {
		uint amount = beneficiaries[msg.sender].pendingReturn;
		if (amount > 0){
			beneficiaries[msg.sender].pendingReturn = 0;
			if (!msg.sender.send(amount)) {
				beneficiaries[msg.sender].pendingReturn = amount;
				return false;
			}
		}
		return true;
	}

}