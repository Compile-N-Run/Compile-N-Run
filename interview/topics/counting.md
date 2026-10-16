---
title: Counting
topic: Counting
group: patterns
description: "Counting explained: tally how often each value appears with a hash map or a small array, then answer questions about frequency, majority, uniqueness and anagrams in one or two linear passes."
---

## What it is

Counting is the simplest pattern on this site and one of the most useful: before you reason about the data, tally it. Walk the input once and record how many times each value appears, in a hash map (`value -> count`) or, when the values come from a small known range such as lowercase letters or digits, in a plain array of 26 or 10 slots. Then answer the question by looking at the counts instead of the original input.

Many problems that look like they need sorting, nested loops or clever searching collapse once the counts exist. "Which letter appears first only once?" is a question about counts. "Can these letters spell that word?" is a comparison of two count tables. "Which number appears more than half the time?" is a scan over counts. The tally turns a question about *positions* into a question about *quantities*, and quantities are easy.

A count table is also a cheap fingerprint. Two strings are anagrams exactly when their 26-slot count arrays are equal, so the array (or a sorted copy of the string) can be the key in a map that groups words by their letters.

## When to use it

- The problem mentions **frequency**, **occurrences**, **most common**, **least common**, **unique**, **duplicate**, **majority** or **k most frequent**.
- You need to compare **the contents of two collections ignoring order**: anagrams, "can `a` be built from the letters of `b`", "are these two arrays permutations of each other".
- Values come from a **small alphabet** (letters, digits, a bounded integer range), which makes a fixed-size array both faster and simpler than a map.
- The question is about **pairs with a property** that depends only on each value, such as "how many pairs sum to a multiple of 60": count by remainder, then multiply counts.
- You must **rearrange or schedule** items so that equal ones stay apart (Reorganize String, Task Scheduler). The answer is driven by the biggest count.

## How it works

1. **Pick the container.** If the values are lowercase letters, use an `int[26]` indexed by `c - 'a'`; for digits, `int[10]`; for arbitrary integers or strings, a hash map. An array is faster and never needs a "does the key exist" check.
2. **Tally.** For each item, increment its slot. One pass, O(n).
3. **Use the counts.** This is the problem-specific part, and there are only a few shapes:
   - scan the input *again* and use the count of each item (first unique character: the first item whose count is 1);
   - scan the *table* and pick the best entry (most frequent element, majority element);
   - compare two tables slot by slot (anagram check, ransom note);
   - sort or bucket the entries by count (top k frequent, sort characters by frequency).

A short trace for "first character that appears exactly once" on `"abcab"`:

```
tally:   a:2  b:2  c:1
second pass:  'a' → count 2, skip
              'b' → count 2, skip
              'c' → count 1 → answer index 2
```

And for "can the letters of `"aabbc"` spell `"abc"`?": tally both and check `have[c] >= need[c]` for every letter. `a:2 >= 1`, `b:2 >= 1`, `c:1 >= 1`, so yes.

A trick worth knowing is **bucket by count**. If you want the `k` most frequent items and `n` items total, no count can exceed `n`, so make `n + 1` buckets where bucket `i` holds the values with count `i`. Walk the buckets from the top until you have collected `k` values. That is O(n) and avoids a sort or a heap.

## Template

```python
from collections import defaultdict


def solve(items):
    """Count each value, then use the counts: here, return the most frequent
    value (earliest on ties). Swap step 2 for the problem's question."""
    # 1. Tally. For letters, an array of 26 ints indexed by ord(c) - ord('a') is faster.
    counts = defaultdict(int)
    for x in items:
        counts[x] += 1
    # 2. Use the counts: scan the table (or scan the input again and look up each item).
    best, best_count = None, 0
    for x in items:
        if counts[x] > best_count:
            best, best_count = x, counts[x]
    return best


if __name__ == "__main__":
    print(solve([3, 1, 3, 2, 1, 3]))   # 3
    print(solve("abcab"))              # a
```

```java
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class Counting {
    /** Count each value, then use the counts: here, return the most frequent
     *  value (earliest on ties). Swap step 2 for the problem's question. */
    static <T> T solve(List<T> items) {
        // 1. Tally. For letters, an int[26] indexed by c - 'a' is faster.
        Map<T, Integer> counts = new HashMap<>();
        for (T x : items) {
            counts.merge(x, 1, Integer::sum);
        }
        // 2. Use the counts: scan the table (or scan the input again and look up each item).
        T best = null;
        int bestCount = 0;
        for (T x : items) {
            if (counts.get(x) > bestCount) {
                best = x;
                bestCount = counts.get(x);
            }
        }
        return best;
    }

    public static void main(String[] args) {
        System.out.println(solve(List.of(3, 1, 3, 2, 1, 3)));            // 3
        System.out.println(solve(List.of('a', 'b', 'c', 'a', 'b')));     // a
    }
}
```

