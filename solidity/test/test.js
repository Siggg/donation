var account_deployer = "0x2f53660e9e3a0ab9f8023b0f3464e7f6e7b06285"; //"0x5D64B367806c2ff524C4Ba1e83e0220787020100";
var account_certifier = "0x2f53660e9e3a0ab9f8023b0f3464e7f6e7b06285"; //"0x5D64B367806c2ff524C4Ba1e83e0220787020100";

var contract_testnet = "0x4c7e620cc5f302d6e3434abb1404f771efbdc482";

var Donation = artifacts.require("Donation");

var expectedHash;

var watchTransaction = function(txhash, callback) {
	try {
		const latestFilter = web3.eth.filter('latest');
	    latestFilter.watch(function (error, res) {
	        if (error) {
	        	latestFilter.stopWatching();
	          	callback(error, null);
	        }
	        else {
	        	const block = web3.eth.getBlock(res, true);
	        	if (block) {
		          	var found = false;
		          	for (var i = 0; i < block.transactions.length; i++) {
						if (block.transactions[i].hash == txhash) {
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
contract("Donation", function(accounts) {
	it("check number of beneficiaries", function() {
		return Donation.deployed().then(function(instance){
			don = instance;
			return	don.getBeneficiaryCount.call({from: account_deployer});
		}).then(function(count){ console.log("number beneficiaries:", count)});	
	});

	it("check beneficiaries", function() {
		return Donation.deployed().then(function(instance){
			don = instance;
			return	instance["getPaginateBeneficiaries"].call(0, 10, {from: account_deployer});
		}).then(function(beneficiaries){ console.log("beneficiaries(0,10):", beneficiaries)});	
	});

	it("register first account", function() {
		return Donation.deployed().then(function(instance){		
			don = instance;
			return instance["registerBeneficiary"].sendTransaction(account_certifier, { "gas": 30000, "from": account_deployer});
			//return instance.registerBeneficiary(account_certifier, {from: account_deployer});
		}).then(function(tx){
			console.log("Attempt registerBeneficiary", tx);
			watchTransaction(tx, function(err, result){ 
				if (err) 
					console.error("failed watching tx", tx); 
				else {
					if (result == true) {
						console.error("tx DONE", tx); 
					}
				}
			});
		});

	});


});



// var waitTransaction = function(txhash, callback) {
// 	expectedHash = txhash;
// 	var interval = setInterval(function() {
// 		try {
// 			console.log("check tx of latest block");
// 			//const latestFilter = web3.eth.filter('latest');
// 			const latestFilter = web3.eth.filter({"fromBlock": 0, "toBlock": "latest", "address": expectedHash });   
// 		    latestFilter.get(function (error, res) {
// 		        if (error) {
// 		        	clearInterval(interval);
// 		          	callback(error, null);
// 		        }
// 		        else {
// 		        	console.log("look into block", res);
// 		        	const block = web3.eth.getBlock(res, true);
// 		        	if (block) {
// 		        		//console.log("look inside", block.transactions);
// 			          	var found = false;
// 			          	for (var i = 0; i < block.transactions.length; i++) {
// 			          		console.log("check tx", block.transactions[i].hash,  expectedHash);
// 			          		//console.log("check tx", block.transactions[i].hash, expectedHash);
// 							if (block.transactions[i].hash == expectedHash) {
// 								found = true;
// 								break;
// 							}
// 			          	}
// 			          	if (found) {
// 			            	clearInterval(interval);
// 			            	callback(null, true);
// 			          	}
// 			        }
// 		        }
// 			});
// 		}
// 		catch (err) {
//       		clearInterval(interval);
//       		logger.error("Error catched in waitTransaction:", err);
//       		callback(err, null);
// 		}
// 	}, 1000);
// };
