---
title: Group Anagrams
leetcode: group-anagrams
description: "Group Anagrams explained: put words made of the same letters into the same group by keying a hash map on each word's sorted letters, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given a list of strings `strs`. Two strings are *anagrams* of each other when one can be turned into the other by rearranging its letters, using every letter exactly once (for example `"listen"` and `"silent"`).

Split the strings into groups so that every group contains exactly the strings that are anagrams of each other, and return the list of groups. The groups, and the strings inside each group, may be returned in any order.

The list has at least one string. A string can be empty, and all strings use only lowercase English letters. Duplicate strings are kept: each copy appears in the output.

## Examples

- `strs = ["note", "stone", "tone", "onset", "cat"]` → `[["note", "tone"], ["stone", "onset"], ["cat"]]`. `"note"` and `"tone"` share the letters e, n, o, t; `"stone"` and `"onset"` share e, n, o, s, t.
- `strs = ["", "b", ""]` → `[["", ""], ["b"]]`. Two empty strings are anagrams of each other.
- `strs = ["loop"]` → `[["loop"]]`. A single string forms its own group.

## Key idea

Anagrams contain the same letters, just in a different order. If you sort the letters of a word, every anagram produces the same sorted string: `"stone"` and `"onset"` both become `"enost"`. That sorted string is a perfect *signature* for the group, so use it as the key of a hash map whose values are the lists of words with that signature.

## Approach

1. Create an empty hash map `groups` from signature to a list of words.
2. For each word `w` in `strs`:
   1. Compute its signature `key` by sorting the characters of `w`.
   2. Append `w` to `groups[key]` (creating the list the first time the key appears).
3. Return all the lists stored in the map.

The brute-force alternative compares every pair of words to check whether they are anagrams, which takes O(n²) comparisons. The signature lets each word find its group with one map lookup.

## Complexity

Let `n` be the number of strings and `k` the length of the longest one.

- **Time:** O(n · k log k). Each word is sorted once (O(k log k)) and inserted into the map once.
- **Space:** O(n · k) for the map, which stores every word and its signature.

## Common mistakes

- Using a set or a letter set as the key: `"aab"` and `"abb"` have the same set of letters `{a, b}` but are not anagrams. The key must keep letter counts, which a sorted string does.
- Dropping duplicate words. `["ab", "ab"]` must return one group with both copies.
- Forgetting the empty string; it is a valid word and its signature is the empty string.

## Follow-up questions

- *Can you avoid sorting?* Count the 26 letters of each word and use the counts (for example `"1#0#2#..."`) as the key. That makes the signature O(k) to build, for O(n · k) time overall.
- *What if the alphabet were all of Unicode?* Sorting still works; a fixed 26-slot count array no longer does, but a map of character counts does.

## Related problems

- Valid Anagram: decide whether two given strings are anagrams.
- Find All Anagrams in a String: a sliding window over letter counts.

## Solutions

```python
class Solution:
    def groupAnagrams(self, strs: List[str]) -> List[List[str]]:
        groups = defaultdict(list)  # sorted letters -> words
        for w in strs:
            groups[''.join(sorted(w))].append(w)
        return list(groups.values())
```

```java
class Solution {
    public List<List<String>> groupAnagrams(String[] strs) {
        Map<String, List<String>> groups = new HashMap<>(); // sorted letters -> words
        for (String w : strs) {
            char[] letters = w.toCharArray();
            Arrays.sort(letters);
            groups.computeIfAbsent(new String(letters), k -> new ArrayList<>()).add(w);
        }
        return new ArrayList<>(groups.values());
    }
}
```

```cpp
class Solution {
public:
    vector<vector<string>> groupAnagrams(vector<string>& strs) {
        unordered_map<string, vector<string>> groups;  // sorted letters -> words
        for (const string& w : strs) {
            string key = w;
            sort(key.begin(), key.end());
            groups[key].push_back(w);
        }
        vector<vector<string>> result;
        for (auto& [key, words] : groups) {
            result.push_back(move(words));
        }
        return result;
    }
};
```

```javascript
/**
 * @param {string[]} strs
 * @return {string[][]}
 */
var groupAnagrams = function (strs) {
  const groups = new Map(); // sorted letters -> words
  for (const w of strs) {
    const key = [...w].sort().join('');
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key).push(w);
  }
  return [...groups.values()];
};
```

```go
import "sort"

func groupAnagrams(strs []string) [][]string {
	groups := make(map[string][]string) // sorted letters -> words
	for _, w := range strs {
		letters := []byte(w)
		sort.Slice(letters, func(i, j int) bool { return letters[i] < letters[j] })
		key := string(letters)
		groups[key] = append(groups[key], w)
	}
	result := make([][]string, 0, len(groups))
	for _, words := range groups {
		result = append(result, words)
	}
	return result
}
```
