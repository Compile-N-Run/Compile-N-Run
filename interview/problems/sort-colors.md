---
title: Sort Colors
leetcode: sort-colors
description: "Sort Colors explained: sort an array that holds only 0s, 1s and 2s in place in a single pass with three pointers (the Dutch national flag algorithm), with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given an array `nums` in which every value is `0`, `1` or `2` (think of them as three colors, say red, white and blue). Rearrange the array so that all the 0s come first, then all the 1s, then all the 2s.

The work must be done in place: change `nums` itself instead of building a new array. The function returns nothing; the test looks at `nums` afterwards. You are not supposed to call the language's built-in sort. The array has at least one element.

## Examples

- `nums = [2, 1, 0, 2, 0, 1]` → `nums` becomes `[0, 0, 1, 1, 2, 2]`.
- `nums = [1, 2, 1]` → `[1, 1, 2]`. A color may be missing entirely (here there is no 0).
- `nums = [2, 2, 0]` → `[0, 2, 2]`.
- `nums = [1]` → `[1]`. A single element is already sorted.

## Key idea

With only three possible values we never need to compare elements against each other. Split the array into four zones with three pointers: everything before `low` is a 0, everything from `low` up to `mid - 1` is a 1, everything after `high` is a 2, and the part from `mid` to `high` is still unknown. Look at `nums[mid]` and send it to the right zone with one swap. Each step shrinks the unknown zone by one, so a single pass sorts the whole array. This is Dijkstra's *Dutch national flag* algorithm.

## Approach

1. Set `low = 0`, `mid = 0`, `high = n - 1`.
2. While `mid <= high`, look at `nums[mid]`:
   1. If it is `0`, swap it with `nums[low]`, then move both `low` and `mid` forward. The value that comes back from `low` is a 1 (or the same element), so it is safe to move past it.
   2. If it is `1`, it is already in the middle zone: just move `mid` forward.
   3. If it is `2`, swap it with `nums[high]` and move `high` backward. Do **not** move `mid`: the value that came back from `high` has not been looked at yet.
3. When `mid` passes `high`, the unknown zone is empty and the array is sorted.

A simple two-pass alternative counts how many 0s, 1s and 2s there are and then overwrites the array with that many of each. It is also O(n) and perfectly fine; interviewers usually follow up by asking for the one-pass version above.

## Complexity

- **Time:** O(n). Every step either moves `mid` forward or `high` backward, so there are at most n steps.
- **Space:** O(1). Only three index variables are used.

## Common mistakes

- Moving `mid` forward after swapping with `high`. The incoming value is unexamined and might be a 0 or a 2; for `[2, 0]` this leaves the 0 at the end.
- Looping while `mid < high` instead of `mid <= high`, which skips the last unknown element (try `[1, 0]`).
- Returning a new sorted array instead of changing `nums` in place.

## Follow-up questions

- Can you do it in one pass with constant extra space? (The three-pointer method above.)
- How would you handle k different colors? (Counting sort in O(n + k), or repeatedly partition.)

## Related problems

- Move Zeroes
- Sort List
- Wiggle Sort

## Solutions

```python
class Solution:
    def sortColors(self, nums: List[int]) -> None:
        low, mid, high = 0, 0, len(nums) - 1
        while mid <= high:
            if nums[mid] == 0:
                nums[low], nums[mid] = nums[mid], nums[low]
                low += 1
                mid += 1
            elif nums[mid] == 1:
                mid += 1
            else:
                nums[mid], nums[high] = nums[high], nums[mid]
                high -= 1  # mid stays: the swapped-in value is unchecked
```

```java
class Solution {
    public void sortColors(int[] nums) {
        int low = 0, mid = 0, high = nums.length - 1;
        while (mid <= high) {
            if (nums[mid] == 0) {
                swap(nums, low++, mid++);
            } else if (nums[mid] == 1) {
                mid++;
            } else {
                swap(nums, mid, high--); // mid stays: the swapped-in value is unchecked
            }
        }
    }

    private void swap(int[] nums, int i, int j) {
        int tmp = nums[i];
        nums[i] = nums[j];
        nums[j] = tmp;
    }
}
```

```cpp
class Solution {
public:
    void sortColors(vector<int>& nums) {
        int low = 0, mid = 0, high = (int)nums.size() - 1;
        while (mid <= high) {
            if (nums[mid] == 0) {
                swap(nums[low++], nums[mid++]);
            } else if (nums[mid] == 1) {
                mid++;
            } else {
                swap(nums[mid], nums[high--]);  // mid stays: the swapped-in value is unchecked
            }
        }
    }
};
```

```javascript
/**
 * @param {number[]} nums
 * @return {void} Do not return anything, modify nums in-place instead.
 */
var sortColors = function (nums) {
  let low = 0, mid = 0, high = nums.length - 1;
  while (mid <= high) {
    if (nums[mid] === 0) {
      [nums[low], nums[mid]] = [nums[mid], nums[low]];
      low++;
      mid++;
    } else if (nums[mid] === 1) {
      mid++;
    } else {
      [nums[mid], nums[high]] = [nums[high], nums[mid]];
      high--; // mid stays: the swapped-in value is unchecked
    }
  }
};
```

```go
func sortColors(nums []int) {
	low, mid, high := 0, 0, len(nums)-1
	for mid <= high {
		switch nums[mid] {
		case 0:
			nums[low], nums[mid] = nums[mid], nums[low]
			low++
			mid++
		case 1:
			mid++
		default:
			nums[mid], nums[high] = nums[high], nums[mid]
			high-- // mid stays: the swapped-in value is unchecked
		}
	}
}
```
