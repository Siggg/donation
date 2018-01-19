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

var truffleConfig = require('../../solidity/truffle.json');
var Donation = artifacts.require("Donation");

var ADDR_DEPLOYER = truffleConfig.donation_dev.addr_deployer;
var ADDR_CERTIFIER = truffleConfig.donation_dev.addr_certifier;
var ADDR_BENEF1 = truffleConfig.donation_dev.addr_benef1;
var ADDR_BENEF2 = truffleConfig.donation_dev.addr_benef2;

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
							//console.log("tx desc", block.transactions[i]);
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
	it("check number of beneficiaries at initial state", function() {
		return Donation.deployed().then(function(instance){
			don = instance;
			return	don.getBeneficiaryCount.call({from: ADDR_DEPLOYER});
		}).then(function(count){ 
			//console.log("number beneficiaries:", count.toNumber());
			assert.equal(count.toNumber(), 0, "beneficiaries count should be 0");});	
	});

	it("check beneficiaries at initial state", function() {
		return Donation.deployed().then(function(instance){
			don = instance;
			return	instance["getPaginateBeneficiaries"].call(0, 99, {from: ADDR_DEPLOYER});
		}).then(function(beneficiaries){ 
			//console.log("beneficiaries(0,99):", beneficiaries);
			for (var i in beneficiaries) {
				if (beneficiaries[i] == 0x0) { //0x0000000000000000000000000000000000000000
				}
				else {
					console.log("beneficiary", i, beneficiaries[i]);
				}
			}
		});	
	});

	it("register two beneficiary accounts", function() {
		return Donation.deployed().then(function(instance){		
			don = instance;
			console.log("Attempt registerBeneficiary", ADDR_BENEF1);
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

	it("check beneficiaries", function() {
		return Donation.deployed().then(function(instance){
			don = instance;
			return	instance["getPaginateBeneficiaries"].call(0, 99, {from: ADDR_DEPLOYER});
		}).then(function(beneficiaries){ 
			//console.log("beneficiaries(0,99):", beneficiaries);
			for (var i in beneficiaries) {
				if (beneficiaries[i] == 0x0) { //0x0000000000000000000000000000000000000000
				}
				else {
					console.log("beneficiary", i, beneficiaries[i]);
				}
			}
		});	
	});

	it("register one account (homemade async call)", function() {
		return Donation.deployed().then(function(instance){		
			don = instance;
			console.log("Attempt registerBeneficiary", ADDR_CERTIFIER);
			return instance["registerBeneficiary"].sendTransaction(ADDR_CERTIFIER, { "gas": 200000, "from": ADDR_CERTIFIER});
		}).then(function(tx){
			console.log("Waiting confirmation of", tx, "...");

			return new Promise(function(resolve,reject) {
				watchTransaction(tx, function(err, result){ 
					if (err) {
						console.error("failed watching tx", tx); 
						reject();
					}
					else {
						if (result == true) {
							console.log("TX DONE", tx); 
						}
						resolve();
					}
				});

			});
		}).then(function(){
			return	don.getBeneficiaryCount.call({"from": ADDR_CERTIFIER});
		}).then(function(count){ 
			console.log("number beneficiaries:", count.toNumber());
			assert.equal(count.toNumber(),3, "beneficiaries count should be 3");
		});
		// .catch(function(err){
		// 	console.error("ERROR:", err);
		// });

	});


});


