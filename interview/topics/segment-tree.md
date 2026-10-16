---
title: Segment Tree
topic: Segment Tree
group: structures
description: "A segment tree answers range queries (sum, min, max) and point updates over an array in O(log n) each, by storing one combined value for every power-of-two block of the array."
---

## What it is

A segment tree is an array laid out as a binary tree where each node stores a summary (sum, minimum, maximum, gcd, ...) of one contiguous block of the original array. The leaves are the elements themselves; a parent summarises its two children; the root summarises everything. Because any range `[l, r]` can be covered by O(log n) of these blocks, a range query combines O(log n) stored values instead of scanning `r - l + 1` elements. Changing one element only touches the O(log n) nodes on the path from its leaf to the root.

Compare with the two simpler tools:

- A **prefix sum array** answers range sums in O(1) but any update costs O(n) to rebuild.
- A **plain array** updates in O(1) but a range query is O(n).
- A **segment tree** does both in O(log n), and works for operations like `min` that prefix sums cannot handle at all.

The version in this guide is the compact *iterative* (bottom-up) layout with `2n` slots: leaf `i` lives at index `n + i`, and node `k`'s children are `2k` and `2k + 1`. It is shorter than the recursive version, fast, and enough for every interview problem that merely needs point updates and range queries.

## When to use it

- The problem mixes **updates** and **range queries** on an array, with up to 10^5 of each; neither a prefix sum nor a rescan is fast enough.
- You need a range *minimum* or *maximum* that changes over time (prefix sums cannot do min/max).
- A problem is secretly "for each element, query a summary over the elements before it", such as counting smaller numbers to the left, or the best DP value among earlier positions in a value range (Longest Increasing Subsequence II). Index the tree by *value* instead of by position.
- You need to find the *first position* where a running condition holds (first index with value >= x): walk down the tree from the root.
- The statement says "range sum query, mutable", "falling squares", "skyline" or "count inversions"; these are classic segment tree or [Binary Indexed Tree](/interview/topics/binary-indexed-tree/) problems.

## How it works

Build for `nums = [2, 1, 5, 3, 4]` (`n = 5`). The tree array has 10 slots; leaves occupy indices 5 to 9:

```
index:  1   2   3   4   5   6   7   8   9
value: 15   9   6   7   2   1   5   3   4
                        ^ leaves: nums[0..4]
```

Building runs `i` from `n - 1` down to 1 and sets `tree[i] = tree[2i] + tree[2i+1]`: `tree[4] = tree[8] + tree[9] = 3 + 4 = 7`, `tree[3] = tree[6] + tree[7] = 1 + 5 = 6`, `tree[2] = tree[4] + tree[5] = 7 + 2 = 9`, and `tree[1] = tree[2] + tree[3] = 15`, the total. When `n` is not a power of two the picture is not a perfect binary tree (node 2 here covers `3, 4, 2`, a wrapped-around block), but the invariant `tree[k] = tree[2k] + tree[2k+1]` holds for every `k` in `1..n-1`, and that is all the query loop relies on.

**Query `[1, 3]`** (sum of `1, 5, 3`). Convert to the half-open leaf range `lo = 6, hi = 9`, then at each level take the boundary nodes that are fully inside and move up:

| `lo` | `hi` | action at this level                                        | `result` |
|------|------|-------------------------------------------------------------|----------|
| 6    | 9    | `lo` even, skip; `hi` odd: `hi = 8`, add `tree[8] = 3`       | 3        |
| 3    | 4    | `lo` odd: add `tree[3] = 6`, `lo = 4`; `hi` even, skip       | 9        |
| 2    | 2    | `lo == hi`, loop ends                                        | 9        |

The rule: if `lo` is a right child, its parent covers elements outside the range, so take `tree[lo]` itself and move `lo` right; symmetric for `hi`. Then move both up a level. Each level adds at most two values, giving O(log n).

**Update `nums[2] = 10`**: set `tree[7] = 10`, then recompute `tree[3] = 1 + 10 = 11`, `tree[1] = 9 + 11 = 20`. Querying `[1, 3]` now gives 14.

## Template

```python
class SegmentTree:
    """Point update + range sum over nums, both O(log n). Swap + for min/max/gcd as needed."""

    def __init__(self, nums: list[int]):
        self.n = len(nums)
        self.tree = [0] * (2 * self.n)
        for i, v in enumerate(nums):          # leaves live at n .. 2n-1
            self.tree[self.n + i] = v
        for i in range(self.n - 1, 0, -1):    # each inner node combines its two children
            self.tree[i] = self.tree[2 * i] + self.tree[2 * i + 1]

    def update(self, i: int, value: int) -> None:
        i += self.n
        self.tree[i] = value
        while i > 1:                          # walk up, recomputing every ancestor
            i //= 2
            self.tree[i] = self.tree[2 * i] + self.tree[2 * i + 1]

    def query(self, left: int, right: int) -> int:
        """Sum of nums[left..right] inclusive."""
        result = 0
        lo, hi = left + self.n, right + self.n + 1    # half-open [lo, hi) on the leaf level
        while lo < hi:
            if lo & 1:                 # lo is a right child: take it and step past it
                result += self.tree[lo]
                lo += 1
            if hi & 1:                 # hi is a right child: the node before it is fully inside
                hi -= 1
                result += self.tree[hi]
            lo //= 2
            hi //= 2
        return result


if __name__ == "__main__":
    st = SegmentTree([2, 1, 5, 3, 4])
    print(st.query(1, 3))   # 1 + 5 + 3 = 9
    st.update(2, 10)        # nums becomes [2, 1, 10, 3, 4]
    print(st.query(1, 3))   # 14
    print(st.query(0, 4))   # 20
```

