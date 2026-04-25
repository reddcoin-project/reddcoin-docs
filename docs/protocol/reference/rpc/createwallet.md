# createwallet

`createwallet "wallet_name" ( disable_private_keys blank "passphrase" avoid_reuse descriptors load_on_startup external_signer )`

Creates and loads a new wallet.

## Argument #1 - wallet_name

**Type:** string, required

The name for the new wallet. If this is a path, the wallet will be created at the path location.

## Argument #2 - disable_private_keys

**Type:** boolean, optional, default=false

Disable the possibility of private keys (only watchonlys are possible in this mode).

## Argument #3 - blank

**Type:** boolean, optional, default=false

Create a blank wallet. A blank wallet has no keys or HD seed. One can be set using sethdseed.

## Argument #4 - passphrase

**Type:** string, optional

Encrypt the wallet with this passphrase.

## Argument #5 - avoid_reuse

**Type:** boolean, optional, default=false

Keep track of coin reuse, and treat dirty and clean coins differently with privacy considerations in mind.

## Argument #6 - descriptors

**Type:** boolean, optional, default=false

Create a native descriptor wallet. The wallet will use descriptors internally to handle address creation

## Argument #7 - load_on_startup

**Type:** boolean, optional

Save wallet name to persistent settings and load on startup. True to add wallet to startup list, false to remove, null to leave unchanged.

## Argument #8 - external_signer

**Type:** boolean, optional, default=false

Use an external signer such as a hardware wallet. Requires -signer to be configured. Wallet creation will fail if keys cannot be fetched. Requires disable_private_keys and descriptors set to true.

## Result

```
{                       (json object)
  "name" : "str",       (string) The wallet name if created successfully. If the wallet was created using a full path, the wallet_name will be the full path.
  "warning" : "str"     (string) Warning message if wallet was not loaded cleanly.
}
```

## Examples

```shell
reddcoin-cli createwallet "testwallet"
curl --user myusername --data-binary '`{"jsonrpc": "1.0", "id": "curltest", "method": "createwallet", "params": ["testwallet"]}`' -H 'content-type: text/plain;' http://127.0.0.1:45443/
reddcoin-cli -named createwallet wallet_name=descriptors avoid_reuse=true descriptors=true load_on_startup=true
curl --user myusername --data-binary '`{"jsonrpc": "1.0", "id": "curltest", "method": "createwallet", "params": {"wallet_name":"descriptors","avoid_reuse":true,"descriptors":true,"load_on_startup":true}}`' -H 'content-type: text/plain;' http://127.0.0.1:45443/
```

