---
title: Single Element in a Sorted Array
leetcode: single-element-in-a-sorted-array
description: "Single Element in a Sorted Array explained: find the one value that appears once when every other value appears twice, in O(log n) with a binary search over pair boundaries, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given a sorted array of integers in which every value appears exactly twice, except for one value that appears exactly once. Return that single value.

Because the array is sorted, the two copies of each value sit next to each other. The array always has an odd length (at least 1), and the solution must run in O(log n) time and O(1) extra space, so a linear scan or a hash map is not good enough.

## Examples

- `[1, 1, 2, 3, 3, 4, 4]` → `2`. Every other value has a twin right beside it.
- `[0, 0, 5, 5, 9]` → `9`. The single value is at the very end.
- `[2, 3, 3]` → `2`. The single value is at the very start.
- `[-4, -4, -1, -1, 0, 6, 6]` → `0`. Negative values work the same way.
- `[7]` → `7`. A one-element array is its own answer.

## Key idea

Before the single element, pairs start at **even** indices: the pair `(nums[0], nums[1])`, then `(nums[2], nums[3])`, and so on. The single element shifts everything after it by one, so after it pairs start at **odd** indices. That gives a yes/no question you can ask in the middle of the array: "does the pair at this even index still line up?" If `nums[mid] == nums[mid + 1]` for an even `mid`, the shift has not happened yet and the single element is to the right; otherwise it is at `mid` or to the left. A property that is false on one side and true on the other is exactly what binary search needs.

## Approach

1. Set `lo = 0` and `hi = n - 1`.
2. While `lo < hi`:
   1. Compute `mid = (lo + hi) / 2`. If `mid` is odd, subtract 1 so that `mid` is even and the comparison looks at a pair that *should* start here.
   2. If `nums[mid] == nums[mid + 1]`, the pairs are still aligned up to `mid + 1`, so set `lo = mid + 2`.
   3. Otherwise the single element is at `mid` or before it, so set `hi = mid`.
3. When the loop ends, `lo == hi` and `nums[lo]` is the single element.

Step 2.1 keeps `mid + 1` in range: `hi` is always even (both `n - 1` and every `mid` assigned to `hi` are even), and `mid <= hi - 1` whenever `lo < hi`, so `mid + 1 <= hi`.

A linear scan comparing neighbours in steps of two, or XOR-ing every value, finds the answer in O(n). Both are correct but ignore the sorted order, which is what the interviewer wants you to exploit.

## Complexity

- **Time:** O(log n). Each loop iteration halves the search range.
- **Space:** O(1). Only two indices are kept.

## Common mistakes

- Comparing `nums[mid]` with `nums[mid - 1]` or `nums[mid + 1]` without first forcing `mid` to be even. The direction of the comparison depends on the parity, and mixing them up sends the search the wrong way.
- Setting `lo = mid + 1` instead of `lo = mid + 2` after a matching pair. Index `mid + 1` is the second half of the pair and cannot be the answer.
- Using `hi = mid - 1` when the pair does not match. The single element might be `nums[mid]` itself.
- Reaching for XOR or a hash map. They are O(n) and the problem explicitly asks for logarithmic time.

## Follow-up questions

- *What if the array is not sorted?* Then the pair trick is gone; XOR all values in O(n) time and O(1) space.
- *What if every value appears three times except one?* Binary search still works on a sorted array by checking the index of the first copy of `nums[mid]` modulo 3; unsorted, you count bits per position.
- *Can you do it with bit tricks on the index?* Yes: `mid ^ 1` is `mid`'s partner (`mid + 1` when `mid` is even, `mid - 1` when odd). If `nums[mid] == nums[mid ^ 1]`, go right (`lo = mid + 1`), else go left (`hi = mid`), without adjusting parity by hand.

## Related problems

- [Search in Rotated Sorted Array](/interview/problems/search-in-rotated-sorted-array/): binary search on a property instead of a plain value.
- [Find Peak Element](/interview/problems/find-peak-element/): another binary search that decides a direction from the neighbours.
- [Find First and Last Position of Element in Sorted Array](/interview/problems/find-first-and-last-position-of-element-in-sorted-array/): binary search for a boundary.
- Single Number (the unsorted version, solved with XOR).

## Solutions

```python
class Solution:
    def singleNonDuplicate(self, nums: List[int]) -> int:
        lo, hi = 0, len(nums) - 1
        while lo < hi:
            mid = (lo + hi) // 2
            if mid % 2 == 1:
                mid -= 1  # look at the pair that should start at an even index
            if nums[mid] == nums[mid + 1]:
                lo = mid + 2  # pairs still aligned: the single element is to the right
            else:
                hi = mid  # alignment broken: it is here or to the left
        return nums[lo]
```

```java
class Solution {
    public int singleNonDuplicate(int[] nums) {
        int lo = 0, hi = nums.length - 1;
        while (lo < hi) {
            int mid = (lo + hi) / 2;
            if (mid % 2 == 1) {
                mid--; // look at the pair that should start at an even index
            }
            if (nums[mid] == nums[mid + 1]) {
                lo = mid + 2; // pairs still aligned: the single element is to the right
            } else {
                hi = mid; // alignment broken: it is here or to the left
            }
        }
        return nums[lo];
    }
}
```

```cpp
class Solution {
public:
    int singleNonDuplicate(vector<int>& nums) {
        int lo = 0, hi = nums.size() - 1;
        while (lo < hi) {
            int mid = (lo + hi) / 2;
            if (mid % 2 == 1) {
                mid--;  // look at the pair that should start at an even index
            }
            if (nums[mid] == nums[mid + 1]) {
                lo = mid + 2;  // pairs still aligned: the single element is to the right
            } else {
                hi = mid;  // alignment broken: it is here or to the left
            }
        }
        return nums[lo];
    }
};
```

```javascript
/**
 * @param {number[]} nums
 * @return {number}
 */
var singleNonDuplicate = function (nums) {
  let lo = 0;
  let hi = nums.length - 1;
  while (lo < hi) {
    let mid = Math.floor((lo + hi) / 2);
    if (mid % 2 === 1) {
      mid--; // look at the pair that should start at an even index
    }
    if (nums[mid] === nums[mid + 1]) {
      lo = mid + 2; // pairs still aligned: the single element is to the right
    } else {
      hi = mid; // alignment broken: it is here or to the left
    }
  }
  return nums[lo];
};
```

```go
func singleNonDuplicate(nums []int) int {
	lo, hi := 0, len(nums)-1
	for lo < hi {
		mid := (lo + hi) / 2
		if mid%2 == 1 {
			mid-- // look at the pair that should start at an even index
		}
		if nums[mid] == nums[mid+1] {
			lo = mid + 2 // pairs still aligned: the single element is to the right
		} else {
			hi = mid // alignment broken: it is here or to the left
		}
	}
	return nums[lo]
}
```
