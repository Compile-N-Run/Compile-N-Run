---
title: String to Integer (atoi)
leetcode: string-to-integer-atoi
description: "String to Integer (atoi) explained: parse an optional sign and leading digits out of a string into a 32-bit integer, clamping on overflow before it happens, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

Write `myAtoi(s)`, a small version of the C library function that turns a string into a 32-bit signed integer. The string `s` can contain letters, digits, spaces, signs and dots, and may be empty. Read it from the left using these rules:

1. Skip any leading space characters (`' '` only).
2. The next character may be `'+'` or `'-'`; it sets the sign. If neither is present the number is positive.
3. Read digits until the first non-digit or the end of the string. Leading zeros are allowed. If there are no digits at all, the result is `0`.
4. Everything after the digits is ignored.
5. If the value is below `-2^31` (`-2147483648`) return `-2147483648`; if it is above `2^31 - 1` (`2147483647`) return `2147483647`.

## Examples

- `"   -17abc"` → `-17`. Skip spaces, read the sign, read `17`, ignore `abc`.
- `"+0042"` → `42`. The plus sign and leading zeros are fine.
- `"words 9"` → `0`. The first non-space character is a letter, so no digits are read.
- `"  +-3"` → `0`. Only one sign is allowed; `-3` after a `+` does not count.
- `"3.14"` → `3`. Reading stops at the dot.
- `"-91283472332"` → `-2147483648`. The value is below the 32-bit range, so it is clamped.

## Key idea

This is a careful left-to-right scan with a pointer: skip spaces, take at most one sign, then accumulate digits with `result = result * 10 + digit`. The only real trap is overflow. Instead of computing a large value and clamping afterwards (which needs a wider integer type), check **before** each step whether `result * 10 + digit` would exceed `2147483647`. The check `result > (2147483647 - digit) / 10` (integer division) is exact and uses only 32-bit arithmetic.

The negative limit `-2147483648` has a magnitude one larger than the positive one, but it does not need special handling: if the magnitude reaches `2147483648` we clamp, and the clamped negative value is exactly `-2147483648`, which is the right answer.

## Approach

1. Set `i = 0` and advance `i` while `s[i]` is a space.
2. Set `sign = 1`. If `s[i]` is `'-'`, set `sign = -1` and advance; if it is `'+'`, just advance.
3. Set `result = 0`. While `s[i]` is a digit:
   1. Let `d` be the digit's value.
   2. If `result > (INT_MAX - d) / 10`, the next step would overflow: return `INT_MAX` when `sign` is positive, otherwise `INT_MIN`.
   3. `result = result * 10 + d`, advance `i`.
4. Return `sign * result`.

Always check `i < len(s)` before reading `s[i]`; the string may end right after the spaces or the sign.

## Complexity

- **Time:** O(n). Each character is looked at once, and the scan usually stops well before the end.
- **Space:** O(1).

## Common mistakes

- Accepting two signs (`"+-3"`) or a sign after a digit. Exactly one sign, and only right after the spaces.
- Skipping spaces *after* the sign (`"- 5"` must give `0`).
- Computing the full value in a 64-bit type and clamping at the end. It works in Python or for short inputs, but a string of a few hundred digits overflows 64 bits too; the pre-multiplication check handles any length.
- Comparing `result * 10 + d > INT_MAX` in a 32-bit type, which has already overflowed by the time the comparison runs.
- Returning `-0` or treating `"-0"` as an error. `-0` is just `0`.

## Follow-up questions

- *How would you accept other whitespace, such as tabs?* Change the skip condition in step 1; the rest is unchanged. (The problem on LeetCode counts only the space character.)
- *How would you parse a float, or scientific notation like `1e5`?* That is Valid Number: a small state machine with states for sign, integer digits, dot, fraction digits, exponent.
- *Why not use the language's built-in parser?* It would throw on `"3.14abc"` and does not clamp; interviewers want to see the scan and the overflow check.

