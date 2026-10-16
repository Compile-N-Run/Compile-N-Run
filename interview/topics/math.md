---
title: Math
topic: Math
group: math
description: "The arithmetic toolkit behind the Math tag: digit loops, modular arithmetic, gcd, fast exponentiation, overflow and the habit of looking for a formula before writing a loop."
---

## What it is

"Math" is LeetCode's tag for problems where the hard part is not a data structure but a bit of arithmetic: pulling the digits out of a number, converting between bases, working with remainders, computing a power without overflowing, or noticing that a long loop collapses into a one-line formula. There is no single algorithm to learn. Instead there is a small toolkit of habits, and most Math problems are one of those habits in disguise.

The toolkit, in rough order of how often it shows up:

- **Digit loops.** `n % 10` is the last digit and `n // 10` drops it. Repeat until `n` is zero and you have walked the number from right to left. Reverse Integer, Palindrome Number and Happy Number are nothing but this loop.
- **Carries.** Adding or multiplying numbers given as strings or linked lists means doing grade-school arithmetic column by column, keeping a `carry` between columns.
- **Remainders and modular arithmetic.** When answers get huge, problems ask for the result modulo `1_000_000_007`. Take `% mod` after every multiplication and addition, never only at the end.
- **gcd and lcm.** Euclid's algorithm finds the greatest common divisor in O(log n) steps; `lcm(a, b) = a / gcd(a, b) * b`.
- **Fast exponentiation.** `x^n` by repeated squaring costs O(log n) multiplications instead of n.
- **Closed forms.** Sum of `1..n` is `n(n+1)/2`; the number of trailing zeros in `n!` is the number of factors of 5; a square has an odd number of divisors. Spotting the formula turns an O(n) loop into O(1) or O(log n).

## When to use it

- The input is a single integer or a number given as a string, linked list or digit array, and the output is another number.
- The statement mentions digits, bases, Roman numerals, remainders, divisibility, powers, factorials, or "return the answer modulo 10^9 + 7".
- The brute-force loop would run `n` times and `n` goes up to 10^9 or more; that is a hint that a formula or a logarithmic trick exists.
- The problem says you may not use the built-in operator (`pow`, `/`, `sqrt`, `*`). You are expected to rebuild it from smaller operations.
- Something is rotated, mirrored or indexed in a grid and the clean solution is an index formula (`rotate (r, c)` to `(c, n-1-r)`).

## How it works

Take `digit_sum(4729)` from the template and trace the digit loop:

| step | `n`  | `n % 10` | `total` |
|------|------|----------|---------|
| 1    | 4729 | 9        | 9       |
| 2    | 472  | 2        | 11      |
| 3    | 47   | 7        | 18      |
| 4    | 4    | 4        | 22      |
| 5    | 0    | stop     | 22      |

Every Math problem built on digits is this table with a different line in the middle: multiply `total` by 10 before adding to reverse the number, compare against the original to test for a palindrome, square the digit for Happy Number.

Now `mod_pow(3, 13, 1000)`. Write 13 in binary: `1101`, so `3^13 = 3^8 * 3^4 * 3^1`. The loop walks the bits from the right. It keeps `base` equal to `3^(2^i)` by squaring it once per bit, and multiplies it into `result` only when the current bit is set:

| bit of 13 | `base` (3^(2^i) mod 1000) | bit set? | `result` |
|-----------|---------------------------|----------|----------|
| 1         | 3                         | yes      | 3        |
| 0         | 9                         | no       | 3        |
| 1         | 81                        | yes      | 243      |
| 1         | 561 (81^2 = 6561)         | yes      | 323      |

Four multiplications instead of thirteen, and the numbers never grow past `mod^2`, which is why we reduce after every product.

Euclid's gcd works because any common divisor of `a` and `b` also divides `a - b`, and therefore `a mod b`. So `gcd(84, 36) = gcd(36, 12) = gcd(12, 0) = 12`. The pair shrinks fast: the second argument at least halves every two steps.

## Template

