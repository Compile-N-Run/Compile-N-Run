---
title: Regular Expression Matching
leetcode: regular-expression-matching
description: "Regular Expression Matching explained: decide whether a pattern with '.' and '*' matches a whole string using a 2D dynamic programming table over prefixes, with a worked example and solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given a string `s` and a pattern `p`. Decide whether the pattern matches the **entire** string (not just part of it) and return `true` or `false`.

The string contains only lowercase English letters. The pattern contains lowercase letters and two special characters:

- `.` matches any single character.
- `*` means "zero or more copies of the character right before it". So `b*` matches `""`, `"b"`, `"bb"` and so on, and `.*` matches any string at all.

Every `*` in the pattern follows a letter or a `.`, never another `*` and never the start of the pattern. Both inputs are short (a few dozen characters at most).

## Examples

- `s = "abb"`, `p = "c*ab*"` → `true`. `c*` matches zero `c`s, `a` matches `a`, and `b*` matches `bb`.
- `s = "hello"`, `p = "h.l*o"` → `true`. `.` matches `e` and `l*` matches `ll`.
- `s = "ab"`, `p = "a"` → `false`. The pattern matches the start of the string but not all of it.
- `s = "aaa"`, `p = "ab*a"` → `false`. `b*` can vanish, but then the pattern only covers two `a`s.

## Key idea

Ask the question for prefixes. Let `dp[i][j]` be `true` when the first `i` characters of `s` are matched by the first `j` characters of `p`. The answer is `dp[len(s)][len(p)]`.

Each cell depends only on cells for shorter prefixes, so we can fill the table row by row. Look at the last pattern character `p[j-1]`:

- **It is a letter or `.`:** it must match exactly one character, the last one of the string prefix, `s[i-1]`. So `dp[i][j]` is true when the characters match (equal, or the pattern has `.`) **and** the rest matched: `dp[i-1][j-1]`.
- **It is `*`:** the pair `x*` (where `x = p[j-2]`) can be used in two ways:
  - **zero copies:** drop the pair and see whether `p[:j-2]` matches: `dp[i][j-2]`.
  - **one more copy:** if `s[i-1]` matches `x`, let the pair eat that character and stay on the same pattern position, because `x*` may eat more: `dp[i-1][j]`.

  `dp[i][j]` is true if either option works.

The base cases come from the empty string. `dp[0][0]` is `true` (empty matches empty). An empty string can still be matched by a non-empty pattern such as `a*b*`, so for row 0 a `*` copies the value from two columns to the left: `dp[0][j] = dp[0][j-2]`. All other cells in row 0 and column 0 are `false`.

### Worked example

`s = "abb"`, `p = "c*ab*"`. Rows are prefixes of `s`, columns are prefixes of `p` (each column is labelled with the pattern character it adds):

```
            ""   c    *    a    b    *
      ""    T    F    T    F    F    F
      a     F    F    F    T    F    T
      b     F    F    F    F    T    T
      b     F    F    F    F    F    T
```

Reading a few cells:

- Row `""`, column `*` (pattern `c*`): zero copies of `c`, so copy the cell two to the left, `dp[0][0] = T`. The empty string matches `c*`.
- Row `a`, column `a` (string `"a"`, pattern `c*a`): `a` matches `a`, so look diagonally up-left at `dp[0][2] = T`. True.
- Row `a`, last column (string `"a"`, pattern `c*ab*`): zero copies of `b` gives `dp[1][3] = T`. True.
- Row `b`, column `b` (string `"ab"`, pattern `c*ab`): `b` matches `b`, diagonal `dp[1][3] = T`. True.
- Last row, last column (string `"abb"`, pattern `c*ab*`): zero copies gives `dp[3][3] = F`, but `b*` can eat the last `b` because it matches, so look straight up at `dp[2][5] = T`. True, and that is the answer.

## Approach

1. Let `m = len(s)`, `n = len(p)`. Create a `(m + 1) × (n + 1)` table of `false` and set `dp[0][0] = true`.
2. Fill row 0: for `j` from 2 to `n`, if `p[j-1] == '*'` set `dp[0][j] = dp[0][j-2]`.
3. For `i` from 1 to `m` and `j` from 1 to `n`:
   1. If `p[j-1] == '*'`:
      - `dp[i][j] = dp[i][j-2]` (zero copies);
      - if `p[j-2] == '.'` or `p[j-2] == s[i-1]`, also allow `dp[i-1][j]` (one more copy).
   2. Otherwise, if `p[j-1] == '.'` or `p[j-1] == s[i-1]`, set `dp[i][j] = dp[i-1][j-1]`.
4. Return `dp[m][n]`.

A plain recursive solution (try zero copies, try one more copy) is correct but can take exponential time on inputs like `s = "aaaaaaaaaaaaaaaaaab"`, `p = "a*a*a*a*a*a*a*c"`, because it explores the same `(i, j)` pairs again and again. The table computes each pair exactly once. Recursion with memoisation is equivalent and also acceptable.

## Complexity

- **Time:** O(m · n). There are `(m + 1)(n + 1)` cells and each takes constant time.
- **Space:** O(m · n) for the table. Only the previous row is ever read, so it can be reduced to O(n).

## Common mistakes

- Treating `*` on its own. It always belongs to the character before it; handle the pair `x*` together, which is why the zero-copies case jumps back two columns.
- Forgetting row 0. Without `dp[0][j] = dp[0][j-2]` for `*`, patterns like `c*ab*` can never match because the leading `c*` is never allowed to vanish.
- Using `dp[i-1][j-2]` for the "one more copy" case. That uses up the `x*` pair after one character; `dp[i-1][j]` keeps it available for more.
- Answering whether the pattern matches *somewhere* in the string. It must match the whole string.

