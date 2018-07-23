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
import latestTime from './helpers/latestTime';
import { increaseTimeTo, duration } from './helpers/increaseTime';

var truffleConfig = require('../../solidity/truffle.json');
var Donation = artifacts.require("Donation");
var PrivilegeRequest = artifacts.require("PrivilegeRequest");
var Privilege =  artifacts.require("Privilege");

var ADDR_DEPLOYER = truffleConfig.donation_dev.addr_deployer;
var ADDR_CERTIFIER = truffleConfig.donation_dev.addr_deployer;
var ADDR_BENEF1 = truffleConfig.donation_dev.addr_benef1;
var ADDR_DAVID = truffleConfig.donation_dev.addr_benef2;
var ADDR_BERNARD = truffleConfig.donation_dev.addr_benef3;
var ADDR_CHARLES = truffleConfig.donation_dev.addr_benef4;
var ADDR_ALICE = truffleConfig.donation_dev.addr_benef5;


contract('Donation', function(accounts) {
  var donation;
  var privilegeRequest;
  const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';


   async function setupContracts() {

    // Deploy donation contract
    const don = await Donation.new({from : ADDR_DEPLOYER});
    console.log('  >> Donation deployed at address ', don.address);

    // Deploy privilege request contract
    const privilege = await PrivilegeRequest.new(don.address, {from : ADDR_DEPLOYER});
    console.log('  >> Privilege request contract deployed at address ', privilege.address);

    // Set up privilege request address contract
    await don.setPrivilegeRequestAddress(privilege.address, {from : ADDR_DEPLOYER});
    await don.privilegeRequest.call({from : ADDR_DEPLOYER}).then(function(privilegeRequest){
        console.log('  >> Privilege request contract set ', privilegeRequest);
    });
    return {don, privilege}

  }

  beforeEach('Redeploy', async function () {
    const contracts = await setupContracts();
    donation = contracts.don;
    privilegeRequest = contracts.privilege;
  });

  // The donation contract as a balance of 0 ether at first.
  it('it check if the donation contract has a balance of 0 ether at first', async function () {
    assert.equal(await web3.eth.getBalance(donation.address), web3.toWei('0', 'ether'));
  });

  // Charles sends 1 ether to the privilege request contract,
  // the PRC create a privilege contract to Charles and retransfer his 1 ether
  it('it check the creation of a privilege contract to Charles', async function () {
    var amount = web3.toWei('1', 'ether');
    var oldBalance = await web3.eth.getBalance(ADDR_CHARLES);

    // The donation contract has a balance of  1 ether
    await donation.sendTransaction({value: amount, from: ADDR_BENEF1, to: donation.address});
    // check if the donation contract receives his 1 ether
    assert.equal(web3.eth.getBalance(donation.address), web3.toWei('1', 'ether'));
    // Charles sends 1 privilege to the Privilege Request Contract.
    await privilegeRequest.sendTransaction({value: amount, from: ADDR_CHARLES, to: privilegeRequest.address, gasPrice: 0});
    var privilege_address_charles = (await donation.getPrivilegeAdr(ADDR_CHARLES)).valueOf();
    console.log(" The address of privilege contract of Charles is " + privilege_address_charles);
    // Charles gets back his 1 ether sent to the privilegeRequest
    var actualBalance = await web3.eth.getBalance(ADDR_CHARLES);
    assert.equal(actualBalance.valueOf(), oldBalance.valueOf());
    // Charles gets a privilege contract with 0 privilege.
    var privilege_charles = await donation.getPrivileges(privilege_address_charles);
    assert.equal(privilege_charles.valueOf(), 0);
  });


  // create privilege contract and simulate a distibution
  it('it simulate the distribution process', async function () {
    var amount = web3.toWei('1', 'ether');
    var oldBalance_alice = await web3.eth.getBalance(ADDR_ALICE);
    var oldBalance_charles = await web3.eth.getBalance(ADDR_CHARLES);
    var oldBalance_david = await web3.eth.getBalance(ADDR_DAVID);

    // The donation contract has a balance of  1 ether
    await donation.sendTransaction({value: amount, from: ADDR_BENEF1, to: donation.address});
    assert.equal(await web3.eth.getBalance(donation.address), web3.toWei('1', 'ether'));

    // Create Privilege contracts to Alice, Charles and David

    // Alice sends 1 privilege to the Privilege Request Contract.
    await privilegeRequest.sendTransaction({value: amount, from: ADDR_ALICE, to: privilegeRequest.address, gasPrice: 0});
    var privilege_address_alice = (await donation.getPrivilegeAdr(ADDR_ALICE)).valueOf();
    // The privilege contract of ALice is created
    console.log(" The address of privilege contract of Alice is " + privilege_address_alice);
    // Alice gets back his 1 ether sent to the privilegeRequest
    var actualBalance_alice = await web3.eth.getBalance(ADDR_ALICE);
    assert.equal(actualBalance_alice.valueOf(), oldBalance_alice.valueOf());
    // Alice gets a privilege contract with 0 privilege.
    var privilege_alice = await donation.getPrivileges(privilege_address_alice);
    assert.equal(privilege_alice.valueOf(), web3.toWei('0','ether'));
    // Bernard sends 1 ether to Alice's Privilege Contract
    await web3.eth.sendTransaction({value: amount, from: ADDR_BERNARD, to: privilege_address_alice, gasPrice: 0});
    // Alice now has 1 privilege.
    var privilege_alice = await donation.getPrivileges(privilege_address_alice);
    assert.equal(privilege_alice.valueOf(), web3.toWei('1','ether'));

    // Charles sends 1 privilege to the Privilege Request Contract.
    await privilegeRequest.sendTransaction({value: amount, from: ADDR_CHARLES, to: privilegeRequest.address, gasPrice: 0});
    var privilege_address_charles = (await donation.getPrivilegeAdr(ADDR_CHARLES)).valueOf();
    // The privilege contract of Charles is created
    console.log(" The address of privilege contract of Charles is " + privilege_address_charles);
    // Charles gets back his 1 ether sent to the privilegeRequest
    var actualBalance_charles = await web3.eth.getBalance(ADDR_CHARLES);
    assert.equal(actualBalance_charles.valueOf(), oldBalance_charles.valueOf());
    // Charles gets a privilege contract with 0 privilege.
    var privilege_charles = await donation.getPrivileges(privilege_address_charles);
    assert.equal(privilege_charles.valueOf(), 0);
    // Charles sends 0.01 privilege to the Privilege Request Contract.
    await web3.eth.sendTransaction({value: web3.toWei('0.01', 'ether'), from: ADDR_CHARLES, to: privilege_address_charles, gasPrice: 0});
    actualBalance_charles = await web3.eth.getBalance(ADDR_CHARLES);
   // Charles gets a privilege contract with 0.01 privilege.
   var privilege_charles = await donation.getPrivileges(privilege_address_charles);
   assert.equal(privilege_charles.valueOf(), web3.toWei('0.01','ether'));

    // David calls the donation contract for a distribution.
    await donation.distribute({from : ADDR_DAVID, gasPrice: 0});

    // Donation contract sends 0.01 ETH to Alice and decrements her privilege by 0.005 (half of ethers distributed)
    var newBalance_alice = actualBalance_alice.add(web3.toWei('0.01','ether'));
    assert.equal(newBalance_alice.valueOf(), (await web3.eth.getBalance(ADDR_ALICE)).valueOf(), '1');
    // Alice now has 0.995 privilege.
    var privilege_alice = await donation.getPrivileges(privilege_address_alice);
    assert.equal(privilege_alice.valueOf(), web3.toWei('0.995', 'ether'), '2');

    // Charles only received 0.01 ETH and its privilege is now at 0.005
    var newBalance_charles = actualBalance_charles.add(web3.toWei('0.01','ether'));
    assert.equal(newBalance_charles.valueOf(), (await web3.eth.getBalance(ADDR_CHARLES)).valueOf(), '3');
    var privilege_charles = await donation.getPrivileges(privilege_address_charles);
    assert.equal(privilege_charles.valueOf(), web3.toWei('0.005','ether'), '4');

    // David is not a beneficiary so he received no ether and still has no privilege
    assert.equal(await donation.getPrivilegeAdr(ADDR_DAVID), ZERO_ADDRESS, '5');
    // David receives no ETH (he has no privilege).
    assert.equal(oldBalance_david.valueOf(), (await web3.eth.getBalance(ADDR_DAVID)).valueOf(),'6');

    // David calls for a distribution once again (without waiting) : It fails (because he did not wait not enough).
    await assertRevert(donation.distribute({from: ADDR_DAVID, gasPrice: 0}));

    // David waits for 1 hour.
    // He calls for a distribution once more : It does not fail (he waited long enough).
    // calculate the distribution period to respect (1 hour after the first distribution)
    var distribution_period_to_respect = latestTime() + duration.hours(1);
    // increase the time to 1 hour
    await increaseTimeTo(distribution_period_to_respect);

    // second distribution after 1 hour
    await donation.distribute({from: ADDR_DAVID, gasPrice:0});

    // Alice receives 0.01 ETH and now has 0.99 privilege
    var privilege_alice = await donation.getPrivileges(privilege_address_alice);
    assert.equal(privilege_alice.valueOf(), web3.toWei('0.99','ether'), '7');

    // Charles receives no ETH (he has less than 0.01 privilege)
    assert.equal((await web3.eth.getBalance(ADDR_CHARLES)).valueOf(), newBalance_charles.valueOf(), '8');

    // David is not a beneficiary so he received no ether and still has no privilege
    assert.equal(await donation.getPrivilegeAdr(ADDR_DAVID), ZERO_ADDRESS, '9');
    // David receives no ETH (he has no privilege).
    assert.equal(oldBalance_david.valueOf(), (await web3.eth.getBalance(ADDR_DAVID)).valueOf(), '10');

    // Charles sends 1 ETH to his privilege contract.
    web3.eth.sendTransaction({value: web3.toWei('1', 'ether'), from: ADDR_CHARLES, to: privilege_address_charles});
    // He now has 1.005 privilege.
    var privilege_charles = await donation.getPrivileges(privilege_address_charles);
    assert.equal(privilege_charles.valueOf(), web3.toWei('1.005','ether'), '12');

  });

  // Try to make a distribute when donation contract have no beneficiary
  describe('Try to make a distribute when beneficiaries count == 0', async function () {
    var amount = web3.toWei('1', 'ether');
    it("it donate 1 ether and try to make a distribute", async function() {
      await donation.sendTransaction({value: amount, from: ADDR_DEPLOYER, to: donation.address});
      // distribute fail because the contract contains no beneficiary
      await assertRevert(donation.distribute({ from: ADDR_CERTIFIER}));
    });
  });

  // Make all the process of registerBeneficiary after check if it's added
  // Try to make a distribute when the donation balance == 0 ether
  describe('Register a beneficiary account and try to make a distribute with a balance == 0', async function () {
    var amount = web3.toWei('1', 'ether');
    it('it register a beneficiary ', async function () {
      // The Privilege Request Contract (Contrat de Demande de Privilege) can register beneficiaries.
      await privilegeRequest.sendTransaction({value: amount, from: ADDR_ALICE, to: privilegeRequest.address, gasPrice: 0});
      // fails because the donation contract contains 0 ether
      await assertRevert(donation.distribute({ from: ADDR_CERTIFIER}));
    });
  });

  // Bernard cannot register beneficiaries (nor can anybody)
  describe('Try to register a beneficiary account from account != privilege Request contract ', async function () {
    it('it try to register a beneficiary ', async function () {
      // fails because only the privilege request contract can register beneficiary
      await assertRevert(donation.registerBeneficiary(ADDR_BENEF1, ADDR_BENEF1, { from: ADDR_BERNARD}));
    });
  });

  // Bernard cannot update his privileges (nor can anybody)
  describe('Update privileges from another account', async function () {
    var amount = web3.toWei('1', 'ether');
    it('it register a beneficiary & try to update privileges', async function () {
      await privilegeRequest.sendTransaction({value: amount, from: ADDR_ALICE, to: privilegeRequest.address, gasPrice: 0});
      // Bernard try to update the number of his privileges, but is fails
      await assertRevert(donation.updatePrivileges(100,{ from: ADDR_BERNARD}));
    });
  });

  // Try to make a donation
  describe('Make a donation', async function () {
    var amount = web3.toWei('1', 'ether');

    it("donate " + amount + " wei", async function() {
      await donation.sendTransaction({value: amount, from: ADDR_DEPLOYER, to: donation.address});
      var balance = await web3.eth.getBalance(donation.address);
      assert.equal(balance.toNumber(), amount, "contract balance should be 1 ether");
    });
   });

   // Launch the distribute function twice in one hour
   describe('Try to make a distribution twice in one hour', async function () {
     var amount = web3.toWei('1', 'ether');
     it("it register, donate and make two distribution", async function() {
       // register a beneficiary from privilege Request contract
       await privilegeRequest.sendTransaction({value: amount, from: ADDR_ALICE, to: privilegeRequest.address, gasPrice: 0});
       // donate 1 ether to the donation contract
       await donation.sendTransaction({value: amount, from: ADDR_DEPLOYER, to: donation.address});
       // check balance of the donation contract
       var balance = await web3.eth.getBalance(donation.address);
       assert.equal(balance.toNumber(), amount, "contract balance should be 1 ether");
       // make the first distribution
       await donation.distribute({from: ADDR_CERTIFIER});
       // try to make a second distribution (but, fails)
       await assertRevert(donation.distribute({from: ADDR_CERTIFIER}));
     });
    });

    // Make a first distribution and a second one after 1h
    describe('Try to make a first distribution and another one after 1h', async function () {
      var amount = web3.toWei('1', 'ether');
      it("it register, donate and make two distribution", async function() {
        // register a beneficiary
        await privilegeRequest.sendTransaction({value: amount, from: ADDR_ALICE, to: privilegeRequest.address, gasPrice: 0});
        // donate 1 ether to the donation contract
        await donation.sendTransaction({value: amount, from: ADDR_DEPLOYER, to: donation.address});
        // check balance of the donation contract
        var balance = await web3.eth.getBalance(donation.address);
        assert.equal(balance.toNumber(), amount, "contract balance should be 1 ether");
        // make the first distribution
        await donation.distribute({from: ADDR_CERTIFIER});
        // calculate the distribution period to respect (1 hour after the first distribution)
        var distribution_period_to_respect = latestTime() + duration.hours(1);
        // increase the time to 1 hour
        await increaseTimeTo(distribution_period_to_respect);
        // second distribution after 1 hour
        await donation.distribute({from: ADDR_CERTIFIER});
      });
     });

});
