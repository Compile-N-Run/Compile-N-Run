---
title: Minimum Window Substring
leetcode: minimum-window-substring
description: "Minimum Window Substring explained: find the shortest part of a string that contains every character of another string (duplicates included) with a sliding window and character counts, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given two strings, `s` and `t`, each made of upper- and lowercase English letters and each at least one character long. Find the shortest contiguous piece (substring) of `s` that contains every character of `t`, **counting repeats**: if `t` has two `a`s, the piece must contain at least two `a`s. The piece may contain extra characters, and the order of characters does not matter.

Return that substring. If no piece of `s` works, return the empty string `""`. Whenever an answer exists, the inputs guarantee that the shortest one is unique. Uppercase and lowercase letters are different characters.

## Examples

- `s = "thequickfox"`, `t = "qf"` → `"quickf"`. It is the only stretch that contains both a `q` and an `f`.
- `s = "abacab"`, `t = "aab"` → `"aba"`. The window needs two `a`s and one `b`; `"aba"` (the first three letters) is the only window of length 3 that has them.
- `s = "abc"`, `t = "aa"` → `""`. `s` has only one `a`, so no window can hold two.
- `s = "a"`, `t = "ab"` → `""`. `t` is longer than `s`, so it cannot fit.

## Key idea

Use a **sliding window** with two pointers, `left` and `right`. Move `right` forward to grow the window until it contains everything `t` needs. Then move `left` forward to shrink the window as long as it still contains everything, recording the shortest valid window seen. When it stops being valid, go back to growing.

To know in O(1) whether the window is valid, keep a count `need[c]` of how many more copies of each character `c` the window still needs, and a single number `missing` = the total number of characters of `t` still not covered. The window is valid exactly when `missing == 0`.

## Approach

1. Fill `need[c]` with the number of times each character `c` appears in `t`. Set `missing = len(t)`, `left = 0`, and remember the best window as (`bestStart`, `bestLen = infinity`).
2. For each `right` from 0 to the end of `s`, with `c = s[right]`:
   1. If `need[c] > 0`, this character covers something `t` still needs, so decrease `missing`.
   2. Decrease `need[c]` (it may go negative; that means the window has spare copies of `c`).
   3. While `missing == 0` (the window `s[left..right]` is valid):
      1. If its length `right - left + 1` is smaller than `bestLen`, record it.
      2. Remove `s[left]` from the window: increase `need[s[left]]`. If it becomes positive, the window just lost a character it needed, so increase `missing`.
      3. Move `left` one step right.
3. Return `s[bestStart : bestStart + bestLen]`, or `""` if `bestLen` is still infinity.

The brute force checks every substring and counts its characters: O(m²) substrings, each costing more work to check, which is far too slow for strings of 100,000 characters.

## Complexity

- **Time:** O(m + n), where m = `len(s)` and n = `len(t)`. Each pointer moves forward through `s` at most once, and building the counts takes O(n).
- **Space:** O(1). The count array has a fixed 128 slots (one per ASCII code), whatever the input size.

## Common mistakes

- Treating `t` as a set of characters and ignoring duplicates. `t = "aa"` needs two `a`s.
- Decreasing `missing` for *every* matching character, including spare copies. Only decrease it while `need[c]` is still positive.
- Recording the window after moving `left` instead of before, which gives a window that is already invalid.
- Building the answer string on every improvement. Store the start and length, and slice once at the end.

## Follow-up questions

- How would you solve it if `s` were huge and `t` used only a few characters? (Filter `s` down to positions whose character is in `t`, then slide over that shorter list.)
- What if the window had to contain the characters of `t` *in order*? That becomes Minimum Window Subsequence, usually solved with dynamic programming or a two-pass scan.

## Related problems

- Longest Substring Without Repeating Characters
- Find All Anagrams in a String
- Sliding Window Maximum

## Solutions

