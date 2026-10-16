---
title: Random Pick with Weight
leetcode: random-pick-with-weight
description: "Random Pick with Weight explained: pick an index with probability proportional to its weight using prefix sums and binary search over a random number, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

Design a class that is built from an array of positive integers `w`, where `w[i]` is the *weight* of index `i`. It has one method, `pickIndex()`, which returns a random index between `0` and `len(w) - 1`. Index `i` must be returned with probability `w[i] / sum(w)`: an index with twice the weight comes up twice as often.

The class is `Solution(w)` in Python, Java, C++ and JavaScript; in Go it is `Constructor(w []int)` with the method `PickIndex()`. Every weight is at least 1 (so every index has a real chance), the array has at most ten thousand weights, each at most one hundred thousand, so the total fits in a 32-bit integer. `pickIndex` may be called many times on the same object.

## Examples

- `w = [2, 5, 3]`: the total is 10, so `pickIndex()` returns `0` about 20% of the time, `1` about 50% and `2` about 30%. A run of five calls might give `1, 2, 1, 0, 1`.
- `w = [7]` → `pickIndex()` always returns `0`.
- `w = [1, 1, 1, 1]` → each of `0`, `1`, `2`, `3` with probability 1/4.
- `w = [1, 99]` → `0` only about once in a hundred calls.

## Key idea

Lay the weights end to end on a number line: index 0 owns the first `w[0]` slots, index 1 the next `w[1]` slots, and so on. For `w = [2, 5, 3]` that is slots 1-2 for index 0, slots 3-7 for index 1 and slots 8-10 for index 2. Now pick one slot uniformly at random between 1 and the total: each index is hit with probability equal to its share of the line. The running totals (prefix sums) `[2, 7, 10]` mark where each index's stretch ends, so the chosen index is the **first prefix sum that is at least the random slot**. The prefix sums are sorted (weights are positive), so binary search finds it in O(log n).

## Approach

1. In the constructor, build `prefix` where `prefix[i] = w[0] + ... + w[i]`. The last entry is the total.
2. In `pickIndex()`:
   1. Draw a random integer `target` uniformly from `1` to `total`, inclusive.
   2. Binary search for the smallest `i` with `prefix[i] >= target`: keep `lo = 0`, `hi = n - 1`; while `lo < hi`, look at `mid`; if `prefix[mid] < target` the answer is to the right (`lo = mid + 1`), otherwise it is `mid` or to its left (`hi = mid`).
   3. Return `lo`.

A brute-force idea is to fill an array with `w[i]` copies of each index and pick a random element. That is correct but can need a billion entries. Scanning the prefix sums linearly instead of binary searching also works, but costs O(n) per pick.

## Complexity

- **Time:** O(n) for the constructor (one pass to build the prefix sums) and O(log n) per `pickIndex` call (binary search).
- **Space:** O(n) for the prefix sums.

## Common mistakes

- Off-by-one in the random range. If you draw from `1..total`, search for the first `prefix[i] >= target`; if you draw from `0..total-1`, search for the first `prefix[i] > target`. Mixing the two gives index 0 one slot too few or too many and can even return an out-of-range index.
- Drawing a random *real* number and comparing it with integer prefix sums without care for the boundaries.
- Rebuilding the prefix sums inside `pickIndex`, which makes every call O(n).
- Using `rand() % total` in C++: on some platforms `RAND_MAX` is only 32767, far smaller than the total. Use a proper generator such as `mt19937`.

## Follow-up questions

- What if weights change between picks? Keep the prefix sums in a Fenwick tree (binary indexed tree) so both updates and searches take O(log n).
- Can picks be O(1)? Yes, with the alias method, which preprocesses the weights into a table in O(n) and then needs one random index and one coin flip per pick.

## Related problems

- [Insert Delete GetRandom O(1)](/interview/problems/insert-delete-getrandom-o1/) (uniform random picks from a changing set)
- Random Pick Index
- Random Point in Non-overlapping Rectangles (the same prefix-sum trick with areas as weights)

## Solutions

```python
import random


class Solution:
    def __init__(self, w: List[int]):
        self.prefix = list(itertools.accumulate(w))  # prefix[i] = w[0] + ... + w[i]

    def pickIndex(self) -> int:
        target = random.randint(1, self.prefix[-1])  # a random slot, 1..total
        # first index whose running total reaches target
        return bisect.bisect_left(self.prefix, target)
```

```java
class Solution {
    private final int[] prefix; // prefix[i] = w[0] + ... + w[i]
    private final Random random = new Random();

    public Solution(int[] w) {
        prefix = new int[w.length];
        int total = 0;
        for (int i = 0; i < w.length; i++) {
            total += w[i];
            prefix[i] = total;
        }
    }

    public int pickIndex() {
        int target = random.nextInt(prefix[prefix.length - 1]) + 1; // a random slot, 1..total
        int lo = 0, hi = prefix.length - 1;
        while (lo < hi) { // first index whose running total reaches target
            int mid = (lo + hi) / 2;
            if (prefix[mid] < target) lo = mid + 1;
            else hi = mid;
        }
        return lo;
    }
}
```

```cpp
class Solution {
    vector<int> prefix;  // prefix[i] = w[0] + ... + w[i]
    mt19937 gen{random_device{}()};

public:
    Solution(vector<int>& w) {
        int total = 0;
        for (int x : w) {
            total += x;
            prefix.push_back(total);
        }
    }

    int pickIndex() {
        uniform_int_distribution<int> slot(1, prefix.back());
        int target = slot(gen);  // a random slot, 1..total
        int lo = 0, hi = prefix.size() - 1;
        while (lo < hi) {  // first index whose running total reaches target
            int mid = (lo + hi) / 2;
            if (prefix[mid] < target) lo = mid + 1;
            else hi = mid;
        }
        return lo;
    }
};
```

```javascript
/**
 * @param {number[]} w
 */
var Solution = function (w) {
  this.prefix = []; // prefix[i] = w[0] + ... + w[i]
  let total = 0;
  for (const x of w) {
    total += x;
    this.prefix.push(total);
  }
};

/**
 * @return {number}
 */
Solution.prototype.pickIndex = function () {
  const prefix = this.prefix;
  const target = Math.floor(Math.random() * prefix[prefix.length - 1]) + 1; // a random slot, 1..total
  let lo = 0, hi = prefix.length - 1;
  while (lo < hi) { // first index whose running total reaches target
    const mid = (lo + hi) >> 1;
    if (prefix[mid] < target) lo = mid + 1;
    else hi = mid;
  }
  return lo;
};
```

```go
import "math/rand"

type Solution struct {
	prefix []int // prefix[i] = w[0] + ... + w[i]
}

func Constructor(w []int) Solution {
	prefix := make([]int, len(w))
	total := 0
	for i, x := range w {
		total += x
		prefix[i] = total
	}
	return Solution{prefix: prefix}
}

func (this *Solution) PickIndex() int {
	target := rand.Intn(this.prefix[len(this.prefix)-1]) + 1 // a random slot, 1..total
	lo, hi := 0, len(this.prefix)-1
	for lo < hi { // first index whose running total reaches target
		mid := (lo + hi) / 2
		if this.prefix[mid] < target {
			lo = mid + 1
		} else {
			hi = mid
		}
	}
	return lo
}
```
