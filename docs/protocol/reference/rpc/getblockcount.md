# getblockcount

`getblockcount`

Returns the height of the most-work fully-validated chain.

The genesis block has height 0.

## Result

| Name | Type | Description |
| --- | --- | --- |
| n | numeric | The current block count |

## Examples

```shell
reddcoin-cli getblockcount
curl --user myusername --data-binary '`{"jsonrpc": "1.0", "id": "curltest", "method": "getblockcount", "params": []}`' -H 'content-type: text/plain;' http://127.0.0.1:45443/
```

