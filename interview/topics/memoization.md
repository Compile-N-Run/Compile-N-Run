---
title: Memoization
topic: Memoization
group: patterns
description: "Memoization explained: keep the natural recursive solution, add a cache keyed by the function's arguments so every subproblem is computed once, and turn exponential recursion into top-down dynamic programming."
---

## What it is

Memoization is recursion with a memory. You write the straightforward recursive function, the one that calls itself on smaller inputs, and then you add one rule: *before* doing any work, check whether this exact input has been answered before; *after* doing the work, store the answer. The store is usually a hash map or an array indexed by the arguments, and it is called the memo.

That one rule changes the running time completely. Counting the ways to climb `n` stairs with steps of 1 or 2 as `ways(n) = ways(n - 1) + ways(n - 2)` makes about 2^n calls, because `ways(n - 2)` is computed from scratch inside both `ways(n - 1)` and `ways(n)`, and the duplication multiplies at every level. With a memo, each `ways(k)` is computed once and every repeat is a lookup, so the whole thing is O(n).

Memoization is the **top-down** form of [dynamic programming](/interview/topics/dynamic-programming/). Bottom-up DP fills a table in a loop from the base cases upward; memoization starts at the question you actually care about and only touches the subproblems that question needs, in whatever order the recursion reaches them. Same table, same answers, different direction. If you can write the recursion, you have the DP; the memo just stops the recursion from repeating itself.

## When to use it

- You have, or can quickly write, a **recursive solution** that is correct but too slow, and you can see it calling itself with the **same arguments many times**.
- The function is **pure**: its answer depends only on its arguments, not on anything that changes between calls. (A running `path` that you mutate is not an argument you can cache on.)
- The arguments are **small and hashable**: an index, two indices, a remaining amount, a bitmask of what has been used. If the state space is small enough to fit in memory, memoization works.
- The problem asks for a **count** or an **optimum**, not for every solution. Backtracking that lists all answers cannot be cached; the answers themselves are the output.
- The subproblem order is **awkward for a loop**: the recursion jumps around a grid in all four directions, or the states are sparse so a full table would mostly stay empty. Top-down visits only what it needs.
- You want a quick, safe first version in an interview. Memoizing the brute force gets from "exponential" to "accepted" in a few lines; convert it to bottom-up afterwards if asked.

## How it works

1. **Write the recursion.** Define `f(state)` in terms of `f(smaller states)`, with explicit base cases. Make sure every piece of information the answer depends on is in `state`.
2. **Add the cache.** A map from `state` to answer; an array if the state is a small integer or pair of integers.
3. **Check first.** At the top of `f`, if `state` is in the cache, return the stored value immediately.
4. **Store last.** After computing the result from the recursive calls, write it into the cache, then return it.

The base cases can go before or after the cache check; it does not matter for correctness, only for a few wasted lookups.

Trace `ways(5)` with steps of 1 and 2, memo starting empty:

```
ways(5) → needs ways(4) and ways(3)
  ways(4) → needs ways(3) and ways(2)
    ways(3) → needs ways(2) and ways(1)
      ways(2) → ways(1) = 1 (base), ways(0) = 1 (base) → 2, memo[2] = 2
      ways(1) = 1
    → 3, memo[3] = 3
    ways(2) → memo hit → 2
  → 5, memo[4] = 5
  ways(3) → memo hit → 3
→ 8, memo[5] = 8
```

Six real computations, two cache hits, and the number of hits grows much faster than the number of computations as `n` grows. Without the memo, `ways(5)` makes 15 calls; `ways(40)` makes over 300 million.

## Template

```python
def solve(n, steps):
    """Top-down DP: count ways to climb n stairs with the given step sizes.
    Replace the state, base case and recurrence with your problem's."""
    memo = {}  # state -> answer; a list works when the state is a small int

    def f(i):
        # 1. Base cases.
        if i == 0:
            return 1
        if i < 0:
            return 0
        # 2. Already answered? Return it.
        if i in memo:
            return memo[i]
        # 3. Recurrence: combine answers for smaller states.
        total = 0
        for s in steps:
            total += f(i - s)
        # 4. Store, then return.
        memo[i] = total
        return total

    return f(n)


if __name__ == "__main__":
    print(solve(5, [1, 2]))   # 8
    print(solve(50, [1, 2]))  # 20365011074, instant thanks to the memo
```

```java
import java.util.HashMap;
import java.util.Map;

public class Memoization {
    /** Top-down DP: count ways to climb n stairs with the given step sizes.
     *  Replace the state, base case and recurrence with your problem's. */
    static long solve(int n, int[] steps) {
        Map<Integer, Long> memo = new HashMap<>(); // state -> answer; a long[] works for small int states
        return f(n, steps, memo);
    }

    static long f(int i, int[] steps, Map<Integer, Long> memo) {
        // 1. Base cases.
        if (i == 0) return 1;
        if (i < 0) return 0;
        // 2. Already answered? Return it.
        if (memo.containsKey(i)) return memo.get(i);
        // 3. Recurrence: combine answers for smaller states.
        long total = 0;
        for (int s : steps) {
            total += f(i - s, steps, memo);
        }
        // 4. Store, then return.
        memo.put(i, total);
        return total;
    }

    public static void main(String[] args) {
        System.out.println(solve(5, new int[] {1, 2}));   // 8
        System.out.println(solve(50, new int[] {1, 2}));  // 20365011074, instant thanks to the memo
    }
}
```

