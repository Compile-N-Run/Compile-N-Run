---
title: Ordered Set
topic: Ordered Set
group: structures
description: "An ordered set keeps values sorted while you insert and remove, so you can find the nearest value above or below any number in O(log n): TreeMap/TreeSet in Java, std::set in C++, bisect in Python, and sorted arrays in JavaScript and Go."
---

## What it is

An ordered set is a collection that stays sorted no matter what you insert or remove, and that can answer *neighbour* questions fast: what is the smallest stored value that is at least `x`? The largest that is at most `x`? The minimum and maximum right now? A hash set answers "is `x` in here?" in O(1) but knows nothing about order; a sorted array answers neighbour questions by binary search but inserting into the middle costs O(n). An ordered set gives O(log n) for all of insert, remove, contains, floor and ceiling.

Under the hood it is a balanced binary search tree (red-black tree in Java and C++). What you get in each language:

- **Java:** `TreeSet<E>` for distinct values, `TreeMap<K, V>` for keys with data. `floor`, `ceiling`, `lower`, `higher`, `first`, `last`, `pollFirst`, `headSet`, `tailSet`. For a multiset use `TreeMap<value, count>`.
- **C++:** `std::set`, `std::map`, and `std::multiset` for duplicates. `lower_bound(x)` is the first element `>= x`, `upper_bound(x)` the first `> x`; step an iterator backwards with `std::prev` for the floor. `begin()` and `rbegin()` are min and max.
- **Python:** no ordered set in the standard library. The interview answer is a plain list kept sorted with the `bisect` module: `bisect_left`, `bisect_right`, `insort`. Searches are O(log n); insert and delete are O(n) memory moves, fast enough for n around 10^5 because the move is a single `memmove`. `sortedcontainers.SortedList` gives true O(log n), but do not count on it being installed.
- **JavaScript:** also no ordered set. Keep a sorted array with a hand-written binary search and `splice` for insert and delete, O(n) each.
- **Go:** no ordered set either. A sorted slice with `sort.SearchInts` (or `sort.Search` with a custom comparison) plus `append`/`copy` for inserts is the usual approach; a treap or `github.com/google/btree` if the problem truly needs O(log n) everything.

## When to use it

- The statement asks about the closest value *above or below* something: "nearest smaller element already seen", "is there a value within `t` of this one", "the first free seat after position p".
- You need the minimum or maximum of a collection that gains *and loses* elements in arbitrary order. A heap handles arbitrary inserts but only removes its top; an ordered set removes any element.
- Sliding window problems that need both the window's min and max (Longest Continuous Subarray With Absolute Diff <= Limit, Continuous Subarrays) and the simple monotonic deque feels fiddly.
- Managing intervals or bookings: find the interval starting just before `x`, check for overlap with the one after (My Calendar I, Data Stream as Disjoint Intervals).
- Design problems that keep items ranked and need "the best item in a category" after updates (Design a Food Rating System, Design a Number Container System).

## How it works

The template answers, for each element of `nums`, "what is the largest value among the previous `k` elements that is at most this one?", which exercises the three operations you always need: insert, floor query, and remove a specific value. Trace `floor_in_window([5, 2, 8, 6, 3, 9], 3)`:

| value | window before | floor(value) | window after insert | removed (older than k) |
|-------|---------------|--------------|---------------------|------------------------|
| 5     | {}            | -1           | {5}                 |                        |
| 2     | {5}           | -1           | {2, 5}              |                        |
| 8     | {2, 5}        | 5            | {2, 5, 8}           |                        |
| 6     | {2, 5, 8}     | 5            | {2, 5, 6, 8}        | 5 → {2, 6, 8}          |
| 3     | {2, 6, 8}     | 2            | {2, 3, 6, 8}        | 2 → {3, 6, 8}          |
| 9     | {3, 6, 8}     | 8            | {3, 6, 8, 9}        | 8 → {3, 6, 9}          |

Result: `[-1, -1, 5, 5, 2, 8]`.

The floor query is "the element just before the first element greater than `value`". In Python that is `window[bisect_right(window, value) - 1]`; in C++ `std::prev(window.upper_bound(value))`; in Java just `floorKey(value)`. Guard the case where no element is small enough (position 0, or `begin()`, or `null`).

