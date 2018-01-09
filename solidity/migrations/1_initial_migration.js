var truffleConfig = require('../../solidity/truffle.json');
	var Migrations = artifacts.require("Migrations");

module.exports = function(deployer) {
   var ADDR_DEPLOYER = truffleConfig.donation.addr_deployer;

  deployer.deploy(Migrations, { "gas": 500000, "from": ADDR_DEPLOYER }).then(function() {
    console.log("  >> Successfully deployed Migrations contract");
  }, function(err) {
    console.log("  >> " + err);
  });
};
