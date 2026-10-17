---
title: Reverse Integer
leetcode: reverse-integer
description: "Reverse Integer explained: reverse the digits of a signed 32-bit integer and return 0 when the result would overflow, by popping digits and checking the bound before each push, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given a signed 32-bit integer `x`, so `x` lies in `[-2³¹, 2³¹ - 1]`, that is `[-2147483648, 2147483647]`. Return the integer whose digits are those of `x` in reverse order, keeping the sign. Trailing zeros of `x` disappear, because they become leading zeros.

If the reversed value does not fit in a signed 32-bit integer, return `0`. Assume your code may only use 32-bit integers, so you cannot simply compute the reversal in a 64-bit variable and compare.

## Examples

- `123` → `321`.
- `-450` → `-54`. The sign stays in front and the trailing zero is dropped.
- `1200` → `21`.
- `1534236469` → `0`. Reversed it would be `9646324351`, which is larger than `2147483647`.
- `-2147483648` → `0`. The smallest 32-bit integer reverses to `-8463847412`, far below the limit.
- `1463847412` → `2147483641`. The reversal fits, barely: it is 6 less than the maximum.
- `0` → `0`.

## Key idea

Peel the digits off the end of `x` one at a time (`x % 10` gives the last digit, `x / 10` removes it) and push them onto the result from the right: `rev = rev * 10 + digit`. The only danger is the push overflowing. Since the result is about to become `rev * 10 + digit`, it stays within the limit `M = 2147483647` exactly when `rev < M / 10`, or `rev == M / 10` and `digit <= 7` (the last digit of `M`). Checking that condition *before* the multiplication keeps every intermediate value inside 32 bits.

Working with the absolute value and reattaching the sign at the end lets one bound cover both signs: the negative limit `-2147483648` has magnitude `2³¹`, and no valid input reverses to exactly `2147483648` (that would need `x = -8463847412`, which is not a 32-bit integer), so comparing the magnitude against `2147483647` is enough.

## Approach

1. Remember the sign and work with the magnitude of each digit (`abs(x % 10)`), so `rev` is always non-negative.
2. While `x != 0`:
   1. `digit = abs(x % 10)`, `x = x / 10` (integer division toward zero).
   2. If `rev > 214748364`, or `rev == 214748364` and `digit > 7`, return `0`: the next push would exceed `2147483647`.
   3. `rev = rev * 10 + digit`.
3. Return `rev` with the original sign.

Converting to a string, reversing and parsing back is shorter but hides the overflow question, which is the whole point of the problem in an interview.

## Complexity

- **Time:** O(d), where `d` is the number of digits of `x`, at most 10.
- **Space:** O(1).

## Common mistakes

- Multiplying first and checking afterwards (`if rev > MAX` after `rev = rev * 10 + digit`). In Java, C++ and Go the overflow has already happened and `rev` has wrapped around to a meaningless value.
- Using a 64-bit `long` to dodge the check. It works on LeetCode but the statement forbids it, and the interviewer will ask how you would do it in 32 bits.
- Calling `abs(x)` on the whole input. `abs(-2147483648)` overflows in Java and C++ (there is no `+2147483648`), which is why the solutions take the absolute value of each digit instead.
- Forgetting the negative limit when checking per sign: the smallest allowed last digit for a negative result is 8 (`...648`), not 7. Working on the magnitude as above sidesteps this.
- Writing `x % 10` in a language where the remainder of a negative number is positive (Python). The solutions below strip the sign first in Python, so the digits come out positive.

## Follow-up questions

- *What if the limit were 64 bits?* Same code with `9223372036854775807` as the maximum, which ends in 7 as well.
- *How would you reverse the bits of a 32-bit unsigned integer instead?* Shift the result left and bring in `x & 1` 32 times (Reverse Bits).
- *Could you detect the overflow with a division check instead?* Yes: after `rev = rev * 10 + digit`, `(rev - digit) / 10 != previous` signals overflow in languages where wrap-around is defined (Java), but undefined behaviour in C++ makes the pre-check safer.

## Related problems

- [Palindrome Number](/interview/problems/palindrome-number/): reverses half the digits with the same pop-and-push loop.
- [String to Integer (atoi)](/interview/problems/string-to-integer-atoi/): the same bound check while parsing characters.
- Reverse Bits
- Reverse String

## Solutions

```python
class Solution:
    def reverse(self, x: int) -> int:
        INT_MAX = 2**31 - 1
        sign = -1 if x < 0 else 1
        x = abs(x)  # Python ints never overflow, so this is safe here
        rev = 0
        while x:
            digit = x % 10
            x //= 10
            if rev > INT_MAX // 10 or (rev == INT_MAX // 10 and digit > 7):
                return 0  # the next push would exceed 2147483647
            rev = rev * 10 + digit
        return sign * rev
```

```java
class Solution {
    public int reverse(int x) {
        int rev = 0;
        boolean negative = x < 0;
        while (x != 0) {
            int digit = Math.abs(x % 10); // digit of the magnitude; abs(x) itself could overflow
            x /= 10;
            if (rev > Integer.MAX_VALUE / 10 || (rev == Integer.MAX_VALUE / 10 && digit > 7)) {
                return 0; // the next push would exceed 2147483647
            }
            rev = rev * 10 + digit;
        }
        return negative ? -rev : rev;
    }
}
```

```cpp
class Solution {
public:
    int reverse(int x) {
        int rev = 0;
        bool negative = x < 0;
        while (x != 0) {
            int digit = abs(x % 10);  // digit of the magnitude; abs(x) itself could overflow
            x /= 10;
            if (rev > INT_MAX / 10 || (rev == INT_MAX / 10 && digit > 7)) {
                return 0;  // the next push would exceed 2147483647
            }
            rev = rev * 10 + digit;
        }
        return negative ? -rev : rev;
    }
};
```

```javascript
/**
 * @param {number} x
 * @return {number}
 */
var reverse = function (x) {
  const INT_MAX = 2147483647;
  const negative = x < 0;
  let rev = 0;
  while (x !== 0) {
    const digit = Math.abs(x % 10); // digit of the magnitude
    x = Math.trunc(x / 10);
    if (rev > Math.floor(INT_MAX / 10) || (rev === Math.floor(INT_MAX / 10) && digit > 7)) {
      return 0; // the next push would exceed 2147483647
    }
    rev = rev * 10 + digit;
  }
  return negative ? -rev : rev;
};
```

```go
import "math"

func reverse(x int) int {
	rev := 0
	negative := x < 0
	for x != 0 {
		digit := x % 10 // Go keeps the sign of x, so take the magnitude
		if digit < 0 {
			digit = -digit
		}
		x /= 10
		if rev > math.MaxInt32/10 || (rev == math.MaxInt32/10 && digit > 7) {
			return 0 // the next push would exceed 2147483647
		}
		rev = rev*10 + digit
	}
	if negative {
		return -rev
	}
	return rev
}
```
