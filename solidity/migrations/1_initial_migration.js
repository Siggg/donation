module.exports = function(deployer) {
  deployer.deploy(Migrations).then(function() {
    console.log("  >> Successfully deployed Migrations contract");
  }, function(err) {
    console.log("  >> " + err);
  });
};
