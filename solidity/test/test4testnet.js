var account_deployer = "0x5D64B367806c2ff524C4Ba1e83e0220787020100";
var account_certifier = "0x5D64B367806c2ff524C4Ba1e83e0220787020100";

var Donation = artifacts.require("Donation");
var truffleConfig = require('../../solidity/truffle.json');

var ADDR_DEPLOYER = truffleConfig.donation_testnet.addr_deployer;
var ADDR_CERTIFIER = truffleConfig.donation_testnet.addr_certifier;
var ADDR_BENEF1 = truffleConfig.donation_testnet.addr_benef1;
var ADDR_BENEF2 = truffleConfig.donation_testnet.addr_benef2;

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

  var regBenef = function(benefAddress) {
    //console.log("contract instance", contractInstance);
		return contractInstance.registerBeneficiary(benefAddress, {gas: 100000, from: ADDR_CERTIFIER});
  };
	
	it("check number of beneficiaries at initial state", function() {
		return Donation.deployed().then(function(instance){
			return	contractInstance.getBeneficiaryCount.call({from: ADDR_DEPLOYER});
		}).then(function(count){ 
			//console.log("number beneficiaries:", count.toNumber());
			assert.equal(count.toNumber(), 0, "beneficiaries count should be 0");});	
	});

	it("register first account on testnet", function() {
		this.timeout(100000);
		var tx = regBenef(ADDR_BENEF1);
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
			return	contractInstance.getBeneficiaryCount.call({"from": ADDR_DEPLOYER});
		}).then(function(count){ 
			console.log("number beneficiaries:", count.toNumber());
			assert.equal(count.toNumber(),1, "beneficiaries count should be 1");
		}).then(function(){
      var tx2 = regBenef(ADDR_BENEF2);
      console.log("EXEC", tx2);
      return new Promise(function(resolve,reject) {
        watchTransaction(tx2, function(err, res){ 
          if (err) {
            console.error("failed watching tx2", tx2); 
            reject();
          }
          else {
            if (res == true) {
              console.log("TX DONE", tx2); 
            }
            resolve();
          }
        });
      }
    });

		// .then(function(){
		// 	return	contractInstance.getBeneficiaryCount.call({"from": account_deployer});
		// }).then(function(count){ 
		// 	console.log("number beneficiaries:", count.toNumber());
		// 	assert.equal(count.toNumber(),1, "beneficiaries count should be 1");
		// });
	});
