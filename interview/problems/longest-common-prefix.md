---
title: Longest Common Prefix
leetcode: longest-common-prefix
description: "Longest Common Prefix explained: find the longest starting string shared by every word in a list by comparing them column by column, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given a list of strings `strs`. Find the longest string that every word in the list starts with, and return it. If the words do not all share at least their first character, return the empty string `""`.

The list contains at least one string. Strings may be empty and contain only lowercase English letters.

## Examples

- `strs = ["interview", "internet", "interval"]` → `"inter"`. All three begin with `inter`, and the next letters (`v`, `n`, `v`) differ.
- `strs = ["apple", "banana"]` → `""`. The first letters already differ.
- `strs = ["code", "coder", "co"]` → `"co"`. The prefix can never be longer than the shortest word.
- `strs = ["solo"]` → `"solo"`. With a single word, the word itself is the answer.

## Key idea

Picture the words stacked on top of each other, aligned on the left, and read them column by column. The common prefix keeps growing as long as every word has a character in the current column and all those characters are the same. The first column where a word runs out or a character differs is where the prefix ends.

## Approach

1. Use the first word as the reference.
2. For each position `i` from `0` up to its length:
   1. Let `c` be the reference word's character at `i`.
   2. Check every other word: if it has no character at `i` (it is too short) or its character differs from `c`, return the reference's first `i` characters.
3. If the loop finishes, the whole reference word is a prefix of every word, so return it.

## Complexity

Let `S` be the total number of characters in all strings.

- **Time:** O(S). Each character is compared at most once, and the scan stops at the first mismatch, so in practice it is O(n · m) where `m` is the length of the answer plus one.
- **Space:** O(1) besides the returned string.

## Common mistakes

- Reading past the end of a shorter word. Check the length before comparing characters.
- Returning `null` or crashing on a list that contains an empty string; the answer is then simply `""`.
- Comparing only neighbouring words with each other and keeping the longest match, instead of the prefix shared by all words.

## Follow-up questions

- *Can sorting help?* After sorting the list, only the first and last words need comparing: any prefix they share is shared by everything between them. This costs O(n log n) comparisons, so it is not faster, but it is short to write.
- *What if you get many prefix queries on the same word list?* Build a trie once; the common prefix is the path from the root while each node has exactly one child and no word ends there.

## Related problems

- Implement Trie (Prefix Tree): the data structure behind fast prefix questions.

## Solutions

```python
class Solution:
    def longestCommonPrefix(self, strs: List[str]) -> str:
        first = strs[0]
        for i, c in enumerate(first):
            for word in strs[1:]:
                if i == len(word) or word[i] != c:  # too short or a mismatch
                    return first[:i]
        return first
```

```java
class Solution {
    public String longestCommonPrefix(String[] strs) {
        String first = strs[0];
        for (int i = 0; i < first.length(); i++) {
            char c = first.charAt(i);
            for (int j = 1; j < strs.length; j++) {
                if (i == strs[j].length() || strs[j].charAt(i) != c) { // too short or a mismatch
                    return first.substring(0, i);
                }
            }
        }
        return first;
    }
}
```

```cpp
class Solution {
public:
    string longestCommonPrefix(vector<string>& strs) {
        const string& first = strs[0];
        for (size_t i = 0; i < first.size(); i++) {
            for (size_t j = 1; j < strs.size(); j++) {
                if (i == strs[j].size() || strs[j][i] != first[i]) {  // too short or a mismatch
                    return first.substr(0, i);
                }
            }
        }
        return first;
    }
};
```

```javascript
/**
 * @param {string[]} strs
 * @return {string}
 */
var longestCommonPrefix = function (strs) {
  const first = strs[0];
  for (let i = 0; i < first.length; i++) {
    for (let j = 1; j < strs.length; j++) {
      if (i === strs[j].length || strs[j][i] !== first[i]) { // too short or a mismatch
        return first.slice(0, i);
      }
    }
  }
  return first;
};
```

```go
func longestCommonPrefix(strs []string) string {
	first := strs[0]
	for i := 0; i < len(first); i++ {
		for _, word := range strs[1:] {
			if i == len(word) || word[i] != first[i] { // too short or a mismatch
				return first[:i]
			}
		}
	}
	return first
}
```
