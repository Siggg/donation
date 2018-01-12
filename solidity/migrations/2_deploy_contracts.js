var q = require('../../node_modules/q');
var fs = require('../../node_modules/fs-extra/lib');
var Web3 = require('../../node_modules/web3');
var truffleConfig = require('../../solidity/truffle.json');

var DONATION = require('../../solidity/build/contracts/Donation.json');
var Donation = artifacts.require("Donation");


module.exports = function(deployer) {
   var ADDR_DEPLOYER = truffleConfig.donation.addr_deployer;
   var ADDR_CERTIFIER = truffleConfig.donation.addr_certifier;
 
   var adddonation;
   var donation;

    var deployDonation = function() {
        var def = q.defer();
        deployer.deploy(Donation, ADDR_CERTIFIER, { "gas": 3000000, "from": ADDR_DEPLOYER }).then(function() {
            adddonation = Donation.address;
            donation = Donation.at(adddonation);
            console.log('  >> Donation deployed at address ', adddonation);
            def.resolve();
        }, function(err) {
            def.reject(err);
        });
        return def.promise;
    };

    deployDonation()
    .catch(function(err) {
        console.log('  >> ' + err);
    });
};
