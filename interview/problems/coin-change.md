---
title: Coin Change
leetcode: coin-change
description: "Coin Change explained: find the fewest coins that add up to an amount, or -1 if it cannot be made, with bottom-up dynamic programming, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given a list `coins` of coin values (all different, all positive) and a target `amount`. You have an unlimited supply of every coin value. Return the smallest number of coins whose values add up to exactly `amount`. If no combination of coins reaches it, return `-1`.

An `amount` of `0` needs no coins, so the answer is `0`. There is at least one coin value, a coin value can be very large (up to about 2^31), and `amount` is at most 10,000.

## Examples

- `coins = [2, 5, 10]`, `amount = 27` → `4`, using `10 + 10 + 5 + 2`. Three coins can reach 25 or 30 but never 27.
- `coins = [1, 3, 4]`, `amount = 6` → `2`, using `3 + 3`. Grabbing the biggest coin first gives `4 + 1 + 1`, which is three coins.
- `coins = [3, 7]`, `amount = 5` → `-1`. No mix of 3s and 7s adds up to 5.
- `coins = [4]`, `amount = 0` → `0`.

## Key idea

Greedy (always take the largest coin that fits) fails, as the second example shows, so we need to consider every option. The trick is that the best way to pay an amount `x` must end with *some* last coin `c`; before that coin you paid `x - c`, and you must have paid it in the best possible way. So

`best[x] = 1 + min(best[x - c])` over all coins `c <= x`,

with `best[0] = 0`. Every amount depends only on smaller amounts, so you can fill a table from `0` up to `amount`. This is **dynamic programming**: each small answer is computed once and reused by all bigger amounts.

## Approach

1. Create an array `best` of size `amount + 1`. Set `best[0] = 0` and every other entry to a sentinel meaning "unreachable", for example `amount + 1` (no answer can use more than `amount` coins, since the smallest coin is at least 1).
2. For each `x` from `1` to `amount`, and for each coin `c`:
   - If `c <= x` and `best[x - c] + 1 < best[x]`, set `best[x] = best[x - c] + 1`.
3. If `best[amount]` is still the sentinel, return `-1`; otherwise return `best[amount]`.

A plain recursion that tries every coin at every step is exponential because it solves the same remaining amounts again and again. Adding memoization to it gives the same O(amount × coins) cost as the table. Another option is a breadth-first search over amounts, where level `k` holds the amounts reachable with `k` coins.

## Complexity

- **Time:** O(A × C), where A is `amount` and C is the number of coin values: every table entry looks at every coin once.
- **Space:** O(A) for the table.

## Common mistakes

- Using the greedy "largest coin first" rule. It is only correct for special coin systems.
- Initialising unreachable amounts with the language's maximum integer and then adding 1, which overflows in Java, C++ and Go. A sentinel of `amount + 1` avoids this.
- Computing `x - c` or `c` sums in a way that overflows when a coin value is close to 2^31. Compare `c <= x` before subtracting.
- Returning the sentinel instead of `-1` when the amount cannot be made.
- Forgetting that `amount = 0` has answer `0`, not `-1`.

## Follow-up questions

- Count how many different combinations reach the amount. (Coin Change II: loop over coins on the outside so each combination is counted once.)
- Also return which coins to use. (Store the last coin chosen for each amount and walk back from `amount`.)
- What if each coin can be used at most once? (That is a 0/1 knapsack: loop over amounts from high to low for each coin.)

## Related problems

- Coin Change II: count the combinations instead of minimising coins.
- Perfect Squares: the same DP where the "coins" are square numbers.
- Minimum Cost For Tickets: a DP over days with a few choices at each step.

## Solutions

```python
class Solution:
    def coinChange(self, coins: List[int], amount: int) -> int:
        unreachable = amount + 1  # more coins than any real answer can use
        best = [0] + [unreachable] * amount
        for x in range(1, amount + 1):
            for c in coins:
                if c <= x and best[x - c] + 1 < best[x]:
                    best[x] = best[x - c] + 1
        return -1 if best[amount] == unreachable else best[amount]
```

```java
class Solution {
    public int coinChange(int[] coins, int amount) {
        int unreachable = amount + 1; // more coins than any real answer can use
        int[] best = new int[amount + 1];
        Arrays.fill(best, unreachable);
        best[0] = 0;
        for (int x = 1; x <= amount; x++) {
            for (int c : coins) {
                if (c <= x && best[x - c] + 1 < best[x]) {
                    best[x] = best[x - c] + 1;
                }
            }
        }
        return best[amount] == unreachable ? -1 : best[amount];
    }
}
```

```cpp
class Solution {
public:
    int coinChange(vector<int>& coins, int amount) {
        int unreachable = amount + 1;  // more coins than any real answer can use
        vector<int> best(amount + 1, unreachable);
        best[0] = 0;
        for (int x = 1; x <= amount; x++) {
            for (int c : coins) {
                if (c <= x && best[x - c] + 1 < best[x]) {
                    best[x] = best[x - c] + 1;
                }
            }
        }
        return best[amount] == unreachable ? -1 : best[amount];
    }
};
```

```javascript
/**
 * @param {number[]} coins
 * @param {number} amount
 * @return {number}
 */
var coinChange = function (coins, amount) {
  const unreachable = amount + 1; // more coins than any real answer can use
  const best = new Array(amount + 1).fill(unreachable);
  best[0] = 0;
  for (let x = 1; x <= amount; x++) {
    for (const c of coins) {
      if (c <= x && best[x - c] + 1 < best[x]) {
        best[x] = best[x - c] + 1;
      }
    }
  }
  return best[amount] === unreachable ? -1 : best[amount];
};
```

```go
func coinChange(coins []int, amount int) int {
	unreachable := amount + 1 // more coins than any real answer can use
	best := make([]int, amount+1)
	for x := 1; x <= amount; x++ {
		best[x] = unreachable
		for _, c := range coins {
			if c <= x && best[x-c]+1 < best[x] {
				best[x] = best[x-c] + 1
			}
		}
	}
	if best[amount] == unreachable {
		return -1
	}
	return best[amount]
}
```