```python
class Solution:
    def minWindow(self, s: str, t: str) -> str:
        need = [0] * 128  # how many more of each character the window needs
        for c in t:
            need[ord(c)] += 1
        missing = len(t)
        left, best_start, best_len = 0, 0, float('inf')
        for right, c in enumerate(s):
            if need[ord(c)] > 0:
                missing -= 1
            need[ord(c)] -= 1
            while missing == 0:
                if right - left + 1 < best_len:
                    best_start, best_len = left, right - left + 1
                need[ord(s[left])] += 1
                if need[ord(s[left])] > 0:
                    missing += 1
                left += 1
        return "" if best_len == float('inf') else s[best_start:best_start + best_len]
```

```java
class Solution {
    public String minWindow(String s, String t) {
        int[] need = new int[128]; // how many more of each character the window needs
        for (int i = 0; i < t.length(); i++) {
            need[t.charAt(i)]++;
        }
        int missing = t.length();
        int left = 0, bestStart = 0, bestLen = Integer.MAX_VALUE;
        for (int right = 0; right < s.length(); right++) {
            char c = s.charAt(right);
            if (need[c] > 0) {
                missing--;
            }
            need[c]--;
            while (missing == 0) {
                if (right - left + 1 < bestLen) {
                    bestStart = left;
                    bestLen = right - left + 1;
                }
                char out = s.charAt(left);
                need[out]++;
                if (need[out] > 0) {
                    missing++;
                }
                left++;
            }
        }
        return bestLen == Integer.MAX_VALUE ? "" : s.substring(bestStart, bestStart + bestLen);
    }
}
```

```cpp
class Solution {
public:
    string minWindow(string s, string t) {
        vector<int> need(128, 0);  // how many more of each character the window needs
        for (char c : t) {
            need[c]++;
        }
        int missing = t.size();
        int left = 0, bestStart = 0, bestLen = INT_MAX;
        for (int right = 0; right < (int)s.size(); right++) {
            char c = s[right];
            if (need[c] > 0) {
                missing--;
            }
            need[c]--;
            while (missing == 0) {
                if (right - left + 1 < bestLen) {
                    bestStart = left;
                    bestLen = right - left + 1;
                }
                char out = s[left];
                need[out]++;
                if (need[out] > 0) {
                    missing++;
                }
                left++;
            }
        }
        return bestLen == INT_MAX ? "" : s.substr(bestStart, bestLen);
    }
};
```

```javascript
/**
 * @param {string} s
 * @param {string} t
 * @return {string}
 */
var minWindow = function (s, t) {
  const need = new Array(128).fill(0); // how many more of each character the window needs
  for (let i = 0; i < t.length; i++) {
    need[t.charCodeAt(i)]++;
  }
  let missing = t.length;
  let left = 0, bestStart = 0, bestLen = Infinity;
  for (let right = 0; right < s.length; right++) {
    const c = s.charCodeAt(right);
    if (need[c] > 0) {
      missing--;
    }
    need[c]--;
    while (missing === 0) {
      if (right - left + 1 < bestLen) {
        bestStart = left;
        bestLen = right - left + 1;
      }
      const out = s.charCodeAt(left);
      need[out]++;
      if (need[out] > 0) {
        missing++;
      }
      left++;
    }
  }
  return bestLen === Infinity ? "" : s.substring(bestStart, bestStart + bestLen);
};
```

```go
func minWindow(s string, t string) string {
	var need [128]int // how many more of each character the window needs
	for i := 0; i < len(t); i++ {
		need[t[i]]++
	}
	missing := len(t)
	left, bestStart, bestLen := 0, 0, len(s)+1
	for right := 0; right < len(s); right++ {
		c := s[right]
		if need[c] > 0 {
			missing--
		}
		need[c]--
		for missing == 0 {
			if right-left+1 < bestLen {
				bestStart, bestLen = left, right-left+1
			}
			out := s[left]
			need[out]++
			if need[out] > 0 {
				missing++
			}
			left++
		}
	}
	if bestLen > len(s) {
		return ""
	}
	return s[bestStart : bestStart+bestLen]
}
```
