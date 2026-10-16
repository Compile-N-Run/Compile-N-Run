---
title: Sorting
topic: Sorting
group: patterns
description: "Sorting explained: when putting the input in order first makes a problem simple, how to sort by a custom key in each language, and the sweep, two-pointer and bucket tricks that follow a sort."
---

## What it is

Sorting puts the elements of a list in order: numbers from small to large, strings alphabetically, or records by whatever key you choose. Every language ships a fast sort, so in an interview you rarely write one; what matters is recognising **when sorting first makes the rest of the problem easy**, and knowing how to say "sort by this key, then by that one" in your language.

A sorted list has structure you can exploit: equal elements sit next to each other, the smallest and largest are at the ends, and "everything less than x" is a prefix. Many problems that look like they need a nested loop become a single sweep once the input is sorted, at the price of O(n log n) for the sort itself. Sorting is also the first step of most greedy algorithms and of the opposite-ends two-pointer search.

## When to use it

- The problem mentions **intervals**, meetings, or events with start and end times. Sorting by start (or by end) is almost always the first line.
- You need to find **duplicates**, group **equal or equivalent** items (anagrams), or compare each element with its **nearest neighbours** in value.
- You need the **k-th smallest** or largest, the median, or the top k, and n is small enough that a full sort is fine (otherwise see heaps and quickselect).
- A **greedy** choice depends on an ordering: cheapest first, earliest deadline first, heaviest first.
- The order of the output is **by some property**, like "sort people by age then by name".
- The problem has a **custom ordering** that is not the natural one, such as "which concatenation gives the bigger number", which means writing a comparator.

## How it works

Take a problem where sorting does most of the work: given a list of meetings as `[start, end]`, count how many meetings clash with the one scheduled right before them.

1. Sort the meetings by start time. If two start together, put the one that ends later first (that is a second sort key, and it is where the comparator syntax matters).
2. Walk through the sorted list once, comparing each meeting with the previous one. A clash is when the current meeting starts before the previous one ends.
3. Count the clashes.

Trace on `[[5, 8], [1, 4], [3, 6], [9, 10]]`:

| step | sorted list so far |
| --- | --- |
| sort by start | `[1, 4], [3, 6], [5, 8], [9, 10]` |

| pair | previous end | current start | clash? |
| --- | --- | --- | --- |
| `[1, 4]` then `[3, 6]` | 4 | 3 | yes |
| `[3, 6]` then `[5, 8]` | 6 | 5 | yes |
| `[5, 8]` then `[9, 10]` | 8 | 9 | no |

Answer: 2. Without the sort, each meeting would have to be compared with every other one. With it, one pass of neighbour comparisons is enough, because the sort guarantees that the earlier-starting meeting is always the previous one.

Most sorting problems have this two-part shape: a sort with the right key, then a linear sweep (or two pointers, or a greedy pick) over the sorted result.

## Template

The skeleton below sorts pairs by their first value ascending and then by their second value descending, then sweeps neighbours. The comparator is the part that changes most from problem to problem, so each block shows that language's way of writing a multi-key order.

```python
def count_clashes(meetings):
    """Sort [start, end] pairs by start (then by longer end first) and count clashes with the previous one."""
    ordered = sorted(meetings, key=lambda m: (m[0], -m[1]))  # problem-specific sort key
    clashes = 0
    for i in range(1, len(ordered)):
        prev, cur = ordered[i - 1], ordered[i]
        if cur[0] < prev[1]:  # problem-specific: the neighbour comparison
            clashes += 1
    return clashes


print(count_clashes([[5, 8], [1, 4], [3, 6], [9, 10]]))  # 2
print(count_clashes([[1, 2], [2, 3]]))  # 0
```

```java
import java.util.Arrays;

public class Sorting {
    // Sort {start, end} pairs by start (then by longer end first) and count clashes with the previous one.
    static int countClashes(int[][] meetings) {
        int[][] ordered = meetings.clone();
        Arrays.sort(ordered, (a, b) -> {          // problem-specific sort key
            if (a[0] != b[0]) return Integer.compare(a[0], b[0]);
            return Integer.compare(b[1], a[1]);   // same start: longer meeting first
        });
        int clashes = 0;
        for (int i = 1; i < ordered.length; i++) {
            int[] prev = ordered[i - 1], cur = ordered[i];
            if (cur[0] < prev[1]) clashes++;      // problem-specific: the neighbour comparison
        }
        return clashes;
    }

    public static void main(String[] args) {
        System.out.println(countClashes(new int[][] {{5, 8}, {1, 4}, {3, 6}, {9, 10}})); // 2
        System.out.println(countClashes(new int[][] {{1, 2}, {2, 3}}));                  // 0
    }
}
```

```cpp
#include <algorithm>
#include <iostream>
#include <vector>

// Sort {start, end} pairs by start (then by longer end first) and count clashes with the previous one.
int countClashes(std::vector<std::vector<int>> meetings) {
    std::sort(meetings.begin(), meetings.end(),
              [](const std::vector<int>& a, const std::vector<int>& b) {  // problem-specific sort key
                  if (a[0] != b[0]) return a[0] < b[0];
                  return a[1] > b[1];  // same start: longer meeting first
              });
    int clashes = 0;
    for (size_t i = 1; i < meetings.size(); i++) {
        const std::vector<int>& prev = meetings[i - 1];
        const std::vector<int>& cur = meetings[i];
        if (cur[0] < prev[1]) clashes++;  // problem-specific: the neighbour comparison
    }
    return clashes;
}

int main() {
    std::cout << countClashes({{5, 8}, {1, 4}, {3, 6}, {9, 10}}) << "\n";  // 2
    std::cout << countClashes({{1, 2}, {2, 3}}) << "\n";                   // 0
    return 0;
}
```

