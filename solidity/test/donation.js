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
var Donation = artifacts.require("Donation");

var ADDR_DEPLOYER = truffleConfig.donation_dev.addr_deployer;
var ADDR_CERTIFIER = truffleConfig.donation_dev.addr_deployer;
var ADDR_BENEF1 = truffleConfig.donation_dev.addr_benef1;
var ADDR_BENEF2 = truffleConfig.donation_dev.addr_benef2;
var ADDR_BENEF3 = truffleConfig.donation_dev.addr_benef3;
var ADDR_BENEF4 = truffleConfig.donation_dev.addr_benef4;
var ADDR_BENEF5 = truffleConfig.donation_dev.addr_benef5;


var don;
contract('Donation', function(accounts) {
  let donation;

  async function setupContracts() {
    const donation = await Donation.new(ADDR_CERTIFIER,{from : ADDR_DEPLOYER});
    return {donation}
  }

  beforeEach('Redeploy', async function () {
    const contracts = await setupContracts();
    donation = contracts.donation;
  });

  describe('Try to make a distribute when beneficiaries count == 0', async function () {
    var amount = web3.toWei('1', 'ether');
    var seuil = web3.toWei('0.25', 'ether');
    it("donate " + amount + " wei", async function() {
      await donation.sendTransaction({value: amount, from: ADDR_DEPLOYER, to: donation.address});
    });
    it('it rejects a distributewhen beneficiaries count == 0', async function() {
      await assertRevert(donation.distribute(seuil,{ from: ADDR_CERTIFIER}));
    });
  });

  describe('Register a beneficiary account and try to make a distribute with a balance == 0', async function () {
    var seuil = web3.toWei('0.25', 'ether');
    it('it register an account', async function () {
      await donation.registerBeneficiary(ADDR_BENEF1, { from: ADDR_CERTIFIER});
    });
    it('it rejects a flush', async function() {
      await assertRevert(donation.distribute(seuil,{ from: ADDR_CERTIFIER}));
    });
  });

  describe('Try to make a distribute from another account != ADDR_CERTIFIER', async function () {
    var amount = web3.toWei('1', 'ether');
    var seuil = web3.toWei('0.25', 'ether');
    it("donate " + amount + " wei", async function() {
      await donation.sendTransaction({value: amount, from: ADDR_DEPLOYER, to: donation.address});
    });
    it('it rejects a distributecalled by another address != ADDR_CERTIFIER', async function() {
      await assertRevert(donation.distribute(seuil, { from: ADDR_BENEF1}));
    });
  });

  describe('Try to unregister a non existing account', async function () {
    it('rejects unregistering a non existing account', async function () {
      await assertRevert(donation.unregisterBeneficiary(ADDR_BENEF1, { from: ADDR_CERTIFIER}));
    });
  });

  describe('Try to unregister an existing account with another account != ADDR_CERTIFIER', async function () {
    it('it register a beneficiary account', async function () {
      await donation.registerBeneficiary(ADDR_BENEF1, { from: ADDR_CERTIFIER});
    });
    it('it unregister the beneficiary account', async function () {
      await assertRevert(donation.unregisterBeneficiary(ADDR_BENEF1, { from: ADDR_BENEF1}));
    });
  });

  describe('Make a donation', async function () {
    var amount = web3.toWei('1', 'ether');
    it("donate " + amount + " wei", async function() {
      await donation.sendTransaction({value: amount, from: ADDR_DEPLOYER, to: donation.address});
      var balance = await web3.eth.getBalance(donation.address);
      assert.equal(balance.toNumber(), amount, "contract balance should be 1 ether");
    });
   });

   describe('Unregister an existing account', async function () {
     it('it register & unregister a beneficiary', async function () {
       console.log("register beneficiary");
       var count = await donation.getBeneficiaryCount.call({"from": ADDR_CERTIFIER});
       assert.equal(count.toNumber(),0, "beneficiaries count should be 0");

       await donation.registerBeneficiary(ADDR_BENEF1, { from: ADDR_CERTIFIER});
       count = await donation.getBeneficiaryCount.call({"from": ADDR_CERTIFIER});
       assert.equal(count.toNumber(),1, "beneficiaries count should be 1");

       await donation.unregisterBeneficiary(ADDR_BENEF1, { from: ADDR_CERTIFIER});
       count = await donation.getBeneficiaryCount.call({"from": ADDR_CERTIFIER});
       assert.equal(count.toNumber(),0, "beneficiaries count should be 0");
     });
   });

  // test @ 0x7794AF39C0f498cD5347F82d239cd612A09fB9e1
  describe('Test donation', async function () {
    var amount = web3.toWei('1', 'ether');
    var seuil = web3.toWei('0.25', 'ether');
    var newBalance = web3.toWei('100.25', 'ether');
    var oldBalance = web3.toWei('100', 'ether');

    it('register beneficiaries account and make a distribute', async function () {
      await donation.registerBeneficiary(ADDR_BENEF1, { from: ADDR_CERTIFIER});
      var count = await donation.getBeneficiaryCount.call({"from": ADDR_CERTIFIER});
      assert.equal(count.toNumber(),1, "beneficiaries count should be 1");

      await donation.registerBeneficiary(ADDR_BENEF2, { from: ADDR_CERTIFIER});
      count = await donation.getBeneficiaryCount.call({"from": ADDR_CERTIFIER});
      assert.equal(count.toNumber(),2, "beneficiaries count should be 2");

      await donation.registerBeneficiary(ADDR_BENEF3, { from: ADDR_CERTIFIER});
      count = await donation.getBeneficiaryCount.call({"from": ADDR_CERTIFIER});
      assert.equal(count.toNumber(),3, "beneficiaries count should be 3");

      await donation.registerBeneficiary(ADDR_BENEF4, { from: ADDR_CERTIFIER});
      count = await donation.getBeneficiaryCount.call({"from": ADDR_CERTIFIER});
      assert.equal(count.toNumber(),4, "beneficiaries count should be 4");

      await donation.registerBeneficiary(ADDR_BENEF5, { from: ADDR_CERTIFIER});
      count = await donation.getBeneficiaryCount.call({"from": ADDR_CERTIFIER});
      assert.equal(count.toNumber(),5, "beneficiaries count should be 5");

      await donation.sendTransaction({value: amount, from: ADDR_DEPLOYER, to: donation.address});
      await donation.distribute(seuil, {from: ADDR_CERTIFIER});


      var balance4 = await web3.eth.getBalance(ADDR_BENEF4);
      assert.equal(balance4.toNumber(), newBalance, "contract balance should be  100,25 ether");

      var balance5 = await web3.eth.getBalance(ADDR_BENEF5);
      assert.equal(balance5.toNumber(), oldBalance, "contract balance should be  100 ether");

    });
  });
});
