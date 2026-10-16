---
title: Dynamic Programming
topic: Dynamic Programming
group: patterns
description: "Dynamic programming explained: break a problem into overlapping subproblems, define a state and a recurrence, fill a table from the base cases up, and read the answer off the table."
---

## What it is

Dynamic programming (DP) is a way to solve a problem by solving smaller versions of it first and remembering their answers. The word "programming" here is old-fashioned and has nothing to do with code; it means planning with a table.

The trick only works when the smaller versions *overlap*: the big problem keeps asking the same small questions again and again. Plain recursion answers each one from scratch and blows up exponentially. DP answers each small question exactly once, writes the result into a table, and every later question just reads it.

Take a staircase of `n` steps where you can climb 1 or 2 at a time. The number of ways to reach step `n` is the ways to reach step `n - 1` (then take one step) plus the ways to reach step `n - 2` (then take two). Those two smaller counts share most of their own sub-counts. Fill a table `ways[0..n]` from the bottom and the answer costs `n` additions instead of roughly 2^n recursive calls.

There are two ways to fill the table. **Bottom-up** starts at the base cases and loops upward; that is what this guide shows. **Top-down** keeps the recursion and adds a cache; that is covered in the [memoization](/interview/topics/memoization/) guide, and the two are interchangeable for most interview problems.

## When to use it

- The problem asks for an **optimum** (minimum cost, maximum profit, longest length, fewest coins) or a **count** (how many ways, how many paths), not for the list of all solutions.
- A natural recursive answer exists, but it would call itself on the **same inputs many times**.
- The answer for a prefix, a range or a position depends only on answers for **smaller** prefixes, ranges or positions, not on how you got there. This is called optimal substructure.
- The words "subsequence", "subarray", "partition", "ways to reach", "minimum number of operations" or "can you form" appear, and the input is too large for backtracking (hundreds or thousands of items).
- Greedy choices look tempting but you can find a counterexample. DP considers every option at each step.

## How it works

Solving a DP problem is really four decisions. Make them in order and write them down before you code.

1. **State.** What does one table cell mean? Choose the smallest description of "where am I" that determines the rest of the problem. For the staircase, `dp[i]` is the number of ways to reach step `i`. For a grid, `dp[r][c]` is often the best value ending at cell `(r, c)`. For two strings, `dp[i][j]` compares the first `i` letters of one with the first `j` of the other.
2. **Recurrence.** How does a cell follow from earlier cells? Think "what was the *last* move?" and take the min, max or sum over those possibilities: `dp[i] = dp[i - 1] + dp[i - 2]`.
3. **Base cases.** The cells the recurrence cannot produce: `dp[0] = 1` (one way to stand still), and often a row or column of zeros or infinities.
4. **Order and answer.** Fill cells so every cell you read is already done (usually increasing index), then read the answer: `dp[n]`, or the max over the whole table, depending on what the state means.

A trace for the staircase with `n = 5`:

| i | 0 | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|---|
| dp[i] | 1 | 1 | 2 | 3 | 5 | 8 |

`dp[2] = dp[1] + dp[0] = 2`, `dp[3] = dp[2] + dp[1] = 3`, and so on; the answer is `dp[5] = 8`. Each cell took constant work, so the whole thing is O(n).

A good habit: write the brute-force recursion first, even just in your head. Its arguments *are* the state and its return expression *is* the recurrence; then cache it (top-down) or turn it into loops (bottom-up).

## Template

```python
def solve(n, steps):
    """Count the ways to climb n stairs taking any of the given step sizes.
    Replace the state, base case, recurrence and answer with your problem's."""
    # 1. State: dp[i] = number of ways to reach stair i.
    dp = [0] * (n + 1)
    # 2. Base case: one way to be at the bottom (do nothing).
    dp[0] = 1
    # 3. Fill in an order where every cell you read is already final.
    for i in range(1, n + 1):
        # 4. Recurrence: look at the last move that could land on i.
        for s in steps:
            if s <= i:
                dp[i] += dp[i - s]  # for a min/max problem: dp[i] = min(dp[i], cost + dp[i - s])
    # 5. Answer: here the last cell; sometimes the best cell anywhere in the table.
    return dp[n]


if __name__ == "__main__":
    print(solve(5, [1, 2]))  # 8
```

```java
public class DynamicProgramming {
    /** Count the ways to climb n stairs taking any of the given step sizes.
     *  Replace the state, base case, recurrence and answer with your problem's. */
    static long solve(int n, int[] steps) {
        // 1. State: dp[i] = number of ways to reach stair i.
        long[] dp = new long[n + 1];
        // 2. Base case: one way to be at the bottom (do nothing).
        dp[0] = 1;
        // 3. Fill in an order where every cell you read is already final.
        for (int i = 1; i <= n; i++) {
            // 4. Recurrence: look at the last move that could land on i.
            for (int s : steps) {
                if (s <= i) dp[i] += dp[i - s]; // min/max problem: dp[i] = Math.min(dp[i], cost + dp[i - s])
            }
        }
        // 5. Answer: here the last cell; sometimes the best cell anywhere in the table.
        return dp[n];
    }

    public static void main(String[] args) {
        System.out.println(solve(5, new int[] {1, 2})); // 8
    }
}
```

