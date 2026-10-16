---
title: Bit Manipulation
topic: Bit Manipulation
group: patterns
description: "Bit manipulation explained: treat an integer as a row of on/off switches and use AND, OR, XOR and shifts to test, set, count and pair up bits in constant time."
---

## What it is

Every integer in memory is a row of bits, each either 0 or 1. A 32-bit `int` is 32 switches; the rightmost one is worth 1, the next 2, then 4, 8 and so on. Bit manipulation means working with those switches directly instead of with the number's decimal value.

Five operators do all the work:

- `a & b` (AND) keeps a bit only where *both* numbers have a 1. Used to test or clear bits.
- `a | b` (OR) keeps a bit where *either* has a 1. Used to set bits.
- `a ^ b` (XOR) keeps a bit where the two *differ*. A number XOR itself is 0, and XOR with 0 changes nothing, which is the basis of many "find the odd one out" tricks.
- `~a` (NOT) flips every bit.
- `a << k` and `a >> k` shift every bit left or right by `k` places; `1 << k` is the number with only bit `k` on, and shifting right drops the lowest bits.

For example, `6` is `110` in binary and `3` is `011`. Then `6 & 3 = 010 = 2`, `6 | 3 = 111 = 7`, `6 ^ 3 = 101 = 5`, `6 >> 1 = 011 = 3`, `6 << 1 = 1100 = 12`.

A small set of items (up to about 20) can be stored as one integer where bit `i` means "item `i` is included", a plain number you can loop over or use as a DP state.

## When to use it

- The problem talks about **binary**, **bits**, **powers of two**, **XOR**, or "without using `+`".
- Every element appears **twice except one** (or an even number of times except a few). XOR cancels the pairs.
- You need **all subsets** of a small collection and want to enumerate them with a counter from `0` to `2^n - 1` instead of recursion.
- A **set of booleans** must be stored compactly as a DP or BFS state (which keys you hold, which cities you visited).
- You must check whether a number is a **power of two**, count its **1 bits**, find the **lowest set bit** or **reverse** its bits.
- The required solution is **O(1) extra space** where a hash set would be the obvious choice.

## How it works

Most problems combine a few of these building blocks. Here `n` is the number and `i` is a bit position counting from 0 on the right.

| Goal | Expression | Why it works |
|---|---|---|
| Test bit `i` | `(n >> i) & 1` | shift the bit to the bottom, mask everything else off |
| Set bit `i` | `n \| (1 << i)` | OR with a single-bit mask |
| Clear bit `i` | `n & ~(1 << i)` | AND with a mask that has every bit on except `i` |
| Flip bit `i` | `n ^ (1 << i)` | XOR flips exactly the masked bit |
| Lowest set bit | `n & -n` | two's complement negation keeps only the rightmost 1 |
| Drop lowest set bit | `n & (n - 1)` | subtracting 1 borrows through the trailing zeros |
| Is a power of two | `n > 0 && (n & (n - 1)) == 0` | a power of two has exactly one bit on |

Let us count the 1 bits in `n = 13` (`1101`) using the "drop the lowest set bit" trick, which loops once per 1 bit instead of once per position:

```
n = 1101   n - 1 = 1100   n & (n - 1) = 1100   count = 1
n = 1100   n - 1 = 1011   n & (n - 1) = 1000   count = 2
n = 1000   n - 1 = 0111   n & (n - 1) = 0000   count = 3
n = 0 → stop; 13 has three 1 bits
```

And the XOR trick: in `[4, 7, 4, 2, 7]` every number but one appears twice. XOR is commutative, so `4 ^ 7 ^ 4 ^ 2 ^ 7 = (4 ^ 4) ^ (7 ^ 7) ^ 2 = 0 ^ 0 ^ 2 = 2`. The pairs vanish and the lonely value remains, with no hash set at all.

## Template