## Follow-up questions

- How would you reduce the memory to one row? (Keep the previous row and the current row, or one row plus a saved diagonal value.)
- What changes for wildcard matching, where `*` matches any sequence by itself and `?` matches one character? (The same table, but `*` looks at `dp[i][j-1]` and `dp[i-1][j]`.)

## Related problems

- [Word Break](/interview/problems/word-break/)
- [Longest Palindromic Substring](/interview/problems/longest-palindromic-substring/)
- Wildcard Matching
- Edit Distance

## Solutions

```python
class Solution:
    def isMatch(self, s: str, p: str) -> bool:
        m, n = len(s), len(p)
        dp = [[False] * (n + 1) for _ in range(m + 1)]  # dp[i][j]: s[:i] matches p[:j]
        dp[0][0] = True
        for j in range(2, n + 1):
            if p[j - 1] == '*':
                dp[0][j] = dp[0][j - 2]  # x* can match the empty string
        for i in range(1, m + 1):
            for j in range(1, n + 1):
                if p[j - 1] == '*':
                    dp[i][j] = dp[i][j - 2]  # zero copies of p[j-2]
                    if p[j - 2] == '.' or p[j - 2] == s[i - 1]:
                        dp[i][j] = dp[i][j] or dp[i - 1][j]  # one more copy
                elif p[j - 1] == '.' or p[j - 1] == s[i - 1]:
                    dp[i][j] = dp[i - 1][j - 1]
        return dp[m][n]
```

```java
class Solution {
    public boolean isMatch(String s, String p) {
        int m = s.length(), n = p.length();
        boolean[][] dp = new boolean[m + 1][n + 1]; // dp[i][j]: s[0..i) matches p[0..j)
        dp[0][0] = true;
        for (int j = 2; j <= n; j++) {
            if (p.charAt(j - 1) == '*') {
                dp[0][j] = dp[0][j - 2]; // x* can match the empty string
            }
        }
        for (int i = 1; i <= m; i++) {
            for (int j = 1; j <= n; j++) {
                char pc = p.charAt(j - 1), sc = s.charAt(i - 1);
                if (pc == '*') {
                    char prev = p.charAt(j - 2);
                    dp[i][j] = dp[i][j - 2]; // zero copies of prev
                    if (prev == '.' || prev == sc) {
                        dp[i][j] = dp[i][j] || dp[i - 1][j]; // one more copy
                    }
                } else if (pc == '.' || pc == sc) {
                    dp[i][j] = dp[i - 1][j - 1];
                }
            }
        }
        return dp[m][n];
    }
}
```

```cpp
class Solution {
public:
    bool isMatch(string s, string p) {
        int m = s.size(), n = p.size();
        vector<vector<bool>> dp(m + 1, vector<bool>(n + 1, false));  // dp[i][j]: s[0..i) matches p[0..j)
        dp[0][0] = true;
        for (int j = 2; j <= n; j++) {
            if (p[j - 1] == '*') {
                dp[0][j] = dp[0][j - 2];  // x* can match the empty string
            }
        }
        for (int i = 1; i <= m; i++) {
            for (int j = 1; j <= n; j++) {
                if (p[j - 1] == '*') {
                    dp[i][j] = dp[i][j - 2];  // zero copies of p[j-2]
                    if (p[j - 2] == '.' || p[j - 2] == s[i - 1]) {
                        dp[i][j] = dp[i][j] || dp[i - 1][j];  // one more copy
                    }
                } else if (p[j - 1] == '.' || p[j - 1] == s[i - 1]) {
                    dp[i][j] = dp[i - 1][j - 1];
                }
            }
        }
        return dp[m][n];
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
  const m = s.length, n = p.length;
  // dp[i][j]: s.slice(0, i) matches p.slice(0, j)
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(false));
  dp[0][0] = true;
  for (let j = 2; j <= n; j++) {
    if (p[j - 1] === '*') dp[0][j] = dp[0][j - 2]; // x* can match the empty string
  }
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (p[j - 1] === '*') {
        dp[i][j] = dp[i][j - 2]; // zero copies of p[j-2]
        if (p[j - 2] === '.' || p[j - 2] === s[i - 1]) {
          dp[i][j] = dp[i][j] || dp[i - 1][j]; // one more copy
        }
      } else if (p[j - 1] === '.' || p[j - 1] === s[i - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      }
    }
  }
  return dp[m][n];
};
```

```go
func isMatch(s string, p string) bool {
	m, n := len(s), len(p)
	dp := make([][]bool, m+1) // dp[i][j]: s[:i] matches p[:j]
	for i := range dp {
		dp[i] = make([]bool, n+1)
	}
	dp[0][0] = true
	for j := 2; j <= n; j++ {
		if p[j-1] == '*' {
			dp[0][j] = dp[0][j-2] // x* can match the empty string
		}
	}
	for i := 1; i <= m; i++ {
		for j := 1; j <= n; j++ {
			if p[j-1] == '*' {
				dp[i][j] = dp[i][j-2] // zero copies of p[j-2]
				if p[j-2] == '.' || p[j-2] == s[i-1] {
					dp[i][j] = dp[i][j] || dp[i-1][j] // one more copy
				}
			} else if p[j-1] == '.' || p[j-1] == s[i-1] {
				dp[i][j] = dp[i-1][j-1]
			}
		}
	}
	return dp[m][n]
}
```