```java
public class Template {
    // Point update + range sum, both O(log n). Swap + for min/max/gcd as needed.
    static class SegmentTree {
        private final int n;
        private final long[] tree;

        SegmentTree(int[] nums) {
            n = nums.length;
            tree = new long[2 * n];
            for (int i = 0; i < n; i++) tree[n + i] = nums[i];      // leaves live at n .. 2n-1
            for (int i = n - 1; i > 0; i--) tree[i] = tree[2 * i] + tree[2 * i + 1]; // inner nodes combine children
        }

        void update(int i, long value) {
            i += n;
            tree[i] = value;
            while (i > 1) {                    // walk up, recomputing every ancestor
                i /= 2;
                tree[i] = tree[2 * i] + tree[2 * i + 1];
            }
        }

        // Sum of nums[left..right] inclusive.
        long query(int left, int right) {
            long result = 0;
            int lo = left + n, hi = right + n + 1;   // half-open [lo, hi) on the leaf level
            while (lo < hi) {
                if ((lo & 1) == 1) result += tree[lo++];   // lo is a right child: take it, step past it
                if ((hi & 1) == 1) result += tree[--hi];   // node before hi is fully inside
                lo /= 2;
                hi /= 2;
            }
            return result;
        }
    }

    public static void main(String[] args) {
        SegmentTree st = new SegmentTree(new int[] {2, 1, 5, 3, 4});
        System.out.println(st.query(1, 3));   // 9
        st.update(2, 10);                     // nums becomes [2, 1, 10, 3, 4]
        System.out.println(st.query(1, 3));   // 14
        System.out.println(st.query(0, 4));   // 20
    }
}
```

```cpp
#include <iostream>
#include <vector>

// Point update + range sum, both O(log n). Swap + for min/max/gcd as needed.
class SegmentTree {
    int n;
    std::vector<long long> tree;

public:
    explicit SegmentTree(const std::vector<int>& nums) : n(nums.size()), tree(2 * nums.size()) {
        for (int i = 0; i < n; i++) tree[n + i] = nums[i];                     // leaves live at n .. 2n-1
        for (int i = n - 1; i > 0; i--) tree[i] = tree[2 * i] + tree[2 * i + 1];  // inner nodes combine children
    }

    void update(int i, long long value) {
        i += n;
        tree[i] = value;
        while (i > 1) {                       // walk up, recomputing every ancestor
            i /= 2;
            tree[i] = tree[2 * i] + tree[2 * i + 1];
        }
    }

    // Sum of nums[left..right] inclusive.
    long long query(int left, int right) const {
        long long result = 0;
        int lo = left + n, hi = right + n + 1;   // half-open [lo, hi) on the leaf level
        while (lo < hi) {
            if (lo & 1) result += tree[lo++];    // lo is a right child: take it, step past it
            if (hi & 1) result += tree[--hi];    // node before hi is fully inside
            lo /= 2;
            hi /= 2;
        }
        return result;
    }
};

int main() {
    SegmentTree st({2, 1, 5, 3, 4});
    std::cout << st.query(1, 3) << "\n";   // 9
    st.update(2, 10);                      // nums becomes {2, 1, 10, 3, 4}
    std::cout << st.query(1, 3) << "\n";   // 14
    std::cout << st.query(0, 4) << "\n";   // 20
}
```

```javascript
// Point update + range sum, both O(log n). Swap + for min/max/gcd as needed.
class SegmentTree {
  constructor(nums) {
    this.n = nums.length;
    this.tree = new Array(2 * this.n).fill(0);
    for (let i = 0; i < this.n; i++) this.tree[this.n + i] = nums[i]; // leaves live at n .. 2n-1
    for (let i = this.n - 1; i > 0; i--) {
      this.tree[i] = this.tree[2 * i] + this.tree[2 * i + 1]; // inner nodes combine children
    }
  }

  update(i, value) {
    i += this.n;
    this.tree[i] = value;
    while (i > 1) {
      // walk up, recomputing every ancestor
      i = Math.floor(i / 2);
      this.tree[i] = this.tree[2 * i] + this.tree[2 * i + 1];
    }
  }

  // Sum of nums[left..right] inclusive.
  query(left, right) {
    let result = 0;
    let lo = left + this.n;
    let hi = right + this.n + 1; // half-open [lo, hi) on the leaf level
    while (lo < hi) {
      if (lo & 1) result += this.tree[lo++]; // lo is a right child: take it, step past it
      if (hi & 1) result += this.tree[--hi]; // node before hi is fully inside
      lo = Math.floor(lo / 2);
      hi = Math.floor(hi / 2);
    }
    return result;
  }
}

const st = new SegmentTree([2, 1, 5, 3, 4]);
console.log(st.query(1, 3)); // 9
st.update(2, 10); // nums becomes [2, 1, 10, 3, 4]
console.log(st.query(1, 3)); // 14
console.log(st.query(0, 4)); // 20
```

