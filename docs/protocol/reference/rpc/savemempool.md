# savemempool

`savemempool`

Dumps the mempool to disk. It will fail until the previous dump is fully loaded.

## Result

```
null    (json null)
```

## Examples

```shell
reddcoin-cli savemempool
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id": "curltest", "method": "savemempool", "params": []}' -H 'content-type: text/plain;' http://127.0.0.1:45443/
```

