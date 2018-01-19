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

var DonationV2 = artifacts.require("DonationV2");

module.exports = function(deployer) {
   var ADDR_DEPLOYER = truffleConfig.donation.addr_deployer;
   var ADDR_CERTIFIER = truffleConfig.donation.addr_certifier;

   var adddonationV2;
   var donationV2;


    var deployDonationV2 = function() {
        var def = q.defer();
        deployer.deploy(DonationV2, ADDR_CERTIFIER, {"from": ADDR_DEPLOYER}).then(function() {
            adddonationV2 = DonationV2.address;
            donationV2 = DonationV2.at(adddonationV2);
            console.log('  >> DonationV2 deployed at address ', adddonationV2);
            def.resolve();
        }, function(err) {
            def.reject(err);
        });
        return def.promise;
    };

    deployDonationV2()
    .catch(function(err) {
        console.log('  >> ' + err);
    });
};
