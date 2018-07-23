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

var HDWalletProvider = require("truffle-hdwallet-provider");
var mnemonic = "door sadness shallow hire fame lesson wonder scan donate caution apple chicken";

// Allows us to use ES6 in our migrations and tests.
require('babel-register')({
  ignore: /node_modules\/(?!test\/helpers)/
});
require('babel-polyfill');
module.exports = {
  networks: {
    mainnet: {
      provider:  function() {
        return new HDWalletProvider(mnemonic, "https://mainnet.infura.io/M61bTRVBOvpealSVYTxe")
      },
      network_id: 1
    },
    ropsten: {
      provider: function() {
        return new HDWalletProvider(mnemonic, "https://ropsten.infura.io/M61bTRVBOvpealSVYTxe")
      },
      network_id: 3,
      gas: 4712387
    },
    development: {
     host: "localhost",
     port: 7545,
     network_id: "*",
     gas: 4712387
   }
  },
  rpc: {
        host: 'localhost',
        post:8080
   },
  optimizer: {
    enabled: true,
    runs: 200
  }
};
