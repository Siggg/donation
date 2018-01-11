var Migrations = artifacts.require("Migrations");
module.exports = function(deployer) {
  deployer.deploy(Migrations, { 
		"gaz": 100000, 
		"from":"0x5d64b367806c2ff524c4ba1e83e0220787020100"})
	  .then(function() {
    		console.log("  >> Successfully deployed Migrations contract");
  	  }, function(err) {
    		console.log("  >> " + err);
  });
};
