---
title: Find Peak Element
leetcode: find-peak-element
description: "Find Peak Element explained: return the index of any element larger than both neighbours in O(log n) by binary searching on the slope, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given a non-empty integer array `nums` in which no two neighbouring elements are equal. A **peak** is an element that is strictly greater than the elements right next to it. Positions outside the array count as negative infinity, so the first element only has to beat its right neighbour and the last element only has to beat its left one.

Return the index of any peak. If there are several, any one of them is accepted. Your algorithm must run in O(log n) time. Values can be as low as the smallest 32-bit integer.

## Examples

- `nums = [2, 5, 3]` → `1`, because `5` is bigger than `2` and `3`.
- `nums = [1, 3, 2, 6, 4]` → `1` or `3`. Both `3` and `6` are peaks; either index is correct.
- `nums = [9, 7, 4]` → `0`. The first element only needs to beat its one neighbour.
- `nums = [1, 2, 3, 4]` → `3`. The array keeps rising, so the last element is the peak.

## Key idea

Look at any position `mid` and its right neighbour. If `nums[mid] < nums[mid + 1]`, you are on an **uphill slope** going right. Keep walking right: either the values eventually go down (the top of that climb is a peak) or you reach the end of the array (the last element is a peak, since beyond it is negative infinity). Either way a peak exists to the right of `mid`. If instead `nums[mid] > nums[mid + 1]`, the same argument going left shows a peak exists at `mid` or to its left. So one comparison throws away half of the array, which is exactly binary search, even though the array is not sorted.

## Approach

1. Set `lo = 0` and `hi = n - 1`. A peak always lies in `[lo, hi]`.
2. While `lo < hi`:
   1. Let `mid = lo + (hi - lo) / 2`. Since `mid < hi`, the index `mid + 1` is always valid.
   2. If `nums[mid] > nums[mid + 1]`, a peak is at `mid` or to its left: set `hi = mid`.
   3. Otherwise a peak is strictly to the right: set `lo = mid + 1`.
3. When `lo == hi`, the range holds a single index, and it is a peak. Return `lo`.

The brute-force scan returns the first `i` with `nums[i] > nums[i + 1]` (or the last index). It is correct but O(n), which the problem rules out.

## Complexity

- **Time:** O(log n). The search range halves on every step.
- **Space:** O(1). Only two indexes.

## Common mistakes

- Thinking binary search needs a sorted array. Here it only needs a rule that tells you which half surely contains an answer.
- Comparing with `nums[mid - 1]` or `nums[mid + 1]` without making sure the index exists. With `lo < hi` and `mid` rounded down, `mid + 1` is always in range.
- Padding the array with a sentinel like `INT_MIN`. Real values can equal the smallest 32-bit integer, so the sentinel would wrongly tie with them.
- Writing tests that expect one specific index. Any peak is valid, so check the peak property instead.

## Follow-up questions

- Can you find a peak in a 2D grid? (Find a Peak Element II: binary search on columns, taking the maximum of each middle column.)
- What changes if neighbours can be equal? (Then a flat region can hide the peak and the worst case becomes O(n).)

## Related problems

- Peak Index in a Mountain Array
- Find a Peak Element II
- Search in Rotated Sorted Array (another binary search on an unsorted-looking array)

## Solutions

```python
class Solution:
    def findPeakElement(self, nums: List[int]) -> int:
        lo, hi = 0, len(nums) - 1
        while lo < hi:
            mid = (lo + hi) // 2
            if nums[mid] > nums[mid + 1]:
                hi = mid       # downhill: a peak is at mid or to its left
            else:
                lo = mid + 1   # uphill: a peak is to the right
        return lo
```

```java
class Solution {
    public int findPeakElement(int[] nums) {
        int lo = 0, hi = nums.length - 1;
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (nums[mid] > nums[mid + 1]) {
                hi = mid;      // downhill: a peak is at mid or to its left
            } else {
                lo = mid + 1;  // uphill: a peak is to the right
            }
        }
        return lo;
    }
}
```

```cpp
class Solution {
public:
    int findPeakElement(vector<int>& nums) {
        int lo = 0, hi = (int)nums.size() - 1;
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (nums[mid] > nums[mid + 1]) {
                hi = mid;      // downhill: a peak is at mid or to its left
            } else {
                lo = mid + 1;  // uphill: a peak is to the right
            }
        }
        return lo;
    }
};
```

```javascript
/**
 * @param {number[]} nums
 * @return {number}
 */
var findPeakElement = function (nums) {
  let lo = 0;
  let hi = nums.length - 1;
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (nums[mid] > nums[mid + 1]) {
      hi = mid; // downhill: a peak is at mid or to its left
    } else {
      lo = mid + 1; // uphill: a peak is to the right
    }
  }
  return lo;
};
```

```go
func findPeakElement(nums []int) int {
	lo, hi := 0, len(nums)-1
	for lo < hi {
		mid := lo + (hi-lo)/2
		if nums[mid] > nums[mid+1] {
			hi = mid // downhill: a peak is at mid or to its left
		} else {
			lo = mid + 1 // uphill: a peak is to the right
		}
	}
	return lo
}
```
