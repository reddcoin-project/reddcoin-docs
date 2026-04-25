% This file is licensed under the MIT License (MIT) available on
% http://opensource.org/licenses/MIT.

# disconnectnode

`disconnectnode ( "address" nodeid )`

Immediately disconnects from the specified peer node.

Strictly one out of 'address' and 'nodeid' can be provided to identify the node.

To disconnect by nodeid, either set 'address' to the empty string, or call using the named 'nodeid' argument only.

## Argument #1 - address

**Type:** string, optional, default=fallback to nodeid

The IP address/port of the node

## Argument #2 - nodeid

**Type:** numeric, optional, default=fallback to address

The node ID (see getpeerinfo for node IDs)

## Result

```
null    (json null)
```

## Examples

```shell
reddcoin-cli disconnectnode "192.168.0.6:45444"
reddcoin-cli disconnectnode "" 1
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id": "curltest", "method": "disconnectnode", "params": ["192.168.0.6:45444"]}' -H 'content-type: text/plain;' http://127.0.0.1:45443/
curl --user myusername --data-binary '`{"jsonrpc": "1.0", "id": "curltest", "method": "disconnectnode", "params": ["", 1]}`' -H 'content-type: text/plain;' http://127.0.0.1:45443/
```

