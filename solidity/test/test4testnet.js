var account_deployer = "0x5D64B367806c2ff524C4Ba1e83e0220787020100";
var account_certifier = "0x5D64B367806c2ff524C4Ba1e83e0220787020100";

var Donation = artifacts.require("Donation");


var testnetContractAddress = "0x4c7e620cc5f302d6e3434abb1404f771efbdc482";

var abi = [{"constant":false,"inputs":[{"name":"startIndex","type":"uint256"},{"name":"size","type":"uint256"}],"name":"getPaginateActiveBeneficiaries","outputs":[{"name":"","type":"address[100]"}],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"withdraw","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"kill","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"startIndex","type":"uint256"},{"name":"size","type":"uint256"}],"name":"getPaginateBeneficiaries","outputs":[{"name":"","type":"address[100]"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_beneficiary","type":"address"}],"name":"unregisterBeneficiary","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"getBeneficiaryCount","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"give","outputs":[],"payable":true,"type":"function"},{"constant":false,"inputs":[{"name":"_newAdmin","type":"address"}],"name":"transferAdminRights","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_beneficiary","type":"address"}],"name":"registerBeneficiary","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"donate","outputs":[],"payable":true,"type":"function"},{"inputs":[{"name":"_certifier","type":"address"}],"type":"constructor"},{"payable":true,"type":"fallback"},{"anonymous":false,"inputs":[{"indexed":false,"name":"donator","type":"address"},{"indexed":false,"name":"amount","type":"uint256"}],"name":"evtDonate","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"benef","type":"address"},{"indexed":false,"name":"amount","type":"uint256"}],"name":"evtSendFailed","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"benef","type":"address"},{"indexed":false,"name":"amount","type":"uint256"}],"name":"evtSendSuccess","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"donator","type":"address"},{"indexed":false,"name":"amount","type":"uint256"}],"name":"evtGive","type":"event"}];

var watchTransaction = function(txhash, callback) {
	try {
		console.log("watchTransaction", txhash);
		const latestFilter = web3.eth.filter('latest');
	    latestFilter.watch(function (error, res) {
	        if (error) {
	        	latestFilter.stopWatching();
	          	callback(error, null);
	        }
	        else {
	        	console.log("check block", res);
	        	const block = web3.eth.getBlock(res, true);
	        	if (block) {
		          	var found = false;
		          	for (var i = 0; i < block.transactions.length; i++) {
						if (block.transactions[i].hash == txhash) {
							console.log("tx desc", block.transactions[i]);
							found = true;
							break;
						}
		          	}
		          	if (found) {
		            	latestFilter.stopWatching();
		            	callback(null, true);
		          	}
		        }
	        }
		});
	}
	catch (err) {
  		latestFilter.stopWatching();
  		logger.error("Error catched in watchTransaction:", err);
  		callback(err, null);
	}
};




	var don;
	var testnetContract = web3.eth.contract(abi); 
	var contractInstance = testnetContract.at(testnetContractAddress); 
			//web3.personal.unlockAccount(account_deployer, "pwdcd92");

	console.log("accounts", web3.eth.accounts);

    var regBenef = function() {
    	//console.log("contract instance", contractInstance);
		return contractInstance.registerBeneficiary(web3.eth.accounts[1], {gas: 100000, from: web3.eth.accounts[0]});
    };
	
	it("check number of beneficiaries at initial state", function() {
		return Donation.deployed().then(function(instance){
			return	contractInstance.getBeneficiaryCount.call({from: account_deployer});
		}).then(function(count){ 
			//console.log("number beneficiaries:", count.toNumber());
			assert.equal(count.toNumber(), 0, "beneficiaries count should be 0");});	
	});

	it("register first account on testnet", function() {
		this.timeout(40000);
		var tx = regBenef();
		console.log("EXEC", tx);

		return new Promise(function(resolve,reject) {
			watchTransaction(tx, function(err, res){ 
				if (err) {
					console.error("failed watching tx", tx); 
					reject();
				}
				else {
					if (res == true) {
						console.log("TX DONE", tx); 
					}
					resolve();
				}
			});
		}).then(function(){
			//console.log("Got confirmation", result);
			return	contractInstance.getBeneficiaryCount.call({"from": account_deployer});
		}).then(function(count){ 
			console.log("number beneficiaries:", count.toNumber());
			assert.equal(count.toNumber(),1, "beneficiaries count should be 1");
		});

		// .then(function(){
		// 	return	contractInstance.getBeneficiaryCount.call({"from": account_deployer});
		// }).then(function(count){ 
		// 	console.log("number beneficiaries:", count.toNumber());
		// 	assert.equal(count.toNumber(),1, "beneficiaries count should be 1");
		// });
	});

// contract("Donation", function(accounts) {
// 	it("check testnet contract existance", function() {
// 		return Donation.deployed().then(function(instance){
// 			don = instance;

// 			var testnetContract = web3.eth.contract(abi); 
// 			var contractInstance = testnetContract.at(testnetContractAddress); 
// 			return contractInstance.getBeneficiaryCount.call(); 

// 			//return	don.getBeneficiaryCount.call({from: account_deployer});
// 		}).then(function(count){ 
// 			//console.log("number beneficiaries:", count.toNumber());
// 			assert.equal(count.toNumber(), 0, "beneficiaries count should be 0");});	
// 	});

// 	it("register first account", function() {
// 		return Donation.deployed().then(function(instance){		
// 			don = instance;
// 			console.log("Attempt registerBeneficiary", account_certifier);
// 			var testnetContract = web3.eth.contract(abi); 
// 			var contractInstance = testnetContract.at(testnetContractAddress); 
// 			//return instance["registerBeneficiary"].sendTransaction(account_certifier, { "gas": 50000, "from": account_certifier});
// 			return contractInstance.registerBeneficiary(account_certifier, {gas: 100000, from: account_certifier});
// 		}).then(function(result){
// 			console.log("Got confirmation", result.receipt, "...");
// 		}).then(function(){
// 			var testnetContract = web3.eth.contract(abi); 
// 			var contractInstance = testnetContract.at(testnetContractAddress); 
// 			return	contractInstance.getBeneficiaryCount.call({"from": account_deployer});
// 		}).then(function(count){ 
// 			console.log("number beneficiaries:", count.toNumber());
// 			assert.equal(count.toNumber(),1, "beneficiaries count should be 1");
// 		});
// 	});

// });
