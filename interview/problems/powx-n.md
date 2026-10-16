---
title: Pow(x, n)
leetcode: powx-n
description: "Pow(x, n) explained: compute x raised to an integer power, including negative exponents and the most negative 32-bit int, with binary exponentiation in O(log n) multiplications, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

Implement `myPow(x, n)`, which returns `x` raised to the power `n`. Here `x` is a floating-point number and `n` is a 32-bit signed integer, so it can be negative, zero, or as small as `-2^31`. The result fits in a double; you must not call the language's built-in power function, because the point of the exercise is to compute it in O(log n) multiplications rather than `n` of them.

## Examples

- `x = 3.0, n = 4` → `81.0`.
- `x = 2.0, n = -3` → `0.125`, because a negative exponent means `1 / (2^3)`.
- `x = -1.5, n = 7` → `-17.0859375`. An odd power of a negative base stays negative.
- `x = 5.5, n = 0` → `1.0`. Anything to the power zero is one.
- `x = 2.0, n = -2147483648` → `0.0` (a positive number that small underflows to zero in a double).

## Key idea

Squaring doubles the exponent for the price of one multiplication: `x^8` is `((x^2)^2)^2`, three multiplications instead of seven. Any exponent can be written in binary, and `x^n` is the product of `x^(2^i)` over the bits `i` that are set in `n`. So walk through the bits of `n`, squaring a running power each step, and multiply it into the result whenever the current bit is 1. This is called binary (or fast) exponentiation.

A negative exponent is handled by inverting the base (`x = 1 / x`) and making the exponent positive. The catch is `n = -2^31`: its negation does not fit in a 32-bit int, so convert to a 64-bit integer before negating.

## Approach

1. Copy `n` into a 64-bit integer `e`. If `e < 0`, set `x = 1 / x` and `e = -e`.
2. Set `result = 1`.
3. While `e > 0`:
   1. If the lowest bit of `e` is 1, multiply `result` by `x`.
   2. Square `x` (`x = x * x`) and shift `e` right by one bit.
4. Return `result`.

Multiplying `x` by itself `n` times is the obvious alternative; with `n` up to two billion that is far too slow, and the recursive version (`pow(x, n/2)` squared) must be careful to compute the half only once or it also becomes O(n).

## Complexity

- **Time:** O(log |n|). The loop runs once per bit of the exponent (at most 32 iterations).
- **Space:** O(1) for the iterative version (the recursive one uses O(log n) stack).

## Common mistakes

- Writing `n = -n` on a 32-bit int: for `-2^31` the result is still `-2^31` (overflow), and the loop never runs or runs forever. Widen to 64 bits first.
- Computing `pow(x, n / 2) * pow(x, n / 2)` in the recursive version. That evaluates the half twice and brings the running time back to O(n).
- Forgetting the `n = 0` case returns `1`, or special-casing `x = 0` so that `0^0` returns `0` instead of `1` (LeetCode expects `1`).
- Comparing the result to an exact value in tests. Floating-point rounding differs between the built-in `pow` and repeated multiplication, so compare with a tolerance.

## Follow-up questions

- How would you compute `x^n mod m` for huge `n` (modular exponentiation)? (Same loop, reducing modulo `m` after each multiplication.)
- Can you make it recursive? (`pow(x, n) = half * half` where `half = pow(x, n / 2)`, times `x` when `n` is odd.)
- How would you raise a matrix to a power (for example to compute Fibonacci numbers in O(log n))? (The same loop with matrix multiplication instead of scalar multiplication.)

## Related problems

- [Climbing Stairs](/interview/problems/climbing-stairs/) (its O(log n) solution uses matrix exponentiation)
- Sqrt(x)
- Super Pow

## Solutions

```python
class Solution:
    def myPow(self, x: float, n: int) -> float:
        e = n
        if e < 0:
            x, e = 1 / x, -e  # Python ints never overflow, so -n is safe
        result = 1.0
        while e > 0:
            if e & 1:  # this bit of the exponent is set: include the current power
                result *= x
            x *= x
            e >>= 1
        return result
```

```java
class Solution {
    public double myPow(double x, int n) {
        long e = n; // widen first: -Integer.MIN_VALUE overflows a 32-bit int
        if (e < 0) {
            x = 1 / x;
            e = -e;
        }
        double result = 1.0;
        while (e > 0) {
            if ((e & 1) == 1) { // this bit of the exponent is set: include the current power
                result *= x;
            }
            x *= x;
            e >>= 1;
        }
        return result;
    }
}
```

```cpp
class Solution {
public:
    double myPow(double x, int n) {
        long long e = n;  // widen first: -INT_MIN overflows a 32-bit int
        if (e < 0) {
            x = 1 / x;
            e = -e;
        }
        double result = 1.0;
        while (e > 0) {
            if (e & 1) {  // this bit of the exponent is set: include the current power
                result *= x;
            }
            x *= x;
            e >>= 1;
        }
        return result;
    }
};
```

```javascript
/**
 * @param {number} x
 * @param {number} n
 * @return {number}
 */
var myPow = function (x, n) {
  // JavaScript numbers are doubles, so -n is exact even for -2^31; avoid the 32-bit
  // bitwise operators (& and >>) and use arithmetic instead.
  let e = n;
  if (e < 0) {
    x = 1 / x;
    e = -e;
  }
  let result = 1;
  while (e > 0) {
    if (e % 2 === 1) {
      // this bit of the exponent is set: include the current power
      result *= x;
    }
    x *= x;
    e = Math.floor(e / 2);
  }
  return result;
};
```

```go
func myPow(x float64, n int) float64 {
	e := int64(n) // widen first: negating math.MinInt32 would overflow a 32-bit int
	if e < 0 {
		x = 1 / x
		e = -e
	}
	result := 1.0
	for e > 0 {
		if e&1 == 1 { // this bit of the exponent is set: include the current power
			result *= x
		}
		x *= x
		e >>= 1
	}
	return result
}
```
