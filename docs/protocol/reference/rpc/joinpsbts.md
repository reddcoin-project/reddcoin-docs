# joinpsbts

`joinpsbts ["psbt",...]`

Joins multiple distinct PSBTs with different inputs and outputs into one PSBT with inputs and outputs from all of the PSBTs
No input in any of the PSBTs can be in more than one of the PSBTs.

## Argument #1 - txs

**Type:** json array, required

The base64 strings of partially signed transactions

```
[
  "psbt",    (string, required) A base64 string of a PSBT
  ...
]
```

## Result

```{eval-rst}
.. list-table::
   :header-rows: 1

   * - Name
     - Type
     - Description
   * - str
     - string
     - The base64-encoded partially signed transaction
```

## Examples

```shell
reddcoin-cli joinpsbts "psbt"
```