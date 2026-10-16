---
title: Roman to Integer
leetcode: roman-to-integer
description: "Roman to Integer explained: convert a Roman numeral to a number by adding symbol values and subtracting a symbol that stands before a larger one, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given a string `s` holding a valid Roman numeral and must return the number it represents. The seven symbols are worth:

| Symbol | I | V | X | L | C | D | M |
|---|---|---|---|---|---|---|---|
| Value | 1 | 5 | 10 | 50 | 100 | 500 | 1000 |

Symbols are normally written from largest to smallest and their values are added: `XXVII` is `10 + 10 + 5 + 1 + 1 = 27`. Six cases use subtraction instead, where a smaller symbol stands right before a larger one: `IV` (4), `IX` (9), `XL` (40), `XC` (90), `CD` (400) and `CM` (900).

The input is always a well-formed numeral for a number from 1 to 3999, between 1 and 15 characters long.

## Examples

- `s = "LXXVIII"` → `78`. Every symbol is at least as large as the one after it, so just add: `50 + 10 + 10 + 5 + 1 + 1 + 1`.
- `s = "CDXLIV"` → `444`. Three subtractive pairs: `CD = 400`, `XL = 40`, `IV = 4`.
- `s = "MMXXVI"` → `2026`.
- `s = "IX"` → `9`. The `I` comes before the larger `X`, so it is subtracted.

## Key idea

Look at each symbol together with the one right after it. If the next symbol is **larger**, the current symbol is part of a subtractive pair, so its value counts negatively. Otherwise its value counts positively. For `CDXLIV`: `C` is before `D` (−100), `D` (+500), `X` before `L` (−10), `L` (+50), `I` before `V` (−1), `V` (+5), and the total is 444. One pass over the string is enough, with no special list of the six pairs.

## Approach

1. Store the value of each symbol in a lookup table.
2. Set `total = 0`. For each index `i`:
   1. Let `v` be the value of `s[i]`.
   2. If there is a next symbol and its value is greater than `v`, subtract `v` from `total`.
   3. Otherwise add `v` to `total`.
3. Return `total`.

An equivalent approach scans from right to left, keeping the largest value seen so far: a symbol smaller than that is subtracted, any other is added.

## Complexity

- **Time:** O(n), where n is the length of `s`: one lookup and comparison per symbol. Since n is at most 15, this is effectively constant.
- **Space:** O(1). The lookup table always holds seven entries.

## Common mistakes

- Comparing with the previous symbol instead of the next one. That version only works if you subtract the previous value twice (once to undo having added it), which is easy to get wrong.
- Reading past the end of the string when checking the next symbol on the last character.
- Hard-coding the six pairs as two-character tokens and then mishandling the order in which they are matched. The compare-with-next rule covers all of them at once.

## Follow-up questions

- Convert the other way, from a number to a Roman numeral. (Integer to Roman: greedily subtract the largest value from a table that includes the six subtractive pairs.)
- How would you check that the input is a valid numeral? (Reject more than three repeats in a row, illegal pairs such as `IL` or `VX`, and symbols that increase in the wrong order; or convert back and compare.)

## Related problems

- Integer to Roman: the reverse conversion.
- String to Integer (atoi): another parse-a-number-from-text exercise with careful rules.

## Solutions

```python
class Solution:
    def romanToInt(self, s: str) -> int:
        value = {"I": 1, "V": 5, "X": 10, "L": 50, "C": 100, "D": 500, "M": 1000}
        total = 0
        for i, ch in enumerate(s):
            v = value[ch]
            if i + 1 < len(s) and value[s[i + 1]] > v:
                total -= v  # a smaller symbol before a larger one is subtracted
            else:
                total += v
        return total
```

```java
class Solution {
    public int romanToInt(String s) {
        Map<Character, Integer> value = Map.of('I', 1, 'V', 5, 'X', 10, 'L', 50, 'C', 100, 'D', 500, 'M', 1000);
        int total = 0;
        for (int i = 0; i < s.length(); i++) {
            int v = value.get(s.charAt(i));
            if (i + 1 < s.length() && value.get(s.charAt(i + 1)) > v) {
                total -= v; // a smaller symbol before a larger one is subtracted
            } else {
                total += v;
            }
        }
        return total;
    }
}
```

```cpp
class Solution {
public:
    int romanToInt(string s) {
        unordered_map<char, int> value = {{'I', 1}, {'V', 5}, {'X', 10}, {'L', 50}, {'C', 100}, {'D', 500}, {'M', 1000}};
        int total = 0;
        for (size_t i = 0; i < s.size(); i++) {
            int v = value[s[i]];
            if (i + 1 < s.size() && value[s[i + 1]] > v) {
                total -= v;  // a smaller symbol before a larger one is subtracted
            } else {
                total += v;
            }
        }
        return total;
    }
};
```

```javascript
/**
 * @param {string} s
 * @return {number}
 */
var romanToInt = function (s) {
  const value = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  let total = 0;
  for (let i = 0; i < s.length; i++) {
    const v = value[s[i]];
    if (i + 1 < s.length && value[s[i + 1]] > v) {
      total -= v; // a smaller symbol before a larger one is subtracted
    } else {
      total += v;
    }
  }
  return total;
};
```

```go
func romanToInt(s string) int {
	value := map[byte]int{'I': 1, 'V': 5, 'X': 10, 'L': 50, 'C': 100, 'D': 500, 'M': 1000}
	total := 0
	for i := 0; i < len(s); i++ {
		v := value[s[i]]
		if i+1 < len(s) && value[s[i+1]] > v {
			total -= v // a smaller symbol before a larger one is subtracted
		} else {
			total += v
		}
	}
	return total
}
```
