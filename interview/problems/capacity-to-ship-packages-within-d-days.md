---
title: Capacity To Ship Packages Within D Days
leetcode: capacity-to-ship-packages-within-d-days
description: "Capacity To Ship Packages Within D Days explained: find the smallest ship capacity that moves packages in order within the deadline by binary searching on the answer, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

A conveyor belt delivers packages to a ship one at a time, in the order given by the array `weights` (each weight between 1 and 500, up to 50,000 packages). Every day the ship is loaded with the next packages from the belt, in order, as long as their total weight does not exceed the ship's capacity; then it sails. Packages cannot be reordered or split.

Given the number of days `days` (at least 1 and at most the number of packages), return the smallest integer capacity that lets all packages be shipped within `days` days.

## Examples

- `weights = [3, 2, 2, 4, 1, 4]`, `days = 3` → `6`. With capacity 6 the days carry `[3, 2]`, `[2, 4]` and `[1, 4]`. With capacity 5 the split would be `[3, 2]`, `[2]`, `[4, 1]`, `[4]`, which needs four days.
- `weights = [7, 3, 5]`, `days = 1` → `15`. One day must carry everything, so the capacity is the total weight.
- `weights = [7, 3, 5]`, `days = 3` → `7`. One package per day, so the heaviest package sets the capacity.
- `weights = [10, 1, 1, 1, 1, 10]`, `days = 2` → `12`. Split as `[10, 1, 1]` and `[1, 1, 10]`.

## Key idea

Checking whether a given capacity works is easy: simulate the loading greedily and count the days. And the check is **monotonic**: if capacity `c` is enough, every larger capacity is enough too. Whenever a yes/no question flips from "no" to "yes" exactly once as the parameter grows, you can **binary search on the answer** instead of trying every value. The answer lies between the heaviest single package (anything smaller cannot ship that package at all) and the sum of all weights (which ships everything in one day).

## Approach

1. Set `lo = max(weights)` and `hi = sum(weights)`. The answer is in `[lo, hi]`.
2. Write a helper `daysNeeded(capacity)`: start with one day and an empty load; for each weight, if adding it would exceed the capacity, start a new day; then add the weight to the current day's load. Return the day count.
3. While `lo < hi`:
   1. Let `mid = lo + (hi - lo) / 2`.
   2. If `daysNeeded(mid) <= days`, then `mid` works and maybe something smaller does too: set `hi = mid`.
   3. Otherwise `mid` is too small: set `lo = mid + 1`.
4. When the loop ends, `lo == hi` is the smallest capacity that works. Return it.

The greedy simulation in step 2 is optimal for a fixed capacity: putting a package on the current day whenever it fits can never increase the number of days compared with starting a new day early.

Trying every capacity from `max` to `sum` and simulating each takes O(n · sum), far too slow; binary search cuts the number of simulations to about `log2(sum)`, around 25 for the largest inputs.

## Complexity

- **Time:** O(n log S), where `S` is the total weight: each of the O(log S) binary-search steps simulates the loading in O(n).
- **Space:** O(1): the simulation only keeps a day counter and the current load.

## Common mistakes

- Starting the search at `lo = 1` or `lo = 0`. A capacity below the heaviest package can never ship that package, and the simulation would silently put it on a day anyway, producing a wrong (too small) answer.
- Counting days as `ceil(sum / capacity)`. Packages are loaded in order and cannot be split, so the greedy simulation is required.
- Off-by-one in the binary search: using `hi = mid - 1` when `mid` works skips the answer, and `lo = mid` without the `+1` can loop forever.
- Returning `mid` from inside the loop at the first capacity that works, which is a valid capacity but not necessarily the smallest.

## Follow-up questions

- What if the packages could be shipped in any order? (Then it becomes a bin-packing question, which is NP-hard in general; the ordered version is what makes binary search work.)
- Can you solve "split an array into `k` contiguous parts and minimise the largest part sum"? (It is the same problem with different names: Split Array Largest Sum.)
- How would you print which packages go on each day for the chosen capacity? (Run the simulation once more with the final capacity and record the splits.)

## Related problems

- [Koko Eating Bananas](/interview/problems/koko-eating-bananas/)
- [Find First and Last Position of Element in Sorted Array](/interview/problems/find-first-and-last-position-of-element-in-sorted-array/)
- Split Array Largest Sum
- Minimum Number of Days to Make m Bouquets

## Solutions

```python
class Solution:
    def shipWithinDays(self, weights: List[int], days: int) -> int:
        def days_needed(capacity: int) -> int:
            count, load = 1, 0
            for w in weights:
                if load + w > capacity:  # this package starts a new day
                    count += 1
                    load = 0
                load += w
            return count

        lo, hi = max(weights), sum(weights)
        while lo < hi:
            mid = (lo + hi) // 2
            if days_needed(mid) <= days:
                hi = mid  # mid works; try smaller
            else:
                lo = mid + 1
        return lo
```

```java
class Solution {
    public int shipWithinDays(int[] weights, int days) {
        int lo = 0, hi = 0;
        for (int w : weights) {
            lo = Math.max(lo, w);
            hi += w;
        }
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (daysNeeded(weights, mid) <= days) {
                hi = mid; // mid works; try smaller
            } else {
                lo = mid + 1;
            }
        }
        return lo;
    }

    private int daysNeeded(int[] weights, int capacity) {
        int count = 1, load = 0;
        for (int w : weights) {
            if (load + w > capacity) { // this package starts a new day
                count++;
                load = 0;
            }
            load += w;
        }
        return count;
    }
}
```

```cpp
class Solution {
public:
    int shipWithinDays(vector<int>& weights, int days) {
        int lo = *max_element(weights.begin(), weights.end());
        int hi = accumulate(weights.begin(), weights.end(), 0);
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (daysNeeded(weights, mid) <= days) {
                hi = mid;  // mid works; try smaller
            } else {
                lo = mid + 1;
            }
        }
        return lo;
    }

private:
    int daysNeeded(const vector<int>& weights, int capacity) {
        int count = 1, load = 0;
        for (int w : weights) {
            if (load + w > capacity) {  // this package starts a new day
                count++;
                load = 0;
            }
            load += w;
        }
        return count;
    }
};
```

```javascript
/**
 * @param {number[]} weights
 * @param {number} days
 * @return {number}
 */
var shipWithinDays = function (weights, days) {
  const daysNeeded = (capacity) => {
    let count = 1;
    let load = 0;
    for (const w of weights) {
      if (load + w > capacity) {
        // this package starts a new day
        count++;
        load = 0;
      }
      load += w;
    }
    return count;
  };

  let lo = 0;
  let hi = 0;
  for (const w of weights) {
    lo = Math.max(lo, w);
    hi += w;
  }
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (daysNeeded(mid) <= days) {
      hi = mid; // mid works; try smaller
    } else {
      lo = mid + 1;
    }
  }
  return lo;
};
```

```go
func shipWithinDays(weights []int, days int) int {
	daysNeeded := func(capacity int) int {
		count, load := 1, 0
		for _, w := range weights {
			if load+w > capacity { // this package starts a new day
				count++
				load = 0
			}
			load += w
		}
		return count
	}

	lo, hi := 0, 0
	for _, w := range weights {
		lo = max(lo, w)
		hi += w
	}
	for lo < hi {
		mid := lo + (hi-lo)/2
		if daysNeeded(mid) <= days {
			hi = mid // mid works; try smaller
		} else {
			lo = mid + 1
		}
	}
	return lo
}
```
