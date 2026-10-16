---
title: Edit Distance
leetcode: edit-distance
description: "Edit Distance explained: count the fewest insertions, deletions and substitutions that turn one word into another with a prefix-by-prefix dynamic programming table, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given two strings, `word1` and `word2`. In one move you may **insert** a character anywhere in `word1`, **delete** any character of `word1`, or **replace** one character of `word1` with another. Return the smallest number of moves that turns `word1` into `word2`.

Either string may be empty; both contain only lowercase English letters and are at most 500 characters long. This value is also known as the Levenshtein distance.

## Examples

- `word1 = "kitten"`, `word2 = "sitting"` → `3`. Replace `k` with `s`, replace `e` with `i`, insert `g` at the end.
- `word1 = "sunday"`, `word2 = "saturday"` → `3`. Insert `a` and `t` after the `s`, then replace `n` with `r`.
- `word1 = "abc"`, `word2 = ""` → `3`. Everything has to be deleted.
- `word1 = "same"`, `word2 = "same"` → `0`. Nothing to do.

## Key idea

Look at the last characters of both words. If they are equal, forget them both and solve the problem for the shorter prefixes. If they differ, the last move of any optimal plan must do one of three things at that position: delete `word1`'s last character, insert `word2`'s last character, or replace one with the other. Each of those leaves a smaller pair of prefixes, so the answer is one plus the best of the three smaller answers. Because the same prefix pairs show up again and again, store their answers in a table instead of recomputing them: `dp[i][j]` is the distance between the first `i` characters of `word1` and the first `j` characters of `word2`.

## Approach

1. Let `m` and `n` be the lengths. Create a table `dp` with `m + 1` rows and `n + 1` columns.
2. Base cases: `dp[i][0] = i` (delete everything) and `dp[0][j] = j` (insert everything).
3. Fill the table row by row. For `i` from 1 to `m` and `j` from 1 to `n`:
   1. If `word1[i-1] == word2[j-1]`, then `dp[i][j] = dp[i-1][j-1]`.
   2. Otherwise `dp[i][j] = 1 + min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])`, which are delete, insert and replace in that order.
4. The answer is `dp[m][n]`.

Each row depends only on the row above, so the table can shrink to one row plus a variable that remembers the top-left cell before it is overwritten. The solutions below use that rolling-row version.

Trying every sequence of moves by recursion without memoisation branches three ways at each step and runs in exponential time; the table makes each prefix pair cost O(1).

## Complexity

- **Time:** O(m × n). Every cell of the table is filled once with constant work.
- **Space:** O(min(m, n)) with the rolling row (the solutions loop over the shorter word in the inner loop). The full table uses O(m × n).

## Common mistakes

- Off-by-one errors between table indexes and string indexes: `dp[i][j]` describes prefixes of length `i` and `j`, so it compares `word1[i-1]` with `word2[j-1]`.
- Forgetting the base row and column, which encode "turn a prefix into the empty string" and the other way round.
- In the rolling-row version, overwriting the diagonal cell before using it. Save `dp[j]` in a temporary before you update it.
- Adding 1 even when the characters match. A matching pair costs nothing.

## Follow-up questions

- *Which moves were made?* Keep the full table and walk back from `dp[m][n]`, choosing the neighbour that produced each value.
- *What if each operation has a different cost?* Replace the three `+ 1`s with the three costs; the structure is unchanged.
- *How is this related to the longest common subsequence?* With only insert and delete allowed, the distance is `m + n - 2 × LCS`.

## Related problems

- [Longest Palindromic Substring](/interview/problems/longest-palindromic-substring/)
- [Regular Expression Matching](/interview/problems/regular-expression-matching/)
- [Word Break](/interview/problems/word-break/)
- Longest Common Subsequence
- One Edit Distance
- Delete Operation for Two Strings

## Solutions

