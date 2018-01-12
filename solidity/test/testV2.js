var account_deployer = "0x2f53660e9e3a0ab9f8023b0f3464e7f6e7b06285"; //"0x5D64B367806c2ff524C4Ba1e83e0220787020100";
var account_certifier = "0x2f53660e9e3a0ab9f8023b0f3464e7f6e7b06285"; //"0x5D64B367806c2ff524C4Ba1e83e0220787020100";

//var contract_testnet = "0x4c7e620cc5f302d6e3434abb1404f771efbdc482";
var truffleConfig = require('../../solidity/truffle.json');
var DonationV2 = artifacts.require("DonationV2");

var ADDR_DEPLOYER = truffleConfig.donation_dev.addr_deployer;
var ADDR_CERTIFIER = truffleConfig.donation_dev.addr_certifier;
var ADDR_BENEF1 = truffleConfig.donation_dev.addr_benef1;
var ADDR_BENEF2 = truffleConfig.donation_dev.addr_benef2;


var don;
contract("DonationV2", function(accounts) {

	it("register first account", function() {
		return DonationV2.deployed().then(function(instance){		
			don = instance;
			console.log("Attempt registerBeneficiary", ADDR_BENEF1);
			//return instance["registerBeneficiary"].sendTransaction(account_certifier, { "gas": 50000, "from": account_certifier});
			return instance.registerBeneficiary(ADDR_BENEF1, {gas: 200000, from: ADDR_CERTIFIER});
		}).then(function(result){
			console.log("Got confirmation", result.receipt, "...");

		}).then(function(){
			return	don.getBeneficiaryCount.call({"from": ADDR_DEPLOYER});
		}).then(function(count){ 
			console.log("number beneficiaries:", count.toNumber());
			assert.equal(count.toNumber(),1, "beneficiaries count should be 1");
		});
		// .catch(function(err){
		// 	console.error("ERROR:", err);
		// });

	});

});



