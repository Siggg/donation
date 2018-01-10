var q = require('../../node_modules/q');
var fs = require('../../node_modules/fs-extra/lib');
var Web3 = require('../../node_modules/web3');
var truffleConfig = require('../../solidity/truffle.json');

//var DONATION = require('../../solidity/build/contracts/Donation.sol.js');

var Donation = artifacts.require("Donation");
var DonationV2 = artifacts.require("DonationV2");

module.exports = function(deployer) {
   var ADDR_DEPLOYER = truffleConfig.donation.addr_deployer;
   var ADDR_CERTIFIER = truffleConfig.donation.addr_certifier;

   var adddonation;
   var donation;

   var adddonationV2;
   var donationV2;

    var deployDonation = function() {
        var def = q.defer();
        deployer.deploy(Donation, ADDR_CERTIFIER, {"from": ADDR_DEPLOYER}).then(function() {
            adddonation = Donation.address;
            donation = Donation.at(adddonation);
            console.log('  >> Donation deployed at address ', adddonation);
            def.resolve();
        }, function(err) {
            def.reject(err);
        });
        return def.promise;
    };

    // var deployDonationV2 = function() {
    //     var def = q.defer();
    //     deployer.deploy(DonationV2, ADDR_CERTIFIER, {"from": ADDR_DEPLOYER}).then(function() {
    //         adddonationV2 = DonationV2.address;
    //         donationV2 = DonationV2.at(adddonationV2);
    //         console.log('  >> DonationV2 deployed at address ', adddonationV2);
    //         def.resolve();
    //     }, function(err) {
    //         def.reject(err);
    //     });
    //     return def.promise;
    // };
      


    deployDonation()
    //.then(deployDonationV2)
//    .then(writeDeployConfigFile)
    .catch(function(err) {
        console.log('  >> ' + err);
    });
};