Removal must take out *one copy* of the oldest value, not all copies. That is why the Java version counts occurrences in a `TreeMap`, the C++ version erases by iterator (`erase(find(x))`) rather than by value, and the sorted-list versions locate a single index with binary search before deleting.

## Template

```python
from bisect import bisect_left, bisect_right, insort


def floor_in_window(nums: list[int], k: int) -> list[int]:
    """For each value, the largest value among the previous k that is <= it, or -1.
    A sorted list plus bisect stands in for an ordered set: O(log n) search, O(n) insert."""
    window = []                      # always kept sorted
    result = []
    for i, v in enumerate(nums):
        pos = bisect_right(window, v)            # first element > v
        result.append(window[pos - 1] if pos > 0 else -1)
        insort(window, v)                        # add: keeps the list sorted
        if i >= k:                               # window too big: remove the oldest value
            window.pop(bisect_left(window, nums[i - k]))
    return result


if __name__ == "__main__":
    print(floor_in_window([5, 2, 8, 6, 3, 9], 3))   # [-1, -1, 5, 5, 2, 8]
```

```java
import java.util.ArrayList;
import java.util.List;
import java.util.TreeMap;

public class Template {
    // For each value, the largest value among the previous k that is <= it, or -1.
    // TreeMap<value, count> is an ordered multiset: floorKey/ceilingKey/firstKey/lastKey in O(log n).
    static List<Integer> floorInWindow(int[] nums, int k) {
        TreeMap<Integer, Integer> window = new TreeMap<>();
        List<Integer> result = new ArrayList<>();
        for (int i = 0; i < nums.length; i++) {
            Integer floor = window.floorKey(nums[i]);        // largest key <= nums[i], or null
            result.add(floor == null ? -1 : floor);
            window.merge(nums[i], 1, Integer::sum);          // add one copy
            if (i >= k) {                                     // window too big: remove the oldest value
                int old = nums[i - k];
                if (window.merge(old, -1, Integer::sum) == 0) window.remove(old);
            }
        }
        return result;
    }

    public static void main(String[] args) {
        System.out.println(floorInWindow(new int[] {5, 2, 8, 6, 3, 9}, 3));   // [-1, -1, 5, 5, 2, 8]
    }
}
```

```cpp
#include <iostream>
#include <set>
#include <vector>

// For each value, the largest value among the previous k that is <= it, or -1.
// std::multiset keeps duplicates in sorted order: insert/erase/upper_bound in O(log n).
std::vector<int> floorInWindow(const std::vector<int>& nums, int k) {
    std::multiset<int> window;
    std::vector<int> result;
    for (int i = 0; i < (int)nums.size(); i++) {
        auto it = window.upper_bound(nums[i]);               // first element > nums[i]
        result.push_back(it == window.begin() ? -1 : *std::prev(it));
        window.insert(nums[i]);
        if (i >= k) {                                        // window too big: remove the oldest value
            window.erase(window.find(nums[i - k]));          // find() erases ONE copy, erase(value) would erase all
        }
    }
    return result;
}

int main() {
    for (int v : floorInWindow({5, 2, 8, 6, 3, 9}, 3)) std::cout << v << ' ';
    std::cout << "\n";   // -1 -1 5 5 2 8
}
```

```javascript
// JavaScript has no ordered set, so keep a sorted array and binary search into it.
// Search is O(log n); insert/remove are O(n) because of splice, fine for n up to ~1e5.
function upperBound(sorted, v) {
  // index of the first element > v
  let lo = 0;
  let hi = sorted.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (sorted[mid] <= v) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

// For each value, the largest value among the previous k that is <= it, or -1.
function floorInWindow(nums, k) {
  const window = []; // always kept sorted
  const result = [];
  for (let i = 0; i < nums.length; i++) {
    const pos = upperBound(window, nums[i]);
    result.push(pos > 0 ? window[pos - 1] : -1);
    window.splice(upperBound(window, nums[i]), 0, nums[i]); // insert, keeping order
    if (i >= k) {
      // window too big: remove the oldest value (one copy)
      window.splice(upperBound(window, nums[i - k]) - 1, 1);
    }
  }
  return result;
}

console.log(floorInWindow([5, 2, 8, 6, 3, 9], 3)); // [ -1, -1, 5, 5, 2, 8 ]
```