```cpp
#include <iostream>
#include <vector>

// Count the ways to climb n stairs taking any of the given step sizes.
// Replace the state, base case, recurrence and answer with your problem's.
long long solve(int n, const std::vector<int>& steps) {
    // 1. State: dp[i] = number of ways to reach stair i.
    std::vector<long long> dp(n + 1, 0);
    // 2. Base case: one way to be at the bottom (do nothing).
    dp[0] = 1;
    // 3. Fill in an order where every cell you read is already final.
    for (int i = 1; i <= n; i++) {
        // 4. Recurrence: look at the last move that could land on i.
        for (int s : steps) {
            if (s <= i) dp[i] += dp[i - s];  // min/max problem: dp[i] = std::min(dp[i], cost + dp[i - s])
        }
    }
    // 5. Answer: here the last cell; sometimes the best cell anywhere in the table.
    return dp[n];
}

int main() {
    std::cout << solve(5, {1, 2}) << "\n";  // 8
}
```

```javascript
// Count the ways to climb n stairs taking any of the given step sizes.
// Replace the state, base case, recurrence and answer with your problem's.
function solve(n, steps) {
  // 1. State: dp[i] = number of ways to reach stair i.
  const dp = new Array(n + 1).fill(0);
  // 2. Base case: one way to be at the bottom (do nothing).
  dp[0] = 1;
  // 3. Fill in an order where every cell you read is already final.
  for (let i = 1; i <= n; i++) {
    // 4. Recurrence: look at the last move that could land on i.
    for (const s of steps) {
      if (s <= i) dp[i] += dp[i - s]; // min/max problem: dp[i] = Math.min(dp[i], cost + dp[i - s])
    }
  }
  // 5. Answer: here the last cell; sometimes the best cell anywhere in the table.
  return dp[n];
}

console.log(solve(5, [1, 2])); // 8
```

```go
package main

import "fmt"

// solve counts the ways to climb n stairs taking any of the given step sizes.
// Replace the state, base case, recurrence and answer with your problem's.
func solve(n int, steps []int) int64 {
	// 1. State: dp[i] = number of ways to reach stair i.
	dp := make([]int64, n+1)
	// 2. Base case: one way to be at the bottom (do nothing).
	dp[0] = 1
	// 3. Fill in an order where every cell you read is already final.
	for i := 1; i <= n; i++ {
		// 4. Recurrence: look at the last move that could land on i.
		for _, s := range steps {
			if s <= i {
				dp[i] += dp[i-s] // min/max problem: dp[i] = min(dp[i], cost+dp[i-s])
			}
		}
	}
	// 5. Answer: here the last cell; sometimes the best cell anywhere in the table.
	return dp[n]
}

func main() {
	fmt.Println(solve(5, []int{1, 2})) // 8
}
```

## Variations

- **1-D sequence DP** (Climbing Stairs, House Robber, Maximum Subarray): `dp[i]` depends on a few earlier cells. Often you can keep only the last two values instead of the whole array.
- **Unbounded choices** (Coin Change, Word Break): `dp[i]` looks back over every coin or every word that could end at `i`, so there is an inner loop over the choices.
- **2-D grid DP** (Unique Paths, Minimum Path Sum, Maximal Square): `dp[r][c]` comes from the cell above and the cell to the left. Row by row is the natural order, and one row of memory is often enough.
- **Two-sequence DP** (Edit Distance, Longest Common Subsequence): `dp[i][j]` compares prefixes of two strings; the recurrence branches on whether the two current characters match.
- **Interval DP** (Burst Balloons, Palindrome Partitioning II): `dp[l][r]` covers a range, built from shorter ranges, so loop over range length first.
- **Knapsack-style** (Partition Equal Subset Sum, Target Sum): `dp[i][sum]` says whether the first `i` items can reach `sum`. Iterate sums downward to reuse one array.

## Common mistakes

- Picking a state that forgets something you need. If the recurrence must know "whether the previous item was taken" or "whether the sign is currently negative", that belongs in the state (Maximum Product Subarray keeps both the max and the min ending at `i`).
- Filling the table in an order where a cell reads a neighbour that has not been computed yet.
- Wrong base case: initialising a "minimum" table with 0 instead of infinity, or forgetting that `dp[0] = 1` means "one way to make nothing".
- Returning `dp[n]` when the answer is the best value anywhere in the table (Longest Increasing Subsequence ends at any index).
- Integer overflow in counting problems: the counts grow fast, so use 64-bit integers or take the modulus the problem asks for.
- Jumping straight to the clever one-row version before the full table works. Get the 2-D version correct, then shrink the memory.

## Complexity

Time is the number of table cells times the work per cell: O(n) for a simple sequence, O(n * k) with `k` choices per cell, O(n * m) for two strings, O(n^3) for interval DP. Space is the size of the table, which can often be reduced by one dimension when each cell only reads the previous row or the last few cells. Compared with the exponential recursion it replaces, that trade of memory for time is the entire point.

## Where to start

1. [70. Climbing Stairs](/interview/problems/climbing-stairs/): the recurrence from this guide, and the two-variable trick to drop the array.
2. [198. House Robber](/interview/problems/house-robber/): a take-or-skip decision at each index.
3. [53. Maximum Subarray](/interview/problems/maximum-subarray/): "best ending here" as a state, and taking the max over the table.
4. [322. Coin Change](/interview/problems/coin-change/): unbounded choices, infinity as the base, and a minimum instead of a sum.
5. [300. Longest Increasing Subsequence](/interview/problems/longest-increasing-subsequence/): an O(n^2) recurrence that looks back at every earlier index.
6. 62. Unique Paths: the first 2-D grid table; each cell is the sum of the cell above and the cell to its left.
7. [221. Maximal Square](/interview/problems/maximal-square/): a grid state that means "largest square ending at this corner".
8. [72. Edit Distance](/interview/problems/edit-distance/): the classic two-string table with three possible last moves.
