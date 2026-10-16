---
title: Maximum Product Subarray
leetcode: maximum-product-subarray
description: "Maximum Product Subarray explained: find the contiguous subarray with the largest product by tracking both the largest and the smallest product ending at each index so negatives can flip, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given an integer array `nums` with at least one element. Find the contiguous, non-empty subarray whose elements multiply to the largest value, and return that product.

Elements can be negative or zero. The answer is guaranteed to fit in a 32-bit signed integer, so you never need big numbers, but intermediate products of other subarrays may be large in languages that do not overflow silently; the algorithm below only ever multiplies values that are themselves valid subarray products.

## Examples

- `[2, -3, 4]` → `4`. The whole array gives `-24`; the best subarray is just `[4]`.
- `[-2, 3, -4]` → `24`. Two negatives cancel, so the whole array wins.
- `[2, -5, -2, -4, 3]` → `24`, from `[-2, -4, 3]`. Including `-5` as well would leave an odd number of negatives.
- `[0, -1]` → `0`. Both single elements are candidates and `0` beats `-1`.
- `[-5]` → `-5`. The subarray must be non-empty, so a lone negative is the answer.

## Key idea

For sums, keeping the best subarray ending at each index is enough (Kadane's algorithm). For products a sign flip changes everything: a very negative product becomes very positive after one more negative number. So keep **two** values for the subarray ending at the current index: the largest product and the smallest (most negative) product. When the next number is negative, the two swap roles. The answer is the largest value the "largest" track ever reaches.

A zero wipes both tracks to `0`, and the next number starts a fresh subarray because we always compare with the number on its own.

## Approach

1. Set `curMax`, `curMin` and `best` to `nums[0]`.
2. For every later element `x`:
   1. If `x` is negative, swap `curMax` and `curMin`, because multiplying by `x` turns the largest product into the smallest and the other way round.
   2. `curMax = max(x, curMax * x)` and `curMin = min(x, curMin * x)`. Taking `x` alone covers the case where the subarray should restart here (for example after a zero).
   3. `best = max(best, curMax)`.
3. Return `best`.

The brute force tries every start and end pair, O(n²) subarrays, which is too slow for arrays of twenty thousand elements. Another correct O(n) idea multiplies prefixes from the left and from the right and resets at zeros; it works because the best subarray always touches either the start or the end of a zero-free segment.

## Complexity

- **Time:** O(n). One pass with constant work per element.
- **Space:** O(1). Three running values.

## Common mistakes

- Tracking only the maximum product. `[-2, 3, -4]` then returns `3` instead of `24`.
- Starting `best` at `0` instead of `nums[0]`, which is wrong for arrays of only negatives such as `[-5]`.
- Forgetting the "`x` alone" option, so a zero makes every later product zero.
- Swapping after the update instead of before it: both `curMax` and `curMin` must be multiplied by the same `x` after they change roles.

## Follow-up questions

- *Can you return the subarray itself, not just the product?* Remember where the current max-track subarray started; it changes whenever `x` alone wins (and when a swap moves the min-track's start into the max track).
- *What if the values are floating point and can be between 0 and 1?* The same two-track idea works, since a number smaller than 1 shrinks a product the way a negative flips it.
- *Why does the prefix-and-suffix method work?* A zero-free segment's best product is either the whole segment or the segment with a prefix or suffix cut off at a negative, so scanning from both ends covers every candidate.

## Related problems

- [Maximum Subarray](/interview/problems/maximum-subarray/)
- [House Robber](/interview/problems/house-robber/)
- Maximum Product of Three Numbers
- Subarray Product Less Than K

## Solutions

```python
class Solution:
    def maxProduct(self, nums: List[int]) -> int:
        cur_max = cur_min = best = nums[0]
        for x in nums[1:]:
            if x < 0:  # a negative turns the largest product into the smallest
                cur_max, cur_min = cur_min, cur_max
            cur_max = max(x, cur_max * x)
            cur_min = min(x, cur_min * x)
            best = max(best, cur_max)
        return best
```

```java
class Solution {
    public int maxProduct(int[] nums) {
        int curMax = nums[0], curMin = nums[0], best = nums[0];
        for (int i = 1; i < nums.length; i++) {
            int x = nums[i];
            if (x < 0) { // a negative turns the largest product into the smallest
                int tmp = curMax;
                curMax = curMin;
                curMin = tmp;
            }
            curMax = Math.max(x, curMax * x);
            curMin = Math.min(x, curMin * x);
            best = Math.max(best, curMax);
        }
        return best;
    }
}
```

```cpp
class Solution {
public:
    int maxProduct(vector<int>& nums) {
        int curMax = nums[0], curMin = nums[0], best = nums[0];
        for (size_t i = 1; i < nums.size(); i++) {
            int x = nums[i];
            if (x < 0) {  // a negative turns the largest product into the smallest
                swap(curMax, curMin);
            }
            curMax = max(x, curMax * x);
            curMin = min(x, curMin * x);
            best = max(best, curMax);
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
var maxProduct = function (nums) {
  let curMax = nums[0];
  let curMin = nums[0];
  let best = nums[0];
  for (let i = 1; i < nums.length; i++) {
    const x = nums[i];
    if (x < 0) {
      // a negative turns the largest product into the smallest
      [curMax, curMin] = [curMin, curMax];
    }
    curMax = Math.max(x, curMax * x);
    curMin = Math.min(x, curMin * x);
    best = Math.max(best, curMax);
  }
  return best;
};
```

```go
func maxProduct(nums []int) int {
	curMax, curMin, best := nums[0], nums[0], nums[0]
	for _, x := range nums[1:] {
		if x < 0 { // a negative turns the largest product into the smallest
			curMax, curMin = curMin, curMax
		}
		curMax = max(x, curMax*x)
		curMin = min(x, curMin*x)
		best = max(best, curMax)
	}
	return best
}
```
