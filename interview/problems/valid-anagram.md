---
title: Valid Anagram
leetcode: valid-anagram
description: "Valid Anagram explained: decide whether one string is a rearrangement of another by counting letters in a 26-slot array, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given two strings `s` and `t` made of lowercase English letters (each has at least one character). Return `true` if `t` is an *anagram* of `s`, and `false` otherwise.

An anagram uses exactly the same letters as the original, each the same number of times, only possibly in a different order. So the two strings must have the same length and the same count of every letter.

## Examples

- `s = "listen"`, `t = "silent"` → `true`. Both contain one each of `e, i, l, n, s, t`.
- `s = "bell"`, `t = "bel"` → `false`. The lengths differ, so a letter is missing.
- `s = "aab"`, `t = "abb"` → `false`. Same letters overall, but `a` appears twice in `s` and only once in `t`.
- `s = "x"`, `t = "x"` → `true`. A string is an anagram of itself.

## Key idea

Order does not matter, only *how many* of each letter there are. Since there are only 26 possible letters, keep one counter per letter: add 1 for every letter of `s` and subtract 1 for every letter of `t`. If the strings are anagrams, every counter ends at exactly zero; any non-zero counter means some letter appears more often in one string than in the other.

## Approach

1. If `s` and `t` have different lengths, return `false` right away.
2. Create an array `count` of 26 zeros, one slot per letter (`'a'` is slot 0, `'b'` slot 1, ...).
3. For each position `i`, do `count[s[i] - 'a'] += 1` and `count[t[i] - 'a'] -= 1`.
4. Return `true` if every slot is zero, otherwise `false`.

Another correct approach sorts both strings and compares them. It is short to write but takes O(n log n) time instead of O(n).

## Complexity

- **Time:** O(n), where n is the length of the strings. One pass to count, plus a fixed 26-slot check.
- **Space:** O(1). The counting array always has 26 slots, no matter how long the strings are.

## Common mistakes

- Only checking that both strings contain the same *set* of letters. `"aab"` and `"abb"` share the set `{a, b}` but are not anagrams.
- Forgetting the length check when you only count one string up and then look up the other: extra letters in `t` can slip through.
- Using a hash map when a 26-slot array is enough. The map works, but the array is simpler and faster.

## Follow-up questions

- What if the strings may contain any Unicode characters? Use a hash map from character to count instead of a fixed array. In Java and JavaScript, be careful that some characters take two UTF-16 code units; iterate by code point.
- How would you group a whole list of words into anagram groups? (Use the sorted word or the letter counts as a hash map key.)

## Related problems

- Group Anagrams
- Find All Anagrams in a String
- Ransom Note

## Solutions

```python
class Solution:
    def isAnagram(self, s: str, t: str) -> bool:
        if len(s) != len(t):
            return False
        count = [0] * 26
        for a, b in zip(s, t):
            count[ord(a) - ord('a')] += 1
            count[ord(b) - ord('a')] -= 1
        return all(c == 0 for c in count)
```

```java
class Solution {
    public boolean isAnagram(String s, String t) {
        if (s.length() != t.length()) {
            return false;
        }
        int[] count = new int[26];
        for (int i = 0; i < s.length(); i++) {
            count[s.charAt(i) - 'a']++;
            count[t.charAt(i) - 'a']--;
        }
        for (int c : count) {
            if (c != 0) {
                return false;
            }
        }
        return true;
    }
}
```

```cpp
class Solution {
public:
    bool isAnagram(string s, string t) {
        if (s.size() != t.size()) {
            return false;
        }
        int count[26] = {0};
        for (size_t i = 0; i < s.size(); i++) {
            count[s[i] - 'a']++;
            count[t[i] - 'a']--;
        }
        for (int c : count) {
            if (c != 0) {
                return false;
            }
        }
        return true;
    }
};
```

```javascript
/**
 * @param {string} s
 * @param {string} t
 * @return {boolean}
 */
var isAnagram = function (s, t) {
  if (s.length !== t.length) {
    return false;
  }
  const count = new Array(26).fill(0);
  for (let i = 0; i < s.length; i++) {
    count[s.charCodeAt(i) - 97]++; // 97 is the code of 'a'
    count[t.charCodeAt(i) - 97]--;
  }
  return count.every((c) => c === 0);
};
```

```go
func isAnagram(s string, t string) bool {
	if len(s) != len(t) {
		return false
	}
	var count [26]int
	for i := 0; i < len(s); i++ {
		count[s[i]-'a']++
		count[t[i]-'a']--
	}
	for _, c := range count {
		if c != 0 {
			return false
		}
	}
	return true
}
```
