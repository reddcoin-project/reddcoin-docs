# dumpprivkey

`dumpprivkey "address"`

Reveals the private key corresponding to 'address'.

Then the importprivkey can be used with this output

## Argument #1 - address

**Type:** string, required

The reddcoin address for the private key

## Result

| Name | Type | Description |
| --- | --- | --- |
| str | string | The private key |

## Examples

```shell
reddcoin-cli dumpprivkey "myaddress"
reddcoin-cli importprivkey "mykey"
```

```
curl --user myusername --data-binary '`{"jsonrpc": "1.0", "id": "curltest", "method": "dumpprivkey", "params": ["myaddress"]}`' -H 'content-type: text/plain;' http://127.0.0.1:45443/
```

