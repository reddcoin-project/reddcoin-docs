% This file is licensed under the MIT License (MIT) available on
% http://opensource.org/licenses/MIT.

# setstaking

`setstaking ( enabled load_on_startup )`

Gets or sets the current staking configuration.

When called without an argument, returns the current status of staking for all loaded wallets.

When called with an argument, enables or disables staking for the currently selected wallet.

## Argument #1 - enabled

**Type:** boolean, optional

To enable or disable staking.

## Argument #2 - load_on_startup

**Type:** boolean, optional

Save wallet name to persistent settings and load on startup. True to add wallet to staking list, false to remove, null to leave unchanged.

## Result (for enabled = null)

```
[                                  (json array)
  {                                (json object)
    "wallet_name" : true|false     (boolean) If staking is enabled for wallet or not. false:inactive, true:active
  },
  ...
]
```

## Result (for enabled = true|false)

```
{                            (json object)
  "enabled" : true|false,    (boolean) If staking is enabled for wallet or not. false:inactive, true:active
  "error" : "str",           (string) Error Message
  "warning" : "str"          (string) Warning Message
}
```

## Examples

```shell
reddcoin-cli staking "[\"all\"]" "[\"http\"]"
curl --user myusername --data-binary '`{"jsonrpc": "1.0", "id": "curltest", "method": "staking", "params": [["all"], ["libevent"]]}`' -H 'content-type: text/plain;' http://127.0.0.1:45443/
```

