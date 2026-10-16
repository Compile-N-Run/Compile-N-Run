---
title: Subarray Product Less Than K
leetcode: subarray-product-less-than-k
description: "Subarray Product Less Than K explained: count contiguous subarrays whose product stays below k with a sliding window that shrinks from the left, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given an array `nums` of positive integers (each between 1 and 1000) and a non-negative integer `k` (up to one million). Count how many contiguous, non-empty subarrays have a product of all their elements that is **strictly less than** `k`, and return that count.

Because every element is at least 1, the product of a subarray never shrinks when the subarray grows. That guarantee is what makes the fast solution work.

## Examples

- `nums = [2, 3, 4]`, `k = 10` → `4`. The subarrays `[2]`, `[3]`, `[4]` and `[2, 3]` (product 6) qualify; `[3, 4]` has product 12 and `[2, 3, 4]` has product 24.
- `nums = [1, 1, 1]`, `k = 2` → `6`. Every one of the six subarrays has product 1.
- `nums = [5, 5]`, `k = 5` → `0`. The product must be strictly below `k`, and 5 is not below 5.
- `nums = [3]`, `k = 0` → `0`. No product of positive numbers can be below 0 (or below 1).

## Key idea

Fix the right end of a subarray at position `right`. Because elements are at least 1, extending the subarray to the left can only make the product larger, so the valid subarrays ending at `right` are exactly those that start at or after some boundary `left`. Keep that boundary with a **sliding window**: when the new element pushes the product to `k` or above, drop elements from the left until it is below `k` again. Every subarray that ends at `right` and starts inside the window is valid, and there are `right - left + 1` of them.

## Approach

1. If `k <= 1`, return `0`: no product of positive integers is below 1.
2. Keep `left = 0`, `product = 1` and `count = 0`.
3. For each index `right`:
   1. Multiply `product` by `nums[right]`.
   2. While `product >= k`, divide `product` by `nums[left]` and move `left` one step right. A single element can be `k` or more on its own (say 1000 with `k = 10`); then the window empties, `left` becomes `right + 1` and the product is back to 1, so the next step adds 0.
   3. Add `right - left + 1` to `count`: the subarrays `[left..right]`, `[left+1..right]`, …, `[right..right]`.
4. Return `count`.

The brute force tries every start and extends to the right until the product reaches `k`. That is O(n²) in the worst case (think of an array of all 1s), while the window moves each pointer at most n times.

## Complexity

- **Time:** O(n). `right` advances n times and `left` never moves backwards, so the inner loop runs at most n times in total.
- **Space:** O(1): a few counters, no matter how long the array is.

## Common mistakes

- Forgetting the `k <= 1` guard. With `k = 1` the inner `while` never makes the product smaller than 1 and `left` runs past `right` on every step, or the code divides by elements that are no longer in the window.
- Using `product > k` instead of `product >= k` in the shrinking loop, which counts subarrays whose product equals `k`.
- Counting `1` per step instead of `right - left + 1`, which only counts subarrays of length one.
- Overflowing a 32-bit integer when the product is multiplied before the window shrinks. Within the constraints the product stays below `k * 1000`, which fits, but using a 64-bit type costs nothing.
- Applying the same window idea to arrays with zeros or negatives, where "extending never decreases the product" no longer holds.

## Follow-up questions

- What changes if elements can be zero? (Any subarray containing a zero has product 0, which is below any positive `k`; handle those stretches separately.)
- How would you count subarrays with *sum* below `k` for positive numbers? (The same window; see also Subarray Sum Equals K for the prefix-sum version when numbers can be negative.)
- Can you count subarrays with product *at most* `k` or in a range `[lo, hi]`? (Count "less than hi + 1" minus "less than lo".)

## Related problems

- [Subarray Sum Equals K](/interview/problems/subarray-sum-equals-k/)
- [Minimum Window Substring](/interview/problems/minimum-window-substring/)
- [Longest Substring Without Repeating Characters](/interview/problems/longest-substring-without-repeating-characters/)
- Minimum Size Subarray Sum

## Solutions

```python
class Solution:
    def numSubarrayProductLessThanK(self, nums: List[int], k: int) -> int:
        if k <= 1:
            return 0
        count, product, left = 0, 1, 0
        for right, x in enumerate(nums):
            product *= x
            while product >= k:  # shrink from the left until the window is valid again
                product //= nums[left]
                left += 1
            count += right - left + 1  # every subarray ending at right that starts in the window
        return count
```

```java
class Solution {
    public int numSubarrayProductLessThanK(int[] nums, int k) {
        if (k <= 1) {
            return 0;
        }
        int count = 0, left = 0;
        long product = 1;
        for (int right = 0; right < nums.length; right++) {
            product *= nums[right];
            while (product >= k) { // shrink from the left until the window is valid again
                product /= nums[left++];
            }
            count += right - left + 1; // every subarray ending at right that starts in the window
        }
        return count;
    }
}
```

```cpp
class Solution {
public:
    int numSubarrayProductLessThanK(vector<int>& nums, int k) {
        if (k <= 1) return 0;
        int count = 0, left = 0;
        long long product = 1;
        for (int right = 0; right < (int)nums.size(); right++) {
            product *= nums[right];
            while (product >= k) {  // shrink from the left until the window is valid again
                product /= nums[left++];
            }
            count += right - left + 1;  // every subarray ending at right that starts in the window
        }
        return count;
    }
};
```

```javascript
/**
 * @param {number[]} nums
 * @param {number} k
 * @return {number}
 */
var numSubarrayProductLessThanK = function (nums, k) {
  if (k <= 1) return 0;
  let count = 0;
  let product = 1;
  let left = 0;
  for (let right = 0; right < nums.length; right++) {
    product *= nums[right];
    while (product >= k) {
      // shrink from the left until the window is valid again
      product /= nums[left++];
    }
    count += right - left + 1; // every subarray ending at right that starts in the window
  }
  return count;
};
```

```go
func numSubarrayProductLessThanK(nums []int, k int) int {
	if k <= 1 {
		return 0
	}
	count, product, left := 0, 1, 0
	for right, x := range nums {
		product *= x
		for product >= k { // shrink from the left until the window is valid again
			product /= nums[left]
			left++
		}
		count += right - left + 1 // every subarray ending at right that starts in the window
	}
	return count
}
```
