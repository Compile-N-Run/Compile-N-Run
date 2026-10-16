---
title: First Missing Positive
leetcode: first-missing-positive
description: "First Missing Positive explained: find the smallest positive integer absent from an unsorted array in O(n) time and O(1) extra space by swapping each value into its own slot, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given an unsorted array of integers `nums`. It may contain negatives, zeros, duplicates and very large values. Return the **smallest positive integer** (1, 2, 3, ...) that does not appear in the array.

The array has at least one element. The intended solution runs in O(n) time and uses only O(1) extra memory; you are allowed to modify the array.

## Examples

- `nums = [2, 5, 1, 9]` → `3`. Both 1 and 2 are present; 3 is the first gap.
- `nums = [-4, 0, 6]` → `1`. No positive number below 6 is present, so 1 is already missing.
- `nums = [3, 1, 2, 2]` → `4`. 1, 2 and 3 are all there (the duplicate does not matter).
- `nums = [1]` → `2`.

## Key idea

With `n` numbers, the answer is always between 1 and `n + 1`: at best the array holds exactly 1, 2, ..., n and the answer is `n + 1`. So only values in `1..n` matter, and there is a natural place for each of them: value `v` belongs at index `v - 1`. Use the array itself as the "seen" table by swapping every useful value into its home slot. Afterwards, the first index `i` whose slot does not hold `i + 1` tells you that `i + 1` is missing.

## Approach

1. For each index `i`, repeat while `nums[i]` is in `1..n` and is not already in its home slot (`nums[nums[i] - 1] != nums[i]`):
   - swap `nums[i]` with `nums[nums[i] - 1]`.

   Values that are out of range, or duplicates whose home slot already holds the same value, are left where they are.
2. Scan again. The first index `i` with `nums[i] != i + 1` gives the answer `i + 1`.
3. If every slot is correct, return `n + 1`.

Each swap puts at least one value into its final home, and a value in its home is never moved again, so there are at most `n` swaps in total even though there is a loop inside a loop.

Simpler alternatives: sort the array and walk it (O(n log n) time), or put every value in a hash set and test 1, 2, 3, ... (O(n) time but O(n) extra space). Both are fine to mention first, but the interviewer is usually waiting for the in-place version.

## Complexity

- **Time:** O(n). The swaps total at most n, and the final scan is one pass.
- **Space:** O(1) extra. The array itself is the lookup table.

## Common mistakes

- Writing the loop condition as `nums[i] != i + 1` instead of `nums[nums[i] - 1] != nums[i]`. With duplicates such as `[1, 1]`, the first version swaps two equal values forever.
- Forgetting the range check, then indexing with a negative, zero or huge value.
- Advancing `i` after one swap. The value that arrives at index `i` may also need to move, so keep swapping (a `while`, not an `if`).
- Returning `n` instead of `n + 1` when every slot is filled correctly.
- In Python, `nums[i], nums[nums[i] - 1] = nums[nums[i] - 1], nums[i]` assigns `nums[i]` first and then uses its new value for the second index. Save the target index in a variable before swapping.

## Follow-up questions

- What if you may not modify the input? (Then O(1) space is out of reach in general; use a hash set or a bitmap of size n + 1.)
- Can you do it with sign marking instead of swaps? (Yes: first replace values outside `1..n` with `n + 1`, then for each value `v` in range make `nums[v - 1]` negative; the first positive slot gives the answer.)

## Related problems

- Missing Number: values are exactly 0..n with one missing, so a sum or XOR works.
- Find All Numbers Disappeared in an Array and Find the Duplicate Number: the same "value v lives at index v - 1" trick.
- [Sort Colors](/interview/problems/sort-colors/): another in-place rearrangement by swapping.

## Solutions

```python
class Solution:
    def firstMissingPositive(self, nums: List[int]) -> int:
        n = len(nums)
        for i in range(n):
            # Keep swapping until nums[i] is out of range or already at home.
            while 1 <= nums[i] <= n and nums[nums[i] - 1] != nums[i]:
                home = nums[i] - 1
                nums[i], nums[home] = nums[home], nums[i]
        for i in range(n):
            if nums[i] != i + 1:
                return i + 1
        return n + 1
```

```java
class Solution {
    public int firstMissingPositive(int[] nums) {
        int n = nums.length;
        for (int i = 0; i < n; i++) {
            // Keep swapping until nums[i] is out of range or already at home.
            while (nums[i] >= 1 && nums[i] <= n && nums[nums[i] - 1] != nums[i]) {
                int home = nums[i] - 1;
                int tmp = nums[home];
                nums[home] = nums[i];
                nums[i] = tmp;
            }
        }
        for (int i = 0; i < n; i++) {
            if (nums[i] != i + 1) {
                return i + 1;
            }
        }
        return n + 1;
    }
}
```

```cpp
class Solution {
public:
    int firstMissingPositive(vector<int>& nums) {
        int n = nums.size();
        for (int i = 0; i < n; i++) {
            // Keep swapping until nums[i] is out of range or already at home.
            while (nums[i] >= 1 && nums[i] <= n && nums[nums[i] - 1] != nums[i]) {
                swap(nums[i], nums[nums[i] - 1]);
            }
        }
        for (int i = 0; i < n; i++) {
            if (nums[i] != i + 1) {
                return i + 1;
            }
        }
        return n + 1;
    }
};
```

```javascript
/**
 * @param {number[]} nums
 * @return {number}
 */
var firstMissingPositive = function (nums) {
  const n = nums.length;
  for (let i = 0; i < n; i++) {
    // Keep swapping until nums[i] is out of range or already at home.
    while (nums[i] >= 1 && nums[i] <= n && nums[nums[i] - 1] !== nums[i]) {
      const home = nums[i] - 1;
      [nums[i], nums[home]] = [nums[home], nums[i]];
    }
  }
  for (let i = 0; i < n; i++) {
    if (nums[i] !== i + 1) {
      return i + 1;
    }
  }
  return n + 1;
};
```

```go
func firstMissingPositive(nums []int) int {
	n := len(nums)
	for i := 0; i < n; i++ {
		// Keep swapping until nums[i] is out of range or already at home.
		for nums[i] >= 1 && nums[i] <= n && nums[nums[i]-1] != nums[i] {
			home := nums[i] - 1
			nums[i], nums[home] = nums[home], nums[i]
		}
	}
	for i := 0; i < n; i++ {
		if nums[i] != i+1 {
			return i + 1
		}
	}
	return n + 1
}
```
