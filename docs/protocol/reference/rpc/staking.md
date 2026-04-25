# staking

`staking ( enabled )`

Gets or sets the current staking configuration.

When called without an argument, returns the current status of staking.

When called with an argument, enables or disables staking.

## Argument #1 - enabled

**Type:** boolean, optional

To enable or disable staking.

## Result

```
{                                    (json object)
  "enabled" : true|false,            (boolean) if staking is active or not. false:inactive, true:active
  "enabled_wallet" : [               (json array)
    {                                (json object)
      "wallet_name" : true|false     (boolean) If staking is enabled for wallet or not. false:inactive, true:active
    },
    ...
  ]
}
```

## Examples

```shell
reddcoin-cli staking "[\"all\"]" "[\"http\"]"
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id": "curltest", "method": "staking", "params": [["all"], ["libevent"]]}' -H 'content-type: text/plain;' http://127.0.0.1:45443/
```