```javascript
// Sort [start, end] pairs by start (then by longer end first) and count clashes with the previous one.
function countClashes(meetings) {
  const ordered = [...meetings].sort((a, b) => {
    // problem-specific sort key (a plain .sort() would compare as strings!)
    if (a[0] !== b[0]) return a[0] - b[0];
    return b[1] - a[1]; // same start: longer meeting first
  });
  let clashes = 0;
  for (let i = 1; i < ordered.length; i++) {
    const prev = ordered[i - 1];
    const cur = ordered[i];
    if (cur[0] < prev[1]) clashes++; // problem-specific: the neighbour comparison
  }
  return clashes;
}

console.log(countClashes([[5, 8], [1, 4], [3, 6], [9, 10]])); // 2
console.log(countClashes([[1, 2], [2, 3]])); // 0
```

```go
package main

import (
	"fmt"
	"sort"
)

// countClashes sorts [start, end] pairs by start (then by longer end first) and counts
// meetings that clash with the previous one.
func countClashes(meetings [][2]int) int {
	ordered := make([][2]int, len(meetings))
	copy(ordered, meetings)
	sort.Slice(ordered, func(i, j int) bool { // problem-specific sort key
		if ordered[i][0] != ordered[j][0] {
			return ordered[i][0] < ordered[j][0]
		}
		return ordered[i][1] > ordered[j][1] // same start: longer meeting first
	})
	clashes := 0
	for i := 1; i < len(ordered); i++ {
		prev, cur := ordered[i-1], ordered[i]
		if cur[0] < prev[1] { // problem-specific: the neighbour comparison
			clashes++
		}
	}
	return clashes
}

func main() {
	fmt.Println(countClashes([][2]int{{5, 8}, {1, 4}, {3, 6}, {9, 10}})) // 2
	fmt.Println(countClashes([][2]int{{1, 2}, {2, 3}}))                  // 0
}
```

## Variations

- **Sort then sweep.** The template. Merge Intervals, Meeting Rooms, and most duplicate-detection problems.
- **Sort then two pointers.** Sorting makes the opposite-ends search valid: 3Sum, Two Sum on a sorted array, Boats to Save People.
- **Sort a key, not the data.** Group Anagrams sorts each word's letters to build a key, then groups by it. Sorting here is a way to normalise.
- **Sort two lists separately.** Meeting Rooms II sorts starts and ends in two arrays and walks them together, which is simpler than keeping the pairs together.
- **Counting sort and buckets.** When values live in a small range (colours 0 to 2, letters a to z, frequencies up to n), count them instead of comparing: O(n) instead of O(n log n). Sort Colors, Top K Frequent Elements with buckets.
- **Partial sorting.** For the k-th largest you do not need a full sort: a heap of size k gives O(n log k), and quickselect gives O(n) on average. Full sort is still the simplest correct first answer.
- **Custom comparator.** Largest Number orders strings by comparing `a + b` with `b + a`. The comparator must be consistent (a total order), or the sort's behaviour is undefined.

## Common mistakes

- JavaScript's `arr.sort()` with no comparator sorts **as strings**, so `[10, 9, 1]` becomes `[1, 10, 9]`. Always pass `(a, b) => a - b` for numbers.
- A comparator that returns a boolean in Java or JavaScript (they expect negative, zero, positive), or one that returns `a - b` on values large enough to overflow in Java (use `Integer.compare`).
- Sorting when the problem requires the **original order** of the output. Sort a copy or sort indices instead.
- Forgetting whether the sort is **stable**. Python, Java's object sort and JavaScript are stable; `std::sort` and Go's `sort.Slice` are not. When ties must keep input order, add the index as a final key or use `std::stable_sort` / `sort.SliceStable`.
- Sorting inside a loop, turning O(n log n) into O(n² log n). Sort once, then reuse.
- Choosing the wrong key for intervals: merging needs sort by start, picking the most non-overlapping intervals needs sort by end.

## Complexity

The library sort is **O(n log n) time**. Python, Java (for objects) and JavaScript use a stable merge-style sort with O(n) extra space; C++ `std::sort` and Go's sort use introsort or pattern-defeating quicksort with O(log n) extra space. Counting sort is O(n + range). Whatever follows the sort is usually O(n), so the sort dominates.

## Where to start

1. [242. Valid Anagram](/interview/problems/valid-anagram/): sort both strings and compare, then see the counting alternative.
2. [217. Contains Duplicate](/interview/problems/contains-duplicate/): after sorting, duplicates are neighbours.
3. [88. Merge Sorted Array](/interview/problems/merge-sorted-array/): what you can do when the input is already sorted.
4. [56. Merge Intervals](/interview/problems/merge-intervals/): the classic sort-then-sweep.
5. [49. Group Anagrams](/interview/problems/group-anagrams/): sorting to build a normalised key.
6. [75. Sort Colors](/interview/problems/sort-colors/): counting sort, and then the one-pass three-way partition.
7. [215. Kth Largest Element in an Array](/interview/problems/kth-largest-element-in-an-array/): full sort first, then a heap, then quickselect.
8. 179. Largest Number: a custom comparator where the order is not the natural one.
