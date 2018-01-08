var truffleConfig = require('../../solidity/truffle.json');

module.exports = function(deployer) {
   var ADDR_DEPLOYER = truffleConfig.donation.addr_deployer;

  deployer.deploy(Migrations, { "gas": 500000, "from": ADDR_DEPLOYER }).then(function() {
    console.log("  >> Successfully deployed Migrations contract");
  }, function(err) {
    console.log("  >> " + err);
  });
};
