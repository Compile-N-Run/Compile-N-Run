---
title: Longest Repeating Character Replacement
leetcode: longest-repeating-character-replacement
description: "Longest Repeating Character Replacement explained: find the longest substring that at most k edits can turn into one repeated letter, using a sliding window that tracks the most frequent letter, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given a string `s` of uppercase English letters and an integer `k`. You may pick at most `k` positions in the string and change each of them to any uppercase letter. Return the length of the longest substring that, after at most `k` such changes, consists of a single repeated letter.

The string has at least one character, and `k` can be `0` (no changes) or larger than the string's length.

## Examples

- `s = "AABCA", k = 1` → `3`. Change the `B` in `"AAB"` to get `"AAA"`. No window of length 4 works with one change.
- `s = "AABCA", k = 2` → `5`. Change `B` and `C` and the whole string becomes `"AAAAA"`.
- `s = "ABBBAA", k = 1` → `4`. `"ABBB"` needs one change; any length-5 window has at most three of one letter and would need two.
- `s = "XYZ", k = 0` → `1`. Without changes only single letters repeat.
- `s = "BBBB", k = 0` → `4`. The whole string already repeats.

## Key idea

A window of text can be made uniform when you keep its most common letter and change everything else, so it is valid exactly when `window length - count of its most frequent letter <= k`. Grow a window to the right one character at a time; whenever it becomes invalid, slide its left edge one step. Longer windows are what we want, so the window never needs to shrink: a window that was once valid at length `L` tells us the answer is at least `L`, and we only care about whether a longer one is possible.

There is a subtle shortcut. The "most frequent letter" count only has to be the largest count **ever seen** in the window, not the exact current maximum. If the real maximum drops after the left edge moves, the window is at most the same length as the one that achieved the old maximum, so it cannot improve the answer and the stale value is harmless. The answer only grows when a letter's count reaches a new high, and that moment is tracked exactly.

## Approach

1. Keep an array `count[26]` of letter frequencies in the window, a pointer `left = 0`, the largest count seen `maxCount = 0`, and `best = 0`.
2. For each `right` from `0` to `n - 1`:
   1. Add `s[right]` to `count` and update `maxCount` with its new count.
   2. If `right - left + 1 - maxCount > k`, the window needs too many changes: remove `s[left]` from `count` and move `left` one step. One step is enough because the window grew by one.
   3. Update `best` with the window length `right - left + 1`.
3. Return `best`.

The brute force checks every substring and counts its letters, O(n²) or O(n³), which is far too slow for strings of a hundred thousand characters. Recomputing the exact maximum over 26 letters after each move is another correct option at O(26n); the stale-maximum trick removes even that factor.

## Complexity

- **Time:** O(n). Each character enters the window once and leaves at most once.
- **Space:** O(1). A 26-entry count array.

## Common mistakes

- Counting the letters to change as `k` minus something per letter instead of using `window length - maxCount`.
- Forgetting to update `maxCount` when a count grows, so valid windows look invalid.
- Shrinking the window with a `while` loop and also recomputing the maximum: correct, but slower and easy to get wrong. With the stale maximum, a single `if` step is enough.
- Returning `maxCount + k` without capping it at the string's length; `k` may be larger than the string.

## Follow-up questions

- *Why can the maximum count be stale?* Because a window shorter than the best one found so far can never change the answer, and the window only grows when a letter's count sets a new record, which is tracked exactly.
- *What if the alphabet is unbounded (any Unicode character)?* Use a hash map for the counts; the algorithm stays the same.
- *What if you must choose the target letter in advance?* Run a plain "at most `k` characters that are not `c`" sliding window once per letter `c`, which is 26 passes.

## Related problems

- [Longest Substring Without Repeating Characters](/interview/problems/longest-substring-without-repeating-characters/)
- [Minimum Window Substring](/interview/problems/minimum-window-substring/)
- Max Consecutive Ones III
- Longest Substring with At Most K Distinct Characters

## Solutions

```python
class Solution:
    def characterReplacement(self, s: str, k: int) -> int:
        count = [0] * 26
        left = max_count = best = 0
        for right, ch in enumerate(s):
            idx = ord(ch) - ord('A')
            count[idx] += 1
            max_count = max(max_count, count[idx])
            if right - left + 1 - max_count > k:  # too many changes needed: slide the left edge
                count[ord(s[left]) - ord('A')] -= 1
                left += 1
            best = max(best, right - left + 1)
        return best
```

```java
class Solution {
    public int characterReplacement(String s, int k) {
        int[] count = new int[26];
        int left = 0, maxCount = 0, best = 0;
        for (int right = 0; right < s.length(); right++) {
            int idx = s.charAt(right) - 'A';
            count[idx]++;
            maxCount = Math.max(maxCount, count[idx]);
            if (right - left + 1 - maxCount > k) { // too many changes needed: slide the left edge
                count[s.charAt(left) - 'A']--;
                left++;
            }
            best = Math.max(best, right - left + 1);
        }
        return best;
    }
}
```

```cpp
class Solution {
public:
    int characterReplacement(string s, int k) {
        int count[26] = {0};
        int left = 0, maxCount = 0, best = 0;
        for (int right = 0; right < (int)s.size(); right++) {
            int idx = s[right] - 'A';
            count[idx]++;
            maxCount = max(maxCount, count[idx]);
            if (right - left + 1 - maxCount > k) {  // too many changes needed: slide the left edge
                count[s[left] - 'A']--;
                left++;
            }
            best = max(best, right - left + 1);
        }
        return best;
    }
};
```

```javascript
/**
 * @param {string} s
 * @param {number} k
 * @return {number}
 */
var characterReplacement = function (s, k) {
  const count = new Array(26).fill(0);
  let left = 0;
  let maxCount = 0;
  let best = 0;
  for (let right = 0; right < s.length; right++) {
    const idx = s.charCodeAt(right) - 65; // 'A'
    count[idx]++;
    maxCount = Math.max(maxCount, count[idx]);
    if (right - left + 1 - maxCount > k) {
      // too many changes needed: slide the left edge
      count[s.charCodeAt(left) - 65]--;
      left++;
    }
    best = Math.max(best, right - left + 1);
  }
  return best;
};
```

```go
func characterReplacement(s string, k int) int {
	var count [26]int
	left, maxCount, best := 0, 0, 0
	for right := 0; right < len(s); right++ {
		idx := s[right] - 'A'
		count[idx]++
		maxCount = max(maxCount, count[idx])
		if right-left+1-maxCount > k { // too many changes needed: slide the left edge
			count[s[left]-'A']--
			left++
		}
		best = max(best, right-left+1)
	}
	return best
}
```
