---
title: First Unique Character in a String
leetcode: first-unique-character-in-a-string
description: "First Unique Character in a String explained: find the index of the first letter that appears exactly once with two passes over a 26-slot count table, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given a string `s` of lowercase English letters. Return the index of the first character that appears **exactly once** in the whole string, or `-1` if every character appears more than once.

"First" means the smallest index, not the first letter alphabetically. The string has at least one character and can be up to 100,000 characters long.

## Examples

- `s = "stress"` → `1`. `s` appears three times; `t` at index 1 is the first letter that occurs only once.
- `s = "racecar"` → `3`. `r`, `a` and `c` each appear twice; `e` at index 3 is unique.
- `s = "aabbcc"` → `-1`. Every letter is doubled.
- `s = "x"` → `0`. A single character is trivially unique.
- `s = "zzyzx"` → `2`. Both `y` (index 2) and `x` (index 4) are unique; the leftmost one wins.

## Key idea

A character is unique only if its total count in the string is 1, and you cannot know that until you have seen the whole string. So count first, then scan. Because the alphabet is just 26 lowercase letters, the count table is a fixed-size array indexed by `letter - 'a'`, and the second pass simply returns the first index whose letter has count 1.

## Approach

1. Create an integer array `count` of size 26, all zeros.
2. First pass: for each character `c` in `s`, do `count[c - 'a'] += 1`.
3. Second pass: for each index `i`, if `count[s[i] - 'a'] == 1`, return `i`.
4. If the second pass finishes, return `-1`.

The brute force checks each character against every other one, which is O(n²) and times out at 100,000 characters. A hash map works just like the array but is slower and not needed for a known small alphabet.

## Complexity

- **Time:** O(n). Two passes over the string with O(1) work per character.
- **Space:** O(1). The count array has 26 entries no matter how long the string is.

## Common mistakes

- Returning the character instead of its index.
- Returning on the first *letter* whose count is 1 while iterating the count array instead of the string. That gives the alphabetically first unique letter, not the leftmost one.
- Using a set of "seen" characters and returning the first character not yet seen. The first character is never seen yet, so that returns `0` for every string.
- Forgetting the `-1` case when nothing is unique.

## Follow-up questions

- *What if the characters can be any Unicode code point?* Use a hash map from character to count; the two-pass idea is unchanged.
- *What if the string is a stream and you must report the current first unique character after each new character?* Keep a queue (or ordered map) of candidates plus a count map; pop from the front while the front's count is above 1 (First Unique Number).
- *Can you do it in one pass?* Record the first index of each letter and a "repeated" flag; after the pass take the smallest index whose flag is not set. It is still two loops in spirit, but only one over the string.

## Related problems

- [Valid Anagram](/interview/problems/valid-anagram/)
- [Group Anagrams](/interview/problems/group-anagrams/)
- [Longest Substring Without Repeating Characters](/interview/problems/longest-substring-without-repeating-characters/)
- First Unique Number
- Sort Characters By Frequency

## Solutions

```python
class Solution:
    def firstUniqChar(self, s: str) -> int:
        count = [0] * 26
        for c in s:
            count[ord(c) - ord('a')] += 1
        for i, c in enumerate(s):
            if count[ord(c) - ord('a')] == 1:
                return i
        return -1
```

```java
class Solution {
    public int firstUniqChar(String s) {
        int[] count = new int[26];
        for (int i = 0; i < s.length(); i++) {
            count[s.charAt(i) - 'a']++;
        }
        for (int i = 0; i < s.length(); i++) {
            if (count[s.charAt(i) - 'a'] == 1) {
                return i;
            }
        }
        return -1;
    }
}
```

```cpp
class Solution {
public:
    int firstUniqChar(string s) {
        int count[26] = {0};
        for (char c : s) {
            count[c - 'a']++;
        }
        for (int i = 0; i < (int)s.size(); i++) {
            if (count[s[i] - 'a'] == 1) {
                return i;
            }
        }
        return -1;
    }
};
```

```javascript
/**
 * @param {string} s
 * @return {number}
 */
var firstUniqChar = function (s) {
  const count = new Array(26).fill(0);
  const a = 'a'.charCodeAt(0);
  for (let i = 0; i < s.length; i++) {
    count[s.charCodeAt(i) - a]++;
  }
  for (let i = 0; i < s.length; i++) {
    if (count[s.charCodeAt(i) - a] === 1) {
      return i;
    }
  }
  return -1;
};
```

```go
func firstUniqChar(s string) int {
	var count [26]int
	for i := 0; i < len(s); i++ {
		count[s[i]-'a']++
	}
	for i := 0; i < len(s); i++ {
		if count[s[i]-'a'] == 1 {
			return i
		}
	}
	return -1
}
```
