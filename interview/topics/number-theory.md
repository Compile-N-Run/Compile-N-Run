---
title: Number Theory
topic: Number Theory
group: math
description: "Primes, divisors, gcd and modular arithmetic for interviews: the sieve of Eratosthenes, trial-division factoring, Euclid's algorithm and the facts about integers that turn slow loops into fast ones."
---

## What it is

Number theory is the part of math that studies whole numbers: which are prime, what divides what, and how remainders behave. In interviews it shows up as a handful of reusable tools rather than deep theory. If you can generate all primes up to `n`, factor a number into primes, compute a gcd, and reason about remainders, you can solve nearly every problem under this tag.

The three building blocks:

- **Sieve of Eratosthenes.** To find every prime up to `n`, start with all numbers marked "prime", then for each prime `p` cross out its multiples `p*p, p*p+p, ...`. Whatever is still marked at the end is prime. It costs about O(n log log n), close to linear.
- **Trial division.** To factor one number `n`, try dividing by `2, 3, 4, ...` up to `sqrt(n)`. Every time a divisor fits, divide it out as many times as it goes. If something larger than 1 remains, that remainder is itself a prime. This works because a composite number always has a factor at most `sqrt(n)`.
- **Euclid's algorithm.** `gcd(a, b) = gcd(b, a mod b)` until `b` is zero. From gcd you get `lcm(a, b) = a / gcd(a, b) * b` and the test "are `a` and `b` coprime?" (`gcd == 1`).

A few facts worth memorising because problems lean on them: a number has an odd count of divisors only if it is a perfect square; the number of divisors of `p1^a * p2^b` is `(a+1)(b+1)`; `(a * b) mod m = ((a mod m) * (b mod m)) mod m`; and if `k` divides `a` and `b` it divides `a - b` too.

## When to use it

- The statement says *prime*, *divisor*, *factor*, *gcd*, *lcm*, *coprime*, *divisible by k* or *modulo*.
- You need to answer many primality questions for numbers up to around 10^7: precompute with a sieve instead of testing each number separately.
- You need to group numbers that share a factor (Largest Component Size by Common Factor): factor each number and union it with its prime factors.
- A problem asks for pairs whose product is divisible by `k`; think in terms of `gcd(a, k)` rather than the raw values.
- Something repeats with a period, or a digit sum collapses (Add Digits): look for a rule about remainders, in that case `n mod 9`.

## How it works

Trace `sieve(30)` from the template. Start with everything from 2 to 30 marked prime.

- `p = 2`: cross out 4, 6, 8, ..., 30.
- `p = 3`: cross out 9, 12, 15, ..., 30. Note we start at `3*3 = 9`, because 6 was already handled by 2.
- `p = 4`: already crossed out, skip.
- `p = 5`: cross out 25, 30. We start at 25, and 25 and 30 were the only multiples left in range.
- `p = 6`: `6 * 6 = 36 > 30`, so the outer loop stops.

Survivors: 2, 3, 5, 7, 11, 13, 17, 19, 23, 29. Two details make the sieve fast: the outer loop stops at `sqrt(n)`, and inner loops start at `p*p`, since smaller multiples have a smaller prime factor that already crossed them out.

Now `prime_factors(360)` by trial division:

| `d` | divides? | `n` after dividing out | recorded |
|-----|----------|------------------------|----------|
| 2   | 3 times  | 45                     | (2, 3)   |
| 3   | 2 times  | 5                      | (3, 2)   |
| 4   | no       | 5                      |          |
| 5   | `5*5 > 5`, loop ends | 5          |          |

The leftover 5 is bigger than 1, so it is recorded as `(5, 1)`. Result: `360 = 2^3 * 3^2 * 5`. The loop only ran up to `d = 3`, since dividing out small primes shrinks `n` and with it the `sqrt(n)` bound.

Finally `gcd(48, 18)`: `48 mod 18 = 12`, `18 mod 12 = 6`, `12 mod 6 = 0`, so the gcd is 6 and `lcm = 48 * 18 / 6 = 144`.

## Template

```python
def sieve(n: int) -> list[bool]:
    """is_prime[i] tells whether i is prime, for 0 <= i <= n."""
    is_prime = [True] * (n + 1)
    is_prime[0] = is_prime[1] = False
    p = 2
    while p * p <= n:
        if is_prime[p]:
            for multiple in range(p * p, n + 1, p):  # smaller multiples were already crossed out
                is_prime[multiple] = False
        p += 1
    return is_prime


def prime_factors(n: int) -> list[tuple[int, int]]:
    """Trial division: (prime, exponent) pairs, e.g. 360 -> [(2, 3), (3, 2), (5, 1)]."""
    factors = []
    d = 2
    while d * d <= n:
        count = 0
        while n % d == 0:
            n //= d
            count += 1
        if count:
            factors.append((d, count))
        d += 1
    if n > 1:                      # whatever is left is a prime bigger than sqrt(original n)
        factors.append((n, 1))
    return factors


def gcd(a: int, b: int) -> int:
    while b:
        a, b = b, a % b
    return a


if __name__ == "__main__":
    is_prime = sieve(30)
    print([i for i in range(31) if is_prime[i]])   # [2, 3, 5, 7, 11, 13, 17, 19, 23, 29]
    print(prime_factors(360))                       # [(2, 3), (3, 2), (5, 1)]
    print(gcd(48, 18), 48 * 18 // gcd(48, 18))      # gcd 6, lcm 144
```

