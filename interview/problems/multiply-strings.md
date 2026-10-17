---
title: Multiply Strings
leetcode: multiply-strings
description: "Multiply Strings explained: multiply two non-negative integers given as decimal strings with schoolbook digit-by-digit products into a result array, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given two non-negative integers `num1` and `num2` as strings of decimal digits. Return their product, also as a string.

The numbers can have up to 200 digits each, so they do not fit in any built-in integer type, and you may not use a big-integer library or convert the whole strings to numbers directly. Neither input has leading zeros except for the number `"0"` itself, and the result must not have leading zeros either.

## Examples

- `num1 = "12"`, `num2 = "34"` → `"408"`.
- `num1 = "999"`, `num2 = "999"` → `"998001"`.
- `num1 = "0"`, `num2 = "98765"` → `"0"`. Anything times zero is `"0"`, not `"00000"`.
- `num1 = "123456789"`, `num2 = "987654321"` → `"121932631112635269"`, a product that overflows 64-bit integers.

## Key idea

Do long multiplication the way it is taught at school, but keep every partial product in one shared array instead of writing rows and adding them at the end. If `num1` has `m` digits and `num2` has `n` digits, the product has at most `m + n` digits. The digit at index `i` of `num1` times the digit at index `j` of `num2` (indices from the left) contributes to positions `i + j` and `i + j + 1` of the result array, so every single-digit product can be added in place and the carries settled right away.

## Approach

1. If either string is `"0"`, return `"0"`.
2. Create an integer array `result` of length `m + n`, filled with zeros.
3. For `i` from the last digit of `num1` down to the first, and for `j` from the last digit of `num2` down to the first:
   1. Compute `product = digit(num1[i]) * digit(num2[j])` and add it to `result[i + j + 1]` (the low position).
   2. Carry the overflow: `result[i + j] += result[i + j + 1] / 10` and `result[i + j + 1] %= 10`.
4. Skip the leading zeros of `result` (there is at most one, at index 0), then join the digits into a string.

A simpler but slower variant builds each row (`num1` times one digit of `num2`, shifted) as a string and adds the rows with a string-addition helper; that is O((m + n) · n) with a lot of string copying, and the in-place array avoids it.

## Complexity

- **Time:** O(m · n), one constant-time step per pair of digits.
- **Space:** O(m + n) for the result array and the output string.

## Common mistakes

- Returning `"0000"` or `""` when one factor is zero; handle `"0"` first, or strip all leading zeros carefully.
- Converting with `int(num1) * int(num2)` (or `BigInteger`). It works in Python and Java but is exactly what the interviewer asked you not to do.
- Mixing up the positions: the product of digits at `i` and `j` lands at `i + j + 1`, with the carry going to `i + j`.
- Doing `num1[i] * num2[j]` on characters instead of their digit values (`c - '0'`).

## Follow-up questions

- How would you add two such strings? (Add Strings: walk both from the right with one carry.)
- Can it be done faster than O(m · n) for very long numbers? (Karatsuba multiplication splits each number in halves and uses three recursive products instead of four, for O(n^1.585).)

## Related problems

- [Add Two Numbers](/interview/problems/add-two-numbers/)
- Plus One
- Add Strings
- Add Binary

## Solutions

```python
class Solution:
    def multiply(self, num1: str, num2: str) -> str:
        if num1 == '0' or num2 == '0':
            return '0'
        m, n = len(num1), len(num2)
        result = [0] * (m + n)
        for i in range(m - 1, -1, -1):
            for j in range(n - 1, -1, -1):
                low = i + j + 1  # the digit product lands here, its carry one place left
                result[low] += (ord(num1[i]) - 48) * (ord(num2[j]) - 48)
                result[low - 1] += result[low] // 10
                result[low] %= 10
        start = 0 if result[0] else 1  # at most one leading zero
        return ''.join(map(str, result[start:]))
```

```java
class Solution {
    public String multiply(String num1, String num2) {
        if (num1.equals("0") || num2.equals("0")) return "0";
        int m = num1.length(), n = num2.length();
        int[] result = new int[m + n];
        for (int i = m - 1; i >= 0; i--) {
            for (int j = n - 1; j >= 0; j--) {
                int low = i + j + 1; // the digit product lands here, its carry one place left
                result[low] += (num1.charAt(i) - '0') * (num2.charAt(j) - '0');
                result[low - 1] += result[low] / 10;
                result[low] %= 10;
            }
        }
        StringBuilder sb = new StringBuilder();
        for (int k = result[0] == 0 ? 1 : 0; k < result.length; k++) sb.append(result[k]); // at most one leading zero
        return sb.toString();
    }
}
```

```cpp
class Solution {
public:
    string multiply(string num1, string num2) {
        if (num1 == "0" || num2 == "0") return "0";
        int m = num1.size(), n = num2.size();
        vector<int> result(m + n, 0);
        for (int i = m - 1; i >= 0; i--) {
            for (int j = n - 1; j >= 0; j--) {
                int low = i + j + 1;  // the digit product lands here, its carry one place left
                result[low] += (num1[i] - '0') * (num2[j] - '0');
                result[low - 1] += result[low] / 10;
                result[low] %= 10;
            }
        }
        string out;
        for (int k = result[0] == 0 ? 1 : 0; k < m + n; k++) out += char('0' + result[k]);  // at most one leading zero
        return out;
    }
};
```

```javascript
/**
 * @param {string} num1
 * @param {string} num2
 * @return {string}
 */
var multiply = function (num1, num2) {
  if (num1 === '0' || num2 === '0') return '0';
  const m = num1.length, n = num2.length;
  const result = new Array(m + n).fill(0);
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      const low = i + j + 1; // the digit product lands here, its carry one place left
      result[low] += (num1.charCodeAt(i) - 48) * (num2.charCodeAt(j) - 48);
      result[low - 1] += Math.floor(result[low] / 10);
      result[low] %= 10;
    }
  }
  return result.slice(result[0] === 0 ? 1 : 0).join(''); // at most one leading zero
};
```

```go
func multiply(num1 string, num2 string) string {
	if num1 == "0" || num2 == "0" {
		return "0"
	}
	m, n := len(num1), len(num2)
	result := make([]int, m+n)
	for i := m - 1; i >= 0; i-- {
		for j := n - 1; j >= 0; j-- {
			low := i + j + 1 // the digit product lands here, its carry one place left
			result[low] += int(num1[i]-'0') * int(num2[j]-'0')
			result[low-1] += result[low] / 10
			result[low] %= 10
		}
	}
	out := make([]byte, 0, m+n)
	start := 0
	if result[0] == 0 { // at most one leading zero
		start = 1
	}
	for _, d := range result[start:] {
		out = append(out, byte('0'+d))
	}
	return string(out)
}
```
