---
title: Merge Sorted Array
leetcode: merge-sorted-array
description: "Merge Sorted Array explained: merge a second sorted array into the spare space at the end of the first one, in place, by filling from the back with three pointers, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given two integer arrays, `nums1` and `nums2`, each sorted in non-decreasing order, and two counts `m` and `n`. The first `m` positions of `nums1` hold real values; `nums1` has exactly `n` extra positions at the end (filled with `0` as placeholders) so its total length is `m + n`. `nums2` holds `n` values.

Merge `nums2` into `nums1` so that `nums1` ends up holding all `m + n` values in sorted order. Do it in place: the function returns nothing, and the result is read from `nums1` afterwards. Either `m` or `n` may be `0`, and values can be negative or repeated.

## Examples

- `nums1 = [2, 5, 9, 0, 0]`, `m = 3`, `nums2 = [4, 10]`, `n = 2` → `nums1` becomes `[2, 4, 5, 9, 10]`.
- `nums1 = [1, 1, 0]`, `m = 2`, `nums2 = [1]`, `n = 1` → `[1, 1, 1]`. Equal values are fine in either order.
- `nums1 = [0, 0]`, `m = 0`, `nums2 = [-3, 6]`, `n = 2` → `[-3, 6]`. The first array has no real values, so the answer is just `nums2`.
- `nums1 = [7]`, `m = 1`, `nums2 = []`, `n = 0` → `[7]`. Nothing to merge.

## Key idea

Merging from the front would overwrite values of `nums1` that we still need. The free space, however, is at the *back*. So merge backwards: compare the largest remaining value of each array and put the bigger one into the last free slot. The write position always stays at or behind the unread part of `nums1`, so nothing useful is ever overwritten.

## Approach

1. Set `i = m - 1` (last real value of `nums1`), `j = n - 1` (last value of `nums2`) and `k = m + n - 1` (last slot of `nums1`).
2. While `j >= 0` (there are still values of `nums2` to place):
   1. If `i >= 0` and `nums1[i] > nums2[j]`, copy `nums1[i]` to `nums1[k]` and decrease `i`.
   2. Otherwise copy `nums2[j]` to `nums1[k]` and decrease `j`.
   3. Decrease `k`.
3. Stop when `nums2` is used up. Any values of `nums1` that were never moved are already in the right place at the front.

The easy alternative copies `nums2` into the tail and sorts the whole array, which costs O((m + n) log(m + n)) and ignores that both inputs are already sorted. Merging from the front with a copy of `nums1` is O(m + n) but needs O(m) extra space.

## Complexity

- **Time:** O(m + n). Each step places one value.
- **Space:** O(1). Only three indexes are used.

## Common mistakes

- Looping while `i >= 0` instead of while `j >= 0`. If `nums1`'s values run out first, the rest of `nums2` still has to be copied (see the `m = 0` example).
- Forgetting the `i >= 0` check, which reads `nums1[-1]` (an error in most languages, the wrong element in Python).
- Merging from the front without a copy, which overwrites values of `nums1` before they are read.

## Follow-up questions

- Can you do it in O(m + n) time without extra space? (Fill from the back, as above.)
- How would you merge k sorted arrays? (A min-heap of the current heads, as in Merge k Sorted Lists.)

## Related problems

- Merge Two Sorted Lists
- Merge k Sorted Lists
- Squares of a Sorted Array

## Solutions

```python
class Solution:
    def merge(self, nums1: List[int], m: int, nums2: List[int], n: int) -> None:
        i, j, k = m - 1, n - 1, m + n - 1
        while j >= 0:
            if i >= 0 and nums1[i] > nums2[j]:
                nums1[k] = nums1[i]
                i -= 1
            else:
                nums1[k] = nums2[j]
                j -= 1
            k -= 1
```

```java
class Solution {
    public void merge(int[] nums1, int m, int[] nums2, int n) {
        int i = m - 1, j = n - 1, k = m + n - 1;
        while (j >= 0) {
            if (i >= 0 && nums1[i] > nums2[j]) {
                nums1[k--] = nums1[i--];
            } else {
                nums1[k--] = nums2[j--];
            }
        }
    }
}
```

```cpp
class Solution {
public:
    void merge(vector<int>& nums1, int m, vector<int>& nums2, int n) {
        int i = m - 1, j = n - 1, k = m + n - 1;
        while (j >= 0) {
            if (i >= 0 && nums1[i] > nums2[j]) {
                nums1[k--] = nums1[i--];
            } else {
                nums1[k--] = nums2[j--];
            }
        }
    }
};
```

```javascript
/**
 * @param {number[]} nums1
 * @param {number} m
 * @param {number[]} nums2
 * @param {number} n
 * @return {void} Do not return anything, modify nums1 in-place instead.
 */
var merge = function (nums1, m, nums2, n) {
  let i = m - 1, j = n - 1, k = m + n - 1;
  while (j >= 0) {
    if (i >= 0 && nums1[i] > nums2[j]) {
      nums1[k--] = nums1[i--];
    } else {
      nums1[k--] = nums2[j--];
    }
  }
};
```

```go
func merge(nums1 []int, m int, nums2 []int, n int) {
	i, j, k := m-1, n-1, m+n-1
	for j >= 0 {
		if i >= 0 && nums1[i] > nums2[j] {
			nums1[k] = nums1[i]
			i--
		} else {
			nums1[k] = nums2[j]
			j--
		}
		k--
	}
}
```