```python
class Solution:
    def minDistance(self, word1: str, word2: str) -> int:
        if len(word1) < len(word2):
            word1, word2 = word2, word1  # keep the shorter word in the inner loop
        n = len(word2)
        prev = list(range(n + 1))  # row for the empty prefix of word1: j insertions
        for i, c1 in enumerate(word1, 1):
            curr = [i] + [0] * n  # dp[i][0]: delete i characters
            for j, c2 in enumerate(word2, 1):
                if c1 == c2:
                    curr[j] = prev[j - 1]
                else:
                    curr[j] = 1 + min(prev[j], curr[j - 1], prev[j - 1])  # delete, insert, replace
            prev = curr
        return prev[n]
```

```java
class Solution {
    public int minDistance(String word1, String word2) {
        if (word1.length() < word2.length()) { // keep the shorter word in the inner loop
            String tmp = word1;
            word1 = word2;
            word2 = tmp;
        }
        int n = word2.length();
        int[] dp = new int[n + 1];
        for (int j = 0; j <= n; j++) {
            dp[j] = j; // empty prefix of word1: j insertions
        }
        for (int i = 1; i <= word1.length(); i++) {
            int diag = dp[0]; // dp[i-1][j-1] before it is overwritten
            dp[0] = i; // delete i characters
            for (int j = 1; j <= n; j++) {
                int above = dp[j];
                if (word1.charAt(i - 1) == word2.charAt(j - 1)) {
                    dp[j] = diag;
                } else {
                    dp[j] = 1 + Math.min(Math.min(above, dp[j - 1]), diag); // delete, insert, replace
                }
                diag = above;
            }
        }
        return dp[n];
    }
}
```

```cpp
class Solution {
public:
    int minDistance(string word1, string word2) {
        if (word1.size() < word2.size()) {
            swap(word1, word2);  // keep the shorter word in the inner loop
        }
        int n = word2.size();
        vector<int> dp(n + 1);
        iota(dp.begin(), dp.end(), 0);  // empty prefix of word1: j insertions
        for (int i = 1; i <= (int)word1.size(); i++) {
            int diag = dp[0];  // dp[i-1][j-1] before it is overwritten
            dp[0] = i;         // delete i characters
            for (int j = 1; j <= n; j++) {
                int above = dp[j];
                if (word1[i - 1] == word2[j - 1]) {
                    dp[j] = diag;
                } else {
                    dp[j] = 1 + min({above, dp[j - 1], diag});  // delete, insert, replace
                }
                diag = above;
            }
        }
        return dp[n];
    }
};
```

```javascript
/**
 * @param {string} word1
 * @param {string} word2
 * @return {number}
 */
var minDistance = function (word1, word2) {
  if (word1.length < word2.length) {
    [word1, word2] = [word2, word1]; // keep the shorter word in the inner loop
  }
  const n = word2.length;
  const dp = Array.from({ length: n + 1 }, (_, j) => j); // empty prefix of word1: j insertions
  for (let i = 1; i <= word1.length; i++) {
    let diag = dp[0]; // dp[i-1][j-1] before it is overwritten
    dp[0] = i; // delete i characters
    for (let j = 1; j <= n; j++) {
      const above = dp[j];
      if (word1[i - 1] === word2[j - 1]) {
        dp[j] = diag;
      } else {
        dp[j] = 1 + Math.min(above, dp[j - 1], diag); // delete, insert, replace
      }
      diag = above;
    }
  }
  return dp[n];
};
```

```go
func minDistance(word1 string, word2 string) int {
	if len(word1) < len(word2) {
		word1, word2 = word2, word1 // keep the shorter word in the inner loop
	}
	n := len(word2)
	dp := make([]int, n+1)
	for j := range dp {
		dp[j] = j // empty prefix of word1: j insertions
	}
	for i := 1; i <= len(word1); i++ {
		diag := dp[0] // dp[i-1][j-1] before it is overwritten
		dp[0] = i     // delete i characters
		for j := 1; j <= n; j++ {
			above := dp[j]
			if word1[i-1] == word2[j-1] {
				dp[j] = diag
			} else {
				dp[j] = 1 + min(above, dp[j-1], diag) // delete, insert, replace
			}
			diag = above
		}
	}
	return dp[n]
}
```
