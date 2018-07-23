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

var Donation = artifacts.require("Donation.sol");
var PrivilegeRequest = artifacts.require("PrivilegeRequest.sol");
var Privilege = artifacts.require("Privilege.sol");

module.exports = function(deployer, network) {

  var ADDR_DEPLOYER = truffleConfig.donation_dev.addr_deployer;
  var ADDR_CERTIFIER = truffleConfig.donation_dev.addr_deployer;


   /*
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
       */
   // ropsten network
   //if (network == 'ropsten') {
   /*
     return deployer.deploy(Donation,{from : ADDR_DEPLOYER}).then(function(){
       console.log('  >> Donation deployed at address ', Donation.address);

       return deployer.deploy(PrivilegeRequest, Donation.address, {from : ADDR_DEPLOYER}).then(function(){
         console.log('  >> Privilege request contract deployed at address ', PrivilegeRequest.address);

         return Donation.deployed().then(function(donation){
           return donation.setPrivilegeRequestAddress(PrivilegeRequest.address, {from : ADDR_DEPLOYER}).then(function(){
             return donation.privilegeRequest.call({from : ADDR_DEPLOYER}).then(function(privilegeRequest){
               console.log('  >> Privilege request contract set ', privilegeRequest);
             });
           });
         });
       });
     });
   //}
*/
const deployContracts = async (deployer, accounts) => {
  try {
      /* library */
      const safeMath = await deployer.deploy(SafeMath);
      const privilegeRequest = await deployer.deploy(PrivilegeRequest,{from : ADDR_DEPLOYER});
      await deployer.link(SafeMath, [Donation]);
      const donation = await deployer.deploy(Donation,{from : ADDR_DEPLOYER});
      await deployer.link(Privilege,[Donation, PrivilegeRequest]);
      await deployer.link(PrivilegeRequest, [Donation]);


      /* set privilege request address*/
      await donation.setPrivilegeRequestAddress(privilegeRequest.address, {from : ADDR_DEPLOYER});

      /* deployed contracts */
      console.log('>>>>>>> Deployed contracts >>>>>>>>');
      console.log('Donation contract at ' + donation.address);
      console.log('Privilege request contract at '+ privilegeRequest.address);
      
      return true
  } catch (err) {
      console.log('### error deploying contracts', err)
  }
}
};
