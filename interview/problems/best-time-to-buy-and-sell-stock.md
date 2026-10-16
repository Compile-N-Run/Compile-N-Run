---
title: Best Time to Buy and Sell Stock
leetcode: best-time-to-buy-and-sell-stock
description: "Best Time to Buy and Sell Stock explained: find the largest profit from one buy and one later sell by tracking the lowest price so far in a single pass, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given an array `prices` where `prices[i]` is the price of a stock on day `i`. The array has at least one day and all prices are non-negative.

You may make **at most one trade**: buy on one day and sell on a **later** day. Return the largest profit you can make. If no trade makes money, return `0` (you simply do not trade).

## Examples

- `prices = [9, 2, 6, 1, 4]` → `4`. Buy at 2 (day 1) and sell at 6 (day 2). Buying at the lowest price, 1, only allows selling at 4, a profit of 3.
- `prices = [2, 9, 1, 8]` → `7`. Buy at 2 and sell at 9, or buy at 1 and sell at 8; both give 7.
- `prices = [8, 6, 5, 3]` → `0`. The price only falls, so every trade would lose money.
- `prices = [5]` → `0`. With a single day there is no later day to sell on.

## Key idea

If you sell on day `i`, the best day to have bought is the day with the **lowest price before `i`**. So walk through the days once, keeping the cheapest price seen so far. On each day, the best profit from selling today is `price - cheapest`; the answer is the largest of those values.

## Approach

1. Set `cheapest` to the first price and `best = 0`.
2. For each price `p` from left to right:
   1. Update `best = max(best, p - cheapest)` (the profit if you sell today).
   2. Update `cheapest = min(cheapest, p)` (a possible buying day for later).
3. Return `best`.

Because `cheapest` only contains prices from earlier days (or today, which gives a profit of 0), you never sell before you buy. Starting `best` at 0 handles the case where prices only fall.

The brute-force alternative tries every buy day with every later sell day, which is O(n²) and too slow for arrays with around 100,000 prices.

## Complexity

- **Time:** O(n). One pass with constant work per day.
- **Space:** O(1). Only two variables are kept.

## Common mistakes

- Returning `max(prices) - min(prices)`. The maximum may come before the minimum, as in `[9, 2, 6, 1, 4]`, where that gives 8 instead of 4.
- Starting `best` at a negative number or returning a negative profit; not trading is always allowed, so the answer is at least 0.

## Follow-up questions

- What if you may make as many trades as you like? (Best Time to Buy and Sell Stock II: add every positive day-to-day increase.)
- What if you may make at most two trades, or at most `k`? (Dynamic programming over trades and holding state.)
- What if each sale is followed by a cooldown day or costs a fee?

## Related problems

- Best Time to Buy and Sell Stock II
- Best Time to Buy and Sell Stock III
- Maximum Subarray

## Solutions

```python
class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        cheapest = prices[0]
        best = 0
        for p in prices:
            best = max(best, p - cheapest)  # sell today
            cheapest = min(cheapest, p)  # or remember today as a buying day
        return best
```

```java
class Solution {
    public int maxProfit(int[] prices) {
        int cheapest = prices[0], best = 0;
        for (int p : prices) {
            best = Math.max(best, p - cheapest); // sell today
            cheapest = Math.min(cheapest, p); // or remember today as a buying day
        }
        return best;
    }
}
```

```cpp
class Solution {
public:
    int maxProfit(vector<int>& prices) {
        int cheapest = prices[0], best = 0;
        for (int p : prices) {
            best = max(best, p - cheapest);  // sell today
            cheapest = min(cheapest, p);     // or remember today as a buying day
        }
        return best;
    }
};
```

```javascript
/**
 * @param {number[]} prices
 * @return {number}
 */
var maxProfit = function (prices) {
  let cheapest = prices[0];
  let best = 0;
  for (const p of prices) {
    best = Math.max(best, p - cheapest); // sell today
    cheapest = Math.min(cheapest, p); // or remember today as a buying day
  }
  return best;
};
```

```go
func maxProfit(prices []int) int {
	cheapest, best := prices[0], 0
	for _, p := range prices {
		best = max(best, p-cheapest) // sell today
		cheapest = min(cheapest, p)  // or remember today as a buying day
	}
	return best
}
```