```go
package main

import (
	"fmt"
	"sort"
)

// Go has no ordered set in the standard library, so keep a sorted slice and use sort.SearchInts.
// Search is O(log n); insert/remove are O(n) because elements shift, fine for n up to ~1e5.

// floorInWindow returns, for each value, the largest value among the previous k that is <= it, or -1.
func floorInWindow(nums []int, k int) []int {
	window := []int{} // always kept sorted
	result := make([]int, 0, len(nums))
	for i, v := range nums {
		pos := sort.SearchInts(window, v+1) // first index with element > v
		if pos > 0 {
			result = append(result, window[pos-1])
		} else {
			result = append(result, -1)
		}
		window = append(window, 0) // insert v at pos, keeping order
		copy(window[pos+1:], window[pos:])
		window[pos] = v
		if i >= k { // window too big: remove the oldest value (one copy)
			old := sort.SearchInts(window, nums[i-k])
			window = append(window[:old], window[old+1:]...)
		}
	}
	return result
}

func main() {
	fmt.Println(floorInWindow([]int{5, 2, 8, 6, 3, 9}, 3)) // [-1 -1 5 5 2 8]
}
```

## Variations

- **Ordered map of intervals.** Key by interval start. To insert `[s, e)`, look at `floorKey(s)` (the booking starting just before) and `ceilingKey(s)` (the one just after) and check both for overlap. My Calendar I is exactly this; Data Stream as Disjoint Intervals adds merging with both neighbours.
- **Two ordered structures in step.** Design a Food Rating System keeps, per cuisine, a set of `(rating, name)` pairs; an update removes the old pair and inserts the new one. Write the two updates next to each other so they cannot drift apart.
- **Window min and max together.** Keep the window's values in a multiset; `begin()` and `rbegin()` give both extremes, and sliding the window is one insert and one erase. The monotonic deque is faster but harder to get right under pressure.

## Common mistakes

- Erasing by value in `std::multiset`, which removes every copy. Erase by iterator from `find`.
- Using `TreeSet` when duplicates matter. Two bookings with the same start, or two window entries with the same value, silently collapse; use `TreeMap<value, count>` or store `(value, index)` pairs.
- Forgetting the empty result from `floorKey`, `ceilingKey`, or an iterator at `begin()`/`end()`; dereferencing `end()` in C++ is undefined behaviour.
- Confusing `lower_bound` (first `>= x`) with `upper_bound` (first `> x`), and `bisect_left` with `bisect_right`. For a floor of `x` use `upper_bound` then step back; for a ceiling use `lower_bound`.
- In Python, appending to the list and sorting after every insert. That is O(n log n) per operation; `insort` is O(n) and far faster.
- Assuming the sorted-array approach is O(log n). Say out loud that insert is O(n) and why it is acceptable for the given constraints.

## Complexity

Tree-backed ordered sets (Java, C++) do insert, remove, contains, floor and ceiling in O(log n) and iterate in sorted order in O(n). The sorted-array stand-ins in Python, JavaScript and Go search in O(log n) but insert and remove in O(n); in practice `memmove` and `splice` are fast enough for 10^5 operations on most judges. Memory is O(n).

## Where to start

1. 2363. Merge Similar Items: a `TreeMap` or sorted dictionary, just to see the sorted iteration.
2. 729. My Calendar I: floor and ceiling of the start time decide whether a booking overlaps.
3. 220. Contains Duplicate III: a window of the last `k` values; for each new value, ask for the ceiling of `value - t`.
4. 456. 132 Pattern: one of several solutions walks from the right with an ordered multiset of later values.
5. 1438. Longest Continuous Subarray With Absolute Diff Less Than or Equal to Limit: sliding window with min and max from a multiset.
6. 2353. Design a Food Rating System: per-cuisine sets of (rating, name) updated in step with a hash map.
7. 855. Exam Room: find the largest gap between occupied seats with an ordered set of positions.
8. 352. Data Stream as Disjoint Intervals: merge with both neighbours on every insert.
