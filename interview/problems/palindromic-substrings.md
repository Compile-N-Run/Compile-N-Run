---
title: Palindromic Substrings
leetcode: palindromic-substrings
description: "Palindromic Substrings explained: count every contiguous piece of a string that reads the same both ways by expanding around each center, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given a string `s` of lowercase English letters (at least one character). A *substring* is a contiguous run of characters, and a *palindrome* reads the same forwards and backwards.

Return how many substrings of `s` are palindromes. Substrings are counted by position, not by content: if the same text appears at two different places, both count.

## Examples

- `s = "aba"` → `4`: the three single letters `"a"`, `"b"`, `"a"`, plus `"aba"` itself.
- `s = "aaaa"` → `10`: four `"a"`, three `"aa"`, two `"aaa"` and one `"aaaa"`. Equal text at different positions counts separately.
- `s = "abba"` → `6`: four single letters, `"bb"` and `"abba"`.
- `s = "abcd"` → `4`: only the single letters.

## Key idea

Every palindrome has a middle: either one character (odd length, like `"aba"`) or the gap between two characters (even length, like `"abba"`). A string of length `n` has `2n - 1` possible middles.

Start at a middle and grow outward one character on each side. As long as the two new characters match, the longer piece is still a palindrome, so count it and keep going. The first mismatch ends that middle, because any longer piece around it would contain the mismatch. Adding up the counts from all middles gives every palindromic substring exactly once.

## Approach

1. Set `count = 0`.
2. Number the centers `0` to `2n - 2`. Center `c` starts at `lo = c / 2` and `hi = (c + 1) / 2` (integer division). For even `c` that is one character (`lo == hi`); for odd `c` it is a pair of neighbours (`hi == lo + 1`). One loop then covers both odd and even lengths.
3. For each center: while `lo >= 0`, `hi < n` and `s[lo] == s[hi]`, add one to `count`, then move `lo` left and `hi` right.
4. Return `count`.

The brute force lists all O(n²) substrings and checks each one in O(n) time, O(n³) overall. A dynamic programming table (`isPal[i][j]`) also reaches O(n²) time but uses O(n²) memory; expanding around centers needs only a few variables.

## Complexity

- **Time:** O(n²). There are `2n - 1` centers and each expansion takes at most O(n) steps.
- **Space:** O(1). Only indexes and the counter are stored.

## Common mistakes

- Forgetting the even-length centers between characters, which misses palindromes like `"bb"`.
- Counting distinct palindromes instead of positions. `"aaaa"` has 10 palindromic substrings, not 4.
- Stopping at the first mismatch for the whole string instead of only for the current center.

## Follow-up questions

- *Can it be faster?* Manacher's algorithm finds the palindrome radius of every center in O(n) total time, and the count is the sum of those radii.
- *How would you return the longest one instead?* Use the same expansion and keep the widest range, as in [Longest Palindromic Substring](/interview/problems/longest-palindromic-substring/).

## Related problems

- [Longest Palindromic Substring](/interview/problems/longest-palindromic-substring/): same center expansion, but keep the longest instead of counting.
- Longest Palindromic Subsequence
- Palindrome Partitioning

## Solutions

```python
class Solution:
    def countSubstrings(self, s: str) -> int:
        n = len(s)
        count = 0
        for center in range(2 * n - 1):
            # Even centers are characters, odd centers are gaps between two characters.
            lo, hi = center // 2, (center + 1) // 2
            while lo >= 0 and hi < n and s[lo] == s[hi]:
                count += 1
                lo -= 1
                hi += 1
        return count
```

```java
class Solution {
    public int countSubstrings(String s) {
        int n = s.length(), count = 0;
        for (int center = 0; center < 2 * n - 1; center++) {
            // Even centers are characters, odd centers are gaps between two characters.
            int lo = center / 2, hi = (center + 1) / 2;
            while (lo >= 0 && hi < n && s.charAt(lo) == s.charAt(hi)) {
                count++;
                lo--;
                hi++;
            }
        }
        return count;
    }
}
```

```cpp
class Solution {
public:
    int countSubstrings(string s) {
        int n = s.size(), count = 0;
        for (int center = 0; center < 2 * n - 1; center++) {
            // Even centers are characters, odd centers are gaps between two characters.
            int lo = center / 2, hi = (center + 1) / 2;
            while (lo >= 0 && hi < n && s[lo] == s[hi]) {
                count++;
                lo--;
                hi++;
            }
        }
        return count;
    }
};
```

```javascript
/**
 * @param {string} s
 * @return {number}
 */
var countSubstrings = function (s) {
  const n = s.length;
  let count = 0;
  for (let center = 0; center < 2 * n - 1; center++) {
    // Even centers are characters, odd centers are gaps between two characters.
    let lo = Math.floor(center / 2);
    let hi = Math.floor((center + 1) / 2);
    while (lo >= 0 && hi < n && s[lo] === s[hi]) {
      count++;
      lo--;
      hi++;
    }
  }
  return count;
};
```

```go
func countSubstrings(s string) int {
	n, count := len(s), 0
	for center := 0; center < 2*n-1; center++ {
		// Even centers are characters, odd centers are gaps between two characters.
		lo, hi := center/2, (center+1)/2
		for lo >= 0 && hi < n && s[lo] == s[hi] {
			count++
			lo--
			hi++
		}
	}
	return count
}
```
