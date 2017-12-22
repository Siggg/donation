# donation
Solidity smart contract that facilitates cryptomoney donations from philantrophists to people in need

## installation instructions

### create new account geth 
```
geth --datadir="~/dev/donation/data" account new
```
### intialize genesis for testnet
```
geth --datadir="~/dev/donation/data" init "customGENESIS.json"
```
### launch geth with testnet
```
geth --datadir "~/dev/donation/data" --identity "Participant1" --networkid "41514" --nodiscover --unlock "0" --port "30303"  --rpc --rpcaddr "localhost" --rpcport "8545" --rpcapi "admin,eth,miner,net,web3" --rpccorsdomain "*" --mine --minerthreads 1 --autodag --nat "any" --maxpeers "2" 
```
### compile contracts
```
cd solidity
truffle compile -all
```
### deploy contracts
```
truffle migrate --reset
```
