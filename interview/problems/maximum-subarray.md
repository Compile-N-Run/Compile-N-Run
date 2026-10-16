---
title: Maximum Subarray
leetcode: maximum-subarray
description: "Maximum Subarray explained: find the largest sum of any contiguous, non-empty run of an integer array with Kadane's algorithm in one pass, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given an array of integers `nums`, which may contain negative numbers. A *subarray* is a contiguous, non-empty run of elements, such as `nums[2..5]`.

Return the largest sum that any subarray can have. You only return the sum, not the subarray itself.

The array has at least one element, so the answer always exists. When every number is negative, the answer is the largest single element, because the subarray may not be empty.

## Examples

- `nums = [2, -5, 3, -1, 4, -6, 1]` → `6`, from the subarray `[3, -1, 4]`.
- `nums = [-4, -2, -7]` → `-2`. All values are negative, so the best is the single element `-2`.
- `nums = [1, 2, 3]` → `6`. With no negatives, the whole array is best.
- `nums = [7]` → `7`.

## Key idea

Walk through the array and, at each position, ask: what is the best sum of a subarray that *ends exactly here*? There are only two choices: extend the best subarray ending at the previous position, or start fresh with the current element alone. Starting fresh is better precisely when the previous best is negative, because a negative prefix only drags the sum down.

So keep a running value `current = max(x, current + x)`. The answer is the largest `current` seen anywhere. This is known as *Kadane's algorithm*.

## Approach

1. Set `current = best = nums[0]`.
2. For each following element `x`:
   1. Set `current = max(x, current + x)`: either extend the previous run or restart at `x`.
   2. Set `best = max(best, current)`.
3. Return `best`.

The brute force sums every pair of start and end positions, which is O(n²) even with running sums. Kadane's algorithm needs a single pass.

## Complexity

- **Time:** O(n). Each element is processed once with constant work.
- **Space:** O(1). Only two running values are kept.

## Common mistakes

- Initialising `best` (or `current`) to `0`: for an all-negative array like `[-4, -2, -7]` this returns `0`, an empty subarray, which is not allowed. Start from `nums[0]`.
- Resetting `current` to `0` *before* updating `best`, which loses the right answer for all-negative input.
- Confusing subarray with subsequence. Elements must be contiguous, so you cannot just add up all the positive numbers.

## Follow-up questions

- *Return the subarray itself.* Remember the index where the current run started and copy it into the answer each time `best` improves.
- *Solve it with divide and conquer.* Split the array in half; the best subarray lies entirely in the left half, entirely in the right half, or crosses the middle. This runs in O(n log n), so it is slower but a common follow-up.
- *What if the array is circular?* Maximum Sum Circular Subarray also considers the total minus the minimum subarray.

## Related problems

- Maximum Product Subarray: the same idea, but you must also track the smallest product because two negatives make a positive.
- Best Time to Buy and Sell Stock: Kadane's algorithm on the day-to-day price differences.

## Solutions

```python
class Solution:
    def maxSubArray(self, nums: List[int]) -> int:
        current = best = nums[0]
        for x in nums[1:]:
            current = max(x, current + x)  # extend the run or start over at x
            best = max(best, current)
        return best
```

```java
class Solution {
    public int maxSubArray(int[] nums) {
        int current = nums[0], best = nums[0];
        for (int i = 1; i < nums.length; i++) {
            current = Math.max(nums[i], current + nums[i]); // extend the run or start over
            best = Math.max(best, current);
        }
        return best;
    }
}
```

```cpp
class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        int current = nums[0], best = nums[0];
        for (size_t i = 1; i < nums.size(); i++) {
            current = max(nums[i], current + nums[i]);  // extend the run or start over
            best = max(best, current);
        }
        return best;
    }
};
```

```javascript
/**
 * @param {number[]} nums
 * @return {number}
 */
var maxSubArray = function (nums) {
  let current = nums[0], best = nums[0];
  for (let i = 1; i < nums.length; i++) {
    current = Math.max(nums[i], current + nums[i]); // extend the run or start over
    best = Math.max(best, current);
  }
  return best;
};
```

```go
func maxSubArray(nums []int) int {
	current, best := nums[0], nums[0]
	for _, x := range nums[1:] {
		current = max(x, current+x) // extend the run or start over at x
		best = max(best, current)
	}
	return best
}
```
