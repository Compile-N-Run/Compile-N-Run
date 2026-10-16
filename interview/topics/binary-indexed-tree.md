---
title: Binary Indexed Tree
topic: Binary Indexed Tree
group: structures
description: "A Binary Indexed Tree (Fenwick tree) keeps prefix sums under point updates in O(log n) each with a few lines of bit tricks; the standard tool for counting inversions and 'how many smaller before me' questions."
---

## What it is

A Binary Indexed Tree, usually called a Fenwick tree, is an array trick that gives you two operations on a hidden array `nums`, each in O(log n):

- `add(i, delta)`: `nums[i] += delta`
- `prefix(i)`: the sum `nums[0] + ... + nums[i]`

Range sums follow as `prefix(r) - prefix(l - 1)`. A prefix sum array does queries in O(1) but updates in O(n); a plain array is the reverse. The Fenwick tree sits in between, and its whole implementation is two short loops.

The idea: store the tree 1-indexed, and let slot `i` hold the sum of a block of positions ending at `i` whose length is the lowest set bit of `i` (written `i & -i`). Slot 8 (binary `1000`) covers eight positions, `1..8`; slot 6 (`110`) covers two, `5..6`; slot 7 (`111`) covers one, just `7`. Any prefix `1..i` splits into O(log n) such blocks, found by repeatedly stripping the lowest set bit from `i`. An update at `i` touches the O(log n) slots whose block contains `i`, found by repeatedly *adding* the lowest set bit.

A Fenwick tree can do a subset of what a [Segment Tree](/interview/topics/segment-tree/) does: it needs an operation with an inverse (sum, xor, counting), so it cannot answer range minimum. In exchange it is shorter, faster, and uses `n + 1` slots. When a sum is what you need, reach for this first.

## When to use it

- Point updates mixed with prefix or range sum queries, up to 10^5 or so of each (Range Sum Query - Mutable).
- "For each element, how many earlier elements are smaller / larger?" Walk the array, query the count of values below the current one, then add the current value. This counts inversions, solves Count of Smaller Numbers After Self and Reverse Pairs, and is the engine behind Count Number of Teams and Create Sorted Array through Instructions.
- Counting pairs or triples with an ordering condition across two or three sequences (Count Good Triplets in an Array).
- Any time you need a running frequency table that supports "how many values at most x" after each insertion. Index the tree by value, after compressing the values to `1..m`.
- You want order statistics (the k-th smallest among inserted values): binary search over the tree in O(log n) by descending through powers of two.

## How it works

Build the tree for `nums = [2, 1, 5, 3, 4]` by calling `add` for each element. Afterwards the 1-indexed slots hold:

| slot `i` | binary | lowest bit | covers positions (1-based) | value |
|----------|--------|------------|----------------------------|-------|
| 1        | 001    | 1          | 1                          | 2     |
| 2        | 010    | 2          | 1..2                       | 3     |
| 3        | 011    | 1          | 3                          | 5     |
| 4        | 100    | 4          | 1..4                       | 11    |
| 5        | 101    | 1          | 5                          | 4     |

**`prefix(3)`** asks for `nums[0..3]`, which is 1-based position 4. Start at `i = 4`: add `tree[4] = 11`, then strip the lowest bit: `4 - 4 = 0`, stop. One slot, answer 11. **`prefix(0)`** is position 1: `tree[1] = 2`. So `range_sum(1, 3) = 11 - 2 = 9`, matching `1 + 5 + 3`.

**`add(2, 5)`** changes `nums[2]` from 5 to 10. That is 1-based position 3. Visit `i = 3` (`tree[3]` becomes 10), then `i = 3 + 1 = 4` (`tree[4]` becomes 16), then `i = 4 + 4 = 8`, which is past `n = 5`, stop. Both slots whose block contains position 3 were updated, and nothing else.

**`prefix(4)`** is position 5: add `tree[5] = 4`, then `i = 5 - 1 = 4`: add `tree[4] = 16`, then `4 - 4 = 0`. Total 20, the sum of the updated array `[2, 1, 10, 3, 4]`.

The two loops are mirror images: a query moves *down* by removing the lowest set bit (`i -= i & -i`), an update moves *up* by adding it (`i += i & -i`). Why `i & -i` gives the lowest set bit: in two's complement, `-i` flips every bit of `i` and adds one, which leaves exactly the lowest set bit in common.

## Template

