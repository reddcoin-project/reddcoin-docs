% This file is licensed under the MIT License (MIT) available on
% http://opensource.org/licenses/MIT.

# getstakinginfo

`getstakinginfo`

Returns a json object containing staking-related information.

## Result

```
{                              (json object)
  "enabled" : true|false,      (boolean) If staking enabled or not
  "staking" : true|false,      (boolean) If currently staking
  "chain" : "str",             (string) current network name (main, test, signet, regtest)
  "blocks" : n,                (numeric) The current block
  "currentblockweight" : n,    (numeric, optional) The block weight of the last assembled block (only present if a block was ever assembled)
  "currentblocktx" : n,        (numeric, optional) The number of block transactions of the last assembled block (only present if a block was ever assembled)
  "difficulty" : n,            (numeric) The current difficulty
  "networkhashps" : n,         (numeric) The network hashes per second
  "pooledtx" : n,              (numeric) The size of the mempool
  "search-interval" : n,       (numeric) last search interval
  "averageweight" : n,         (numeric) the average staking weight
  "totalweight" : n,           (numeric) the total staking weight
  "netstakeweight" : n,        (numeric) the network staking weight
  "expectedtime" : n,          (numeric) approximate time till next stake
  "warnings" : "str"           (string) any network and blockchain warnings
}
```

## Examples

```{highlight} shell
```

```
reddcoin-cli getstakinginfo
```

```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id": "curltest", "method": "getstakinginfo", "params": []}' -H 'content-type: text/plain;' http://127.0.0.1:45443/
```