```python
def digit_sum(n: int) -> int:
    """Peel digits off the right end one at a time."""
    n = abs(n)
    total = 0
    while n > 0:
        total += n % 10   # last digit
        n //= 10          # drop it
    return total


def gcd(a: int, b: int) -> int:
    """Euclid: gcd(a, b) == gcd(b, a mod b)."""
    while b:
        a, b = b, a % b
    return a


def mod_pow(base: int, exp: int, mod: int) -> int:
    """base ** exp % mod by squaring, in O(log exp) steps."""
    result = 1
    base %= mod
    while exp > 0:
        if exp & 1:               # this bit of exp is set: multiply it in
            result = result * base % mod
        base = base * base % mod  # square for the next bit
        exp >>= 1
    return result


if __name__ == "__main__":
    print(digit_sum(4729))        # 22
    print(gcd(84, 36))            # 12
    print(mod_pow(3, 13, 1000))   # 3^13 = 1594323 -> 323
```

```java
public class Template {
    // Peel digits off the right end one at a time.
    static int digitSum(int n) {
        n = Math.abs(n);
        int total = 0;
        while (n > 0) {
            total += n % 10; // last digit
            n /= 10;         // drop it
        }
        return total;
    }

    // Euclid: gcd(a, b) == gcd(b, a mod b).
    static long gcd(long a, long b) {
        while (b != 0) {
            long t = a % b;
            a = b;
            b = t;
        }
        return a;
    }

    // base ^ exp % mod by squaring, in O(log exp) steps.
    static long modPow(long base, long exp, long mod) {
        long result = 1;
        base %= mod;
        while (exp > 0) {
            if ((exp & 1) == 1) {       // this bit of exp is set: multiply it in
                result = result * base % mod;
            }
            base = base * base % mod;   // square for the next bit
            exp >>= 1;
        }
        return result;
    }

    public static void main(String[] args) {
        System.out.println(digitSum(4729));      // 22
        System.out.println(gcd(84, 36));         // 12
        System.out.println(modPow(3, 13, 1000)); // 323
    }
}
```

```cpp
#include <cstdlib>
#include <iostream>

// Peel digits off the right end one at a time.
int digitSum(int n) {
    n = std::abs(n);
    int total = 0;
    while (n > 0) {
        total += n % 10;  // last digit
        n /= 10;          // drop it
    }
    return total;
}

// Euclid: gcd(a, b) == gcd(b, a mod b).
long long gcd(long long a, long long b) {
    while (b != 0) {
        long long t = a % b;
        a = b;
        b = t;
    }
    return a;
}

// base ^ exp % mod by squaring, in O(log exp) steps.
long long modPow(long long base, long long exp, long long mod) {
    long long result = 1;
    base %= mod;
    while (exp > 0) {
        if (exp & 1) {                 // this bit of exp is set: multiply it in
            result = result * base % mod;
        }
        base = base * base % mod;      // square for the next bit
        exp >>= 1;
    }
    return result;
}

int main() {
    std::cout << digitSum(4729) << "\n";       // 22
    std::cout << gcd(84, 36) << "\n";          // 12
    std::cout << modPow(3, 13, 1000) << "\n";  // 323
}
```

```javascript
// Peel digits off the right end one at a time.
function digitSum(n) {
  n = Math.abs(n);
  let total = 0;
  while (n > 0) {
    total += n % 10; // last digit
    n = Math.floor(n / 10); // drop it (no integer division in JS)
  }
  return total;
}

// Euclid: gcd(a, b) == gcd(b, a mod b).
function gcd(a, b) {
  while (b !== 0) {
    [a, b] = [b, a % b];
  }
  return a;
}

// base ^ exp % mod by squaring, in O(log exp) steps.
// BigInt keeps the products exact when mod is around 1e9.
function modPow(base, exp, mod) {
  let result = 1n;
  let b = BigInt(base) % BigInt(mod);
  let e = BigInt(exp);
  const m = BigInt(mod);
  while (e > 0n) {
    if (e & 1n) result = (result * b) % m; // this bit of exp is set
    b = (b * b) % m; // square for the next bit
    e >>= 1n;
  }
  return Number(result);
}

console.log(digitSum(4729)); // 22
console.log(gcd(84, 36)); // 12
console.log(modPow(3, 13, 1000)); // 323
```

