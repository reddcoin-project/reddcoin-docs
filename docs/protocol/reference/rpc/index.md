% This file is licensed under the MIT License (MIT) available on
% http://opensource.org/licenses/MIT.

# RPC API Reference

## Blockchain RPCs

```{toctree}
:maxdepth: 1

getbestblockhash
getblock
getblockchaininfo
getblockcount
getblockfilter
getblockhash
getblockheader
getblockstats
getchaintips
getchaintxstats
getdifficulty
getinflation
getinflationmultiplier
getmempoolancestors
getmempooldescendants
getmempoolentry
getmempoolinfo
getrawmempool
gettxout
gettxoutproof
gettxoutsetinfo
preciousblock
pruneblockchain
savemempool
scantxoutset
verifychain
verifytxoutproof
```

## Control RPCs

```{toctree}
:maxdepth: 1

checkupdates
getmemoryinfo
getrpcinfo
help
logging
stop
uptime
```

## Generating RPCs

```{toctree}
:maxdepth: 1

generateblock
generatetoaddress
generatetodescriptor
setstaking
staking
```

## Mining RPCs

```{toctree}
:maxdepth: 1

getblocktemplate
getmininginfo
getnetworkhashps
getstakinginfo
prioritisetransaction
submitblock
submitheader
```

## Network RPCs

```{toctree}
:maxdepth: 1

addnode
clearbanned
disconnectnode
getaddednodeinfo
getconnectioncount
getnettotals
getnetworkinfo
getnodeaddresses
getpeerinfo
listbanned
ping
setban
setnetworkactive
```

## Rawtransactions RPCs

```{toctree}
:maxdepth: 1

analyzepsbt
combinepsbt
combinerawtransaction
converttopsbt
createpsbt
createrawtransaction
decodepsbt
decoderawtransaction
decodescript
finalizepsbt
fundrawtransaction
getrawtransaction
joinpsbts
sendrawtransaction
signrawtransactionwithkey
testmempoolaccept
utxoupdatepsbt
```

## Signer RPCs

```{toctree}
:maxdepth: 1

enumeratesigners
```

## Util RPCs

```{toctree}
:maxdepth: 1

createmultisig
deriveaddresses
estimatesmartfee
getdescriptorinfo
getindexinfo
signmessagewithprivkey
validateaddress
verifymessage
```

## Wallet RPCs

**Note:** the wallet RPCs are only available if Bitcoin Core was built
with wallet support, which is the default.

```{toctree}
:maxdepth: 1

abandontransaction
abortrescan
addmultisigaddress
backupwallet
bumpfee
createwallet
dumpprivkey
dumpwallet
encryptwallet
getaddressesbylabel
getaddressinfo
getbalance
getbalances
gethdwalletinfo
getinterest
getnewaddress
getrawchangeaddress
getreceivedbyaddress
getreceivedbylabel
gettransaction
getunconfirmedbalance
getwalletinfo
importaddress
importdescriptors
importmulti
importprivkey
importprunedfunds
importpubkey
importwallet
keypoolrefill
listaddressgroupings
listdescriptors
listlabels
listlockunspent
listreceivedbyaddress
listreceivedbylabel
listsinceblock
listtransactions
listunspent
listwalletdir
listwallets
loadwallet
lockunspent
psbtbumpfee
removeprunedfunds
rescanblockchain
send
sendmany
sendtoaddress
sethdseed
setlabel
settxfee
setwalletflag
signmessage
signrawtransactionwithwallet
unloadwallet
upgradewallet
walletcreatefundedpsbt
walletdisplayaddress
walletlock
walletpassphrase
walletpassphrasechange
walletprocesspsbt
```

## Zmq RPCs

```{toctree}
:maxdepth: 1

getzmqnotifications
```

