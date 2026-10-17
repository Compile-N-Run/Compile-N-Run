---
title: Word Break II
leetcode: word-break-ii
description: "Word Break II explained: list every way to split a string into dictionary words with a memoized depth-first search over suffixes, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given a string `s` and a list of distinct words `wordDict`. Insert spaces into `s` so that every piece is a dictionary word, and return **all** such sentences. A word may be reused any number of times, and the sentences may be returned in any order. If `s` cannot be split, return an empty list.

All strings are non-empty and contain only lowercase English letters. LeetCode keeps `s` short (at most 20 characters) and promises that the number of valid sentences is small enough to list.

## Examples

- `s = "icecreamcone"`, `wordDict = ["ice", "cream", "cone", "icecream"]` → `["ice cream cone", "icecream cone"]`. Both `"ice" + "cream"` and `"icecream"` cover the first eight letters.
- `s = "sunflowerpot"`, `wordDict = ["sun", "flower", "pot", "flow", "erpot"]` → `["sun flower pot", "sun flow erpot"]`.
- `s = "hotdogs"`, `wordDict = ["hot", "dog", "hotdog"]` → `[]`. Every split leaves a trailing `"s"`.
- `s = "aaa"`, `wordDict = ["a", "aa"]` → `["a a a", "a aa", "aa a"]`. The same word can appear several times in one sentence.

## Key idea

Every sentence for `s` is a dictionary word that matches the start of `s`, followed by a sentence for the rest. So the set of sentences for the suffix `s[i:]` depends only on `i`: once we have computed it, we can reuse it every time a different first part ends at position `i`. A depth-first search from index 0 that remembers (memoizes) the answer for each suffix never explores the same suffix twice, which is what keeps the search from blowing up on inputs like `"aaaa..."` with words `"a"`, `"aa"`, `"aaa"`.

## Approach

1. Put the words into a hash set and record the longest word length `maxLen`; no piece can be longer than that.
2. Define `sentences(i)`: the list of sentences that cover `s[i:]`.
   - If `i == len(s)`, return a list holding one empty sentence (the base case that lets the caller append nothing).
   - Otherwise, for every end `j` from `i + 1` to `min(n, i + maxLen)`: if `s[i:j]` is a word, take every sentence of `sentences(j)` and prepend `s[i:j]` (with a space when the rest is non-empty).
   - Store the result in a memo keyed by `i` before returning it.
3. Return `sentences(0)`.

A plain recursion without the memo is correct but can repeat the same work exponentially often. A faster variant first runs the boolean DP of Word Break backwards to find which suffixes can be split at all, and only explores those; it matters for inputs that have a long unreachable tail.

## Complexity

- **Time:** O(n · L + n · A), where `n` is the length of `s`, `L` is `maxLen` and `A` is the total size of the output: each suffix is explored once, and every sentence is copied once per word it contains, which is bounded by the output size.
- **Space:** O(n · A) in the worst case for the memo, since suffix lists share no storage; the recursion depth is at most `n`.

## Common mistakes

- Returning an empty list for the base case `i == n`. The caller then has nothing to prepend to, and no sentence is ever produced. The base case must be a list with one empty sentence.
- Forgetting to memoize, which times out on strings made of a single repeated letter.
- Building sentences with a trailing or leading space; join the parts instead of concatenating a space after every word.
- Comparing the output in a fixed order in your own tests; LeetCode accepts any order, so sort before comparing.

## Follow-up questions

- How would you only count the sentences, or return the number of ways? (Then the DP of Word Break with counts instead of booleans is enough and runs in O(n · L).)
- What if the dictionary is huge and `s` is long? (Store the words in a trie and walk it from each start index, so that matching all words starting at `i` costs O(L) instead of O(L²).)

## Related problems

- [Word Break](/interview/problems/word-break/)
- [Combination Sum](/interview/problems/combination-sum/)
- [Restore IP Addresses](/interview/problems/restore-ip-addresses/)
- Concatenated Words

## Solutions