## Related problems

- [Roman to Integer](/interview/problems/roman-to-integer/)
- [Basic Calculator II](/interview/problems/basic-calculator-ii/)
- Reverse Integer
- Valid Number

## Solutions

```python
class Solution:
    def myAtoi(self, s: str) -> int:
        INT_MAX, INT_MIN = 2**31 - 1, -(2**31)
        n, i = len(s), 0
        while i < n and s[i] == ' ':
            i += 1
        sign = 1
        if i < n and s[i] in '+-':
            sign = -1 if s[i] == '-' else 1
            i += 1
        result = 0
        while i < n and '0' <= s[i] <= '9':
            d = ord(s[i]) - ord('0')
            if result > (INT_MAX - d) // 10:  # the next step would leave the 32-bit range
                return INT_MAX if sign == 1 else INT_MIN
            result = result * 10 + d
            i += 1
        return sign * result
```

```java
class Solution {
    public int myAtoi(String s) {
        int n = s.length(), i = 0;
        while (i < n && s.charAt(i) == ' ') {
            i++;
        }
        int sign = 1;
        if (i < n && (s.charAt(i) == '+' || s.charAt(i) == '-')) {
            sign = s.charAt(i) == '-' ? -1 : 1;
            i++;
        }
        int result = 0;
        while (i < n && Character.isDigit(s.charAt(i))) {
            int d = s.charAt(i) - '0';
            if (result > (Integer.MAX_VALUE - d) / 10) { // the next step would leave the 32-bit range
                return sign == 1 ? Integer.MAX_VALUE : Integer.MIN_VALUE;
            }
            result = result * 10 + d;
            i++;
        }
        return sign * result;
    }
}
```

```cpp
class Solution {
public:
    int myAtoi(string s) {
        int n = s.size(), i = 0;
        while (i < n && s[i] == ' ') {
            i++;
        }
        int sign = 1;
        if (i < n && (s[i] == '+' || s[i] == '-')) {
            sign = s[i] == '-' ? -1 : 1;
            i++;
        }
        int result = 0;
        while (i < n && isdigit(s[i])) {
            int d = s[i] - '0';
            if (result > (INT_MAX - d) / 10) {  // the next step would leave the 32-bit range
                return sign == 1 ? INT_MAX : INT_MIN;
            }
            result = result * 10 + d;
            i++;
        }
        return sign * result;
    }
};
```

```javascript
/**
 * @param {string} s
 * @return {number}
 */
var myAtoi = function (s) {
  const INT_MAX = 2147483647;
  const INT_MIN = -2147483648;
  const n = s.length;
  let i = 0;
  while (i < n && s[i] === ' ') {
    i++;
  }
  let sign = 1;
  if (i < n && (s[i] === '+' || s[i] === '-')) {
    sign = s[i] === '-' ? -1 : 1;
    i++;
  }
  let result = 0;
  while (i < n && s[i] >= '0' && s[i] <= '9') {
    const d = s.charCodeAt(i) - 48; // '0'
    if (result > Math.floor((INT_MAX - d) / 10)) {
      // the next step would leave the 32-bit range
      return sign === 1 ? INT_MAX : INT_MIN;
    }
    result = result * 10 + d;
    i++;
  }
  return sign * result;
};
```

```go
import "math"

func myAtoi(s string) int {
	n, i := len(s), 0
	for i < n && s[i] == ' ' {
		i++
	}
	sign := 1
	if i < n && (s[i] == '+' || s[i] == '-') {
		if s[i] == '-' {
			sign = -1
		}
		i++
	}
	result := 0
	for i < n && s[i] >= '0' && s[i] <= '9' {
		d := int(s[i] - '0')
		if result > (math.MaxInt32-d)/10 { // the next step would leave the 32-bit range
			if sign == 1 {
				return math.MaxInt32
			}
			return math.MinInt32
		}
		result = result*10 + d
		i++
	}
	return sign * result
}
```
