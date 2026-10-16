---
title: Greedy
topic: Greedy
group: patterns
description: "Greedy explained: make the locally best choice at every step and never revisit it, how to tell when that is safe, and the sort-then-pick template behind interval scheduling, jumps and stock problems."
---

## What it is

A greedy algorithm builds its answer one decision at a time, and at each step it takes whatever looks best right now, without worrying about what comes later and without ever undoing a choice. There is no backtracking, no table of subproblems, just a loop that picks and moves on.

That sounds too simple to work, and for many problems it does not: taking the biggest coin first fails for coin systems like `{1, 3, 4}` making 6. Greedy is only correct when the problem has a specific property: a locally best choice is always part of some globally best answer. When that holds, greedy is the shortest and fastest solution available, usually a sort followed by one pass. When it does not, the right tool is dynamic programming, which considers every choice.

So the skill being tested is not writing the loop, it is deciding what "best right now" means and convincing yourself (and the interviewer) that it is safe.

## When to use it

- The problem asks for a **maximum number of things you can fit** (meetings, tasks, non-overlapping intervals) or the **minimum number of things you need** (jumps, arrows, refuelling stops).
- The problem talks about **intervals with start and end times**, deadlines, or events on a line. Sorting by end time is a strong hint.
- The input can be sorted by a single natural key (cost, size, deadline) and after sorting the decision for each element depends only on what you have already picked.
- You can state an **exchange argument**: if an optimal solution made a different choice at this step, swapping in the greedy choice does not make it worse.
- Dynamic programming would work but the transitions collapse to "always take the best", as in Jump Game and Best Time to Buy and Sell Stock II.
- A counter-hint: if the problem says "exactly k", has several interacting constraints, or has small examples where the obvious greedy choice is wrong, think DP instead.

## How it works

Take interval scheduling: given meetings as `[start, end]`, how many can one person attend without overlap?

1. Sort the meetings by **end time**. The meeting that finishes earliest leaves the most room for everything after it; that is the greedy choice.
2. Keep `last_end`, the end of the most recently chosen meeting, starting at minus infinity.
3. Walk the sorted list. If a meeting starts at or after `last_end`, take it: increase the count and set `last_end` to its end. Otherwise skip it.
4. The count at the end is the answer.

Trace on `[[1, 4], [2, 3], [3, 5], [6, 8], [5, 7]]`:

| sorted by end | start >= last_end? | action | last_end |
| --- | --- | --- | --- |
| [2, 3] | 2 >= -inf | take | 3 |
| [1, 4] | 1 >= 3? no | skip | 3 |
| [3, 5] | 3 >= 3 | take | 5 |
| [5, 7] | 5 >= 5 | take | 7 |
| [6, 8] | 6 >= 7? no | skip | 7 |

Three meetings. Why is earliest-end safe? Suppose the best schedule does not include `[2, 3]`, the earliest finisher. Its first meeting ends no earlier than 3, so swapping that meeting for `[2, 3]` keeps every later meeting compatible and the count unchanged. Repeat for every step and the greedy schedule is as good as any. This "swap it in, nothing gets worse" reasoning is the exchange argument, and some version of it justifies every correct greedy algorithm.

A different key breaks it: sorting by start and taking `[1, 4]` first blocks `[2, 3]` and `[3, 5]`. The choice of key is the whole algorithm.

## Template

The skeleton below is the sort-then-pick loop from the example. For a new problem, change the sort key (the greedy order) and the compatibility test.

```python
def max_non_overlapping(intervals):
    """Largest number of [start, end] intervals you can keep with no two overlapping."""
    ordered = sorted(intervals, key=lambda iv: iv[1])  # greedy order: earliest end first
    count = 0
    last_end = float("-inf")  # state describing what has been chosen so far
    for start, end in ordered:
        if start >= last_end:  # problem-specific: is this item compatible with the choices so far?
            count += 1  # take it, never reconsider
            last_end = end
    return count


print(max_non_overlapping([[1, 4], [2, 3], [3, 5], [6, 8], [5, 7]]))  # 3
print(max_non_overlapping([[1, 10], [2, 3], [4, 5]]))  # 2
```

```java
import java.util.Arrays;

public class Greedy {
    // Largest number of {start, end} intervals you can keep with no two overlapping.
    static int maxNonOverlapping(int[][] intervals) {
        int[][] ordered = intervals.clone();
        Arrays.sort(ordered, (a, b) -> Integer.compare(a[1], b[1])); // greedy order: earliest end first
        int count = 0;
        long lastEnd = Long.MIN_VALUE; // state describing what has been chosen so far
        for (int[] iv : ordered) {
            if (iv[0] >= lastEnd) { // problem-specific: compatible with the choices so far?
                count++;            // take it, never reconsider
                lastEnd = iv[1];
            }
        }
        return count;
    }

    public static void main(String[] args) {
        System.out.println(maxNonOverlapping(new int[][] {{1, 4}, {2, 3}, {3, 5}, {6, 8}, {5, 7}})); // 3
        System.out.println(maxNonOverlapping(new int[][] {{1, 10}, {2, 3}, {4, 5}}));                // 2
    }
}
```

