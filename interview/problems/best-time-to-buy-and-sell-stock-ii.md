---
title: Best Time to Buy and Sell Stock II
leetcode: best-time-to-buy-and-sell-stock-ii
description: "Best Time to Buy and Sell Stock II explained: find the largest profit from any number of trades by adding up every day-to-day price rise in one greedy pass, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given an array `prices` where `prices[i]` is the price of a stock on day `i`. The array has at least one day and all prices are non-negative.

You may trade as many times as you like, with two limits: you can hold **at most one share** at a time, and you must sell before you buy again. Selling and buying on the same day is allowed. Return the largest total profit you can make; if no trade helps, return `0`.

## Examples

- `prices = [3, 1, 4, 2, 6]` → `7`. Buy at 1, sell at 4 (+3); buy at 2, sell at 6 (+4).
- `prices = [2, 3, 5, 8]` → `6`. Prices only go up, so buy on day 0 and sell on the last day. (Selling and rebuying every day gives the same 6.)
- `prices = [9, 7, 4, 1]` → `0`. Prices only fall, so the best plan is not to trade.
- `prices = [5]` → `0`. With a single day there is nothing to sell.

## Key idea

Draw the prices as a line chart. Any trade from day `a` to a later day `b` earns `prices[b] - prices[a]`, which equals the sum of the daily changes between them. A daily change that is negative only hurts, and a positive one only helps. Since we may trade as often as we like, we can collect **every** positive daily change and skip every negative one. So the answer is simply the sum of `prices[i] - prices[i-1]` over all days where it is positive.

## Approach

1. Set `profit = 0`.
2. For each day `i` from 1 to the end, if `prices[i] > prices[i-1]`, add the difference to `profit`.
3. Return `profit`.

This does not mean you literally trade every day. Consecutive rises such as 2 → 3 → 5 → 8 add up to the same amount as one trade from 2 to 8; summing the small steps is just an easy way to compute the total of all the "buy at a valley, sell at the next peak" trades.

A dynamic programming view gives the same result: keep two values per day, the best profit while holding a share and while holding none, and update both from the previous day. It is worth knowing because it extends to the harder variants (fees, cooldowns, a limit of k trades).

## Complexity

- **Time:** O(n), one pass over the prices.
- **Space:** O(1), only the running total.

## Common mistakes

- Reusing the one-trade solution from [Best Time to Buy and Sell Stock](/interview/problems/best-time-to-buy-and-sell-stock/): tracking only the lowest price so far finds the single best trade, not the best set of trades.
- Trying to find valleys and peaks explicitly and getting the boundaries wrong on flat stretches or at the last day. The sum of positive differences avoids all of that.
- Starting the loop at index 0 and reading `prices[-1]` (or out of bounds).

## Follow-up questions

- What if each sale costs a fixed fee? (Use the hold/no-hold DP: `cash = max(cash, hold + price - fee)`, `hold = max(hold, cash - price)`.)
- What if you must wait one day after selling before buying again? (Add a third "cooldown" state to the DP.)
- What if you may make at most two, or at most k, trades? (Keep a hold/no-hold pair for each trade count.)

## Related problems

- [Best Time to Buy and Sell Stock](/interview/problems/best-time-to-buy-and-sell-stock/): the same prices, but only one trade.
- Best Time to Buy and Sell Stock with Transaction Fee and Best Time to Buy and Sell Stock with Cooldown: the DP follow-ups above.
- [Maximum Subarray](/interview/problems/maximum-subarray/): another single-pass scan over a sequence of gains and losses.

## Solutions

```python
class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        profit = 0
        for i in range(1, len(prices)):
            if prices[i] > prices[i - 1]:
                profit += prices[i] - prices[i - 1]  # collect every rise
        return profit
```

```java
class Solution {
    public int maxProfit(int[] prices) {
        int profit = 0;
        for (int i = 1; i < prices.length; i++) {
            if (prices[i] > prices[i - 1]) {
                profit += prices[i] - prices[i - 1]; // collect every rise
            }
        }
        return profit;
    }
}
```

```cpp
class Solution {
public:
    int maxProfit(vector<int>& prices) {
        int profit = 0;
        for (size_t i = 1; i < prices.size(); i++) {
            if (prices[i] > prices[i - 1]) {
                profit += prices[i] - prices[i - 1];  // collect every rise
            }
        }
        return profit;
    }
};
```

```javascript
/**
 * @param {number[]} prices
 * @return {number}
 */
var maxProfit = function (prices) {
  let profit = 0;
  for (let i = 1; i < prices.length; i++) {
    if (prices[i] > prices[i - 1]) {
      profit += prices[i] - prices[i - 1]; // collect every rise
    }
  }
  return profit;
};
```

```go
func maxProfit(prices []int) int {
	profit := 0
	for i := 1; i < len(prices); i++ {
		if prices[i] > prices[i-1] {
			profit += prices[i] - prices[i-1] // collect every rise
		}
	}
	return profit
}
```
