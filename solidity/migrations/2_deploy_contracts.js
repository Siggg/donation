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
var q = require('../../node_modules/q');
var fs = require('../../node_modules/fs-extra/lib');
var Web3 = require('../../node_modules/web3');
var truffleConfig = require('../../solidity/truffle.json');

var Donation = artifacts.require("Donation");

module.exports = function(deployer) {

  var ADDR_DEPLOYER = truffleConfig.donation_dev.addr_deployer;
  var ADDR_CERTIFIER = truffleConfig.donation_dev.addr_deployer;

   var adddonation;
   var donation;

   console.log(ADDR_DEPLOYER);
   var deployDonation = function() {
        var def = q.defer();
        deployer.deploy(Donation, ADDR_CERTIFIER, {from: ADDR_DEPLOYER}).then(function() {
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
        console.log('  >> err :' + err);
      });
};
