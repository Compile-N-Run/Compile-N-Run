---
title: Decode Ways
leetcode: decode-ways
description: "Decode Ways explained: count the ways a digit string splits into letter codes 1-26 with a Fibonacci-style dynamic programme that keeps only the last two counts, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

Letters are encoded as numbers: `A` is `1`, `B` is `2`, ... , `Z` is `26`. A message is encoded by writing those numbers one after another with no separators, so the digit string loses track of where each code ends. Given a non-empty string `s` of digits, return how many different ways it can be split back into valid codes.

A code is a one-digit number `1`–`9` or a two-digit number `10`–`26`. A `0` can never stand alone and there are no leading zeros, so `06` is not the same as `6`. If no split works, return `0`. The answer is guaranteed to fit in a 32-bit integer.

## Examples

- `"12"` → `2`. Either `1 2` (AB) or `12` (L).
- `"226"` → `3`. `2 2 6`, `22 6` or `2 26`.
- `"06"` → `0`. The leading `0` cannot start a code, and `06` is not a valid two-digit code.
- `"2101"` → `1`. The only split is `2 10 1`; `21 01` fails because `01` is not a code, and `21 0 1` fails because `0` cannot stand alone.
- `"27"` → `1`. `27` is too big for a two-digit code, so it must be `2 7`.

## Key idea

Look at the last digit. If it is non-zero, it can be its own code, and the rest of the string must be decoded in front of it: that gives `ways(i - 1)` possibilities. If the last two digits form a number from 10 to 26, they can also be one code, which adds `ways(i - 2)`. So the count for a prefix depends only on the counts for the two shorter prefixes, exactly like the Fibonacci sequence, except that some steps contribute zero. Scan left to right and keep just those two numbers.

## Approach

1. Let `prev` be the number of ways to decode the empty prefix (`1`, the empty split) and `cur` the ways for the first digit: `1` if it is not `0`, otherwise `0`.
2. For each later position `i`, compute `next`:
   1. Start with `cur` if `s[i]` is not `0` (the digit stands alone), else `0`.
   2. If `s[i-1]` is `1`, or `s[i-1]` is `2` and `s[i]` is at most `6`, add `prev` (the two digits form one code).
3. Shift: `prev = cur`, `cur = next`.
4. After the loop `cur` is the answer. If the string becomes undecodable (two consecutive zeros, or a `0` after a digit other than `1` or `2`), both counters reach `0` and stay there.

The exponential alternative tries every split recursively; memoising it gives the same recurrence, and the two-variable loop is that memo squeezed to constant space.

## Complexity

- **Time:** O(n). One pass over the string with constant work per digit.
- **Space:** O(1). Only the two previous counts are kept.

## Common mistakes

- Treating `0` as a code or allowing `0x` as a two-digit code. `"06"` must return `0`.
- Checking the two-digit case with `s[i-1] != '0'` only. `"27"` would then be counted twice; the window must be `10`–`26`.
- Forgetting the empty-prefix base of `1`. Without it, `"12"` gives `1` instead of `2`.
- Starting the loop at index 0 and reading `s[-1]`.

## Follow-up questions

- *What if `*` can stand for any digit 1–9?* Decode Ways II: the same recurrence with more cases per step (and a modulus, because counts explode).
- *Could you return one actual decoding, not just the count?* Keep a back-pointer per position or rebuild the string by recursion from the end.
- *Why is the answer bounded by a 32-bit integer?* The count grows at most like Fibonacci, so the constraint limits the number of consecutive "double-choice" digits; the problem promises this so you need no big integers.

## Related problems

- [Climbing Stairs](/interview/problems/climbing-stairs/)
- [House Robber](/interview/problems/house-robber/)
- [Word Break](/interview/problems/word-break/)
- Decode Ways II

## Solutions

```python
class Solution:
    def numDecodings(self, s: str) -> int:
        prev, cur = 1, 1 if s[0] != '0' else 0  # ways for the empty prefix and for s[:1]
        for i in range(1, len(s)):
            nxt = cur if s[i] != '0' else 0  # s[i] as a one-digit code
            if s[i - 1] == '1' or (s[i - 1] == '2' and s[i] <= '6'):
                nxt += prev  # s[i-1:i+1] as a two-digit code 10..26
            prev, cur = cur, nxt
        return cur
```

```java
class Solution {
    public int numDecodings(String s) {
        int prev = 1, cur = s.charAt(0) != '0' ? 1 : 0; // ways for the empty prefix and for s[:1]
        for (int i = 1; i < s.length(); i++) {
            char a = s.charAt(i - 1), b = s.charAt(i);
            int next = b != '0' ? cur : 0; // b as a one-digit code
            if (a == '1' || (a == '2' && b <= '6')) {
                next += prev; // ab as a two-digit code 10..26
            }
            prev = cur;
            cur = next;
        }
        return cur;
    }
}
```

```cpp
class Solution {
public:
    int numDecodings(string s) {
        int prev = 1, cur = s[0] != '0' ? 1 : 0;  // ways for the empty prefix and for s[:1]
        for (size_t i = 1; i < s.size(); i++) {
            char a = s[i - 1], b = s[i];
            int next = b != '0' ? cur : 0;  // b as a one-digit code
            if (a == '1' || (a == '2' && b <= '6')) {
                next += prev;  // ab as a two-digit code 10..26
            }
            prev = cur;
            cur = next;
        }
        return cur;
    }
};
```

```javascript
/**
 * @param {string} s
 * @return {number}
 */
var numDecodings = function (s) {
  let prev = 1; // ways for the empty prefix
  let cur = s[0] !== '0' ? 1 : 0; // ways for s[:1]
  for (let i = 1; i < s.length; i++) {
    const a = s[i - 1], b = s[i];
    let next = b !== '0' ? cur : 0; // b as a one-digit code
    if (a === '1' || (a === '2' && b <= '6')) {
      next += prev; // ab as a two-digit code 10..26
    }
    prev = cur;
    cur = next;
  }
  return cur;
};
```

```go
func numDecodings(s string) int {
	prev, cur := 1, 0 // ways for the empty prefix and for s[:1]
	if s[0] != '0' {
		cur = 1
	}
	for i := 1; i < len(s); i++ {
		a, b := s[i-1], s[i]
		next := 0
		if b != '0' {
			next = cur // b as a one-digit code
		}
		if a == '1' || (a == '2' && b <= '6') {
			next += prev // ab as a two-digit code 10..26
		}
		prev, cur = cur, next
	}
	return cur
}
```
