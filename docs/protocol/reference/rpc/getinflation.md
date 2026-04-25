% This file is licensed under the MIT License (MIT) available on
% http://opensource.org/licenses/MIT.

# getinflation

`getinflation ( height )`

Returns details on the current inflation.

## Argument #1 - height

**Type:** numeric, optional, default=0

Block height (default=current block tip).

## Result

```
{                     (json object)
  "height" : n,       (numeric) Block height
  "inflation" : n     (numeric) Current inflation
}
```

## Examples

```{highlight} shell
```

```
reddcoin-cli getinflation
```

```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id": "curltest", "method": "getinflation", "params": []}' -H 'content-type: text/plain;' http://127.0.0.1:45443/
```