```cpp
#include <iostream>
#include <unordered_map>
#include <vector>

// Top-down DP: count ways to climb n stairs with the given step sizes.
// Replace the state, base case and recurrence with your problem's.
long long f(int i, const std::vector<int>& steps, std::unordered_map<int, long long>& memo) {
    // 1. Base cases.
    if (i == 0) return 1;
    if (i < 0) return 0;
    // 2. Already answered? Return it.
    auto it = memo.find(i);
    if (it != memo.end()) return it->second;
    // 3. Recurrence: combine answers for smaller states.
    long long total = 0;
    for (int s : steps) {
        total += f(i - s, steps, memo);
    }
    // 4. Store, then return.
    memo[i] = total;
    return total;
}

long long solve(int n, const std::vector<int>& steps) {
    std::unordered_map<int, long long> memo;  // state -> answer; a vector works for small int states
    return f(n, steps, memo);
}

int main() {
    std::cout << solve(5, {1, 2}) << "\n";   // 8
    std::cout << solve(50, {1, 2}) << "\n";  // 20365011074, instant thanks to the memo
}
```

```javascript
// Top-down DP: count ways to climb n stairs with the given step sizes.
// Replace the state, base case and recurrence with your problem's.
function solve(n, steps) {
  const memo = new Map(); // state -> answer; an array works for small int states

  function f(i) {
    // 1. Base cases.
    if (i === 0) return 1;
    if (i < 0) return 0;
    // 2. Already answered? Return it.
    if (memo.has(i)) return memo.get(i);
    // 3. Recurrence: combine answers for smaller states.
    let total = 0;
    for (const s of steps) {
      total += f(i - s);
    }
    // 4. Store, then return.
    memo.set(i, total);
    return total;
  }

  return f(n);
}

console.log(solve(5, [1, 2]));  // 8
console.log(solve(50, [1, 2])); // 20365011074, instant thanks to the memo
```

```go
package main

import "fmt"

// solve is top-down DP: count ways to climb n stairs with the given step sizes.
// Replace the state, base case and recurrence with your problem's.
func solve(n int, steps []int) int64 {
	memo := map[int]int64{} // state -> answer; a slice works for small int states

	var f func(i int) int64
	f = func(i int) int64 {
		// 1. Base cases.
		if i == 0 {
			return 1
		}
		if i < 0 {
			return 0
		}
		// 2. Already answered? Return it.
		if v, ok := memo[i]; ok {
			return v
		}
		// 3. Recurrence: combine answers for smaller states.
		var total int64
		for _, s := range steps {
			total += f(i - s)
		}
		// 4. Store, then return.
		memo[i] = total
		return total
	}

	return f(n)
}

func main() {
	fmt.Println(solve(5, []int{1, 2}))  // 8
	fmt.Println(solve(50, []int{1, 2})) // 20365011074, instant thanks to the memo
}
```

## Variations

- **Built-in caches**: Python's `@functools.lru_cache(maxsize=None)` (or `@cache`) memoizes a function in one line, as long as its arguments are hashable. Interviewers usually accept it if you can explain what it does.
- **Array memo**: when the state is an index or a pair of indices, a 1-D or 2-D array filled with a sentinel (`-1`, `None`, `null`) is faster than a hash map.
- **Multi-argument state**: `f(i, j)` for two strings, `f(index, remaining)` for knapsack-style choices, `f(row, col)` for grids. Pack them into a tuple, a string key, or a single integer such as `i * cols + j`.
- **Bitmask state**: when the state is "which items are still available", use an integer mask; `f(mask)` with a memo of size `2^n` is the standard way to solve small permutation problems (Can I Win, Partition to K Equal Sum Subsets).
- **Memoized DFS on a graph or grid**: longest path in a DAG or in a matrix where you may only step to a larger value; the memo doubles as the "visited" set because every cell's answer is final once computed.
- **Converting to bottom-up**: the memo keys are the table cells, and the recursion's call order tells you the loop order (compute what is called first). Do this when the recursion depth would overflow the stack.

## Common mistakes

- Leaving something out of the state. If the answer secretly depends on a variable you did not pass as an argument, the cache returns answers computed under different conditions. Everything that can change the result must be a key.
- Caching on a mutable argument (a list that you modify and restore). The key you look up later is a different object with the same contents, or the same object with different contents.
- Forgetting to store the result, which leaves the recursion exponential and makes it hard to tell why the "memoized" version is still slow.
- Checking the cache after the recursive calls instead of before them.
- Stack overflow: `f(n)` with `n = 10^5` recurses 10^5 deep. Python's default limit is about 1000; raise it with `sys.setrecursionlimit` or switch to bottom-up.
- Using a memo that is shared between test cases or calls with different inputs (a static field in Java, a module-level dict in Python) without clearing it.

## Complexity

Time is the number of distinct states times the work done inside one call, excluding the recursive calls themselves: O(n) for a one-index state with a constant number of choices, O(n * m) for two indices, O(2^n * n) for a bitmask with a loop over `n` items. Space is the number of states stored plus the recursion depth. These are the same bounds as bottom-up DP; the difference is that top-down may compute fewer states, while bottom-up has no recursion overhead and can often drop whole rows of the table.

## Where to start

1. 509. Fibonacci Number: the smallest possible example. Time the naive version against the memoized one for `n = 40`.
2. [70. Climbing Stairs](/interview/problems/climbing-stairs/): the recurrence from this guide, first with a memo, then as a loop.
3. 1137. N-th Tribonacci Number: the same shape with three terms, to check you can generalise the base cases.
4. [139. Word Break](/interview/problems/word-break/): `f(start)` asks whether the suffix can be segmented; the memo turns a string search into O(n^2).
5. 241. Different Ways to Add Parentheses: `f(expression)` keyed by a substring, with a list as the cached value.
6. 329. Longest Increasing Path in a Matrix: memoized DFS over a grid, where the memo replaces the visited set.
7. 464. Can I Win: the state is a bitmask of the numbers already used; the memo has at most `2^20` entries.