```python
class Solution:
    def wordBreak(self, s: str, wordDict: List[str]) -> List[str]:
        words = set(wordDict)
        max_len = max(map(len, wordDict))
        memo = {len(s): ['']}  # the empty suffix has exactly one (empty) sentence

        def sentences(i: int) -> List[str]:
            if i in memo:
                return memo[i]
            result = []
            for j in range(i + 1, min(len(s), i + max_len) + 1):
                piece = s[i:j]
                if piece in words:
                    for rest in sentences(j):
                        result.append(piece if rest == '' else piece + ' ' + rest)
            memo[i] = result
            return result

        return sentences(0)
```

```java
class Solution {
    private final Map<Integer, List<String>> memo = new HashMap<>();
    private Set<String> words;
    private int maxLen;
    private String s;

    public List<String> wordBreak(String s, List<String> wordDict) {
        this.s = s;
        words = new HashSet<>(wordDict);
        for (String w : wordDict) maxLen = Math.max(maxLen, w.length());
        memo.put(s.length(), List.of("")); // the empty suffix has exactly one (empty) sentence
        return sentences(0);
    }

    private List<String> sentences(int i) {
        List<String> cached = memo.get(i);
        if (cached != null) return cached;
        List<String> result = new ArrayList<>();
        for (int j = i + 1; j <= Math.min(s.length(), i + maxLen); j++) {
            String piece = s.substring(i, j);
            if (!words.contains(piece)) continue;
            for (String rest : sentences(j)) result.add(rest.isEmpty() ? piece : piece + " " + rest);
        }
        memo.put(i, result);
        return result;
    }
}
```

```cpp
class Solution {
public:
    vector<string> wordBreak(string s, vector<string>& wordDict) {
        unordered_set<string> words(wordDict.begin(), wordDict.end());
        size_t maxLen = 0;
        for (const string& w : wordDict) maxLen = max(maxLen, w.size());
        unordered_map<size_t, vector<string>> memo;
        memo[s.size()] = {""};  // the empty suffix has exactly one (empty) sentence

        function<const vector<string>&(size_t)> sentences = [&](size_t i) -> const vector<string>& {
            auto it = memo.find(i);
            if (it != memo.end()) return it->second;
            vector<string> result;
            for (size_t j = i + 1; j <= min(s.size(), i + maxLen); j++) {
                string piece = s.substr(i, j - i);
                if (!words.count(piece)) continue;
                for (const string& rest : sentences(j)) result.push_back(rest.empty() ? piece : piece + " " + rest);
            }
            return memo[i] = move(result);
        };
        return sentences(0);
    }
};
```

```javascript
/**
 * @param {string} s
 * @param {string[]} wordDict
 * @return {string[]}
 */
var wordBreak = function (s, wordDict) {
  const words = new Set(wordDict);
  const maxLen = Math.max(...wordDict.map((w) => w.length));
  const memo = new Map([[s.length, ['']]]); // the empty suffix has exactly one (empty) sentence
  const sentences = (i) => {
    if (memo.has(i)) return memo.get(i);
    const result = [];
    for (let j = i + 1; j <= Math.min(s.length, i + maxLen); j++) {
      const piece = s.slice(i, j);
      if (!words.has(piece)) continue;
      for (const rest of sentences(j)) result.push(rest === '' ? piece : piece + ' ' + rest);
    }
    memo.set(i, result);
    return result;
  };
  return sentences(0);
};
```

```go
func wordBreak(s string, wordDict []string) []string {
	words := make(map[string]bool, len(wordDict))
	maxLen := 0
	for _, w := range wordDict {
		words[w] = true
		maxLen = max(maxLen, len(w))
	}
	memo := map[int][]string{len(s): {""}} // the empty suffix has exactly one (empty) sentence
	var sentences func(i int) []string
	sentences = func(i int) []string {
		if cached, ok := memo[i]; ok {
			return cached
		}
		result := []string{}
		for j := i + 1; j <= min(len(s), i+maxLen); j++ {
			piece := s[i:j]
			if !words[piece] {
				continue
			}
			for _, rest := range sentences(j) {
				if rest == "" {
					result = append(result, piece)
				} else {
					result = append(result, piece+" "+rest)
				}
			}
		}
		memo[i] = result
		return result
	}
	return sentences(0)
}
```
