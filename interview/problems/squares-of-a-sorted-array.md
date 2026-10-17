---
title: Squares of a Sorted Array
leetcode: squares-of-a-sorted-array
description: "Squares of a Sorted Array explained: square every number of a sorted array and return the squares in sorted order in one pass with two pointers that fill the result from the back, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given an array `nums` of integers sorted in non-decreasing order. Numbers may be negative, zero or positive, and values may repeat. Return a new array that holds the **square of every number**, also sorted in non-decreasing order.

The array has at least one element. The follow-up LeetCode asks for is an O(n) solution, since sorting the squares would take O(n log n).

## Examples

- `[-4, -1, 0, 3, 10]` → `[0, 1, 9, 16, 100]`. Squaring reorders the values: `-4` becomes `16`, which now sits after `9`.
- `[-7, -3, 2, 3, 11]` → `[4, 9, 9, 49, 121]`. `-3` and `3` both square to `9`.
- `[1, 2, 3]` → `[1, 4, 9]`. All positive, so the order does not change.
- `[-3, -2, -1]` → `[1, 4, 9]`. All negative, so the order reverses.
- `[0]` → `[0]`.

## Key idea

Squaring destroys the order only because negatives flip: a large negative number has a large square. But the input is sorted, so the biggest squares can only be at the **two ends** of the array: the most negative number on the left or the most positive number on the right. Compare the two ends, take the bigger square, and move that end inwards. Repeating this produces the squares from largest to smallest, so write them into the result **from the back**.

## Approach

1. Create a result array of the same length and a write position `pos = n - 1`.
2. Keep two pointers, `left = 0` and `right = n - 1`.
3. While `left <= right`:
   1. Compare `|nums[left]|` and `|nums[right]|` (or compare the squares).
   2. If the left one is larger, write `nums[left]²` at `pos` and move `left` right; otherwise write `nums[right]²` at `pos` and move `right` left.
   3. Decrease `pos`.
4. Return the result.

The obvious alternative squares every element and sorts, which is O(n log n) and does not use the fact that the input is already sorted.

## Complexity

- **Time:** O(n). Each step places one square and moves one pointer.
- **Space:** O(n) for the output; nothing else besides a few indices.

## Common mistakes

- Filling the result from the front. The two ends give you the *largest* square first, so you must write from the back (or reverse at the end).
- Using `left < right` as the loop condition and forgetting the last element when the pointers meet.
- Comparing the raw values instead of their absolute values or squares: `-7 < 2` but `49 > 4`.
- Writing the squares back into `nums` while still reading from it; use a separate result array.

## Follow-up questions

- *Can you do it without a second array?* Not in place in one pass, since the result must grow from the back while you still need both ends of the input. You can, however, find the split point between negatives and non-negatives and merge the two halves outwards, which is the same O(n) idea.
- *What if the array were not sorted?* Then no structure helps: square and sort, O(n log n).

## Related problems

- [Merge Sorted Array](/interview/problems/merge-sorted-array/)
- [Sort Colors](/interview/problems/sort-colors/)
- Sort Transformed Array (apply a quadratic to a sorted array, the generalisation of this problem)

## Solutions

```python
class Solution:
    def sortedSquares(self, nums: List[int]) -> List[int]:
        n = len(nums)
        result = [0] * n
        left, right = 0, n - 1
        for pos in range(n - 1, -1, -1):  # fill from the back: the largest square is at one of the ends
            if abs(nums[left]) > abs(nums[right]):
                result[pos] = nums[left] * nums[left]
                left += 1
            else:
                result[pos] = nums[right] * nums[right]
                right -= 1
        return result
```

```java
class Solution {
    public int[] sortedSquares(int[] nums) {
        int n = nums.length;
        int[] result = new int[n];
        int left = 0, right = n - 1;
        for (int pos = n - 1; pos >= 0; pos--) { // fill from the back: the largest square is at one of the ends
            if (Math.abs(nums[left]) > Math.abs(nums[right])) {
                result[pos] = nums[left] * nums[left];
                left++;
            } else {
                result[pos] = nums[right] * nums[right];
                right--;
            }
        }
        return result;
    }
}
```

```cpp
class Solution {
public:
    vector<int> sortedSquares(vector<int>& nums) {
        int n = nums.size();
        vector<int> result(n);
        int left = 0, right = n - 1;
        for (int pos = n - 1; pos >= 0; pos--) {  // fill from the back: the largest square is at one of the ends
            if (abs(nums[left]) > abs(nums[right])) {
                result[pos] = nums[left] * nums[left];
                left++;
            } else {
                result[pos] = nums[right] * nums[right];
                right--;
            }
        }
        return result;
    }
};
```

```javascript
/**
 * @param {number[]} nums
 * @return {number[]}
 */
var sortedSquares = function (nums) {
  const n = nums.length;
  const result = new Array(n);
  let left = 0;
  let right = n - 1;
  for (let pos = n - 1; pos >= 0; pos--) {
    // fill from the back: the largest square is at one of the ends
    if (Math.abs(nums[left]) > Math.abs(nums[right])) {
      result[pos] = nums[left] * nums[left];
      left++;
    } else {
      result[pos] = nums[right] * nums[right];
      right--;
    }
  }
  return result;
};
```

```go
func sortedSquares(nums []int) []int {
	n := len(nums)
	result := make([]int, n)
	left, right := 0, n-1
	for pos := n - 1; pos >= 0; pos-- { // fill from the back: the largest square is at one of the ends
		if abs(nums[left]) > abs(nums[right]) {
			result[pos] = nums[left] * nums[left]
			left++
		} else {
			result[pos] = nums[right] * nums[right]
			right--
		}
	}
	return result
}

func abs(x int) int {
	if x < 0 {
		return -x
	}
	return x
}
```
