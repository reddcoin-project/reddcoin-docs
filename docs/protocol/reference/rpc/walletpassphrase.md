% This file is licensed under the MIT License (MIT) available on
% http://opensource.org/licenses/MIT.

# walletpassphrase

`walletpassphrase "passphrase" timeout ( stakingonly )`

Stores the wallet decryption key in memory for 'timeout' seconds.

This is needed prior to performing transactions related to private keys such as sending reddcoins
Note:

Issuing the walletpassphrase command while the wallet is already unlocked will set a new unlock
time that overrides the old one.

## Argument #1 - passphrase

**Type:** string, required

The wallet passphrase

## Argument #2 - timeout

**Type:** numeric, required

The time to keep the decryption key in seconds; capped at 100000000 (~3 years).

## Argument #3 - stakingonly

**Type:** boolean, optional

If the wallet is unlocked for staking only

## Result

```
null    (json null)
```

## Examples

```{highlight} shell
```

Unlock the wallet for 60 seconds:

```
reddcoin-cli walletpassphrase "my pass phrase" 60
```

Unlock the wallet for 99999999 seconds for staking:

```
reddcoin-cli walletpassphrase "my pass phrase" 99999999 true
```

Lock the wallet again (before 60 seconds):

```
reddcoin-cli walletlock
```

As a JSON-RPC call:

```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id": "curltest", "method": "walletpassphrase", "params": ["my pass phrase", 60]}' -H 'content-type: text/plain;' http://127.0.0.1:45443/
```

As a JSON-RPC call:

```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id": "curltest", "method": "walletpassphrase", "params": ["my pass phrase", 99999999 true]}' -H 'content-type: text/plain;' http://127.0.0.1:45443/
```

