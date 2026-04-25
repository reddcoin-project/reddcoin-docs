% This file is licensed under the MIT License (MIT) available on
% http://opensource.org/licenses/MIT.

# getzmqnotifications

`getzmqnotifications`

Returns information about the active ZeroMQ notifications.

## Result

```
[                         (json array)
  {                       (json object)
    "type" : "str",       (string) Type of notification
    "address" : "str",    (string) Address of the publisher
    "hwm" : n             (numeric) Outbound message high water mark
  },
  ...
]
```

## Examples

```{highlight} shell
```

```
reddcoin-cli getzmqnotifications
```

```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id": "curltest", "method": "getzmqnotifications", "params": []}' -H 'content-type: text/plain;' http://127.0.0.1:45443/
```