```cpp
#include <algorithm>
#include <climits>
#include <iostream>
#include <vector>

// Largest number of {start, end} intervals you can keep with no two overlapping.
int maxNonOverlapping(std::vector<std::vector<int>> intervals) {
    std::sort(intervals.begin(), intervals.end(),
              [](const std::vector<int>& a, const std::vector<int>& b) {
                  return a[1] < b[1];  // greedy order: earliest end first
              });
    int count = 0;
    long long lastEnd = LLONG_MIN;  // state describing what has been chosen so far
    for (const std::vector<int>& iv : intervals) {
        if (iv[0] >= lastEnd) {  // problem-specific: compatible with the choices so far?
            count++;             // take it, never reconsider
            lastEnd = iv[1];
        }
    }
    return count;
}

int main() {
    std::cout << maxNonOverlapping({{1, 4}, {2, 3}, {3, 5}, {6, 8}, {5, 7}}) << "\n";  // 3
    std::cout << maxNonOverlapping({{1, 10}, {2, 3}, {4, 5}}) << "\n";                 // 2
    return 0;
}
```

```javascript
// Largest number of [start, end] intervals you can keep with no two overlapping.
function maxNonOverlapping(intervals) {
  const ordered = [...intervals].sort((a, b) => a[1] - b[1]); // greedy order: earliest end first
  let count = 0;
  let lastEnd = -Infinity; // state describing what has been chosen so far
  for (const [start, end] of ordered) {
    if (start >= lastEnd) {
      // problem-specific: compatible with the choices so far?
      count++; // take it, never reconsider
      lastEnd = end;
    }
  }
  return count;
}

console.log(maxNonOverlapping([[1, 4], [2, 3], [3, 5], [6, 8], [5, 7]])); // 3
console.log(maxNonOverlapping([[1, 10], [2, 3], [4, 5]])); // 2
```

```go
package main

import (
	"fmt"
	"math"
	"sort"
)

// maxNonOverlapping returns the largest number of [start, end] intervals you can keep
// with no two overlapping.
func maxNonOverlapping(intervals [][2]int) int {
	ordered := make([][2]int, len(intervals))
	copy(ordered, intervals)
	sort.Slice(ordered, func(i, j int) bool {
		return ordered[i][1] < ordered[j][1] // greedy order: earliest end first
	})
	count := 0
	lastEnd := math.MinInt // state describing what has been chosen so far
	for _, iv := range ordered {
		if iv[0] >= lastEnd { // problem-specific: compatible with the choices so far?
			count++ // take it, never reconsider
			lastEnd = iv[1]
		}
	}
	return count
}

func main() {
	fmt.Println(maxNonOverlapping([][2]int{{1, 4}, {2, 3}, {3, 5}, {6, 8}, {5, 7}})) // 3
	fmt.Println(maxNonOverlapping([][2]int{{1, 10}, {2, 3}, {4, 5}}))                // 2
}
```

## Variations

- **Earliest end first.** The template. Non-overlapping Intervals asks for the number to *remove*, which is `n` minus this count; Minimum Number of Arrows to Burst Balloons is the same loop with a different compatibility test.
- **Reach as far as you can.** Jump Game keeps the furthest index reachable so far; Jump Game II counts how many times that frontier has to be extended. No sorting, just a running maximum.
- **Take every local gain.** Best Time to Buy and Sell Stock II adds up every day-to-day price increase, because any sequence of trades is a sum of such increases.
- **Resetting on failure.** Gas Station restarts the candidate start whenever the running tank goes negative, with a global total deciding whether any start works at all.
- **Greedy with a heap.** When the best choice changes as you go (always take the most frequent remaining task, the cheapest available item), keep candidates in a priority queue. Task Scheduler, Meeting Rooms II.
- **Greedy inside binary search.** The feasibility check in search-on-the-answer problems is often a greedy packing pass: Capacity To Ship Packages, Split Array Largest Sum.
- **Two-pass greedy.** Candy walks left to right, then right to left, and takes the maximum of the two requirements at each position.

## Common mistakes

- Picking a plausible key without checking it. Sorting intervals by start or by length both feel reasonable for scheduling and both are wrong; test the key on a small adversarial example before coding.
- Using greedy where DP is needed. Coin Change with arbitrary coins, 0/1 knapsack and "exactly k" constraints are the classic traps.
- Forgetting to sort at all, or sorting but then iterating over the original array.
- A compatibility test with the wrong strictness: `start >= last_end` lets a meeting begin when the previous one ends; use `>` if touching counts as overlap in the problem.
- Mutating the input when the problem (or later test cases) expect it unchanged. Sort a copy if in doubt.
- Explaining only *what* the loop does, not *why* it is safe. Interviewers want the one-sentence exchange argument.

## Complexity

Almost always **O(n log n)** for the sort plus **O(n)** for the pass, or plain **O(n)** when no sort is needed (jumps, stock, gas station). Greedy with a heap costs O(n log n) for the heap operations. Extra space is O(1) beyond the sorted copy or the heap.

## Where to start

1. 455. Assign Cookies: sort both lists and match greedily; the simplest exchange argument you will meet.
2. [122. Best Time to Buy and Sell Stock II](/interview/problems/best-time-to-buy-and-sell-stock-ii/): take every upward step, and see why that equals the best set of trades.
3. [55. Jump Game](/interview/problems/jump-game/): track the furthest reachable index in one pass.
4. 435. Non-overlapping Intervals: the earliest-end template, counting removals.
5. [45. Jump Game II](/interview/problems/jump-game-ii/): the frontier idea again, now counting how many times it must be pushed.
6. [134. Gas Station](/interview/problems/gas-station/): greedy with a reset, plus a global check that proves the answer exists.
7. 621. Task Scheduler: greedy with a heap, or a counting formula once you see the structure.
8. [253. Meeting Rooms II](/interview/problems/meeting-rooms-ii/): sorted starts and ends with a heap or a two-array sweep, a bridge to harder interval problems.
