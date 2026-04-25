# uptime

`uptime`

Returns the total uptime of the server.

## Result

```{eval-rst}
.. list-table::
   :header-rows: 1

   * - Name
     - Type
     - Description
   * - n
     - numeric
     - The number of seconds that the server has been running
```

## Examples

```shell
reddcoin-cli uptime
curl --user myusername --data-binary '`{"jsonrpc": "1.0", "id": "curltest", "method": "uptime", "params": []}`' -H 'content-type: text/plain;' http://127.0.0.1:45443/
```

