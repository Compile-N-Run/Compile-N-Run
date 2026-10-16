---
title: Climbing Stairs
leetcode: climbing-stairs
description: "Climbing Stairs explained: count the ways to climb n steps taking 1 or 2 at a time with a Fibonacci-style dynamic programming loop in O(1) space, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

A staircase has `n` steps (`n` is between 1 and 45). On each move you climb either 1 step or 2 steps. Return the number of different sequences of moves that take you from the bottom exactly to the top.

Two ways are different if the sequence of moves differs, so `1 + 2` and `2 + 1` count separately. For `n` up to 45 the answer fits in a 32-bit signed integer.

## Examples

- `n = 1` → `1`. The only way is a single 1-step move.
- `n = 3` → `3`: `1+1+1`, `1+2`, `2+1`.
- `n = 4` → `5`: `1+1+1+1`, `1+1+2`, `1+2+1`, `2+1+1`, `2+2`.
- `n = 6` → `13`.

## Key idea

Think about the **last move**. To stand on step `n`, you arrived either from step `n - 1` (with a 1-step move) or from step `n - 2` (with a 2-step move). Those two groups do not overlap and together cover every way, so

`ways(n) = ways(n - 1) + ways(n - 2)`, with `ways(1) = 1` and `ways(2) = 2`.

This is the Fibonacci sequence shifted by one. Each value depends only on the previous two, so you can compute it from the bottom up while keeping just two numbers.

## Approach

1. If `n` is 1 or 2, return `n`.
2. Keep `a = ways(1) = 1` and `b = ways(2) = 2`.
3. Repeat for steps 3 through `n`: compute `c = a + b`, then slide the pair forward with `a = b`, `b = c`.
4. Return `b`, which now holds `ways(n)`.

The plain recursive version, `ways(n - 1) + ways(n - 2)` without remembering results, recomputes the same values again and again and takes exponential time: for `n = 45` that is over a billion calls. Memoizing (caching) results also fixes it, at the cost of O(n) memory.

## Complexity

- **Time:** O(n). One loop iteration per step.
- **Space:** O(1). Only two running values are stored.

## Common mistakes

- Using plain recursion without a cache, which times out for larger `n`.
- Getting the base cases off by one, for example treating `ways(2)` as 1. There are two ways to climb two steps: `1+1` and `2`.
- Counting combinations instead of sequences (treating `1+2` and `2+1` as the same).

## Follow-up questions

- What if you could climb 1, 2 or 3 steps at a time? The recurrence becomes the sum of the previous three values.
- What if each step had a cost and you wanted the cheapest way up? (Min Cost Climbing Stairs.)
- For very large `n`, the Fibonacci numbers can be computed in O(log n) with matrix exponentiation (usually modulo some number to keep them small).

## Related problems

- Min Cost Climbing Stairs
- Fibonacci Number
- House Robber

## Solutions

```python
class Solution:
    def climbStairs(self, n: int) -> int:
        if n <= 2:
            return n
        a, b = 1, 2  # ways to reach steps 1 and 2
        for _ in range(3, n + 1):
            a, b = b, a + b
        return b
```

```java
class Solution {
    public int climbStairs(int n) {
        if (n <= 2) {
            return n;
        }
        int a = 1, b = 2; // ways to reach steps 1 and 2
        for (int i = 3; i <= n; i++) {
            int c = a + b;
            a = b;
            b = c;
        }
        return b;
    }
}
```

```cpp
class Solution {
public:
    int climbStairs(int n) {
        if (n <= 2) {
            return n;
        }
        int a = 1, b = 2;  // ways to reach steps 1 and 2
        for (int i = 3; i <= n; i++) {
            int c = a + b;
            a = b;
            b = c;
        }
        return b;
    }
};
```

```javascript
/**
 * @param {number} n
 * @return {number}
 */
var climbStairs = function (n) {
  if (n <= 2) {
    return n;
  }
  let a = 1, b = 2; // ways to reach steps 1 and 2
  for (let i = 3; i <= n; i++) {
    [a, b] = [b, a + b];
  }
  return b;
};
```

```go
func climbStairs(n int) int {
	if n <= 2 {
		return n
	}
	a, b := 1, 2 // ways to reach steps 1 and 2
	for i := 3; i <= n; i++ {
		a, b = b, a+b
	}
	return b
}
```
