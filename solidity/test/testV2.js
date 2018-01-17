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

	it("register two account", function() {
		return DonationV2.deployed().then(function(instance){		
			don = instance;
			console.log("Attempt registerBeneficiary", ADDR_BENEF1);
			return instance.registerBeneficiary(ADDR_BENEF1, {gas: 200000, from: ADDR_CERTIFIER});
		}).then(function(result){
			//console.log("Got confirmation", result.receipt, "...");
		}).then(function(){
			return	don.getBeneficiaryCount.call({"from": ADDR_DEPLOYER});
		}).then(function(count){ 
			//console.log("number beneficiaries:", count.toNumber());
			assert.equal(count.toNumber(),1, "beneficiaries count should be 1");
		}).then(function(){
			console.log("Attempt registerBeneficiary", ADDR_BENEF2);
			return don.registerBeneficiary(ADDR_BENEF2, {gas: 200000, from: ADDR_CERTIFIER});
		}).then(function(result){
			//console.log("Got confirmation", result.receipt, "...");
		}).then(function(){
			return	don.getBeneficiaryCount.call({"from": ADDR_DEPLOYER});
		}).then(function(count){ 
			//console.log("number beneficiaries:", count.toNumber());
			assert.equal(count.toNumber(),2, "beneficiaries count should be 2");
		});
		// .catch(function(err){
		// 	console.error("ERROR:", err);
		// });

	});

	it("check paginate accessor of beneficiaries", function() {
		return DonationV2.deployed().then(function(instance){
			don = instance;
			return	instance.getPaginateBeneficiaries.call(0, 99, {from: ADDR_CERTIFIER});
		}).then(function(beneficiaries){ 
			//console.log("beneficiaries(0,99):", beneficiaries);
			var addBenefs = [];
			for (var i in beneficiaries) {
				if (beneficiaries[i] == 0x0) { //0x0000000000000000000000000000000000000000

				}
				else {
					console.log("beneficiary", i, beneficiaries[i]);
					addBenefs.push(beneficiaries[i]);
				}
			}
			assert.equal(addBenefs[0],ADDR_BENEF1, "beneficiary[0] should be " + ADDR_BENEF1);
			assert.equal(addBenefs[1],ADDR_BENEF2, "beneficiary[1] should be " + ADDR_BENEF2);
			assert.equal(addBenefs.length,2, "beneficiaries count should be 2");
		});	
	});

	it("unregister an existing account and register it again", function() {
		return DonationV2.deployed().then(function(instance){		
			don = instance;
			console.log("Attempt unregisterBeneficiary", ADDR_BENEF1);
			return instance.unregisterBeneficiary(ADDR_BENEF1, {gas: 200000, from: ADDR_CERTIFIER});
		}).then(function(result){
			//console.log("Got confirmation", result.receipt, "...");
		}).then(function(){
			return	don.getBeneficiaryCount.call({"from": ADDR_DEPLOYER});
		}).then(function(count){ 
			//console.log("number beneficiaries:", count.toNumber());
			assert.equal(count.toNumber(),1, "beneficiaries count should be 1");
		}).then(function(){
			console.log("Attempt registerBeneficiary", ADDR_BENEF1);
			return don.registerBeneficiary(ADDR_BENEF1, {gas: 200000, from: ADDR_CERTIFIER});
		}).then(function(result){
			//console.log("Got confirmation", result.receipt, "...");
		}).then(function(){
			return	don.getBeneficiaryCount.call({"from": ADDR_DEPLOYER});
		}).then(function(count){ 
			//console.log("number beneficiaries:", count.toNumber());
			assert.equal(count.toNumber(),2, "beneficiaries count should be 2");
		});
	});

	var balanceBenef1;
	var balanceBenef2;

	var expectedBalanceBenef1;
	var expectedBalanceBenef2;

	var amount = 1000000;
	it("donate " + amount + " wei", function() {
		return DonationV2.deployed().then(function(instance){		
			don = instance;
			console.log("Attempt to donate via fallback function", amount, ADDR_DEPLOYER, DonationV2.address);
			//return instance["registerBeneficiary"].sendTransaction(account_certifier, { "gas": 50000, "from": account_certifier});
			return don.sendTransaction({value: amount, gas: 200000, from: ADDR_DEPLOYER, to: DonationV2.address});
		}).then(function(result){
			//console.log("Got confirmation", result.receipt, "...");
			//console.log("Check contract balance", DonationV2.address);
			return	web3.eth.getBalance(DonationV2.address);
		}).then(function(balance){ 
			console.log("contract balance:", balance.toNumber());
			assert.equal(balance.toNumber(),amount, "contract balance should be " + amount);
		}).then(function(){
			return	web3.eth.getBalance(ADDR_BENEF1);
		}).then(function(balance){ 
			console.log("benef1 balance:", balance.toNumber());
			balanceBenef1 = balance.toNumber();
		}).then(function(){
			return	web3.eth.getBalance(ADDR_BENEF2);
		}).then(function(balance){ 
			console.log("benef2 balance:", balance.toNumber());
			balanceBenef2 = balance.toNumber();
		}).then(function(){
			console.log("Attempt to flush contrat balance");
			return don.flush({gas: 200000, from: ADDR_DEPLOYER});
		}).then(function(result){
			//console.log("Got confirmation", result.receipt, "...");
			//console.log("Check contract balance");
			return	web3.eth.getBalance(DonationV2.address);
		}).then(function(balance){ 
			console.log("contract balance:", balance.toNumber());
			assert.equal(balance.toNumber(),0, "contract balance should be 0");
		}).then(function(){
			return	web3.eth.getBalance(ADDR_BENEF1);
		}).then(function(balance){ 
			console.log("benef1 balance:", balance.toNumber());
			expectedBalanceBenef1 = balanceBenef1 + (amount/2);
			assert.equal(balance.toNumber(), expectedBalanceBenef1, "contract balance should be " + expectedBalanceBenef1);
		}).then(function(){
			return	web3.eth.getBalance(ADDR_BENEF2);
		}).then(function(balance){ 
			console.log("benef2 balance:", balance.toNumber());
			expectedBalanceBenef2 = balanceBenef2 + (amount/2);
			assert.equal(balance.toNumber(), expectedBalanceBenef2, "contract balance should be " + expectedBalanceBenef2);
		});
		// .catch(function(err){
		// 	console.error("ERROR:", err);
		// });

	});

});



