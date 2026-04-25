# pruneblockchain

`pruneblockchain height`

## Argument #1 - height

**Type:** numeric, required

The block height to prune up to. May be set to a discrete height, or to a UNIX epoch time

: to prune blocks whose block time is at least 2 hours older than the provided timestamp.

## Result

```{eval-rst}
.. list-table::
   :header-rows: 1

   * - Name
     - Type
     - Description
   * - n
     - numeric
     - Height of the last block pruned
```

## Examples

```shell
reddcoin-cli pruneblockchain 1000
curl --user myusername --data-binary '`{"jsonrpc": "1.0", "id": "curltest", "method": "pruneblockchain", "params": [1000]}`' -H 'content-type: text/plain;' http://127.0.0.1:45443/
```