```python
class FenwickTree:
    """Prefix sums with point updates, both O(log n). Indices are 0-based outside, 1-based inside."""

    def __init__(self, size: int):
        self.n = size
        self.tree = [0] * (size + 1)     # tree[i] covers the last (i & -i) positions ending at i

    def add(self, i: int, delta: int) -> None:
        """nums[i] += delta."""
        i += 1
        while i <= self.n:
            self.tree[i] += delta
            i += i & -i                   # jump to the next node whose range contains i

    def prefix(self, i: int) -> int:
        """Sum of nums[0..i] inclusive; -1 gives 0."""
        i += 1
        total = 0
        while i > 0:
            total += self.tree[i]
            i -= i & -i                   # strip the lowest set bit: the previous block
        return total

    def range_sum(self, left: int, right: int) -> int:
        return self.prefix(right) - self.prefix(left - 1)


if __name__ == "__main__":
    nums = [2, 1, 5, 3, 4]
    bit = FenwickTree(len(nums))
    for i, v in enumerate(nums):
        bit.add(i, v)
    print(bit.range_sum(1, 3))   # 1 + 5 + 3 = 9
    bit.add(2, 5)                # nums[2] goes from 5 to 10
    print(bit.range_sum(1, 3))   # 14
    print(bit.prefix(4))         # 20
```

```java
public class Template {
    // Prefix sums with point updates, both O(log n). Indices are 0-based outside, 1-based inside.
    static class FenwickTree {
        private final int n;
        private final long[] tree;      // tree[i] covers the last (i & -i) positions ending at i

        FenwickTree(int size) {
            n = size;
            tree = new long[size + 1];
        }

        // nums[i] += delta
        void add(int i, long delta) {
            for (i++; i <= n; i += i & -i) {   // jump to the next node whose range contains i
                tree[i] += delta;
            }
        }

        // Sum of nums[0..i] inclusive; -1 gives 0.
        long prefix(int i) {
            long total = 0;
            for (i++; i > 0; i -= i & -i) {    // strip the lowest set bit: the previous block
                total += tree[i];
            }
            return total;
        }

        long rangeSum(int left, int right) {
            return prefix(right) - prefix(left - 1);
        }
    }

    public static void main(String[] args) {
        int[] nums = {2, 1, 5, 3, 4};
        FenwickTree bit = new FenwickTree(nums.length);
        for (int i = 0; i < nums.length; i++) bit.add(i, nums[i]);
        System.out.println(bit.rangeSum(1, 3));   // 9
        bit.add(2, 5);                            // nums[2] goes from 5 to 10
        System.out.println(bit.rangeSum(1, 3));   // 14
        System.out.println(bit.prefix(4));        // 20
    }
}
```

```cpp
#include <iostream>
#include <vector>

// Prefix sums with point updates, both O(log n). Indices are 0-based outside, 1-based inside.
class FenwickTree {
    int n;
    std::vector<long long> tree;   // tree[i] covers the last (i & -i) positions ending at i

public:
    explicit FenwickTree(int size) : n(size), tree(size + 1, 0) {}

    // nums[i] += delta
    void add(int i, long long delta) {
        for (i++; i <= n; i += i & -i) {   // jump to the next node whose range contains i
            tree[i] += delta;
        }
    }

    // Sum of nums[0..i] inclusive; -1 gives 0.
    long long prefix(int i) const {
        long long total = 0;
        for (i++; i > 0; i -= i & -i) {    // strip the lowest set bit: the previous block
            total += tree[i];
        }
        return total;
    }

    long long rangeSum(int left, int right) const {
        return prefix(right) - prefix(left - 1);
    }
};

int main() {
    std::vector<int> nums = {2, 1, 5, 3, 4};
    FenwickTree bit(nums.size());
    for (int i = 0; i < (int)nums.size(); i++) bit.add(i, nums[i]);
    std::cout << bit.rangeSum(1, 3) << "\n";   // 9
    bit.add(2, 5);                             // nums[2] goes from 5 to 10
    std::cout << bit.rangeSum(1, 3) << "\n";   // 14
    std::cout << bit.prefix(4) << "\n";        // 20
}
```

```javascript
// Prefix sums with point updates, both O(log n). Indices are 0-based outside, 1-based inside.
class FenwickTree {
  constructor(size) {
    this.n = size;
    this.tree = new Array(size + 1).fill(0); // tree[i] covers the last (i & -i) positions ending at i
  }

  // nums[i] += delta
  add(i, delta) {
    for (i++; i <= this.n; i += i & -i) {
      // jump to the next node whose range contains i
      this.tree[i] += delta;
    }
  }

  // Sum of nums[0..i] inclusive; -1 gives 0.
  prefix(i) {
    let total = 0;
    for (i++; i > 0; i -= i & -i) {
      // strip the lowest set bit: the previous block
      total += this.tree[i];
    }
    return total;
  }

  rangeSum(left, right) {
    return this.prefix(right) - this.prefix(left - 1);
  }
}

const nums = [2, 1, 5, 3, 4];
const bit = new FenwickTree(nums.length);
nums.forEach((v, i) => bit.add(i, v));
console.log(bit.rangeSum(1, 3)); // 9
bit.add(2, 5); // nums[2] goes from 5 to 10
console.log(bit.rangeSum(1, 3)); // 14
console.log(bit.prefix(4)); // 20
```

