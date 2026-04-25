# abortrescan

`abortrescan`

Stops current wallet rescan triggered by an RPC call, e.g. by an importprivkey call.

Note: Use "getwalletinfo" to query the scanning progress.

## Result

```{eval-rst}
.. list-table::
   :header-rows: 1

   * - Name
     - Type
     - Description
   * - true|false
     - boolean
     - Whether the abort was successful
```

## Examples

Import a private key:

```shell
reddcoin-cli importprivkey "mykey"
Abort the running wallet rescan:
```

```
reddcoin-cli abortrescan
```

As a JSON-RPC call:

```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id": "curltest", "method": "abortrescan", "params": []}' -H 'content-type: text/plain;' http://127.0.0.1:45443/
```

