var q = require('../../node_modules/q');
var fs = require('../../node_modules/fs-extra/lib');
var Web3 = require('../../node_modules/web3');
var truffleConfig = require('../../solidity/truffle.json');

var DONATION = require('../../solidity/build/contracts/Donation.sol.js');


module.exports = function(deployer) {
   var ADDR_DEPLOYER = truffleConfig.donation.addr_deployer;
   var ADDR_CERTIFIER = truffleConfig.donation.addr_certifier;
   var adddonation;

   var donation;

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
    
    // var writeDeployConfigFile = function() {
    //     var def = q.defer();
    //     // Once everything is deployed, creates a file with contract addresses
    //     if (fs != undefined) {
    //         fs.writeFileSync(
    //             __dirname + '/../../server/config/deploy-config.json', 
    //             JSON.stringify({
    //                'DONATION': adddonation,
    //                'DONATION_abi': DONATION.all_networks.default.abi,
    //             }),
    //             'utf-8'
    //         );
    //         def.resolve();
    //     } else {
    //         def.reject('fs is undefined');
    //     }
    //     return def.promise;
    // };

    deployDonation()
//    .then(writeDeployConfigFile)
    .catch(function(err) {
        console.log('  >> ' + err);
    });
};