```cpp
#include <iostream>
#include <string>
#include <unordered_map>
#include <vector>

// Count each value, then use the counts: here, return the most frequent
// value (earliest on ties). Swap step 2 for the problem's question.
template <typename T>
T solve(const std::vector<T>& items) {
    // 1. Tally. For letters, an int[26] indexed by c - 'a' is faster.
    std::unordered_map<T, int> counts;
    for (const T& x : items) {
        counts[x]++;
    }
    // 2. Use the counts: scan the table (or scan the input again and look up each item).
    T best = items[0];
    int bestCount = 0;
    for (const T& x : items) {
        if (counts[x] > bestCount) {
            best = x;
            bestCount = counts[x];
        }
    }
    return best;
}

int main() {
    std::cout << solve(std::vector<int>{3, 1, 3, 2, 1, 3}) << "\n";       // 3
    std::cout << solve(std::vector<char>{'a', 'b', 'c', 'a', 'b'}) << "\n";  // a
}
```

```javascript
// Count each value, then use the counts: here, return the most frequent
// value (earliest on ties). Swap step 2 for the problem's question.
function solve(items) {
  // 1. Tally. For letters, an array of 26 ints indexed by charCode - 97 is faster.
  const counts = new Map();
  for (const x of items) {
    counts.set(x, (counts.get(x) || 0) + 1);
  }
  // 2. Use the counts: scan the table (or scan the input again and look up each item).
  let best = null;
  let bestCount = 0;
  for (const x of items) {
    if (counts.get(x) > bestCount) {
      best = x;
      bestCount = counts.get(x);
    }
  }
  return best;
}

console.log(solve([3, 1, 3, 2, 1, 3])); // 3
console.log(solve("abcab"));            // a
```

```go
package main

import "fmt"

// solve counts each value, then uses the counts: here, it returns the most
// frequent value (earliest on ties). Swap step 2 for the problem's question.
func solve[T comparable](items []T) T {
	// 1. Tally. For letters, a [26]int indexed by c - 'a' is faster.
	counts := map[T]int{}
	for _, x := range items {
		counts[x]++
	}
	// 2. Use the counts: scan the table (or scan the input again and look up each item).
	var best T
	bestCount := 0
	for _, x := range items {
		if counts[x] > bestCount {
			best = x
			bestCount = counts[x]
		}
	}
	return best
}

func main() {
	fmt.Println(solve([]int{3, 1, 3, 2, 1, 3}))          // 3
	fmt.Println(string(solve([]rune("abcab"))))          // a
}
```

## Variations

- **Fixed array vs. hash map**: `int[26]` for lowercase letters, `int[128]` for ASCII, `int[k + 1]` for integers known to lie in `0..k`; a map for everything else.
- **Count one, subtract the other**: tally string `a` with `+1` and string `b` with `-1`; the strings are anagrams exactly when every slot ends at 0. One array instead of two.
- **Count by a derived key**: remainder modulo 60, sorted letters of a word, the number's digit multiset. The key defines which items count as "the same".
- **Bucket sort by count**: `n + 1` buckets indexed by frequency give the top-k in O(n) without a heap.
- **Counting with a sliding window**: keep the counts of the current window and update them as the window moves; this is how "distinct characters in a window" problems stay linear (see the Sliding Window guide).
- **Majority without a table**: when the problem guarantees a value appears more than `n / 2` times, Boyer-Moore voting finds it in O(1) space. Learn the count-table version first; it is what you reach for when the guarantee is missing.

## Common mistakes

- Reading a key that is not in the map. Python's `dict[x]` raises, Java's `get` returns `null`; use `defaultdict`, `Counter`, `getOrDefault` or `merge`.
- Mixing up "count > 1" (appears more than once) with "count >= 1" (appears at all) when checking duplicates.
- Indexing a letter array with the character code itself (`counts['a']`) instead of `counts[c - 'a']`, or forgetting that uppercase and lowercase are different slots.
- Comparing two count maps with `==` in languages where that is reference equality, or forgetting that a missing key and a count of 0 should mean the same thing.
- Picking "the most frequent" by scanning the map when the problem wants the *first* in input order on ties; scan the input instead.
- Rebuilding the count table inside a loop, which turns an O(n) solution into O(n^2). Tally once, reuse many times.

## Complexity

Tallying is O(n) time and O(d) space, where `d` is the number of distinct values (at most 26 for lowercase letters, at most `n` in general). Using the counts is usually another O(n) or O(d) pass. Sorting the table by count adds O(d log d); a heap for the top `k` costs O(d log k); bucket sort brings it back to O(n). When the alphabet is fixed, the whole thing is O(n) time and O(1) extra space, which is as good as it gets.

## Where to start

1. 387. First Unique Character in a String: tally, then rescan the input for the first count of 1.
2. 383. Ransom Note: two count tables (or one with plus and minus) compared slot by slot.
3. [169. Majority Element](/interview/problems/majority-element/): scan the table for a count above `n / 2`, then learn the O(1)-space voting trick.
4. 451. Sort Characters By Frequency: tally, then sort or bucket the characters by their counts.
5. [347. Top K Frequent Elements](/interview/problems/top-k-frequent-elements/): tally plus a heap, then the bucket-sort version for O(n).
6. 767. Reorganize String: the largest count decides whether a rearrangement is possible, and a greedy placement builds it.
7. 621. Task Scheduler: a formula on the maximum count and how many tasks share it.
