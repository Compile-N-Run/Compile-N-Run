---
title: Sqrt(x)
leetcode: sqrtx
description: "Sqrt(x) explained: compute the integer square root of a non-negative number without a square-root function by binary searching for the largest k with k*k <= x, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given a non-negative integer `x` no larger than `2^31 - 1`. Return the square root of `x` **rounded down** to an integer: the largest integer `k` such that `k * k <= x`. You may not call a built-in square-root or power function; the point of the problem is to compute it yourself with integer arithmetic.

## Examples

- `16` → `4`, since `4 * 4 = 16` exactly.
- `15` → `3`. The real square root is about 3.87, and the decimal part is dropped.
- `0` → `0` and `1` → `1`.
- `2147483647` → `46340`. `46340² = 2147395600` fits under `x`, while `46341² = 2147488281` is already too big.

## Key idea

The function `k → k * k` is increasing, so "is `k * k <= x`?" is true for all small `k` and false for all large `k`, with a single switch point. That is exactly the shape binary search needs: search the range `0..x` for the last `k` where the test is still true. Each step halves the range, so even the largest input takes about 31 steps.

## Approach

1. Set `lo = 0`, `hi = x`, `answer = 0`.
2. While `lo <= hi`:
   1. `mid = lo + (hi - lo) / 2`.
   2. If `mid * mid <= x`, `mid` is a valid candidate: record `answer = mid` and search higher with `lo = mid + 1`.
   3. Otherwise `mid` is too big: `hi = mid - 1`.
3. Return `answer`.

Compute `mid * mid` in a 64-bit integer (or compare `mid <= x / mid`): for `x` near `2^31` the square of a 32-bit `mid` overflows. In JavaScript numbers are doubles, so the product is safe.

The brute force counts `k = 0, 1, 2, …` until `k * k > x`, which is O(√x), about 46,000 steps at the top of the range. Fine for one call, slow for many. Newton's method (`k = (k + x / k) / 2` until it stops changing) converges even faster than binary search and is a good follow-up to know.

## Complexity

- **Time:** O(log x), about 31 iterations for a 32-bit input.
- **Space:** O(1).

## Common mistakes

- Overflow in `mid * mid` when `mid` is a 32-bit int. Use 64-bit arithmetic or division (`mid <= x / mid`, guarding `mid == 0`).
- Returning `lo` or `hi` without thinking about which one holds the answer when the loop ends. Recording `answer` whenever the test passes is the easiest way to be sure.
- Converting through floating point (`(int) Math.sqrt(x)`) when the interviewer asked for integer-only arithmetic; it is also a precision risk for larger inputs in other versions of the problem.
- An infinite loop from `lo = mid` instead of `lo = mid + 1` when `lo` and `hi` are adjacent.

## Follow-up questions

- Implement Newton's method and compare the number of iterations.
- Return the result rounded to the nearest integer instead of down, or to a fixed number of decimal places.
- Decide whether `x` is a perfect square (Valid Perfect Square: same search, check `answer * answer == x`).

## Related problems

- [Pow(x, n)](/interview/problems/powx-n/)
- [Koko Eating Bananas](/interview/problems/koko-eating-bananas/)
- [Find Peak Element](/interview/problems/find-peak-element/)
- Valid Perfect Square

## Solutions

```python
class Solution:
    def mySqrt(self, x: int) -> int:
        lo, hi, answer = 0, x, 0
        while lo <= hi:
            mid = (lo + hi) // 2
            if mid * mid <= x:
                answer = mid  # valid: remember it and look for a larger one
                lo = mid + 1
            else:
                hi = mid - 1
        return answer
```

```java
class Solution {
    public int mySqrt(int x) {
        int lo = 0, hi = x, answer = 0;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            if ((long) mid * mid <= x) { // long: mid * mid overflows int near 2^31
                answer = mid; // valid: remember it and look for a larger one
                lo = mid + 1;
            } else {
                hi = mid - 1;
            }
        }
        return answer;
    }
}
```

```cpp
class Solution {
public:
    int mySqrt(int x) {
        int lo = 0, hi = x, answer = 0;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            if ((long long)mid * mid <= x) {  // long long: mid * mid overflows int near 2^31
                answer = mid;  // valid: remember it and look for a larger one
                lo = mid + 1;
            } else {
                hi = mid - 1;
            }
        }
        return answer;
    }
};
```

```javascript
/**
 * @param {number} x
 * @return {number}
 */
var mySqrt = function (x) {
  let lo = 0, hi = x, answer = 0;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (mid * mid <= x) {
      answer = mid; // valid: remember it and look for a larger one
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return answer;
};
```

```go
func mySqrt(x int) int {
	lo, hi, answer := 0, x, 0
	for lo <= hi {
		mid := lo + (hi-lo)/2
		if mid*mid <= x { // int is 64-bit on LeetCode, so the square cannot overflow
			answer = mid // valid: remember it and look for a larger one
			lo = mid + 1
		} else {
			hi = mid - 1
		}
	}
	return answer
}
```
