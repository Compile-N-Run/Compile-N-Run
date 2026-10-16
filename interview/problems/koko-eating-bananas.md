---
title: Koko Eating Bananas
leetcode: koko-eating-bananas
description: "Koko Eating Bananas explained: find the slowest eating speed that still finishes every pile within h hours by binary searching on the answer, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

Koko has `n` piles of bananas; pile `i` holds `piles[i]` bananas. She picks a fixed eating speed `k` (bananas per hour). Each hour she chooses one pile and eats `k` bananas from it. If that pile has fewer than `k` left, she finishes it and waits for the rest of the hour without starting another pile.

Given `piles` and a number of hours `h`, return the smallest whole-number speed `k` that lets her finish every pile within `h` hours.

Guarantees: there is at least one pile, every pile has at least one banana, and `h` is at least the number of piles (so eating a whole pile per hour always works). Piles and `h` can be as large as about a billion.

## Examples

- `piles = [5, 9, 2]`, `h = 6` → `3`. At speed 3 the piles take 2 + 3 + 1 = 6 hours, which fits. At speed 2 they would take 3 + 5 + 1 = 9 hours.
- `piles = [10, 10]`, `h = 2` → `10`. With one hour per pile she must eat each pile in one go.
- `piles = [7]`, `h = 7` → `1`. One banana per hour is just enough.
- `piles = [4, 1, 8]`, `h = 5` → `4`: hours at speed 4 are 1 + 1 + 2 = 4, at speed 3 they are 2 + 1 + 3 = 6.

## Key idea

Two facts make this a binary search. First, for a given speed `k` it is easy to compute the hours needed: pile `p` takes `ceil(p / k)` hours, and we add those up. Second, the hours needed only go down (or stay the same) as `k` grows. So the speeds split into "too slow" on the left and "fast enough" on the right, and we want the first fast-enough speed. Instead of trying every speed, binary search over the range of possible speeds.

## Approach

1. The answer lies between `1` and `max(piles)`: a speed above the largest pile never helps, because every pile already takes one hour at that speed.
2. Set `lo = 1`, `hi = max(piles)`.
3. While `lo < hi`:
   1. Let `mid = lo + (hi - lo) / 2`.
   2. Compute `hours = sum(ceil(p / mid))` over all piles, using `(p + mid - 1) / mid` in integer arithmetic.
   3. If `hours <= h`, speed `mid` works, so the answer is `mid` or smaller: set `hi = mid`.
   4. Otherwise `mid` is too slow: set `lo = mid + 1`.
4. When `lo == hi`, that speed is the smallest one that works. Return it.

The brute force tries `k = 1, 2, 3, ...` until one works. That can take up to `max(piles)` tries (a billion), each costing O(n), which is far too slow.

## Complexity

- **Time:** O(n log m), where `m = max(piles)`. The search halves the range each step (about 30 steps for a billion) and each step scans all `n` piles.
- **Space:** O(1). Only a few counters are used.

## Common mistakes

- Integer overflow when adding up hours. With `k = 1` the total can reach roughly 10⁴ × 10⁹, which does not fit in a 32-bit int. Use a 64-bit counter (`long` in Java, `long long` in C++), or stop counting as soon as the total exceeds `h`.
- Using `p / k` instead of the ceiling: a pile of 5 at speed 2 takes 3 hours, not 2.
- Using floating-point division and rounding up; the integer form `(p + k - 1) / k` is exact and works the same in every language.
- Off-by-one in the search: when `mid` works, keep it (`hi = mid`), do not jump to `mid - 1`.

## Follow-up questions

- The same "binary search on the answer" pattern solves Capacity To Ship Packages Within D Days and Split Array Largest Sum. How do you recognise it? The question asks for the smallest (or largest) value that satisfies a check, and the check is monotonic.

## Related problems

- Capacity To Ship Packages Within D Days
- Minimum Number of Days to Make m Bouquets

## Solutions

```python
class Solution:
    def minEatingSpeed(self, piles: List[int], h: int) -> int:
        lo, hi = 1, max(piles)
        while lo < hi:
            mid = (lo + hi) // 2
            hours = sum((p + mid - 1) // mid for p in piles)
            if hours <= h:
                hi = mid  # mid is fast enough; try slower
            else:
                lo = mid + 1  # too slow
        return lo
```

```java
class Solution {
    public int minEatingSpeed(int[] piles, int h) {
        int lo = 1, hi = 0;
        for (int p : piles) hi = Math.max(hi, p);
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            long hours = 0; // can exceed the int range when mid is small
            for (int p : piles) hours += (p + (long) mid - 1) / mid;
            if (hours <= h) {
                hi = mid; // mid is fast enough; try slower
            } else {
                lo = mid + 1; // too slow
            }
        }
        return lo;
    }
}
```

```cpp
class Solution {
public:
    int minEatingSpeed(vector<int>& piles, int h) {
        int lo = 1, hi = *max_element(piles.begin(), piles.end());
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            long long hours = 0;  // can exceed the int range when mid is small
            for (int p : piles) hours += (p + (long long)mid - 1) / mid;
            if (hours <= h) {
                hi = mid;  // mid is fast enough; try slower
            } else {
                lo = mid + 1;  // too slow
            }
        }
        return lo;
    }
};
```

```javascript
/**
 * @param {number[]} piles
 * @param {number} h
 * @return {number}
 */
var minEatingSpeed = function (piles, h) {
  let lo = 1, hi = Math.max(...piles);
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    let hours = 0;
    for (const p of piles) hours += Math.floor((p + mid - 1) / mid);
    if (hours <= h) {
      hi = mid; // mid is fast enough; try slower
    } else {
      lo = mid + 1; // too slow
    }
  }
  return lo;
};
```

```go
func minEatingSpeed(piles []int, h int) int {
	lo, hi := 1, 0
	for _, p := range piles {
		if p > hi {
			hi = p
		}
	}
	for lo < hi {
		mid := lo + (hi-lo)/2
		hours := 0 // Go's int is 64-bit on LeetCode, so no overflow here
		for _, p := range piles {
			hours += (p + mid - 1) / mid
		}
		if hours <= h {
			hi = mid // mid is fast enough; try slower
		} else {
			lo = mid + 1 // too slow
		}
	}
	return lo
}
```