```python
def solve(n):
    """Walk the bits of n and count the 1s. Replace 'count' with the
    problem-specific work: build a result, test a condition, etc."""
    # Toolkit (i = bit position, 0 = rightmost):
    #   test  (n >> i) & 1      set  n | (1 << i)     clear  n & ~(1 << i)
    #   flip  n ^ (1 << i)      lowest set bit  n & -n   drop lowest  n & (n - 1)
    count = 0
    for i in range(32):          # 32 for a 32-bit int; 64 for a long
        bit = (n >> i) & 1
        if bit:                  # problem-specific: do something with bit i
            count += 1
    return count


if __name__ == "__main__":
    print(solve(13))         # 3 (13 = 0b1101)
    print(13 & (13 - 1))     # 12: drop the lowest set bit
    print(4 ^ 7 ^ 4 ^ 2 ^ 7)  # 2: XOR cancels the pairs
```

```java
public class BitManipulation {
    /** Walk the bits of n and count the 1s. Replace 'count' with the
     *  problem-specific work: build a result, test a condition, etc. */
    static int solve(int n) {
        // Toolkit (i = bit position, 0 = rightmost):
        //   test  (n >> i) & 1      set  n | (1 << i)     clear  n & ~(1 << i)
        //   flip  n ^ (1 << i)      lowest set bit  n & -n   drop lowest  n & (n - 1)
        // Use >>> (unsigned shift) when n may be negative and you want zeros shifted in.
        int count = 0;
        for (int i = 0; i < 32; i++) {   // 32 for an int; 64 for a long
            int bit = (n >>> i) & 1;
            if (bit == 1) {              // problem-specific: do something with bit i
                count++;
            }
        }
        return count;
    }

    public static void main(String[] args) {
        System.out.println(solve(13));           // 3 (13 = 0b1101)
        System.out.println(13 & (13 - 1));       // 12: drop the lowest set bit
        System.out.println(4 ^ 7 ^ 4 ^ 2 ^ 7);   // 2: XOR cancels the pairs
    }
}
```

```cpp
#include <cstdint>
#include <iostream>

// Walk the bits of n and count the 1s. Replace 'count' with the
// problem-specific work: build a result, test a condition, etc.
int solve(uint32_t n) {
    // Toolkit (i = bit position, 0 = rightmost):
    //   test  (n >> i) & 1      set  n | (1u << i)     clear  n & ~(1u << i)
    //   flip  n ^ (1u << i)     lowest set bit  n & -n   drop lowest  n & (n - 1)
    // Shift unsigned values: right-shifting a negative signed int is implementation-defined.
    int count = 0;
    for (int i = 0; i < 32; i++) {   // 32 for a 32-bit value; 64 for uint64_t
        uint32_t bit = (n >> i) & 1;
        if (bit) {                   // problem-specific: do something with bit i
            count++;
        }
    }
    return count;
}

int main() {
    std::cout << solve(13) << "\n";            // 3 (13 = 0b1101)
    std::cout << (13 & (13 - 1)) << "\n";      // 12: drop the lowest set bit
    std::cout << (4 ^ 7 ^ 4 ^ 2 ^ 7) << "\n";  // 2: XOR cancels the pairs
}
```

```javascript
// Walk the bits of n and count the 1s. Replace 'count' with the
// problem-specific work: build a result, test a condition, etc.
function solve(n) {
  // Toolkit (i = bit position, 0 = rightmost):
  //   test  (n >> i) & 1      set  n | (1 << i)     clear  n & ~(1 << i)
  //   flip  n ^ (1 << i)      lowest set bit  n & -n   drop lowest  n & (n - 1)
  // JavaScript bit operators work on 32-bit signed ints; use >>> for an unsigned shift.
  let count = 0;
  for (let i = 0; i < 32; i++) {
    const bit = (n >>> i) & 1;
    if (bit) { // problem-specific: do something with bit i
      count++;
    }
  }
  return count;
}

console.log(solve(13));          // 3 (13 = 0b1101)
console.log(13 & (13 - 1));      // 12: drop the lowest set bit
console.log(4 ^ 7 ^ 4 ^ 2 ^ 7);  // 2: XOR cancels the pairs
```

