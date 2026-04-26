# gethdwalletinfo

`gethdwalletinfo`

Returns an object containing sensitive private info about this HD wallet.

## Result

```
{                                  (json object)
  "hdseed" : "str",                (string) The HD seed (bip32, in hex)
  "mnemonic" : "str",              (string) The mnemonic for this HD wallet (bip39, english words)
  "mnemonicpassphrase" : "str",    (string) The mnemonic passphrase for this HD wallet (bip39)
  "rootprivkey" : "str",           (string) The bip32 root private key
  "extendedprivkey" : "str",       (string) The bip32 extended private key
  "extendedpubkey" : "str"         (string) The bip32 extended public key
}
```

## Examples

```shell
reddcoin-cli gethdwalletinfo
reddcoin-cli gethdwalletinfo
```

```
curl --user myusername --data-binary '`{"jsonrpc": "1.0", "id": "curltest", "method": "gethdwalletinfo", "params": []}`' -H 'content-type: text/plain;' http://127.0.0.1:45443/
```

