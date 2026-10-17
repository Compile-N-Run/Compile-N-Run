---
title: Valid Palindrome II
leetcode: valid-palindrome-ii
description: "Valid Palindrome II explained: decide whether a string becomes a palindrome after deleting at most one character, with two pointers and a single skip, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given a non-empty string `s` of lowercase letters. Return `true` if `s` is a palindrome, or can become one by deleting **at most one** character; otherwise return `false`. Deleting nothing is allowed, so a string that already reads the same backwards is accepted as it is.

## Examples

- `"abca"` → `true`. Delete the `b` to get `"aca"` (deleting the `c` to get `"aba"` also works).
- `"abc"` → `false`. Removing any single letter leaves two different letters.
- `"racecar"` → `true`. It is already a palindrome; no deletion needed.
- `"abcdba"` → `true`. Delete the `c`: `"abdba"`.
- `"a"` → `true`. A single character is a palindrome.

## Key idea

Check the string from both ends with two pointers, exactly as for a normal palindrome. The first time the two characters differ, you have used up your one deletion and there are only two ways to spend it: drop the left character or drop the right one. Either choice leaves a plain palindrome check on the remaining range. No other deletion can help, because characters outside the current mismatch were already matched in pairs and a deletion elsewhere would shift one side and break them.

## Approach

1. Write a helper `isPalindrome(s, lo, hi)` that moves two pointers inward and returns `false` on the first mismatch.
2. Set `lo = 0`, `hi = len(s) - 1`. While `lo < hi`:
   1. If `s[lo] == s[hi]`, move both pointers inward.
   2. Otherwise return `isPalindrome(s, lo + 1, hi) || isPalindrome(s, lo, hi - 1)`: skip the left character or skip the right one, and the rest must be a true palindrome.
3. If the loop finishes, `s` was already a palindrome: return `true`.

The brute force deletes each of the `n` characters in turn and checks the result, which is O(n²). The two-pointer version does at most three linear scans.

## Complexity

- **Time:** O(n). One scan to the first mismatch, then at most two more scans over the remainder.
- **Space:** O(1). Only the pointers (the helper runs on index ranges, never on substrings).

## Common mistakes

- Trying only one of the two skips, for example always deleting the left character. `"abcca"` needs the left skip (the mismatch is `b` vs `c`, and dropping the `b` leaves `"cc"`), while `"accba"` needs the right one.
- Allowing a second deletion inside the helper (calling the same skipping function recursively). After the first skip the rest must match exactly.
- Building new strings with slicing in the helper; it works but costs O(n) extra space per check.
- Forgetting the already-a-palindrome case, for example returning `false` when the loop never hits a mismatch.

## Follow-up questions

- Generalise to at most `k` deletions. (Recursion with a budget: at each mismatch branch into skip-left and skip-right with `k - 1`; or compute the longest palindromic subsequence and check `n - LPS <= k`.)
- How would you handle mixed case and punctuation? (Normalise first, as in Valid Palindrome.)

## Related problems

- [Valid Palindrome](/interview/problems/valid-palindrome/)
- [Palindromic Substrings](/interview/problems/palindromic-substrings/)
- [Longest Palindromic Substring](/interview/problems/longest-palindromic-substring/)
- Longest Palindromic Subsequence

## Solutions

```python
class Solution:
    def validPalindrome(self, s: str) -> bool:
        def is_palindrome(lo: int, hi: int) -> bool:
            while lo < hi:
                if s[lo] != s[hi]:
                    return False
                lo, hi = lo + 1, hi - 1
            return True

        lo, hi = 0, len(s) - 1
        while lo < hi:
            if s[lo] != s[hi]:  # one deletion: skip the left or the right character
                return is_palindrome(lo + 1, hi) or is_palindrome(lo, hi - 1)
            lo, hi = lo + 1, hi - 1
        return True
```

```java
class Solution {
    public boolean validPalindrome(String s) {
        int lo = 0, hi = s.length() - 1;
        while (lo < hi) {
            if (s.charAt(lo) != s.charAt(hi)) { // one deletion: skip the left or the right character
                return isPalindrome(s, lo + 1, hi) || isPalindrome(s, lo, hi - 1);
            }
            lo++;
            hi--;
        }
        return true;
    }

    private boolean isPalindrome(String s, int lo, int hi) {
        while (lo < hi) {
            if (s.charAt(lo++) != s.charAt(hi--)) {
                return false;
            }
        }
        return true;
    }
}
```

```cpp
class Solution {
    bool isPalindrome(const string& s, int lo, int hi) {
        while (lo < hi) {
            if (s[lo++] != s[hi--]) {
                return false;
            }
        }
        return true;
    }

public:
    bool validPalindrome(string s) {
        int lo = 0, hi = s.size() - 1;
        while (lo < hi) {
            if (s[lo] != s[hi]) {  // one deletion: skip the left or the right character
                return isPalindrome(s, lo + 1, hi) || isPalindrome(s, lo, hi - 1);
            }
            lo++;
            hi--;
        }
        return true;
    }
};
```

```javascript
/**
 * @param {string} s
 * @return {boolean}
 */
var validPalindrome = function (s) {
  const isPalindrome = (lo, hi) => {
    while (lo < hi) {
      if (s[lo++] !== s[hi--]) return false;
    }
    return true;
  };

  let lo = 0, hi = s.length - 1;
  while (lo < hi) {
    if (s[lo] !== s[hi]) {
      // one deletion: skip the left or the right character
      return isPalindrome(lo + 1, hi) || isPalindrome(lo, hi - 1);
    }
    lo++;
    hi--;
  }
  return true;
};
```

```go
func validPalindrome(s string) bool {
	isPalindrome := func(lo, hi int) bool {
		for lo < hi {
			if s[lo] != s[hi] {
				return false
			}
			lo++
			hi--
		}
		return true
	}

	lo, hi := 0, len(s)-1
	for lo < hi {
		if s[lo] != s[hi] { // one deletion: skip the left or the right character
			return isPalindrome(lo+1, hi) || isPalindrome(lo, hi-1)
		}
		lo++
		hi--
	}
	return true
}
```
