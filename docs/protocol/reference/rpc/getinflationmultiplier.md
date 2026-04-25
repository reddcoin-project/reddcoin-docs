% This file is licensed under the MIT License (MIT) available on
% http://opensource.org/licenses/MIT.

# getinflationmultiplier

`getinflationmultiplier ( height )`

Returns details on the current inflationmultiplier.

## Argument #1 - height

**Type:** numeric, optional, default=0

Block height (default=current block tip).

## Result

```
{                      (json object)
  "height" : n,        (numeric) Block height
  "inflation" : n,     (numeric) Current inflation
  "multiplier" : n     (numeric) Current inflation multiplier
}
```

## Examples

```{highlight} shell
```

```
reddcoin-cli getinflationmultiplier
```

```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id": "curltest", "method": "getinflationmultiplier", "params": []}' -H 'content-type: text/plain;' http://127.0.0.1:45443/
```

