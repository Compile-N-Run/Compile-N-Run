---
title: Search in Rotated Sorted Array
leetcode: search-in-rotated-sorted-array
description: "Search in Rotated Sorted Array explained: find a target in a sorted array that was rotated at an unknown point with a modified binary search in O(log n), with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given an array `nums` of distinct integers that was sorted in increasing order and then possibly *rotated*: some prefix was cut off and moved to the end, so `[1, 2, 3, 4, 5]` might arrive as `[4, 5, 1, 2, 3]`. You do not know where the cut is, and the array may not be rotated at all. Given an integer `target`, return its index in `nums`, or `-1` if it is not present.

The array has at least one element. Your algorithm must run in O(log n) time, so a linear scan is not enough.

## Examples

- `nums = [15, 18, 22, 3, 7, 11]`, `target = 7` → `4`.
- `nums = [15, 18, 22, 3, 7, 11]`, `target = 20` → `-1`. 20 falls between values in the array but is not one of them.
- `nums = [30, 40, 50, 10, 20]`, `target = 40` → `1`. The target is in the left, larger part.
- `nums = [9]`, `target = 9` → `0`.

## Key idea

Cut a rotated array anywhere and at least one of the two halves is still sorted normally. In binary search, look at `nums[lo]`, `nums[mid]` and `nums[hi]`: if `nums[lo] <= nums[mid]`, the left half `lo..mid` is sorted; otherwise the right half `mid..hi` is. For the sorted half you can tell instantly whether the target lies inside it by comparing with its two ends. If it does, search there; if not, it must be in the other half. Either way you discard half the array per step, just like ordinary binary search.

## Approach

1. Set `lo = 0` and `hi = n - 1`.
2. While `lo <= hi`:
   1. `mid = (lo + hi) / 2`. If `nums[mid] == target`, return `mid`.
   2. If `nums[lo] <= nums[mid]` (left half sorted):
      - if `nums[lo] <= target < nums[mid]`, set `hi = mid - 1`;
      - otherwise set `lo = mid + 1`.
   3. Else (right half sorted):
      - if `nums[mid] < target <= nums[hi]`, set `lo = mid + 1`;
      - otherwise set `hi = mid - 1`.
3. The loop ended without a match, so return `-1`.

A two-pass alternative first binary-searches for the smallest element (the rotation point) and then runs an ordinary binary search on the correct side. It has the same complexity; the one-pass version is shorter.

## Complexity

- **Time:** O(log n). Each iteration halves the range `lo..hi`.
- **Space:** O(1). Only a few index variables are used.

## Common mistakes

- Writing `nums[lo] < nums[mid]` instead of `<=`: when `lo == mid` (two elements left) the left "half" is a single sorted element, and the strict test sends the search the wrong way.
- Using strict comparisons on both ends of the range check, which skips a target sitting exactly at `nums[lo]` or `nums[hi]`.
- Forgetting the unrotated case; the same code handles it because the left half is always sorted then.

## Follow-up questions

- What if the array may contain duplicates? (Search in Rotated Sorted Array II: when `nums[lo] == nums[mid] == nums[hi]` you cannot tell which side is sorted, so shrink both ends by one; the worst case becomes O(n).)
- How do you find the rotation point itself? (Find Minimum in Rotated Sorted Array.)

## Related problems

- Find Minimum in Rotated Sorted Array
- Search in Rotated Sorted Array II
- Binary Search

## Solutions

```python
class Solution:
    def search(self, nums: List[int], target: int) -> int:
        lo, hi = 0, len(nums) - 1
        while lo <= hi:
            mid = (lo + hi) // 2
            if nums[mid] == target:
                return mid
            if nums[lo] <= nums[mid]:  # left half is sorted
                if nums[lo] <= target < nums[mid]:
                    hi = mid - 1
                else:
                    lo = mid + 1
            else:  # right half is sorted
                if nums[mid] < target <= nums[hi]:
                    lo = mid + 1
                else:
                    hi = mid - 1
        return -1
```

```java
class Solution {
    public int search(int[] nums, int target) {
        int lo = 0, hi = nums.length - 1;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            if (nums[mid] == target) {
                return mid;
            }
            if (nums[lo] <= nums[mid]) { // left half is sorted
                if (nums[lo] <= target && target < nums[mid]) {
                    hi = mid - 1;
                } else {
                    lo = mid + 1;
                }
            } else { // right half is sorted
                if (nums[mid] < target && target <= nums[hi]) {
                    lo = mid + 1;
                } else {
                    hi = mid - 1;
                }
            }
        }
        return -1;
    }
}
```

```cpp
class Solution {
public:
    int search(vector<int>& nums, int target) {
        int lo = 0, hi = nums.size() - 1;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            if (nums[mid] == target) return mid;
            if (nums[lo] <= nums[mid]) {  // left half is sorted
                if (nums[lo] <= target && target < nums[mid]) {
                    hi = mid - 1;
                } else {
                    lo = mid + 1;
                }
            } else {  // right half is sorted
                if (nums[mid] < target && target <= nums[hi]) {
                    lo = mid + 1;
                } else {
                    hi = mid - 1;
                }
            }
        }
        return -1;
    }
};
```

```javascript
/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number}
 */
var search = function (nums, target) {
  let lo = 0;
  let hi = nums.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (nums[mid] === target) {
      return mid;
    }
    if (nums[lo] <= nums[mid]) { // left half is sorted
      if (nums[lo] <= target && target < nums[mid]) {
        hi = mid - 1;
      } else {
        lo = mid + 1;
      }
    } else { // right half is sorted
      if (nums[mid] < target && target <= nums[hi]) {
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }
  }
  return -1;
};
```

```go
func search(nums []int, target int) int {
	lo, hi := 0, len(nums)-1
	for lo <= hi {
		mid := lo + (hi-lo)/2
		if nums[mid] == target {
			return mid
		}
		if nums[lo] <= nums[mid] { // left half is sorted
			if nums[lo] <= target && target < nums[mid] {
				hi = mid - 1
			} else {
				lo = mid + 1
			}
		} else { // right half is sorted
			if nums[mid] < target && target <= nums[hi] {
				lo = mid + 1
			} else {
				hi = mid - 1
			}
		}
	}
	return -1
}
```