```java
import java.util.ArrayList;
import java.util.List;

public class Template {
    // isPrime[i] tells whether i is prime, for 0 <= i <= n.
    static boolean[] sieve(int n) {
        boolean[] isPrime = new boolean[n + 1];
        java.util.Arrays.fill(isPrime, true);
        isPrime[0] = false;
        if (n >= 1) isPrime[1] = false;
        for (int p = 2; (long) p * p <= n; p++) {
            if (!isPrime[p]) continue;
            for (int multiple = p * p; multiple <= n; multiple += p) { // smaller multiples were already crossed out
                isPrime[multiple] = false;
            }
        }
        return isPrime;
    }

    // Trial division: {prime, exponent} pairs, e.g. 360 -> [[2,3],[3,2],[5,1]].
    static List<int[]> primeFactors(int n) {
        List<int[]> factors = new ArrayList<>();
        for (int d = 2; (long) d * d <= n; d++) {
            int count = 0;
            while (n % d == 0) {
                n /= d;
                count++;
            }
            if (count > 0) factors.add(new int[] {d, count});
        }
        if (n > 1) factors.add(new int[] {n, 1}); // what is left is a prime bigger than sqrt(original n)
        return factors;
    }

    static long gcd(long a, long b) {
        while (b != 0) {
            long t = a % b;
            a = b;
            b = t;
        }
        return a;
    }

    public static void main(String[] args) {
        boolean[] isPrime = sieve(30);
        StringBuilder primes = new StringBuilder();
        for (int i = 0; i <= 30; i++) if (isPrime[i]) primes.append(i).append(' ');
        System.out.println(primes.toString().trim());        // 2 3 5 7 11 13 17 19 23 29
        for (int[] f : primeFactors(360)) System.out.print(f[0] + "^" + f[1] + " ");
        System.out.println();                                 // 2^3 3^2 5^1
        System.out.println(gcd(48, 18) + " " + 48 * 18 / gcd(48, 18)); // 6 144
    }
}
```

```cpp
#include <iostream>
#include <utility>
#include <vector>

// isPrime[i] tells whether i is prime, for 0 <= i <= n.
std::vector<bool> sieve(int n) {
    std::vector<bool> isPrime(n + 1, true);
    isPrime[0] = false;
    if (n >= 1) isPrime[1] = false;
    for (long long p = 2; p * p <= n; p++) {
        if (!isPrime[p]) continue;
        for (long long multiple = p * p; multiple <= n; multiple += p) {  // smaller multiples were already crossed out
            isPrime[multiple] = false;
        }
    }
    return isPrime;
}

// Trial division: (prime, exponent) pairs, e.g. 360 -> {2,3} {3,2} {5,1}.
std::vector<std::pair<long long, int>> primeFactors(long long n) {
    std::vector<std::pair<long long, int>> factors;
    for (long long d = 2; d * d <= n; d++) {
        int count = 0;
        while (n % d == 0) {
            n /= d;
            count++;
        }
        if (count > 0) factors.push_back({d, count});
    }
    if (n > 1) factors.push_back({n, 1});  // what is left is a prime bigger than sqrt(original n)
    return factors;
}

long long gcd(long long a, long long b) {
    while (b != 0) {
        long long t = a % b;
        a = b;
        b = t;
    }
    return a;
}

int main() {
    std::vector<bool> isPrime = sieve(30);
    for (int i = 0; i <= 30; i++) if (isPrime[i]) std::cout << i << ' ';
    std::cout << "\n";                                         // 2 3 5 7 11 13 17 19 23 29
    for (auto [p, e] : primeFactors(360)) std::cout << p << '^' << e << ' ';
    std::cout << "\n";                                         // 2^3 3^2 5^1
    std::cout << gcd(48, 18) << ' ' << 48 * 18 / gcd(48, 18) << "\n";  // 6 144
}
```

```javascript
// isPrime[i] tells whether i is prime, for 0 <= i <= n.
function sieve(n) {
  const isPrime = new Array(n + 1).fill(true);
  isPrime[0] = false;
  if (n >= 1) isPrime[1] = false;
  for (let p = 2; p * p <= n; p++) {
    if (!isPrime[p]) continue;
    for (let multiple = p * p; multiple <= n; multiple += p) {
      isPrime[multiple] = false; // smaller multiples were already crossed out
    }
  }
  return isPrime;
}

// Trial division: [prime, exponent] pairs, e.g. 360 -> [[2,3],[3,2],[5,1]].
function primeFactors(n) {
  const factors = [];
  for (let d = 2; d * d <= n; d++) {
    let count = 0;
    while (n % d === 0) {
      n /= d;
      count++;
    }
    if (count > 0) factors.push([d, count]);
  }
  if (n > 1) factors.push([n, 1]); // what is left is a prime bigger than sqrt(original n)
  return factors;
}

function gcd(a, b) {
  while (b !== 0) [a, b] = [b, a % b];
  return a;
}

const isPrime = sieve(30);
console.log(isPrime.map((v, i) => (v ? i : -1)).filter((i) => i >= 0).join(" ")); // 2 3 5 7 11 13 17 19 23 29
console.log(JSON.stringify(primeFactors(360))); // [[2,3],[3,2],[5,1]]
console.log(gcd(48, 18), (48 * 18) / gcd(48, 18)); // 6 144
```

