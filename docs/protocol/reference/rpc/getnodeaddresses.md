% This file is licensed under the MIT License (MIT) available on
% http://opensource.org/licenses/MIT.

# getnodeaddresses

`getnodeaddresses ( count "network" )`

Return known addresses, which can potentially be used to find new nodes in the network.

## Argument #1 - count

**Type:** numeric, optional, default=1

The maximum number of addresses to return. Specify 0 to return all known addresses.

## Argument #2 - network

**Type:** string, optional, default=all networks

Return only addresses of the specified network. Can be one of: ipv4, ipv6, onion, i2p.

## Result

```
[                         (json array)
  {                       (json object)
    "time" : xxx,         (numeric) The UNIX epoch time when the node was last seen
    "services" : n,       (numeric) The services offered by the node
    "address" : "str",    (string) The address of the node
    "port" : n,           (numeric) The port number of the node
    "network" : "str"     (string) The network (ipv4, ipv6, onion, i2p) the node connected through
  },
  ...
]
```

## Examples

```{highlight} shell
```

```
reddcoin-cli getnodeaddresses 8
```

```
reddcoin-cli getnodeaddresses 4 "i2p"
```

```
reddcoin-cli -named getnodeaddresses network=onion count=12
```

```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id": "curltest", "method": "getnodeaddresses", "params": [8]}' -H 'content-type: text/plain;' http://127.0.0.1:45443/
```

```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id": "curltest", "method": "getnodeaddresses", "params": [4, "i2p"]}' -H 'content-type: text/plain;' http://127.0.0.1:45443/
```

