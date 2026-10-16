---
title: Divide and Conquer
topic: Divide and Conquer
group: patterns
description: "Divide and conquer explained: split the input into independent halves, solve each half recursively, and combine the two answers, the pattern behind merge sort, quickselect and many tree-building problems."
---

## What it is

Divide and conquer solves a big problem by cutting it into smaller copies of the *same* problem, solving those (usually with the same function calling itself), and then stitching the small answers into the big one. The three steps are literally the name: **divide**, **conquer** (recurse), **combine**.

Merge sort is the textbook example. To sort a list, split it in the middle, sort each half, then merge two sorted halves by repeatedly taking the smaller front element. A list of one item is already sorted, so the recursion bottoms out there. Nobody "sorts" in the usual sense; all the real work happens in the merge step.

What makes this different from [dynamic programming](/interview/topics/dynamic-programming/) is that the pieces do not overlap. The left half and the right half share nothing, so there is no table of remembered results; you solve each piece once and throw it away after combining. What makes it different from a plain loop is the depth: halving `n` items again and again gives only about log2(n) levels, and that logarithm is where the speed comes from.

## When to use it

- The input can be **split into independent parts** (left and right halves of an array, left and right subtrees, two ranges of a sorted array) and the answer for the whole can be **built from the answers for the parts**.
- The problem is a **sort, selection or counting-pairs question** where comparing across the split is cheaper than comparing everything with everything: merge sort, quickselect for the k-th largest, counting inversions.
- You are asked to **build a tree from traversals** or from a sorted array: the root splits the input into a left part and a right part, and each part is the same problem.
- A **linear scan is O(n) but you can discard half the input** at every step by looking at one element in the middle. Binary search is divide and conquer where one of the two halves is dropped.
- Interview hints like "can you do better than O(n^2)?" on a problem about pairs or subarrays, and "O(log n)" on a problem about sorted data.

## How it works

Write the function around a range `[lo, hi]` so that no copying is needed when you split.

1. **Base case.** If the range is tiny (empty or one element), answer it directly and return.
2. **Divide.** Pick a split point, almost always the middle `mid = lo + (hi - lo) / 2`.
3. **Conquer.** Call the same function on `[lo, mid]` and on `[mid + 1, hi]`. Trust it: assume each call returns the correct answer for its half. (This is the leap of faith that makes recursion easy to write; prove it by checking the base case and the combine step only.)
4. **Combine.** Build the answer for `[lo, hi]` from the two half-answers. This is the only step that is specific to the problem, and it is usually linear in the range size.

Trace merge sort on `[5, 2, 4, 1]`:

```
sort [5, 2, 4, 1]
  divide → sort [5, 2] and sort [4, 1]
    sort [5, 2] → sort [5], sort [2] → merge → [2, 5]
    sort [4, 1] → sort [4], sort [1] → merge → [1, 4]
  combine: merge [2, 5] with [1, 4]
    take 1 (1 < 2), take 2, take 4 (4 < 5), take 5 → [1, 2, 4, 5]
```

Two levels of splitting, and at each level the merges touch every element once. That is O(n) work per level times O(log n) levels, O(n log n) in total.

The same shape solves Maximum Subarray: the best subarray is either entirely in the left half, entirely in the right half, or crosses the middle. The first two come from the recursive calls; the crossing one is found by walking outward from `mid` in both directions. The combine step takes the max of the three.

## Template

```python
def solve(items, lo, hi):
    """Sort items[lo..hi] with merge sort. Keep the shape, swap the base case
    and the combine step for your problem."""
    # 1. Base case: a range of one element is already solved.
    if lo >= hi:
        return [items[lo]] if lo == hi else []
    # 2. Divide: split in the middle.
    mid = lo + (hi - lo) // 2
    # 3. Conquer: solve both halves (trust the recursion).
    left = solve(items, lo, mid)
    right = solve(items, mid + 1, hi)
    # 4. Combine: build the answer for the whole range from the two half-answers.
    merged = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            merged.append(left[i])
            i += 1
        else:
            merged.append(right[j])
            j += 1
    merged.extend(left[i:])
    merged.extend(right[j:])
    return merged


if __name__ == "__main__":
    data = [5, 2, 4, 1, 3]
    print(solve(data, 0, len(data) - 1))  # [1, 2, 3, 4, 5]
```

