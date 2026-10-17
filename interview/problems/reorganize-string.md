---
title: Reorganize String
leetcode: reorganize-string
description: "Reorganize String explained: rearrange a string's letters so that no two neighbours are equal by placing the most frequent letter in every other slot, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given a string `s` of lowercase letters (at least one). Rearrange its letters so that **no two adjacent characters are the same**, and return any such arrangement. If no arrangement works, return the empty string `""`.

The string has at most 500 characters. Several answers are usually valid; any one of them is accepted.

## Examples

- `"aab"` → `"aba"`. The two `a`s are kept apart by the `b`.
- `"aaab"` → `""`. Three `a`s need at least two other letters between them, and there is only one `b`.
- `"vvvlo"` → `"vlvov"` (or `"vovlv"`, `"vlvov"`…). Three `v`s fit at positions 0, 2 and 4 of a 5-letter string, and the other letters fill the gaps.
- `"a"` → `"a"`. One letter has no neighbour.
- `"aabb"` → `"abab"` or `"baba"`.

## Key idea

Only the **most frequent letter** can cause trouble. In a string of length `n` there are `ceil(n / 2)` "every other" slots (positions 0, 2, 4, …), so a letter with more than `(n + 1) / 2` copies cannot be kept apart no matter what, and the answer is `""`. If it fits, place that letter in every other slot starting from position 0. Then take the remaining letters, most frequent first, and keep filling the leftover even positions and then the odd positions. A letter that wraps from the even slots to the odd slots can never land next to itself, because that would require even more copies than the most frequent letter had.

## Approach

1. Count every letter (26 counters). Let `n = len(s)`.
2. Find the letter with the largest count. If that count is greater than `(n + 1) / 2` (integer division), return `""`.
3. Create an output array of `n` characters and a write index `pos = 0`.
4. Write the most frequent letter at `pos = 0, 2, 4, …` until its count is used up.
5. For every other letter, repeat while it still has copies left: write it at `pos`, then `pos += 2`; when `pos` reaches `n`, jump to `pos = 1` and continue through the odd positions.
6. Join the array into a string and return it.

The alternative most people reach for first is a **max-heap** of `(count, letter)`: repeatedly pop the most frequent letter that differs from the last one written, append it, and push the previously held letter back. It is also correct and generalises to "letters at least k apart", but the even/odd fill is shorter and runs in linear time with no heap at all. A brute force that tries every permutation is hopeless even for a dozen letters.

## Complexity

- **Time:** O(n + 26 log 26) ≈ O(n): one counting pass, a sort of at most 26 letters, and one pass to write the output.
- **Space:** O(n) for the output, plus 26 counters.

## Common mistakes

- Using `n / 2` instead of `(n + 1) / 2` as the limit. For `"aba"` the letter `a` appears twice in a string of length 3, which is fine.
- Starting the remaining letters at an odd position instead of continuing where the most frequent letter stopped. That leaves even slots empty and can put two equal letters together later.
- In the heap version, forgetting to push the held-back letter back into the heap, which drops letters from the output.
- Returning the original string when it already has no equal neighbours *without* handling the impossible case; the impossibility check must come first.

## Follow-up questions

- *What if equal letters must be at least `k` apart?* The heap approach with a queue that holds a letter for `k - 1` steps handles it (Rearrange String k Distance Apart).
- *How is this related to scheduling?* Task Scheduler asks the same question about CPU tasks with a cooldown between repeats; the same counting argument gives the answer.
- *What if the string contained Unicode?* Replace the 26 counters with a hash map; the slot argument is unchanged.

## Related problems

- [Task Scheduler](/interview/problems/task-scheduler/)
- [Top K Frequent Elements](/interview/problems/top-k-frequent-elements/)
- Rearrange String k Distance Apart
- Distant Barcodes

## Solutions

```python
class Solution:
    def reorganizeString(self, s: str) -> str:
        n = len(s)
        counts = Counter(s)
        letters = sorted(counts, key=lambda c: -counts[c])  # most frequent first
        if counts[letters[0]] > (n + 1) // 2:
            return ''
        out = [''] * n
        pos = 0
        for letter in letters:
            for _ in range(counts[letter]):
                if pos >= n:  # even slots are full, continue with the odd ones
                    pos = 1
                out[pos] = letter
                pos += 2
        return ''.join(out)
```

```java
class Solution {
    public String reorganizeString(String s) {
        int n = s.length();
        int[] counts = new int[26];
        for (char c : s.toCharArray()) counts[c - 'a']++;
        Integer[] letters = new Integer[26];
        for (int i = 0; i < 26; i++) letters[i] = i;
        Arrays.sort(letters, (a, b) -> counts[b] - counts[a]); // most frequent first
        if (counts[letters[0]] > (n + 1) / 2) {
            return "";
        }
        char[] out = new char[n];
        int pos = 0;
        for (int letter : letters) {
            for (int k = 0; k < counts[letter]; k++) {
                if (pos >= n) pos = 1; // even slots are full, continue with the odd ones
                out[pos] = (char) ('a' + letter);
                pos += 2;
            }
        }
        return new String(out);
    }
}
```

```cpp
class Solution {
public:
    string reorganizeString(string s) {
        int n = s.size();
        vector<int> counts(26, 0);
        for (char c : s) counts[c - 'a']++;
        vector<int> letters(26);
        iota(letters.begin(), letters.end(), 0);
        sort(letters.begin(), letters.end(), [&](int a, int b) { return counts[a] > counts[b]; });  // most frequent first
        if (counts[letters[0]] > (n + 1) / 2) {
            return "";
        }
        string out(n, ' ');
        int pos = 0;
        for (int letter : letters) {
            for (int k = 0; k < counts[letter]; k++) {
                if (pos >= n) pos = 1;  // even slots are full, continue with the odd ones
                out[pos] = 'a' + letter;
                pos += 2;
            }
        }
        return out;
    }
};
```

```javascript
/**
 * @param {string} s
 * @return {string}
 */
var reorganizeString = function (s) {
  const n = s.length;
  const counts = new Map();
  for (const c of s) counts.set(c, (counts.get(c) || 0) + 1);
  const letters = [...counts.keys()].sort((a, b) => counts.get(b) - counts.get(a)); // most frequent first
  if (counts.get(letters[0]) > Math.floor((n + 1) / 2)) {
    return '';
  }
  const out = new Array(n);
  let pos = 0;
  for (const letter of letters) {
    for (let k = 0; k < counts.get(letter); k++) {
      if (pos >= n) pos = 1; // even slots are full, continue with the odd ones
      out[pos] = letter;
      pos += 2;
    }
  }
  return out.join('');
};
```

```go
import "sort"

func reorganizeString(s string) string {
	n := len(s)
	counts := [26]int{}
	for i := 0; i < n; i++ {
		counts[s[i]-'a']++
	}
	letters := make([]int, 26)
	for i := range letters {
		letters[i] = i
	}
	sort.Slice(letters, func(a, b int) bool { return counts[letters[a]] > counts[letters[b]] }) // most frequent first
	if counts[letters[0]] > (n+1)/2 {
		return ""
	}
	out := make([]byte, n)
	pos := 0
	for _, letter := range letters {
		for k := 0; k < counts[letter]; k++ {
			if pos >= n { // even slots are full, continue with the odd ones
				pos = 1
			}
			out[pos] = byte('a' + letter)
			pos += 2
		}
	}
	return string(out)
}
```
