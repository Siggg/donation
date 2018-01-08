var account_deployer = "0x5D64B367806c2ff524C4Ba1e83e0220787020100";
var account_certifier = "0x5D64B367806c2ff524C4Ba1e83e0220787020100";

var Donation = artifacts.require("Donation");

var don;
contract("Donation", function(accounts) {
	it("register first account", function() {
		return Donation.deployed().then(function(instance){
			console.log("contract Donation deployed");			
			don = instance;
			return instance.registerBeneficiary(account_certifier, {from: account_deployer});
		}).then(function(){
			console.log("Beneficiary registered && getting benef count");
			return	don.getBeneficiaryCount.call({from: account_deployer});
		}).then(function(count){ console.log("number beneficiaries:", count)});
	});

});

//var instanceDonation = Donation.at("0x6654fD9A66dF4DE6623db8BA1A0Daf5B13a7550e");

//instanceDonation.registerBeneficiary(account_certifier, {from: account_deployer});


//var don;
//Donation.deployed().then(function(instance) {
//  don = instance;
//  return don.registerBeneficiary(account_certifier, {from: account_deployer});
//}).then(function(result) {
//     alert("Transaction successful!");
//  }).catch(function(e) {
//     alert("Transaction errored!");
//  })

