---
title: Wildcard Matching
leetcode: wildcard-matching
description: "Wildcard Matching explained: match a string against a pattern with ? and * using two pointers that remember the last star and back up to it on a mismatch, in linear space and near-linear time, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given a string `s` of lowercase letters and a pattern `p` that may contain lowercase letters plus two wildcards: `?` matches exactly one character of any kind, and `*` matches any sequence of characters, including the empty one. Decide whether the pattern matches the **whole** string, not just a part of it.

Either input may be empty. Several stars may appear in a row, and a star never has to consume anything. Return `true` or `false`.

## Examples

- `s = "adceb"`, `p = "*a*b"` → `true`. The first star matches nothing, `a` matches `a`, the second star matches `dce`, `b` matches `b`.
- `s = "acdcb"`, `p = "a*c?b"` → `false`. After the star takes `cd`, `c` matches `c`, `?` must match `b`, and then `b` has nothing left to match.
- `s = "cb"`, `p = "?a"` → `false`. The `?` matches `c` but `a` is not `b`.
- `s = ""`, `p = "**"` → `true`. Stars may match the empty string, so an empty string fits.
- `s = "abc"`, `p = ""` → `false`. An empty pattern only matches an empty string.

## Key idea

Walk through `s` and `p` together. Letters and `?` are forced moves: advance both pointers or fail. A `*` is the only choice point, and the trick is that you never need to remember more than the **most recent** star. Match it greedily to nothing at first, remember where it is in `p` and where you were in `s`. When a later mismatch occurs, go back to that star, let it swallow one more character of `s`, and try again from there.

Why is forgetting earlier stars safe? If the latest star can be stretched to cover the trouble spot, that works. If it cannot, no earlier star could do better: anything an earlier star could absorb, the later star could absorb too, since everything between them has already matched once. So one pair of saved positions replaces a full table of sub-results.

## Approach

