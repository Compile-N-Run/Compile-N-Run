---
title: Palindrome Number
leetcode: palindrome-number
description: "Palindrome Number explained: check whether an integer's digits read the same in both directions by reversing only half of the number, without converting it to a string, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given a 32-bit signed integer `x`. Return `true` if its decimal digits read the same from left to right as from right to left, and `false` otherwise.

The minus sign counts as part of the number, so a negative number is never a palindrome (`-55` reversed would be `55-`). Interviewers usually add a follow-up: solve it without turning the number into a string.

## Examples

- `x = 1331` → `true`. The digits are the same in both directions.
- `x = 12321` → `true`. With an odd number of digits, the middle digit (`3`) pairs with itself.
- `x = -44` → `false`. The minus sign has no partner at the other end.
- `x = 50` → `false`. Reversed it would be `05`, and a number cannot start with 0.

## Key idea

The easy answer is `str(x) == str(x)[::-1]`. Without strings, you can peel digits off the end with `% 10` and `/ 10` and build the reversed number. Reversing the *whole* number can overflow a 32-bit integer (for example `2147483647` reversed is `7463847412`), so reverse only the **back half**. Keep moving digits from `x` onto `rev` until `rev` is at least as large as what remains of `x`; at that point you have handled half of the digits. The number is a palindrome when the front half equals the reversed back half.

## Approach

1. If `x` is negative, return `false`. If `x` ends in `0` but is not `0` itself, return `false` too: the first digit can never be 0.
2. Set `rev = 0`. While `x > rev`:
   1. `rev = rev * 10 + x % 10` (move the last digit of `x` onto `rev`).
   2. `x = x / 10` (integer division drops that digit).
3. Now `x` holds the front half and `rev` the reversed back half.
   - Even digit count: they must be equal, `x == rev`.
   - Odd digit count: `rev` has one extra digit, the middle one, which can be dropped: `x == rev / 10`.
4. Return `true` if either comparison holds.

For `12321`: after the loop `x = 12` and `rev = 123`, and `123 / 10 = 12`, so the answer is `true`.

## Complexity

- **Time:** O(log x). The loop runs about half as many times as `x` has digits (at most 5 for a 32-bit number).
- **Space:** O(1). Only two integers are used.

## Common mistakes

- Forgetting the trailing-zero check. Without it, `10` goes through the loop as `x = 1, rev = 0` and then `x = 0, rev = 1`, and the odd-length test `rev / 10 == x` wrongly returns `true`.
- Reversing the whole number in a 32-bit type, which overflows for large inputs.
- Treating negative numbers by their absolute value. `-121` is not a palindrome.
- Forgetting the odd-length case (`x == rev / 10`), which rejects `12321`.

## Follow-up questions

- Do it without converting to a string. (The half-reversal above.)
- Compare digits from both ends directly. (Find the largest power of 10 not above `x`, then repeatedly compare `x / power` with `x % 10` and strip both digits.)

## Related problems

- [Valid Palindrome](/interview/problems/valid-palindrome/): the same question for text, ignoring punctuation and case.
- Reverse Integer: reverse all the digits while detecting 32-bit overflow.
- Palindrome Linked List: also solved by reversing only the second half.

## Solutions

```python
class Solution:
    def isPalindrome(self, x: int) -> bool:
        # Negatives and numbers ending in 0 (other than 0) cannot be palindromes.
        if x < 0 or (x % 10 == 0 and x != 0):
            return False
        rev = 0
        while x > rev:
            rev = rev * 10 + x % 10
            x //= 10
        # Even length: halves match. Odd length: drop the middle digit from rev.
        return x == rev or x == rev // 10
```

```java
class Solution {
    public boolean isPalindrome(int x) {
        // Negatives and numbers ending in 0 (other than 0) cannot be palindromes.
        if (x < 0 || (x % 10 == 0 && x != 0)) {
            return false;
        }
        int rev = 0;
        while (x > rev) {
            rev = rev * 10 + x % 10;
            x /= 10;
        }
        // Even length: halves match. Odd length: drop the middle digit from rev.
        return x == rev || x == rev / 10;
    }
}
```

```cpp
class Solution {
public:
    bool isPalindrome(int x) {
        // Negatives and numbers ending in 0 (other than 0) cannot be palindromes.
        if (x < 0 || (x % 10 == 0 && x != 0)) {
            return false;
        }
        int rev = 0;
        while (x > rev) {
            rev = rev * 10 + x % 10;
            x /= 10;
        }
        // Even length: halves match. Odd length: drop the middle digit from rev.
        return x == rev || x == rev / 10;
    }
};
```

```javascript
/**
 * @param {number} x
 * @return {boolean}
 */
var isPalindrome = function (x) {
  // Negatives and numbers ending in 0 (other than 0) cannot be palindromes.
  if (x < 0 || (x % 10 === 0 && x !== 0)) {
    return false;
  }
  let rev = 0;
  while (x > rev) {
    rev = rev * 10 + (x % 10);
    x = Math.floor(x / 10);
  }
  // Even length: halves match. Odd length: drop the middle digit from rev.
  return x === rev || x === Math.floor(rev / 10);
};
```

```go
func isPalindrome(x int) bool {
	// Negatives and numbers ending in 0 (other than 0) cannot be palindromes.
	if x < 0 || (x%10 == 0 && x != 0) {
		return false
	}
	rev := 0
	for x > rev {
		rev = rev*10 + x%10
		x /= 10
	}
	// Even length: halves match. Odd length: drop the middle digit from rev.
	return x == rev || x == rev/10
}
```
