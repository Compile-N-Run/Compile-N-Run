---
title: Max Consecutive Ones III
leetcode: max-consecutive-ones-iii
description: "Max Consecutive Ones III explained: find the longest run of 1s you can get by flipping at most k zeros, using a sliding window that never holds more than k zeros, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given a binary array `nums` (every element is `0` or `1`) and an integer `k >= 0`. You may change at most `k` of the zeros into ones. Return the length of the longest block of consecutive ones you can obtain.

The array is non-empty. `k` may be zero (no flips allowed) or larger than the number of zeros (then the whole array becomes ones).

## Examples

- `nums = [1, 1, 0, 0, 1, 1, 1, 0, 1]`, `k = 2` → `7`. Flip the two zeros at indices 2 and 3 to get `1 1 1 1 1 1 1 0 1`, a run of seven.
- `nums = [0, 0, 0]`, `k = 1` → `1`. One flipped zero is the whole run.
- `nums = [1, 1, 1]`, `k = 0` → `3`. No flips needed, and none allowed.
- `nums = [1, 0, 1, 0, 1]`, `k = 5` → `5`. More flips than zeros: the whole array becomes ones.

## Key idea

Rephrase the question: find the longest **window** (contiguous subarray) that contains at most `k` zeros. Every zero inside the window is one you flip, and ones cost nothing. That is a classic sliding-window problem: grow the window to the right one element at a time, and when it holds more than `k` zeros, shrink it from the left until it is valid again. The answer is the largest valid window size seen.

Why does the left pointer never need to move back? If a window `[left, right]` holds too many zeros, every window starting at `left` and ending at or after `right` holds too many as well, so `left` can only move forward.

## Approach

1. Keep two indices `left` and `right`, a count `zeros` of zeros inside `[left, right]`, and `best = 0`.
2. For each `right` from `0` to the end:
   1. If `nums[right] == 0`, increase `zeros`.
   2. While `zeros > k`: if `nums[left] == 0` decrease `zeros`; then move `left` one step right.
   3. The window is now valid; update `best = max(best, right - left + 1)`.
3. Return `best`.

A brute force checks every subarray and counts its zeros, which is O(n²) or O(n³). The sliding window looks at each element at most twice (once when `right` passes it, once when `left` does).

A neat variant never shrinks the window below its best size: when `zeros > k` it moves both pointers together, so the window length only grows, and the final `right - left` is the answer. It saves a `max` call but is harder to explain in an interview, so the version here keeps the explicit `best`.

## Complexity

- **Time:** O(n). Each index is advanced past by `right` once and by `left` at most once.
- **Space:** O(1). Two indices and two counters.

## Common mistakes

- Resetting the window to empty when it holds too many zeros. Only the leftmost element needs to go; a reset turns the algorithm quadratic or wrong.
- Using `if` instead of `while` when shrinking. With `k = 0` and two zeros in a row, one shrink step is not enough.
- Forgetting to decrease `zeros` when the element leaving the window is a zero.
- Returning the longest run of *existing* ones (the `k = 0` case) and ignoring the flips.

## Follow-up questions

- What if you may *delete* at most one element instead of flipping? (Longest Subarray of 1's After Deleting One Element: same window with `k = 1`, minus one for the deleted element.)
- The same template solves Longest Repeating Character Replacement, Fruit Into Baskets and Longest Substring with At Most K Distinct Characters: a window with a counter, shrink while the counter breaks the rule.
- How would you return the actual window, not just its length? (Record `left` whenever `best` improves.)

## Related problems

- [Longest Substring Without Repeating Characters](/interview/problems/longest-substring-without-repeating-characters/)
- [Minimum Window Substring](/interview/problems/minimum-window-substring/)
- Longest Repeating Character Replacement
- Max Consecutive Ones

## Solutions

```python
class Solution:
    def longestOnes(self, nums: List[int], k: int) -> int:
        best = left = zeros = 0
        for right, num in enumerate(nums):
            if num == 0:
                zeros += 1
            while zeros > k:  # too many zeros: drop elements from the left
                if nums[left] == 0:
                    zeros -= 1
                left += 1
            best = max(best, right - left + 1)
        return best
```

```java
class Solution {
    public int longestOnes(int[] nums, int k) {
        int best = 0, left = 0, zeros = 0;
        for (int right = 0; right < nums.length; right++) {
            if (nums[right] == 0) {
                zeros++;
            }
            while (zeros > k) { // too many zeros: drop elements from the left
                if (nums[left] == 0) {
                    zeros--;
                }
                left++;
            }
            best = Math.max(best, right - left + 1);
        }
        return best;
    }
}
```

```cpp
class Solution {
public:
    int longestOnes(vector<int>& nums, int k) {
        int best = 0, left = 0, zeros = 0;
        for (int right = 0; right < (int)nums.size(); right++) {
            if (nums[right] == 0) {
                zeros++;
            }
            while (zeros > k) {  // too many zeros: drop elements from the left
                if (nums[left] == 0) {
                    zeros--;
                }
                left++;
            }
            best = max(best, right - left + 1);
        }
        return best;
    }
};
```

```javascript
/**
 * @param {number[]} nums
 * @param {number} k
 * @return {number}
 */
var longestOnes = function (nums, k) {
  let best = 0;
  let left = 0;
  let zeros = 0;
  for (let right = 0; right < nums.length; right++) {
    if (nums[right] === 0) {
      zeros++;
    }
    while (zeros > k) {
      // too many zeros: drop elements from the left
      if (nums[left] === 0) {
        zeros--;
      }
      left++;
    }
    best = Math.max(best, right - left + 1);
  }
  return best;
};
```

```go
func longestOnes(nums []int, k int) int {
	best, left, zeros := 0, 0, 0
	for right, num := range nums {
		if num == 0 {
			zeros++
		}
		for zeros > k { // too many zeros: drop elements from the left
			if nums[left] == 0 {
				zeros--
			}
			left++
		}
		best = max(best, right-left+1)
	}
	return best
}
```
