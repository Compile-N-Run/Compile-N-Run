---
title: Longest Palindromic Substring
leetcode: longest-palindromic-substring
description: "Longest Palindromic Substring explained: find the longest contiguous piece of a string that reads the same both ways by expanding around every center, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given a string `s`. A *palindrome* reads the same from left to right and from right to left, like `"level"` or `"noon"`. A *substring* is a contiguous run of characters taken from `s`.

Return the longest substring of `s` that is a palindrome. If several palindromic substrings share the maximum length, returning any one of them is accepted.

The string has at least one character and contains only English letters and digits. Letters are case-sensitive: `"Aa"` is not a palindrome.

## Examples

- `s = "xracecarz"` → `"racecar"`, which reads the same backwards and is 7 characters long.
- `s = "abbc"` → `"bb"`. Even-length palindromes count too.
- `s = "pqr"` → `"p"` (or `"q"`, or `"r"`). Any single character is a palindrome of length 1.
- `s = "aaaa"` → `"aaaa"`, the whole string.

## Key idea

Every palindrome is symmetric around its middle. That middle is either one character (odd length, like the `e` in `"racecar"`) or the gap between two equal characters (even length, like `"noon"`). A string of length `n` has `2n - 1` such centers.

From each center, grow outward one step at a time while the characters on both sides match. When they stop matching, you have found the longest palindrome around that center. The best result over all centers is the answer.

## Approach

1. Keep `start` and `bestLen` for the best palindrome found so far (initially `0` and `0`).
2. For each index `i`:
   1. Expand around the single center `(i, i)` to get an odd-length palindrome.
   2. Expand around the pair `(i, i + 1)` to get an even-length palindrome.
   3. To expand from `(lo, hi)`: while `lo >= 0`, `hi < n` and `s[lo] == s[hi]`, move `lo` left and `hi` right. The palindrome is then `s[lo + 1 .. hi - 1]`, of length `hi - lo - 1`.
   4. If either length beats `bestLen`, record it and its start `lo + 1`.
3. Return the substring of length `bestLen` starting at `start`.

The brute force checks every one of the O(n²) substrings for being a palindrome in O(n) time each, so O(n³) in total. A dynamic programming table brings this down to O(n²) time but needs O(n²) memory; expanding around centers gets the same time with constant memory.

## Complexity

- **Time:** O(n²). There are `2n - 1` centers and each expansion takes at most O(n) steps.
- **Space:** O(1) besides the returned string; only a few indexes are stored.

## Common mistakes

- Expanding only around single characters, which misses every even-length palindrome such as `"bb"`.
- Off-by-one errors after the loop: when it stops, `lo` and `hi` point one step *past* the palindrome, so it starts at `lo + 1` and has length `hi - lo - 1`.
- Confusing substring with subsequence. Characters must be next to each other; `"aba"` is not a substring of `"axbxa"`.

## Follow-up questions

- *Can it be done in linear time?* Manacher's algorithm reuses the symmetry of palindromes already found to compute every center's radius in O(n) total.
- *How many palindromic substrings are there?* Palindromic Substrings counts them with the same center expansion.

## Related problems

- Palindromic Substrings: count every palindromic substring instead of finding the longest.
- Longest Palindromic Subsequence: characters may be skipped, which calls for dynamic programming.

## Solutions

```python
class Solution:
    def longestPalindrome(self, s: str) -> str:
        n = len(s)
        start, best_len = 0, 0

        def expand(lo: int, hi: int) -> None:
            nonlocal start, best_len
            while lo >= 0 and hi < n and s[lo] == s[hi]:
                lo -= 1
                hi += 1
            if hi - lo - 1 > best_len:  # palindrome is s[lo + 1 : hi]
                start, best_len = lo + 1, hi - lo - 1

        for i in range(n):
            expand(i, i)      # odd length
            expand(i, i + 1)  # even length
        return s[start:start + best_len]
```

```java
class Solution {
    private int start = 0, bestLen = 0;

    public String longestPalindrome(String s) {
        start = 0;
        bestLen = 0;
        for (int i = 0; i < s.length(); i++) {
            expand(s, i, i);     // odd length
            expand(s, i, i + 1); // even length
        }
        return s.substring(start, start + bestLen);
    }

    private void expand(String s, int lo, int hi) {
        while (lo >= 0 && hi < s.length() && s.charAt(lo) == s.charAt(hi)) {
            lo--;
            hi++;
        }
        if (hi - lo - 1 > bestLen) { // palindrome is s[lo + 1 .. hi - 1]
            start = lo + 1;
            bestLen = hi - lo - 1;
        }
    }
}
```

```cpp
class Solution {
public:
    string longestPalindrome(string s) {
        int n = s.size(), start = 0, bestLen = 0;
        auto expand = [&](int lo, int hi) {
            while (lo >= 0 && hi < n && s[lo] == s[hi]) {
                lo--;
                hi++;
            }
            if (hi - lo - 1 > bestLen) {  // palindrome is s[lo + 1 .. hi - 1]
                start = lo + 1;
                bestLen = hi - lo - 1;
            }
        };
        for (int i = 0; i < n; i++) {
            expand(i, i);      // odd length
            expand(i, i + 1);  // even length
        }
        return s.substr(start, bestLen);
    }
};
```

```javascript
/**
 * @param {string} s
 * @return {string}
 */
var longestPalindrome = function (s) {
  const n = s.length;
  let start = 0, bestLen = 0;
  const expand = (lo, hi) => {
    while (lo >= 0 && hi < n && s[lo] === s[hi]) {
      lo--;
      hi++;
    }
    if (hi - lo - 1 > bestLen) { // palindrome is s[lo + 1 .. hi - 1]
      start = lo + 1;
      bestLen = hi - lo - 1;
    }
  };
  for (let i = 0; i < n; i++) {
    expand(i, i);     // odd length
    expand(i, i + 1); // even length
  }
  return s.slice(start, start + bestLen);
};
```

```go
func longestPalindrome(s string) string {
	n, start, bestLen := len(s), 0, 0
	expand := func(lo, hi int) {
		for lo >= 0 && hi < n && s[lo] == s[hi] {
			lo--
			hi++
		}
		if hi-lo-1 > bestLen { // palindrome is s[lo+1 .. hi-1]
			start, bestLen = lo+1, hi-lo-1
		}
	}
	for i := 0; i < n; i++ {
		expand(i, i)   // odd length
		expand(i, i+1) // even length
	}
	return s[start : start+bestLen]
}
```