```go
package main

import "fmt"

// solve walks the bits of n and counts the 1s. Replace 'count' with the
// problem-specific work: build a result, test a condition, etc.
func solve(n uint32) int {
	// Toolkit (i = bit position, 0 = rightmost):
	//   test  (n >> i) & 1      set  n | (1 << i)     clear  n &^ (1 << i)   (Go's AND NOT)
	//   flip  n ^ (1 << i)      lowest set bit  n & -n   drop lowest  n & (n - 1)
	count := 0
	for i := 0; i < 32; i++ { // 32 for uint32; 64 for uint64
		bit := (n >> i) & 1
		if bit == 1 { // problem-specific: do something with bit i
			count++
		}
	}
	return count
}

func main() {
	fmt.Println(solve(13))          // 3 (13 = 0b1101)
	fmt.Println(13 & (13 - 1))      // 12: drop the lowest set bit
	fmt.Println(4 ^ 7 ^ 4 ^ 2 ^ 7)  // 2: XOR cancels the pairs
}
```

## Variations

- **XOR cancellation**: XOR everything together to find the single unpaired value, the missing index, or the two unpaired values (split the numbers by one bit where their XOR differs, then XOR each group).
- **Counting 1 bits**: loop over positions, or use `n & (n - 1)` repeatedly, or build a table where `bits[i] = bits[i >> 1] + (i & 1)`.
- **Bitmask as a set**: `mask | (1 << i)` adds item `i`, `mask >> i & 1` checks it, and `for mask in range(1 << n)` enumerates every subset. To enumerate only the sub-masks of a mask: `sub = mask; while sub: ...; sub = (sub - 1) & mask`.
- **Arithmetic with bits**: `a ^ b` is the sum without carries, `(a & b) << 1` is the carries; repeat until the carries are zero to add two numbers without `+`.
- **Bit-by-bit construction**: build a reversed number or a maximum XOR by deciding one bit at a time from the top.

## Common mistakes

- Mixing up precedence. In most languages `&`, `^` and `|` bind *looser* than `==` and `+`, so `n & 1 == 0` means `n & (1 == 0)`. Always write `(n & 1) == 0`.
- Shifting a negative number right. Java and JavaScript fill with the sign bit for `>>`; use `>>>` when you mean "shift in zeros". In C++ shift unsigned types. Python integers are unbounded, so a 32-bit mask like `& 0xFFFFFFFF` is needed to imitate overflow.
- Forgetting that `n & (n - 1) == 0` is also true for `n = 0`; add `n > 0` for a power-of-two test.
- Using `1 << i` with an `int` when the result needs 64 bits; write `1L << i` in Java, `1ULL << i` in C++, `int64(1) << i` in Go.

## Complexity

Each operator is one machine instruction, so a bit trick runs in O(1) and a loop over positions in O(32) or O(64), which counts as constant. Enumerating all subsets with a bitmask is O(2^n), the same as backtracking but with less code. Space is almost always O(1), which is why interviewers ask for these solutions after you have shown the hash-set version.

## Where to start

1. 191. Number of 1 Bits: the position loop and the `n & (n - 1)` trick side by side.
2. 136. Single Number: XOR cancels pairs; the one-line solution that everyone should be able to explain.
3. 338. Counting Bits: a DP over bits, `bits[i] = bits[i >> 1] + (i & 1)`.
4. 268. Missing Number: XOR the indices with the values and see what is left.
5. 190. Reverse Bits: pull bits off one end and push them onto the other, 32 times.
6. 78. Subsets: enumerate masks from `0` to `2^n - 1` and translate each one into a list.
7. [287. Find the Duplicate Number](/interview/problems/find-the-duplicate-number/): the bit-counting solution compares each bit's count in the array with the count in `1..n`.
8. 371. Sum of Two Integers: addition from XOR and carries, with the signed-overflow details in each language.
