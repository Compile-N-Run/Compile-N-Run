---
title: Next Permutation
leetcode: next-permutation
description: "Next Permutation explained: rearrange an array in place into the next larger ordering of its numbers by finding a pivot, swapping and reversing the suffix, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

Think of every possible ordering (permutation) of the numbers in an array, sorted like words in a dictionary: compare the first element, then the second, and so on. Given an array of integers `nums`, change it **in place** into the ordering that comes right after it in that sorted list.

If the array is already the largest ordering (its numbers are in non-increasing order), there is no next one, so wrap around to the smallest ordering: the numbers sorted in ascending order.

The function returns nothing; the caller looks at `nums` afterwards. Use only constant extra memory. The array has at least one element and may contain duplicates.

## Examples

- `nums = [1, 3, 2]` → `[2, 1, 3]`. The orderings of 1, 2, 3 in order are 123, 132, 213, 231, 312, 321, so 132 is followed by 213.
- `nums = [5, 4, 3]` → `[3, 4, 5]`. 543 is the largest ordering, so we wrap around to the smallest.
- `nums = [2, 2, 7]` → `[2, 7, 2]`. Duplicates are fine: the distinct orderings are 227, 272, 722.
- `nums = [1, 5, 8, 4, 7, 6, 5, 3, 1]` → `[1, 5, 8, 5, 1, 3, 4, 6, 7]`. The worked example in the approach below.

## Key idea

To get the *smallest* possible increase, change the array as far to the right as possible. Look at the array from the end: a tail that is in non-increasing order (like `7, 6, 5, 3, 1`) is already at its largest, so no rearrangement of the tail alone can make the number bigger. The element just before that tail (the **pivot**, `4` above) must grow. Swap it with the smallest tail element that is bigger than it (`5`), which keeps the tail non-increasing. Then make the tail as small as possible by putting it in ascending order, which is just a reversal because it is sorted backwards.

## Approach

1. Find the pivot: scan from the right for the first index `i` with `nums[i] < nums[i + 1]`. In the long example that is the `4` at index 3, since `7, 6, 5, 3, 1` never increases.
2. If there is no such `i`, the whole array is non-increasing (the largest ordering). Reverse the whole array and stop.
3. Otherwise scan from the right again for the first index `j` with `nums[j] > nums[i]`. Because the tail is non-increasing, this is the smallest value bigger than the pivot (the rightmost one if there are duplicates). Here it is the `5` at index 6.
4. Swap `nums[i]` and `nums[j]`: `[1, 5, 8, 5, 7, 6, 4, 3, 1]`. The tail after `i` is still non-increasing.
5. Reverse the tail after `i`: `[1, 5, 8, 5, 1, 3, 4, 6, 7]`.

Generating all permutations, sorting them and picking the next one would take O(n! · n) time, which is hopeless beyond tiny arrays.

## Complexity

- **Time:** O(n). Each of the two scans and the reversal touches every element at most once.
- **Space:** O(1). Only a few index variables; everything happens inside `nums`.

## Common mistakes

- Using `<=` instead of `<` when finding the pivot, or `>=` instead of `>` when finding the swap partner. With duplicates such as `[1, 5, 1]` the wrong comparison picks an equal value and produces the same or a smaller ordering.
- Sorting the tail instead of reversing it. It works but costs O(n log n); the tail is already sorted backwards.
- Forgetting the wrap-around case and leaving the largest ordering unchanged.
- Returning a new array. The caller only sees changes made to `nums` itself.

## Follow-up questions

- How would you find the *previous* permutation? (Mirror every comparison.)
- How would you get the k-th permutation of `1..n` directly? (Use factorials to pick each digit: Permutation Sequence.)

## Related problems

- Permutations
- Permutations II
- Permutation Sequence

## Solutions

```python
class Solution:
    def nextPermutation(self, nums: List[int]) -> None:
        """
        Do not return anything, modify nums in-place instead.
        """
        i = len(nums) - 2
        while i >= 0 and nums[i] >= nums[i + 1]:
            i -= 1  # skip the non-increasing tail
        if i >= 0:
            j = len(nums) - 1
            while nums[j] <= nums[i]:
                j -= 1  # smallest tail value bigger than the pivot
            nums[i], nums[j] = nums[j], nums[i]
        # Reverse the tail (the whole array when there was no pivot).
        left, right = i + 1, len(nums) - 1
        while left < right:
            nums[left], nums[right] = nums[right], nums[left]
            left += 1
            right -= 1
```

```java
class Solution {
    public void nextPermutation(int[] nums) {
        int i = nums.length - 2;
        while (i >= 0 && nums[i] >= nums[i + 1]) {
            i--; // skip the non-increasing tail
        }
        if (i >= 0) {
            int j = nums.length - 1;
            while (nums[j] <= nums[i]) {
                j--; // smallest tail value bigger than the pivot
            }
            swap(nums, i, j);
        }
        // Reverse the tail (the whole array when there was no pivot).
        for (int left = i + 1, right = nums.length - 1; left < right; left++, right--) {
            swap(nums, left, right);
        }
    }

    private void swap(int[] nums, int a, int b) {
        int t = nums[a];
        nums[a] = nums[b];
        nums[b] = t;
    }
}
```

```cpp
class Solution {
public:
    void nextPermutation(vector<int>& nums) {
        int i = (int)nums.size() - 2;
        while (i >= 0 && nums[i] >= nums[i + 1]) {
            i--;  // skip the non-increasing tail
        }
        if (i >= 0) {
            int j = (int)nums.size() - 1;
            while (nums[j] <= nums[i]) {
                j--;  // smallest tail value bigger than the pivot
            }
            swap(nums[i], nums[j]);
        }
        // Reverse the tail (the whole array when there was no pivot).
        reverse(nums.begin() + i + 1, nums.end());
    }
};
```

```javascript
/**
 * @param {number[]} nums
 * @return {void} Do not return anything, modify nums in-place instead.
 */
var nextPermutation = function (nums) {
  let i = nums.length - 2;
  while (i >= 0 && nums[i] >= nums[i + 1]) {
    i--; // skip the non-increasing tail
  }
  if (i >= 0) {
    let j = nums.length - 1;
    while (nums[j] <= nums[i]) {
      j--; // smallest tail value bigger than the pivot
    }
    [nums[i], nums[j]] = [nums[j], nums[i]];
  }
  // Reverse the tail (the whole array when there was no pivot).
  for (let left = i + 1, right = nums.length - 1; left < right; left++, right--) {
    [nums[left], nums[right]] = [nums[right], nums[left]];
  }
};
```

```go
func nextPermutation(nums []int) {
	i := len(nums) - 2
	for i >= 0 && nums[i] >= nums[i+1] {
		i-- // skip the non-increasing tail
	}
	if i >= 0 {
		j := len(nums) - 1
		for nums[j] <= nums[i] {
			j-- // smallest tail value bigger than the pivot
		}
		nums[i], nums[j] = nums[j], nums[i]
	}
	// Reverse the tail (the whole array when there was no pivot).
	for left, right := i+1, len(nums)-1; left < right; left, right = left+1, right-1 {
		nums[left], nums[right] = nums[right], nums[left]
	}
}
```
