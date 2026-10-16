---
title: Find First and Last Position of Element in Sorted Array
leetcode: find-first-and-last-position-of-element-in-sorted-array
description: "Find First and Last Position of Element in Sorted Array explained: locate the range of a target in a sorted array with two lower-bound binary searches in O(log n), with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given an array of integers `nums` sorted in non-decreasing order (duplicates allowed) and an integer `target`. Return a pair `[first, last]`: the index of the first and the last occurrence of `target`. If `target` does not appear, return `[-1, -1]`.

The array may be empty. The solution must run in O(log n) time, so scanning the array is not enough.

## Examples

- `nums = [1, 3, 3, 3, 6, 9]`, `target = 3` → `[1, 3]`. The 3s occupy indexes 1 to 3.
- `nums = [2, 4, 4, 8]`, `target = 5` → `[-1, -1]`. 5 would sit between the 4s and the 8, but it is not there.
- `nums = [7]`, `target = 7` → `[0, 0]`. One occurrence: first and last are the same index.
- `nums = []`, `target = 0` → `[-1, -1]`.

## Key idea

Both answers come from one question asked twice: **"what is the first index whose value is at least `x`?"** (often called the *lower bound*). Binary search answers it in O(log n) because the array is split into a "too small" part followed by an "at least x" part.

- `first = lowerBound(target)`. If that index is past the end or does not hold `target`, the target is absent.
- `last = lowerBound(target + 1) - 1`: the first value larger than `target` starts right after the last copy of `target`.

## Approach

1. Write `lowerBound(x)` with a half-open range `lo = 0`, `hi = n`:
   1. While `lo < hi`, let `mid = lo + (hi - lo) / 2`.
   2. If `nums[mid] < x`, the answer is to the right: `lo = mid + 1`.
   3. Otherwise `nums[mid]` is a candidate, but there may be an earlier one: `hi = mid`.
   4. When the loop ends, `lo` is the first index with `nums[lo] >= x` (or `n` if there is none).
2. Compute `first = lowerBound(target)`. If `first == n` or `nums[first] != target`, return `[-1, -1]`.
3. Otherwise return `[first, lowerBound(target + 1) - 1]`.

The tempting shortcut, binary search for any copy of `target` and then walk left and right, is O(n) in the worst case (for example, an array that is all 3s), which breaks the O(log n) requirement.

## Complexity

- **Time:** O(log n): two binary searches.
- **Space:** O(1).

## Common mistakes

- Expanding outwards from one found match, which becomes linear on long runs of duplicates.
- Mixing up loop styles: using `hi = n - 1` with `while (lo < hi)`, or `hi = mid - 1` with the half-open version, gives off-by-one errors or infinite loops. Pick one template and keep it consistent.
- Not checking `first < n` before reading `nums[first]`, which fails when `target` is larger than every element or the array is empty.
- Computing `mid = (lo + hi) / 2` in Java or C++ where `lo + hi` could overflow for huge arrays; `lo + (hi - lo) / 2` is the safe habit.

## Follow-up questions

- Count how many times `target` appears. (`lowerBound(target + 1) - lowerBound(target)`, still O(log n).)
- Can you do it with library calls? (Python's `bisect_left` / `bisect_right`, C++'s `lower_bound` / `upper_bound`, Java's and Go's `sort.Search`-style helpers.)
- What if the sorted array has been rotated? (See [Search in Rotated Sorted Array](/interview/problems/search-in-rotated-sorted-array/).)

## Related problems

- [Search in Rotated Sorted Array](/interview/problems/search-in-rotated-sorted-array/): binary search where only half of the range is sorted.
- [Find Peak Element](/interview/problems/find-peak-element/): binary search on a property instead of a value.
- Search Insert Position: exactly the lower-bound function on its own.
- [Koko Eating Bananas](/interview/problems/koko-eating-bananas/): the same "first index where a condition becomes true" search over an answer range.

## Solutions

```python
class Solution:
    def searchRange(self, nums: List[int], target: int) -> List[int]:
        def lower_bound(x: int) -> int:
            """First index whose value is >= x (len(nums) if none)."""
            lo, hi = 0, len(nums)
            while lo < hi:
                mid = (lo + hi) // 2
                if nums[mid] < x:
                    lo = mid + 1
                else:
                    hi = mid
            return lo

        first = lower_bound(target)
        if first == len(nums) or nums[first] != target:
            return [-1, -1]
        return [first, lower_bound(target + 1) - 1]
```

```java
class Solution {
    public int[] searchRange(int[] nums, int target) {
        int first = lowerBound(nums, target);
        if (first == nums.length || nums[first] != target) {
            return new int[] {-1, -1};
        }
        return new int[] {first, lowerBound(nums, target + 1) - 1};
    }

    // First index whose value is >= x (nums.length if none).
    private int lowerBound(int[] nums, int x) {
        int lo = 0, hi = nums.length;
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (nums[mid] < x) {
                lo = mid + 1;
            } else {
                hi = mid;
            }
        }
        return lo;
    }
}
```

```cpp
class Solution {
public:
    vector<int> searchRange(vector<int>& nums, int target) {
        int first = lowerBound(nums, target);
        if (first == (int)nums.size() || nums[first] != target) {
            return {-1, -1};
        }
        return {first, lowerBound(nums, target + 1) - 1};
    }

private:
    // First index whose value is >= x (nums.size() if none).
    int lowerBound(const vector<int>& nums, int x) {
        int lo = 0, hi = nums.size();
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (nums[mid] < x) {
                lo = mid + 1;
            } else {
                hi = mid;
            }
        }
        return lo;
    }
};
```

```javascript
/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var searchRange = function (nums, target) {
  // First index whose value is >= x (nums.length if none).
  const lowerBound = (x) => {
    let lo = 0;
    let hi = nums.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (nums[mid] < x) {
        lo = mid + 1;
      } else {
        hi = mid;
      }
    }
    return lo;
  };
  const first = lowerBound(target);
  if (first === nums.length || nums[first] !== target) {
    return [-1, -1];
  }
  return [first, lowerBound(target + 1) - 1];
};
```

```go
func searchRange(nums []int, target int) []int {
	first := lowerBound(nums, target)
	if first == len(nums) || nums[first] != target {
		return []int{-1, -1}
	}
	return []int{first, lowerBound(nums, target+1) - 1}
}

// lowerBound returns the first index whose value is >= x (len(nums) if none).
func lowerBound(nums []int, x int) int {
	lo, hi := 0, len(nums)
	for lo < hi {
		mid := lo + (hi-lo)/2
		if nums[mid] < x {
			lo = mid + 1
		} else {
			hi = mid
		}
	}
	return lo
}
```