```go
package main

import "fmt"

// sieve returns isPrime where isPrime[i] tells whether i is prime, for 0 <= i <= n.
func sieve(n int) []bool {
	isPrime := make([]bool, n+1)
	for i := 2; i <= n; i++ {
		isPrime[i] = true
	}
	for p := 2; p*p <= n; p++ {
		if !isPrime[p] {
			continue
		}
		for multiple := p * p; multiple <= n; multiple += p { // smaller multiples were already crossed out
			isPrime[multiple] = false
		}
	}
	return isPrime
}

// primeFactors uses trial division: [prime, exponent] pairs, e.g. 360 -> [[2 3] [3 2] [5 1]].
func primeFactors(n int) [][2]int {
	var factors [][2]int
	for d := 2; d*d <= n; d++ {
		count := 0
		for n%d == 0 {
			n /= d
			count++
		}
		if count > 0 {
			factors = append(factors, [2]int{d, count})
		}
	}
	if n > 1 { // what is left is a prime bigger than sqrt(original n)
		factors = append(factors, [2]int{n, 1})
	}
	return factors
}

func gcd(a, b int) int {
	for b != 0 {
		a, b = b, a%b
	}
	return a
}

func main() {
	isPrime := sieve(30)
	for i, ok := range isPrime {
		if ok {
			fmt.Print(i, " ")
		}
	}
	fmt.Println()                                  // 2 3 5 7 11 13 17 19 23 29
	fmt.Println(primeFactors(360))                 // [[2 3] [3 2] [5 1]]
	fmt.Println(gcd(48, 18), 48*18/gcd(48, 18)) // 6 144
}
```

## Variations

- **Smallest-prime-factor sieve.** Instead of a boolean, store the smallest prime that divides each number. Then factoring any `n` up to the limit is O(log n): repeatedly divide by `spf[n]`. Worth it when you must factor thousands of numbers.
- **gcd of an array.** Fold `gcd` over all elements. The gcd of a list is 1 as soon as any prefix reaches 1, so you can stop early.
- **Modular inverse.** When a problem divides under a modulus, multiply by the inverse instead. For a prime modulus `m`, the inverse of `a` is `a^(m-2) mod m` by Fermat's little theorem, computed with fast exponentiation (see the [Math](/interview/topics/math/) guide).
- **Counting divisors from the factorization.** With `n = p1^a1 * p2^a2 * ...`, the divisor count is `(a1+1)(a2+1)...` and the divisor sum is a product of geometric series. No need to enumerate divisors.

## Common mistakes

- Starting the inner sieve loop at `2*p` instead of `p*p`. Still correct, but roughly twice the work, and starting at `p` itself would wrongly cross out the prime.
- Writing the trial-division loop as `d <= sqrt(n)` with a floating-point `sqrt`. Use `d * d <= n` on integers (with a wide enough type so `d * d` does not overflow).
- Forgetting the leftover factor after trial division. `prime_factors(14)` must report 7, which is never reached by the loop because `3 * 3 > 7`.
- Treating 1 as prime, or 0 and 1 as special cases you forgot to initialise in the sieve.
- `lcm = a * b / gcd` overflowing before the division. Divide first: `a / gcd * b`.
- Using `%` on negative numbers and expecting a non-negative remainder in Java, C++, JavaScript or Go.

## Complexity

The sieve is O(n log log n) time and O(n) memory; for `n = 10^7` that is a few tens of milliseconds and 10 MB of booleans. Trial division is O(sqrt(n)) per number. Euclid's gcd is O(log min(a, b)). Problems that look like they need O(n^2) pair checks for divisibility usually become O(n * number of divisors) or O(n log n) after you group numbers by their gcd with `k`.

## Where to start

1. 1979. Find Greatest Common Divisor of Array: Euclid's algorithm with nothing else in the way.
2. 258. Add Digits: find the `mod 9` rule by tracing a few examples, then write the O(1) answer.
3. 204. Count Primes: implement the sieve and get the `p*p` start and the `sqrt(n)` stop right.
4. 2523. Closest Prime Numbers in Range: sieve once, then scan consecutive primes.
5. 914. X of a Kind in a Deck of Cards: the answer is whether the gcd of all counts is at least 2.
6. 2521. Distinct Prime Factors of Product of Array: factor each number by trial division and collect primes in a set.
7. 2183. Count Array Pairs Divisible by K: replace each number by `gcd(num, k)` and count compatible pairs.
8. 952. Largest Component Size by Common Factor: union each number with its prime factors, then find the largest group.