```go
package main

import "fmt"

// digitSum peels digits off the right end one at a time.
func digitSum(n int) int {
	if n < 0 {
		n = -n
	}
	total := 0
	for n > 0 {
		total += n % 10 // last digit
		n /= 10         // drop it
	}
	return total
}

// gcd uses Euclid: gcd(a, b) == gcd(b, a mod b).
func gcd(a, b int64) int64 {
	for b != 0 {
		a, b = b, a%b
	}
	return a
}

// modPow computes base^exp % mod by squaring, in O(log exp) steps.
func modPow(base, exp, mod int64) int64 {
	result := int64(1)
	base %= mod
	for exp > 0 {
		if exp&1 == 1 { // this bit of exp is set: multiply it in
			result = result * base % mod
		}
		base = base * base % mod // square for the next bit
		exp >>= 1
	}
	return result
}

func main() {
	fmt.Println(digitSum(4729))      // 22
	fmt.Println(gcd(84, 36))         // 12
	fmt.Println(modPow(3, 13, 1000)) // 323
}
```

## Variations

- **Column arithmetic.** Add Two Numbers, Add Binary, Multiply Strings: walk both inputs from the least significant end, add `carry`, emit `sum % base`, keep `sum / base` as the new carry, and do not forget a final non-zero carry.
- **Base conversion.** Excel column titles are base 26 with digits `A..Z` and no zero, so subtract 1 before each `% 26`. Roman numerals are a greedy subtraction from the largest symbol downward.
- **Cycle detection on numbers.** Happy Number and Add Digits feed a number into a function repeatedly; either a set of seen values or Floyd's two-pointer trick tells you when it loops.
- **Counting with formulas.** Factorial Trailing Zeroes counts multiples of 5, 25, 125, ...; Bulb Switcher is "how many perfect squares are at most n", which is `floor(sqrt(n))`.
- **Index arithmetic on grids.** Rotate Image and Spiral Matrix are about mapping `(row, col)` to new coordinates without moving data twice.
- **Randomness with weights.** Random Pick with Weight turns weights into prefix sums and binary searches a random number into them.

## Common mistakes

- **Overflow.** Reversing a 32-bit integer can exceed the range; multiplying two values near 10^9 needs 64 bits even before you take the modulus. In JavaScript, products above 2^53 silently lose precision, so use `BigInt` for modular multiplication.
- **Negative remainders.** In Java, C++, JavaScript and Go, `-7 % 3` is `-1`, not `2`. Python gives `2`. Normalise with `((x % m) + m) % m` when the sign matters.
- **Reducing only at the end.** `result * base % mod` after each step keeps numbers small; `(base ** exp) % mod` computes a gigantic number first (or overflows).
- **Integer division in JavaScript.** `n / 10` gives a float; use `Math.floor(n / 10)` or `Math.trunc` for negatives.
- **Forgetting the last carry** when adding digit lists, so `99 + 1` comes out as `00`.
- **Floating point for exactness.** `sqrt`, `pow` and `log` return doubles; `Math.pow(3, 20) % 7` or `int(math.log(n, 3)) == ...` can be off by one. Prefer integer loops or binary search.

## Complexity

Digit loops cost O(number of digits), which is O(log n). Euclid's gcd is O(log min(a, b)). Fast exponentiation is O(log exp) multiplications. A closed-form answer is O(1). If your Math solution is O(n) in the *value* of the input rather than its number of digits, there is usually a faster idea waiting.

## Where to start

1. [9. Palindrome Number](/interview/problems/palindrome-number/) teaches the digit loop: reverse the number and compare.
2. [13. Roman to Integer](/interview/problems/roman-to-integer/) is a single pass with one look-ahead rule for subtraction.
3. [202. Happy Number](/interview/problems/happy-number/) combines the digit loop with cycle detection.
4. 66. Plus One is the gentlest carry problem: increment a digit array from the right.
5. [2. Add Two Numbers](/interview/problems/add-two-numbers/) is the same carry logic on linked lists of different lengths.
6. [50. Pow(x, n)](/interview/problems/powx-n/) is fast exponentiation with a negative exponent to handle.
7. 172. Factorial Trailing Zeroes rewards spotting the formula instead of computing the factorial.
8. [48. Rotate Image](/interview/problems/rotate-image/) is pure index arithmetic: transpose, then reverse each row.
