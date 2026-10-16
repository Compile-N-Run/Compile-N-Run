---
title: Word Break
leetcode: word-break
description: "Word Break explained: decide whether a string can be split into dictionary words using dynamic programming over prefixes, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given a string `s` and a list of distinct words `wordDict`. Return `true` if `s` can be cut into one or more pieces so that every piece is a word from the dictionary, and `false` otherwise.

A dictionary word may be used any number of times, and not every word has to be used. All strings are non-empty and contain only lowercase English letters.

## Examples

- `s = "sunflower"`, `wordDict = ["sun", "flower", "flow"]` → `true`: `"sun" + "flower"`.
- `s = "hotdogs"`, `wordDict = ["hot", "dog", "hotdog"]` → `false`. Every split leaves a trailing `"s"` that is not a word.
- `s = "abab"`, `wordDict = ["ab"]` → `true`: `"ab" + "ab"`. The same word can be reused.
- `s = "applepie"`, `wordDict = ["apple", "app", "lepie"]` → `true`: `"app" + "lepie"`. Grabbing the longest word first (`"apple"`) would leave `"pie"` and fail.

## Key idea

Ask a smaller question first: can the first `i` characters of `s` be split into words? Call the answer `ok[i]`. The empty prefix trivially can (`ok[0] = true`). A longer prefix `s[0:i]` can be split exactly when there is some cut point `j` where the prefix `s[0:j]` can be split (`ok[j]`) and the last piece `s[j:i]` is a dictionary word. Each answer only depends on shorter prefixes, so we fill `ok` from left to right, and the final answer is `ok[n]`. This is **dynamic programming**: it remembers each prefix's answer instead of re-exploring the same splits over and over.

## Approach

1. Put the words into a hash set for O(1) lookups, and note `maxLen`, the length of the longest word. No piece can be longer than that.
2. Create a boolean array `ok` of size `n + 1`, all `false`, and set `ok[0] = true`.
3. For each end position `i` from `1` to `n`:
   - For each start `j` from `i - 1` down to `max(0, i - maxLen)`: if `ok[j]` is true and `s[j:i]` is in the set, set `ok[i] = true` and stop checking this `i`.
4. Return `ok[n]`.

The plain recursive approach (try every word that matches the start, then recurse on the rest) is correct, but on inputs like `"aaaa...ab"` with words `"a"`, `"aa"`, `"aaa"` it explores an exponential number of splits. Greedy matching is simply wrong, as the `"applepie"` example shows.

## Complexity

- **Time:** O(n · L²), where `n` is the length of `s` and `L` is `maxLen`: for each of the `n` positions we try up to `L` cut points and build or hash a substring of length up to `L`.
- **Space:** O(n + total length of the words) for the `ok` array and the word set.

## Common mistakes

- Greedily taking the longest (or shortest) matching word. Some strings need a different choice early on.
- Off-by-one errors in `ok`: `ok[i]` describes the first `i` characters, so the array needs `n + 1` entries and the answer is `ok[n]`, not `ok[n - 1]`.
- Writing the recursion without memoization, which times out on long strings of repeated letters.
- Searching the word list linearly for every substring instead of using a set.

## Follow-up questions

- Return every possible sentence instead of just yes or no. (Word Break II: memoized DFS that builds the lists of splits.)
- How would a trie help? (Walk the trie from each reachable start position so you stop as soon as no word can match.)

## Related problems

- Word Break II
- Concatenated Words
- Coin Change (the same "can I build the total from pieces" DP shape)

## Solutions

```python
class Solution:
    def wordBreak(self, s: str, wordDict: List[str]) -> bool:
        words = set(wordDict)
        max_len = max(len(w) for w in wordDict)
        n = len(s)
        ok = [False] * (n + 1)  # ok[i]: the first i characters can be split
        ok[0] = True
        for i in range(1, n + 1):
            for j in range(i - 1, max(0, i - max_len) - 1, -1):
                if ok[j] and s[j:i] in words:
                    ok[i] = True
                    break
        return ok[n]
```

```java
class Solution {
    public boolean wordBreak(String s, List<String> wordDict) {
        Set<String> words = new HashSet<>(wordDict);
        int maxLen = 0;
        for (String w : wordDict) {
            maxLen = Math.max(maxLen, w.length());
        }
        int n = s.length();
        boolean[] ok = new boolean[n + 1]; // ok[i]: the first i characters can be split
        ok[0] = true;
        for (int i = 1; i <= n; i++) {
            for (int j = i - 1; j >= Math.max(0, i - maxLen); j--) {
                if (ok[j] && words.contains(s.substring(j, i))) {
                    ok[i] = true;
                    break;
                }
            }
        }
        return ok[n];
    }
}
```

```cpp
class Solution {
public:
    bool wordBreak(string s, vector<string>& wordDict) {
        unordered_set<string> words(wordDict.begin(), wordDict.end());
        int maxLen = 0;
        for (const string& w : wordDict) {
            maxLen = max(maxLen, (int)w.size());
        }
        int n = s.size();
        vector<bool> ok(n + 1, false);  // ok[i]: the first i characters can be split
        ok[0] = true;
        for (int i = 1; i <= n; i++) {
            for (int j = i - 1; j >= max(0, i - maxLen); j--) {
                if (ok[j] && words.count(s.substr(j, i - j))) {
                    ok[i] = true;
                    break;
                }
            }
        }
        return ok[n];
    }
};
```

```javascript
/**
 * @param {string} s
 * @param {string[]} wordDict
 * @return {boolean}
 */
var wordBreak = function (s, wordDict) {
  const words = new Set(wordDict);
  const maxLen = Math.max(...wordDict.map((w) => w.length));
  const n = s.length;
  const ok = new Array(n + 1).fill(false); // ok[i]: the first i characters can be split
  ok[0] = true;
  for (let i = 1; i <= n; i++) {
    for (let j = i - 1; j >= Math.max(0, i - maxLen); j--) {
      if (ok[j] && words.has(s.slice(j, i))) {
        ok[i] = true;
        break;
      }
    }
  }
  return ok[n];
};
```

```go
func wordBreak(s string, wordDict []string) bool {
	words := make(map[string]bool, len(wordDict))
	maxLen := 0
	for _, w := range wordDict {
		words[w] = true
		maxLen = max(maxLen, len(w))
	}
	n := len(s)
	ok := make([]bool, n+1) // ok[i]: the first i characters can be split
	ok[0] = true
	for i := 1; i <= n; i++ {
		for j := i - 1; j >= max(0, i-maxLen); j-- {
			if ok[j] && words[s[j:i]] {
				ok[i] = true
				break
			}
		}
	}
	return ok[n]
}
```
