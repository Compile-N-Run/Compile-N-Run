---
title: Integer to Roman
leetcode: integer-to-roman
description: "Integer to Roman explained: turn a number from 1 to 3999 into a Roman numeral by greedily taking the largest symbol value from a table that includes the six subtractive pairs, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given an integer `num` between 1 and 3999 and must return it written as a Roman numeral. The seven symbols are worth:

| Symbol | I | V | X | L | C | D | M |
|---|---|---|---|---|---|---|---|
| Value | 1 | 5 | 10 | 50 | 100 | 500 | 1000 |

A numeral is written from the largest symbol to the smallest, and the values are added up. Two extra rules decide the exact spelling:

- A digit of 4 or 9 uses subtraction: a smaller symbol right before a larger one. Only six such pairs exist: `IV` (4), `IX` (9), `XL` (40), `XC` (90), `CD` (400) and `CM` (900).
- The powers of ten (`I`, `X`, `C`, `M`) may repeat up to three times in a row; `V`, `L` and `D` never repeat. So 4 is `IV`, never `IIII`.

There is exactly one correct spelling for every number in the range.

## Examples

- `num = 68` → `"LXVIII"`: `50 + 10 + 5 + 1 + 1 + 1`.
- `num = 944` → `"CMXLIV"`: `900 (CM) + 40 (XL) + 4 (IV)`.
- `num = 2026` → `"MMXXVI"`.
- `num = 3999` → `"MMMCMXCIX"`, the largest allowed input.

## Key idea

Treat the six subtractive pairs as if they were extra symbols. Then the table has 13 "symbols", from `M` (1000) down to `I` (1), and the numeral is built greedily: always write the largest symbol that still fits into what is left, subtract its value, and repeat. Because `CM`, `CD`, `XC`, `XL`, `IX` and `IV` are in the table, the greedy choice automatically produces `CM` for 900 instead of `DCCCC`.

## Approach

1. List the 13 value/symbol pairs in decreasing order: 1000 `M`, 900 `CM`, 500 `D`, 400 `CD`, 100 `C`, 90 `XC`, 50 `L`, 40 `XL`, 10 `X`, 9 `IX`, 5 `V`, 4 `IV`, 1 `I`.
2. Start with an empty result. For each pair, while `num` is at least the value, append the symbol and subtract the value from `num`.
3. When the table is exhausted, `num` is 0. Return the result.

An equivalent approach handles each decimal digit separately with four lookup arrays (thousands, hundreds, tens, ones), for example `hundreds[9] = "CM"`. It does the same work with less looping but more typing.

## Complexity

- **Time:** O(1). The table has 13 entries and the output is at most 15 characters, whatever the input.
- **Space:** O(1) besides the output string.

## Common mistakes

- Leaving the subtractive pairs out of the table and trying to patch 4s and 9s afterwards, which leads to `IIII` or `VIIII`.
- Listing the table out of order (for example putting 900 after 500). Greedy only works when values go strictly down.
- Using `if` instead of `while`, so a symbol that should repeat (`MMM`, `XXX`) is written only once.

## Follow-up questions

- Convert in the other direction. ([Roman to Integer](/interview/problems/roman-to-integer/): add each symbol, but subtract one that stands before a larger symbol.)
- Why does greedy work here when it fails for some coin systems? (The table is designed so that each digit of the number maps to symbols independently, so taking the biggest piece never blocks a better spelling.)

## Related problems

- [Roman to Integer](/interview/problems/roman-to-integer/): the reverse conversion.
- Integer to English Words: another number-to-text conversion handled in chunks.

## Solutions

```python
class Solution:
    def intToRoman(self, num: int) -> str:
        table = [(1000, "M"), (900, "CM"), (500, "D"), (400, "CD"), (100, "C"), (90, "XC"),
                 (50, "L"), (40, "XL"), (10, "X"), (9, "IX"), (5, "V"), (4, "IV"), (1, "I")]
        parts = []
        for value, symbol in table:
            while num >= value:
                parts.append(symbol)
                num -= value
        return "".join(parts)
```

```java
class Solution {
    public String intToRoman(int num) {
        int[] values = {1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1};
        String[] symbols = {"M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I"};
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < values.length; i++) {
            while (num >= values[i]) {
                sb.append(symbols[i]);
                num -= values[i];
            }
        }
        return sb.toString();
    }
}
```

```cpp
class Solution {
public:
    string intToRoman(int num) {
        const int values[] = {1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1};
        const string symbols[] = {"M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I"};
        string result;
        for (int i = 0; i < 13; i++) {
            while (num >= values[i]) {
                result += symbols[i];
                num -= values[i];
            }
        }
        return result;
    }
};
```

```javascript
/**
 * @param {number} num
 * @return {string}
 */
var intToRoman = function (num) {
  const values = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
  const symbols = ["M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I"];
  let result = "";
  for (let i = 0; i < values.length; i++) {
    while (num >= values[i]) {
      result += symbols[i];
      num -= values[i];
    }
  }
  return result;
};
```

```go
import "strings"

func intToRoman(num int) string {
	values := []int{1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1}
	symbols := []string{"M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I"}
	var sb strings.Builder
	for i, v := range values {
		for num >= v {
			sb.WriteString(symbols[i])
			num -= v
		}
	}
	return sb.String()
}
```
