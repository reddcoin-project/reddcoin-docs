# checkupdates

`checkupdates`

Returns details of the latest software update available.

## Result

```
{                                    (json object)
  "localversion" : n,                (numeric) The local version number
  "remoteversion" : n,               (numeric) The remote version number
  "updateavailable" : true|false,    (boolean) Is a remote update available
  "message" : "str",                 (string) Message confirming if you are on latest release version and where to download the latest version from
  "warning" : "str",                 (string) Any warning messages
  "officialDownloadLink" : "str",    (string) Official direct download link
  "errors" : "str"                   (string) Any error messages
}
```

## Examples

```shell
reddcoin-cli checkupdates
curl --user myusername --data-binary '`{"jsonrpc": "1.0", "id": "curltest", "method": "checkupdates", "params": []}`' -H 'content-type: text/plain;' http://127.0.0.1:45443/
```

