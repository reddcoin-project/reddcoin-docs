% This file is licensed under the MIT License (MIT) available on
% http://opensource.org/licenses/MIT.

# getinterest

`getinterest ( start end )`

Returns the total available balance.

The available balance is what the wallet considers currently spendable, and is
thus affected by options which limit spendability such as -spendzeroconfchange.

## Argument #1 - start

**Type:** numeric, optional, default=0

Start time (unixtime).

## Argument #2 - end

**Type:** numeric, optional, default=-1

End time (unixtime).

## Result

```{eval-rst}
.. list-table::
   :header-rows: 1

   * - Name
     - Type
     - Description
   * - n
     - numeric
     - The total amount in RDD interest generated for this wallet.
```

## Examples

```{highlight} shell
```

The total amount of interest generated for this wallet:

```
reddcoin-cli getinterest
```

The total amount of interest generated for this wallet from start time:

```
reddcoin-cli getinterest 16123456789
```

The total amount of interest generated for this wallet between start and end time:

```
reddcoin-cli getinterest 16123456789 1685591657
```

As a JSON-RPC call:

```
curl --user myusername --data-binary '{"jsonrpc": "1.0", "id": "curltest", "method": "getinterest", "params": [16123456789]}' -H 'content-type: text/plain;' http://127.0.0.1:45443/
```

