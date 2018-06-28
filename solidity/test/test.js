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
import assertRevert from './helpers/assertRevert';
var truffleConfig = require('../../solidity/truffle.json');
var DonationV2 = artifacts.require("DonationV2");

var ADDR_DEPLOYER = truffleConfig.donation_dev.addr_deployer;
var ADDR_CERTIFIER = truffleConfig.donation_dev.addr_deployer;
var ADDR_BENEF1 = truffleConfig.donation_dev.addr_benef1;
var ADDR_BENEF2 = truffleConfig.donation_dev.addr_benef2;
var ADDR_BENEF3 = truffleConfig.donation_dev.addr_benef3;
var ADDR_BENEF4 = truffleConfig.donation_dev.addr_benef4;
var ADDR_BENEF5 = truffleConfig.donation_dev.addr_benef5;


var don;
contract('DonationV2', function(accounts) {
  let donation;

  async function setupContracts() {
    const donation = await DonationV2.new(ADDR_CERTIFIER,{from : ADDR_DEPLOYER});
    return {donation}
  }

  beforeEach('Redeploy', async function () {
    const contracts = await setupContracts()
    donation = contracts.donation
    console.log("donation address " +donation.address);
  });
/*
  describe('Try to make a flush when beneficiaries count == 0', function () {
    it("rejects a flush when beneficiaries count == 0", function() {
      await assertRevert(donation.flush({ from: ADDR_CERTIFIER}));
    });
  });

  describe('Unregister a non existing account', function () {
    it('rejects unregistering a non existing account', async function () {
      await assertRevert(donation.unregisterBeneficiary(ADDR_BENEF1, { from: ADDR_CERTIFIER}));
    });
  });

  describe('Make a donation', function () {
    var amount = web3.toWei('1', 'ether');
    it("donate " + amount + " wei", function() {
      await donation.sendTransaction({value: amount, from: ADDR_DEPLOYER, to: donation.address});
    });
   });

   describe('Register a beneficiary account and make a donation', function () {
     var amount = web3.toWei('1', 'ether');
     it('register an account', async function () {
       await donation.registerBeneficiary(ADDR_BENEF1, { from: ADDR_CERTIFIER});
     });
     it("donate " + amount + " wei", function() {
       await donation.sendTransaction({value: amount, from: ADDR_DEPLOYER, to: donation.address});
     });
     it("make a flush ", function() {
       await donation.flush({ from: ADDR_CERTIFIER});
     });
   });

   describe('Unregister an existing account', function () {
     it('unregister a beneficiary ', async function () {
       await donation.unregisterBeneficiary(ADDR_BENEF1, { from: ADDR_CERTIFIER});
     });
   });

   describe('Register 3 beneficiaries account, make a donation and flush for only two beneficiaries', function () {
     var amount = web3.toWei('1', 'ether');

     it('register the first beneficiary account', async function () {
       await donation.registerBeneficiary(ADDR_BENEF1, { from: ADDR_CERTIFIER});
     });
     it('register the second beneficiary account', async function () {
       await donation.registerBeneficiary(ADDR_BENEF2, { from: ADDR_CERTIFIER});
     });
     it('register the third beneficiary account', async function () {
       await donation.registerBeneficiary(ADDR_BENEF3, { from: ADDR_CERTIFIER});
     });
     it("donate " + amount + " wei", function() {
       await donation.sendTransaction({value: amount, from: ADDR_DEPLOYER, to: donation.address});
     });
     it("make a flush ", function() {
       await donation.flush({ from: ADDR_CERTIFIER});
     });
   });

   describe('Try to make a flush from another account != ADDR_CERTIFIER', function () {
     it("rejects a flush called by another address", function() {
       await assertRevert(donation.flush({ from: ADDR_DEPLOYER}));
     });
   });
*/
// test @ 0x7794AF39C0f498cD5347F82d239cd612A09fB9e1
describe('Test donation', async function () {
  var amount = web3.toWei('1', 'ether');
  var seuil = web3.toWei('0.25', 'ether');
  it('register beneficiaries account and make a flush ', async function () {
    console.log("register 1 beneficiary");
    await donation.registerBeneficiary(ADDR_BENEF1, { from: ADDR_CERTIFIER});
    console.log("register 2 beneficiary");
    await donation.registerBeneficiary(ADDR_BENEF2, { from: ADDR_CERTIFIER});
    console.log("register 3 beneficiary");
    await donation.registerBeneficiary(ADDR_BENEF3, { from: ADDR_CERTIFIER});
    console.log("register 4 beneficiary");
    await donation.registerBeneficiary(ADDR_BENEF4, { from: ADDR_CERTIFIER});
    console.log("register 5 beneficiary");
    await donation.registerBeneficiary(ADDR_BENEF5, { from: ADDR_CERTIFIER});
    console.log("donate " + amount + " wei");
    await donation.sendTransaction({value: amount, from: ADDR_DEPLOYER, to: donation.address});
    console.log("make a flush");
    await donation.flush(seuil, {from: ADDR_CERTIFIER});
  });
});
});