1. Keep `i` (index in `s`), `j` (index in `p`), `star = -1` (index of the last star seen in `p`) and `match` (the index in `s` where that star's expansion currently ends).
2. While `i < len(s)`:
   1. If `j < len(p)` and `p[j]` is `?` or equals `s[i]`: advance both `i` and `j`.
   2. Else if `j < len(p)` and `p[j]` is `*`: record `star = j`, `match = i`, and advance `j` only (the star matches nothing so far).
   3. Else if a star was seen (`star != -1`): backtrack. Set `j = star + 1`, increment `match`, and set `i = match`, so the star now covers one more character.
   4. Otherwise return `false`: a mismatch with no star to fall back on.
3. After `s` is consumed, skip any remaining `*` in `p`. The match succeeds if `j` reached the end of `p`.

The textbook alternative is a dynamic-programming table `dp[i][j]` ("does `s[:i]` match `p[:j]`"), with `dp[i][j] = dp[i-1][j] or dp[i][j-1]` on a star. It is O(m·n) in time and space (O(n) with a rolling row). The greedy two-pointer method is shorter, uses O(1) extra space and is linear whenever the pattern has few stars; both are accepted answers, and interviewers often ask for the DP recurrence as a warm-up before the greedy argument.

## Complexity

- **Time:** O(m·n) in the worst case, where `m = len(s)` and `n = len(p)`: each backtrack re-scans part of the pattern, and a pattern such as `*a*a*a...` against a long run of `a`s makes that happen repeatedly. In typical inputs it is close to O(m + n).
- **Space:** O(1). Four integers, no table.

## Common mistakes

- Treating `*` like the regex `*` ("zero or more of the previous character"). Here it is a free-standing wildcard that matches any substring.
- Forgetting step 3. With `s = "a"` and `p = "a*"` the loop ends with `j` pointing at the star, which must be skipped before declaring success.
- Resetting `i` to the position of the star instead of `match + 1`, which re-tries the same failed expansion forever or returns the wrong answer.
- Testing whether the pattern appears *somewhere* in `s`. The whole string must be covered.

## Follow-up questions

- *Can you write the DP version?* `dp[0][0] = true`; `dp[0][j]` is true while `p[:j]` is all stars; for a star `dp[i][j] = dp[i-1][j] || dp[i][j-1]`; for `?` or a matching letter `dp[i][j] = dp[i-1][j-1]`. Roll the rows to use O(n) space.
- *How does this differ from Regular Expression Matching?* There `*` modifies the preceding element, which breaks the "only the last star matters" argument, so that problem needs the DP table.
- *How would you match many strings against one pattern?* Compile the pattern once into a sequence of literal segments between stars and search each segment greedily left to right (the same idea, precomputed).

## Related problems

- [Regular Expression Matching](/interview/problems/regular-expression-matching/)
- [Edit Distance](/interview/problems/edit-distance/)
- [Longest Valid Parentheses](/interview/problems/longest-valid-parentheses/)

## Solutions

```python
class Solution:
    def isMatch(self, s: str, p: str) -> bool:
        i = j = 0
        star, match = -1, 0  # last '*' seen in p, and the s index its expansion currently ends at
        while i < len(s):
            if j < len(p) and (p[j] == '?' or p[j] == s[i]):
                i += 1
                j += 1
            elif j < len(p) and p[j] == '*':
                star, match = j, i  # the star matches nothing for now
                j += 1
            elif star != -1:
                j = star + 1  # back up: let the last star swallow one more character
                match += 1
                i = match
            else:
                return False
        while j < len(p) and p[j] == '*':
            j += 1
        return j == len(p)
```

```java
class Solution {
    public boolean isMatch(String s, String p) {
        int i = 0, j = 0;
        int star = -1, match = 0; // last '*' seen in p, and the s index its expansion currently ends at
        while (i < s.length()) {
            if (j < p.length() && (p.charAt(j) == '?' || p.charAt(j) == s.charAt(i))) {
                i++;
                j++;
            } else if (j < p.length() && p.charAt(j) == '*') {
                star = j; // the star matches nothing for now
                match = i;
                j++;
            } else if (star != -1) {
                j = star + 1; // back up: let the last star swallow one more character
                match++;
                i = match;
            } else {
                return false;
            }
        }
        while (j < p.length() && p.charAt(j) == '*') {
            j++;
        }
        return j == p.length();
    }
}
```

```cpp
class Solution {
public:
    bool isMatch(string s, string p) {
        int i = 0, j = 0, n = s.size(), m = p.size();
        int star = -1, match = 0;  // last '*' seen in p, and the s index its expansion currently ends at
        while (i < n) {
            if (j < m && (p[j] == '?' || p[j] == s[i])) {
                i++;
                j++;
            } else if (j < m && p[j] == '*') {
                star = j;  // the star matches nothing for now
                match = i;
                j++;
            } else if (star != -1) {
                j = star + 1;  // back up: let the last star swallow one more character
                match++;
                i = match;
            } else {
                return false;
            }
        }
        while (j < m && p[j] == '*') {
            j++;
        }
        return j == m;
    }
};
```

```javascript
/**
 * @param {string} s
 * @param {string} p
 * @return {boolean}
 */
var isMatch = function (s, p) {
  let i = 0, j = 0;
  let star = -1, match = 0; // last '*' seen in p, and the s index its expansion currently ends at
  while (i < s.length) {
    if (j < p.length && (p[j] === '?' || p[j] === s[i])) {
      i++;
      j++;
    } else if (j < p.length && p[j] === '*') {
      star = j; // the star matches nothing for now
      match = i;
      j++;
    } else if (star !== -1) {
      j = star + 1; // back up: let the last star swallow one more character
      match++;
      i = match;
    } else {
      return false;
    }
  }
  while (j < p.length && p[j] === '*') {
    j++;
  }
  return j === p.length;
};
```

```go
func isMatch(s string, p string) bool {
	i, j := 0, 0
	star, match := -1, 0 // last '*' seen in p, and the s index its expansion currently ends at
	for i < len(s) {
		if j < len(p) && (p[j] == '?' || p[j] == s[i]) {
			i++
			j++
		} else if j < len(p) && p[j] == '*' {
			star, match = j, i // the star matches nothing for now
			j++
		} else if star != -1 {
			j = star + 1 // back up: let the last star swallow one more character
			match++
			i = match
		} else {
			return false
		}
	}
	for j < len(p) && p[j] == '*' {
		j++
	}
	return j == len(p)
}
```