```go
package main

import "fmt"

// FenwickTree gives prefix sums with point updates, both O(log n).
// Indices are 0-based outside, 1-based inside.
type FenwickTree struct {
	n    int
	tree []int // tree[i] covers the last (i & -i) positions ending at i
}

func NewFenwickTree(size int) *FenwickTree {
	return &FenwickTree{n: size, tree: make([]int, size+1)}
}

// Add does nums[i] += delta.
func (f *FenwickTree) Add(i, delta int) {
	for i++; i <= f.n; i += i & -i { // jump to the next node whose range contains i
		f.tree[i] += delta
	}
}

// Prefix returns the sum of nums[0..i] inclusive; -1 gives 0.
func (f *FenwickTree) Prefix(i int) int {
	total := 0
	for i++; i > 0; i -= i & -i { // strip the lowest set bit: the previous block
		total += f.tree[i]
	}
	return total
}

func (f *FenwickTree) RangeSum(left, right int) int {
	return f.Prefix(right) - f.Prefix(left-1)
}

func main() {
	nums := []int{2, 1, 5, 3, 4}
	bit := NewFenwickTree(len(nums))
	for i, v := range nums {
		bit.Add(i, v)
	}
	fmt.Println(bit.RangeSum(1, 3)) // 9
	bit.Add(2, 5)                   // nums[2] goes from 5 to 10
	fmt.Println(bit.RangeSum(1, 3)) // 14
	fmt.Println(bit.Prefix(4))      // 20
}
```

## Variations

- **Counting by value.** Compress the distinct values to `1..m` (sort, then binary search or a map), build a tree of size `m`, and `add(value, 1)` as you insert. `prefix(value - 1)` is "how many inserted values are smaller". This is the pattern for Count of Smaller Numbers After Self, Reverse Pairs (query `2 * x` after compressing both `x` and `2x`), and Count of Range Sum (over prefix sums).
- **Point query, range update.** Store differences: `add(l, x)` and `add(r + 1, -x)`; `prefix(i)` returns the current value at `i`. Useful for "add x to every element in a range" problems that only read single cells.
- **2D Fenwick tree.** Nest the loops over rows and columns for Range Sum Query 2D - Mutable: O(log n log m) per operation.
- **Order statistic (k-th smallest).** With counts in the tree, walk down from the highest power of two at most `n`, moving right whenever the block's count is less than `k`. Finds the k-th element in O(log n) without a sorted container.

## Common mistakes

- Starting the loop at index 0. `0 & -0` is 0, so `i += i & -i` never moves and the loop runs forever. Everything inside the tree is 1-based; convert once at the boundary.
- Sizing the tree as `n` instead of `n + 1`, so the last position is lost.
- Querying before inserting in the "count smaller before me" pattern, or the other way around, which counts an element against itself.
- Forgetting coordinate compression when values go to 10^9, or leaving the query values out of the compressed set (Reverse Pairs needs `2 * x` in it too).
- Overflowing 32-bit sums; use 64-bit.
- Trying to use it for range minimum. Subtraction does not undo `min`; use a segment tree.

## Complexity

`add` and `prefix` are O(log n) each; building from `n` values by repeated `add` is O(n log n). Memory is O(n). Each operation is a tight loop over a plain array, so a Fenwick tree is often two to three times faster than a segment tree on the same task.

## Where to start

1. 307. Range Sum Query - Mutable: implement `add` and `prefix` and get the 1-based indexing right.
2. 1395. Count Number of Teams: tree indexed by rating; count smaller-to-the-left and larger-to-the-right for each middle element.
3. 315. Count of Smaller Numbers After Self: coordinate compression plus the query-then-insert walk from the right.
4. 493. Reverse Pairs: same walk, but the query is for values greater than `2 * nums[i]`; compress both sets.
5. 327. Count of Range Sum: the walk over prefix sums, with two queries per element for the lower and upper bound.
6. 1649. Create Sorted Array through Instructions: counts smaller and larger as you insert; the answer is a modular sum.
7. 2179. Count Good Triplets in an Array: map positions between two permutations and count with a tree twice.
8. 406. Queue Reconstruction by Height: find the k-th free slot with a Fenwick tree instead of inserting into a list.