```java
import java.util.Arrays;

public class DivideAndConquer {
    /** Sort items[lo..hi] with merge sort. Keep the shape, swap the base case
     *  and the combine step for your problem. */
    static int[] solve(int[] items, int lo, int hi) {
        // 1. Base case: a range of one element is already solved.
        if (lo > hi) return new int[0];
        if (lo == hi) return new int[] {items[lo]};
        // 2. Divide: split in the middle.
        int mid = lo + (hi - lo) / 2;
        // 3. Conquer: solve both halves (trust the recursion).
        int[] left = solve(items, lo, mid);
        int[] right = solve(items, mid + 1, hi);
        // 4. Combine: build the answer for the whole range from the two half-answers.
        int[] merged = new int[left.length + right.length];
        int i = 0, j = 0, k = 0;
        while (i < left.length && j < right.length) {
            merged[k++] = left[i] <= right[j] ? left[i++] : right[j++];
        }
        while (i < left.length) merged[k++] = left[i++];
        while (j < right.length) merged[k++] = right[j++];
        return merged;
    }

    public static void main(String[] args) {
        int[] data = {5, 2, 4, 1, 3};
        System.out.println(Arrays.toString(solve(data, 0, data.length - 1))); // [1, 2, 3, 4, 5]
    }
}
```

```cpp
#include <iostream>
#include <vector>

// Sort items[lo..hi] with merge sort. Keep the shape, swap the base case
// and the combine step for your problem.
std::vector<int> solve(const std::vector<int>& items, int lo, int hi) {
    // 1. Base case: a range of one element is already solved.
    if (lo > hi) return {};
    if (lo == hi) return {items[lo]};
    // 2. Divide: split in the middle.
    int mid = lo + (hi - lo) / 2;
    // 3. Conquer: solve both halves (trust the recursion).
    std::vector<int> left = solve(items, lo, mid);
    std::vector<int> right = solve(items, mid + 1, hi);
    // 4. Combine: build the answer for the whole range from the two half-answers.
    std::vector<int> merged;
    merged.reserve(left.size() + right.size());
    size_t i = 0, j = 0;
    while (i < left.size() && j < right.size()) {
        if (left[i] <= right[j]) merged.push_back(left[i++]);
        else merged.push_back(right[j++]);
    }
    while (i < left.size()) merged.push_back(left[i++]);
    while (j < right.size()) merged.push_back(right[j++]);
    return merged;
}

int main() {
    std::vector<int> data = {5, 2, 4, 1, 3};
    for (int x : solve(data, 0, (int)data.size() - 1)) std::cout << x << " ";  // 1 2 3 4 5
    std::cout << "\n";
}
```

```javascript
// Sort items[lo..hi] with merge sort. Keep the shape, swap the base case
// and the combine step for your problem.
function solve(items, lo, hi) {
  // 1. Base case: a range of one element is already solved.
  if (lo > hi) return [];
  if (lo === hi) return [items[lo]];
  // 2. Divide: split in the middle.
  const mid = lo + Math.floor((hi - lo) / 2);
  // 3. Conquer: solve both halves (trust the recursion).
  const left = solve(items, lo, mid);
  const right = solve(items, mid + 1, hi);
  // 4. Combine: build the answer for the whole range from the two half-answers.
  const merged = [];
  let i = 0, j = 0;
  while (i < left.length && j < right.length) {
    merged.push(left[i] <= right[j] ? left[i++] : right[j++]);
  }
  while (i < left.length) merged.push(left[i++]);
  while (j < right.length) merged.push(right[j++]);
  return merged;
}

const data = [5, 2, 4, 1, 3];
console.log(solve(data, 0, data.length - 1)); // [ 1, 2, 3, 4, 5 ]
```

