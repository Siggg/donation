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
		}).then(function(){
			console.log("Attempt registerBeneficiary", ADDR_BENEF2);
			return don.registerBeneficiary(ADDR_BENEF2, {gas: 200000, from: ADDR_CERTIFIER});
		}).then(function(result){
			console.log("Got confirmation", result.receipt, "...");
		}).then(function(){
			return	don.getBeneficiaryCount.call({"from": ADDR_DEPLOYER});
		}).then(function(count){ 
			console.log("number beneficiaries:", count.toNumber());
			assert.equal(count.toNumber(),2, "beneficiaries count should be 2");
		});
		// .catch(function(err){
		// 	console.error("ERROR:", err);
		// });

	});

	var amount = 1000000;
	it("donate " + amount + " wei", function() {
		return DonationV2.deployed().then(function(instance){		
			don = instance;
			console.log("Attempt to donate via fallback function", amount, ADDR_DEPLOYER, DonationV2.address);
			//return instance["registerBeneficiary"].sendTransaction(account_certifier, { "gas": 50000, "from": account_certifier});
			return don.sendTransaction({value: amount, gas: 200000, from: ADDR_DEPLOYER, to: DonationV2.address});
		}).then(function(result){
			console.log("Got confirmation", result.receipt, "...");
			console.log("Check contract balance", DonationV2.address);
			return	web3.eth.getBalance(DonationV2.address);
		}).then(function(balance){ 
			console.log("contract balance:", balance.toNumber());
			assert.equal(balance.toNumber(),amount, "contract balance should be " + amount);
		}).then(function(){
			return	web3.eth.getBalance(ADDR_BENEF1);
		}).then(function(balance){ 
			console.log("benef1 balance:", balance.toNumber());
		}).then(function(){
			return	web3.eth.getBalance(ADDR_BENEF2);
		}).then(function(balance){ 
			console.log("benef2 balance:", balance.toNumber());
		}).then(function(){
			console.log("Attempt to flush contrat balance");
			return don.flush({gas: 200000, from: ADDR_DEPLOYER});
		}).then(function(result){
			console.log("Got confirmation", result.receipt, "...");
			console.log("Check contract balance");
			return	web3.eth.getBalance(DonationV2.address);
		}).then(function(balance){ 
			console.log("contract balance:", balance.toNumber());
			assert.equal(balance.toNumber(),0, "contract balance should be 0");
		}).then(function(){
			return	web3.eth.getBalance(ADDR_BENEF1);
		}).then(function(balance){ 
			console.log("benef1 balance:", balance.toNumber());
		}).then(function(){
			return	web3.eth.getBalance(ADDR_BENEF2);
		}).then(function(balance){ 
			console.log("benef2 balance:", balance.toNumber());
		});
		// .catch(function(err){
		// 	console.error("ERROR:", err);
		// });

	});

});