```go
package main

import "fmt"

// SegmentTree gives point update + range sum, both O(log n). Swap + for min/max/gcd as needed.
type SegmentTree struct {
	n    int
	tree []int
}

func NewSegmentTree(nums []int) *SegmentTree {
	n := len(nums)
	st := &SegmentTree{n: n, tree: make([]int, 2*n)}
	copy(st.tree[n:], nums) // leaves live at n .. 2n-1
	for i := n - 1; i > 0; i-- {
		st.tree[i] = st.tree[2*i] + st.tree[2*i+1] // inner nodes combine children
	}
	return st
}

func (st *SegmentTree) Update(i, value int) {
	i += st.n
	st.tree[i] = value
	for i > 1 { // walk up, recomputing every ancestor
		i /= 2
		st.tree[i] = st.tree[2*i] + st.tree[2*i+1]
	}
}

// Query returns the sum of nums[left..right] inclusive.
func (st *SegmentTree) Query(left, right int) int {
	result := 0
	lo, hi := left+st.n, right+st.n+1 // half-open [lo, hi) on the leaf level
	for lo < hi {
		if lo&1 == 1 { // lo is a right child: take it, step past it
			result += st.tree[lo]
			lo++
		}
		if hi&1 == 1 { // node before hi is fully inside
			hi--
			result += st.tree[hi]
		}
		lo /= 2
		hi /= 2
	}
	return result
}

func main() {
	st := NewSegmentTree([]int{2, 1, 5, 3, 4})
	fmt.Println(st.Query(1, 3)) // 9
	st.Update(2, 10)            // nums becomes [2 1 10 3 4]
	fmt.Println(st.Query(1, 3)) // 14
	fmt.Println(st.Query(0, 4)) // 20
}
```

## Variations

- **Other operations.** Replace `+` with `min`, `max` or `gcd` and the "empty" value `0` with infinity, minus infinity or 0. The operation must be associative; it does not need to be invertible, which is the main advantage over prefix sums and Fenwick trees.
- **Indexed by value.** For "count of smaller numbers after self", compress the values to `0..m-1`, walk the array from the right, query the sum over `[0, value-1]`, then add 1 at `value`. The tree stores counts, not the array.
- **DP over a range.** Longest Increasing Subsequence II stores, at value `v`, the best chain length ending with value `v`; the transition is a range max over `[v-k, v-1]`.
- **Range update, point query.** Store differences: add `+x` at `l` and `-x` at `r+1`, then a point query is a prefix sum. Falling Squares and My Calendar III want range update *and* range query, which needs **lazy propagation**: a recursive tree where each node also stores a pending update to push to its children only when needed. Learn it after the basic tree feels natural.
- **Sparse coordinates.** When indices go up to 10^9 but there are only 10^5 queries, compress coordinates first.

## Common mistakes

- Off-by-one on the query range. The template takes an inclusive `[left, right]` and converts to half-open leaves; mixing the two conventions returns one element too few or too many.
- Setting `tree[i] = value` on update when the problem wants `+= delta`, or the reverse.
- Using `0` as the empty value for a `min` tree. Use a large sentinel.
- Overflow in sum trees: with 10^5 values up to 10^9 the root is 10^14, so use 64-bit in Java, C++ and Go.
- Forgetting coordinate compression and allocating a tree of size 10^9.
- Reaching for a segment tree when there are no updates at all and a prefix sum is enough.

## Complexity

Build is O(n). Each point update and each range query is O(log n). Memory is O(n): exactly `2n` slots in this layout, `4n` in the usual recursive layout. With lazy propagation range updates are also O(log n). For `n = 10^5` and 10^5 operations that is around 2 million steps, comfortably fast in any language.

## Where to start

1. 307. Range Sum Query - Mutable: the definition of the structure; implement the template and pass it.
2. 1395. Count Number of Teams: for each middle soldier, count smaller ratings to the left and larger to the right with a tree indexed by rating.
3. 315. Count of Smaller Numbers After Self: the classic "walk from the right, query then insert" pattern with coordinate compression.
4. 673. Number of Longest Increasing Subsequence: store a pair (length, count) per value and merge pairs; shows how the combine step can carry two numbers.
5. 2407. Longest Increasing Subsequence II: range max over a value window drives a DP.
6. 729. My Calendar I: also solvable with an ordered set, but a good first range-max-with-updates exercise.
7. 699. Falling Squares: range assign and range max, your first lazy propagation problem.
8. 218. The Skyline Problem: coordinate compression plus range max; compare with the heap sweep.