```go
package main

import "fmt"

// solve sorts items[lo..hi] with merge sort. Keep the shape, swap the base case
// and the combine step for your problem.
func solve(items []int, lo, hi int) []int {
	// 1. Base case: a range of one element is already solved.
	if lo > hi {
		return []int{}
	}
	if lo == hi {
		return []int{items[lo]}
	}
	// 2. Divide: split in the middle.
	mid := lo + (hi-lo)/2
	// 3. Conquer: solve both halves (trust the recursion).
	left := solve(items, lo, mid)
	right := solve(items, mid+1, hi)
	// 4. Combine: build the answer for the whole range from the two half-answers.
	merged := make([]int, 0, len(left)+len(right))
	i, j := 0, 0
	for i < len(left) && j < len(right) {
		if left[i] <= right[j] {
			merged = append(merged, left[i])
			i++
		} else {
			merged = append(merged, right[j])
			j++
		}
	}
	merged = append(merged, left[i:]...)
	merged = append(merged, right[j:]...)
	return merged
}

func main() {
	data := []int{5, 2, 4, 1, 3}
	fmt.Println(solve(data, 0, len(data)-1)) // [1 2 3 4 5]
}
```

## Variations

- **Both halves, linear combine** (merge sort, Maximum Subarray, counting inversions): O(n log n). Counting problems piggyback on the merge: while merging, every time you take from the right half, the remaining left elements are "inversions" with it.
- **One half only** (binary search, Median of Two Sorted Arrays, Find Peak Element): look at the middle, decide which side can hold the answer, drop the other. O(log n).
- **Partition instead of split** (quickselect for Kth Largest Element): choose a pivot, move smaller items to its left, and recurse into only the side that contains index `k`. Average O(n).
- **Tree construction** (Convert Sorted Array to BST, Construct Binary Tree from Preorder and Inorder): the root is the middle element or the first preorder element; the halves become the subtrees. The combine step is just linking two children.
- **k-way splitting** (Merge k Sorted Lists): pair the lists up, merge each pair, repeat; each round halves the number of lists.

## Common mistakes

- An off-by-one in the split: `[lo, mid]` and `[mid + 1, hi]` cover everything exactly once. Using `[lo, mid - 1]` and `[mid, hi]` with `mid = lo` on a two-element range recurses forever.
- Computing `mid` as `(lo + hi) / 2`, which overflows in Java, C++ and Go for large indices. Write `lo + (hi - lo) / 2`.
- Forgetting the crossing case in the combine step. In Maximum Subarray the answer can straddle the middle, and neither half-answer knows about it.
- Copying subarrays at every level instead of passing indices. The algorithm still works, but the copies push an O(n log n) solution towards O(n^2) in memory traffic.
- Using a stable `<=` in the merge when counting pairs that need strict `<`, or the other way round. The comparison in the merge decides what is counted.
- Picking a bad pivot in quickselect on sorted input (always the first element) and getting O(n^2). Use a random pivot or the middle.

## Complexity

If the function splits a size-n problem into two halves and spends O(n) combining them, the total is O(n log n): n work on each of log2(n) levels. If it keeps only one half and combines in O(1), the total is O(log n). If it keeps one half but combines in O(n), as quickselect does, the levels shrink geometrically (n + n/2 + n/4 + ...) and the total is O(n) on average. Space is the recursion depth, O(log n), plus any buffers the combine step allocates (merge sort needs an O(n) buffer).

## Where to start

1. 912. Sort an Array: implement merge sort from the template, then try quicksort for the partition variant.
2. 108. Convert Sorted Array to Binary Search Tree: the middle element is the root; each half is a subtree. No combine step beyond linking children.
3. [53. Maximum Subarray](/interview/problems/maximum-subarray/): the three-case combine (left, right, crossing); then compare with the O(n) one-pass answer.
4. [215. Kth Largest Element in an Array](/interview/problems/kth-largest-element-in-an-array/): quickselect, recursing into one side only.
5. [23. Merge k Sorted Lists](/interview/problems/merge-k-sorted-lists/): merge pairs of lists until one remains, and see why that beats merging them one by one.
6. 105. Construct Binary Tree from Preorder and Inorder Traversal: the first preorder value splits inorder into left and right subtrees.
7. [4. Median of Two Sorted Arrays](/interview/problems/median-of-two-sorted-arrays/): throw away half of one array at every step for O(log(m + n)).
8. 315. Count of Smaller Numbers After Self: counting during the merge step of merge sort.
