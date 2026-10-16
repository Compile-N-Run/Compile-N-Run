---
title: Longest Substring Without Repeating Characters
leetcode: longest-substring-without-repeating-characters
description: "Longest Substring Without Repeating Characters explained: find the longest run of distinct characters with a sliding window and a last-seen map, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given a string `s`, which may be empty and may contain letters, digits, symbols and spaces. Return the length of the longest **substring** (a contiguous block of characters) in which no character appears more than once.

Only the length is returned, not the substring itself. A subsequence that skips characters does not count.

## Examples

- `s = "xyzxab"` → `5`. The window `"yzxab"` has five different characters; `"xyzxab"` itself repeats `x`.
- `s = "abba"` → `2`. Both `"ab"` and `"ba"` work; any longer block repeats a letter.
- `s = "zzzz"` → `1`. Every block of two or more characters repeats `z`.
- `s = ""` → `0`. An empty string has no characters at all.

## Key idea

Keep a **sliding window** `[left, right]` that never contains a repeated character. Move `right` forward one character at a time. If the new character already appears inside the window, the window must now start just after that earlier occurrence, so jump `left` there directly. To know where the earlier occurrence was, remember the **last index** at which each character was seen in a hash map. The longest window you ever see is the answer.

## Approach

1. Create an empty map `last` from character to the index where it was last seen. Set `left = 0` and `best = 0`.
2. For each index `right` with character `c`:
   1. If `c` is in `last` and `last[c] >= left`, the earlier copy is inside the window. Move `left` to `last[c] + 1`.
   2. Store `last[c] = right`.
   3. Update `best = max(best, right - left + 1)`.
3. Return `best`.

The check `last[c] >= left` matters: an old occurrence that is already to the left of the window must not pull `left` backwards. In `"abba"`, when the final `a` arrives, its old index 0 is outside the window `[2, 2]`, so `left` stays at 2.

The brute-force alternative checks every substring for duplicates, which is O(n²) substrings with O(n) work each. Even the improved O(n²) version (grow from each start until a repeat) is too slow for strings of tens of thousands of characters.

## Complexity

- **Time:** O(n). `right` visits each character once and `left` only moves forward.
- **Space:** O(k), where `k` is the number of distinct characters (at most the size of the character set, for example 128 for ASCII).

## Common mistakes

- Setting `left = last[c] + 1` without checking that the old index is inside the window, which moves `left` backwards and gives `3` instead of `2` for `"abba"`.
- Computing the window length as `right - left` instead of `right - left + 1`.
- Forgetting the empty string, where the answer is `0`.
- Confusing substring with subsequence: the characters must be next to each other.

## Follow-up questions

- How would you return the substring itself? (Also remember the `left` and `right` of the best window.)
- What if at most `k` distinct characters are allowed, rather than all distinct? (Longest Substring with At Most K Distinct Characters, which shrinks the window with a counter map.)

## Related problems

- Longest Substring with At Most Two Distinct Characters
- Minimum Window Substring
- Longest Repeating Character Replacement

## Solutions

```python
class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        last = {}  # character -> last index seen
        left = best = 0
        for right, c in enumerate(s):
            if c in last and last[c] >= left:
                left = last[c] + 1  # jump past the earlier copy
            last[c] = right
            best = max(best, right - left + 1)
        return best
```

```java
class Solution {
    public int lengthOfLongestSubstring(String s) {
        Map<Character, Integer> last = new HashMap<>(); // character -> last index seen
        int left = 0, best = 0;
        for (int right = 0; right < s.length(); right++) {
            char c = s.charAt(right);
            Integer prev = last.get(c);
            if (prev != null && prev >= left) {
                left = prev + 1; // jump past the earlier copy
            }
            last.put(c, right);
            best = Math.max(best, right - left + 1);
        }
        return best;
    }
}
```

```cpp
class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        unordered_map<char, int> last;  // character -> last index seen
        int left = 0, best = 0;
        for (int right = 0; right < (int)s.size(); right++) {
            char c = s[right];
            auto it = last.find(c);
            if (it != last.end() && it->second >= left) {
                left = it->second + 1;  // jump past the earlier copy
            }
            last[c] = right;
            best = max(best, right - left + 1);
        }
        return best;
    }
};
```

```javascript
/**
 * @param {string} s
 * @return {number}
 */
var lengthOfLongestSubstring = function (s) {
  const last = new Map(); // character -> last index seen
  let left = 0;
  let best = 0;
  for (let right = 0; right < s.length; right++) {
    const c = s[right];
    if (last.has(c) && last.get(c) >= left) {
      left = last.get(c) + 1; // jump past the earlier copy
    }
    last.set(c, right);
    best = Math.max(best, right - left + 1);
  }
  return best;
};
```

```go
func lengthOfLongestSubstring(s string) int {
	last := make(map[byte]int) // character -> last index seen (the input is ASCII)
	left, best := 0, 0
	for right := 0; right < len(s); right++ {
		c := s[right]
		if prev, ok := last[c]; ok && prev >= left {
			left = prev + 1 // jump past the earlier copy
		}
		last[c] = right
		best = max(best, right-left+1)
	}
	return best
}
```
