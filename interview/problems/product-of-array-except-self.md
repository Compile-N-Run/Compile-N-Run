---
title: Product of Array Except Self
leetcode: product-of-array-except-self
description: "Product of Array Except Self explained: for every position, multiply all the other numbers without using division, by combining prefix and suffix products in O(n) time, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given an integer array `nums` with at least two elements. Return a new array `answer` of the same length where `answer[i]` is the product of every element of `nums` **except** `nums[i]`.

Two rules make this interesting: you may not use division, and the solution must run in O(n) time. The values can be negative or zero, and the problem guarantees that the product of any prefix or suffix of `nums` fits in a 32-bit integer.

## Examples

- `nums = [2, 3, 4, 5]` → `[60, 40, 30, 24]`. For example, position 1 gets `2 * 4 * 5 = 40`.
- `nums = [3, 0, 4]` → `[0, 12, 0]`. Only the position holding the zero escapes it: `3 * 4 = 12`.
- `nums = [0, 5, 0]` → `[0, 0, 0]`. With two zeros, every product includes at least one of them.
- `nums = [-1, 2, -3]` → `[-6, 3, -2]`.

## Key idea

The product of "everything except position `i`" splits into two parts: the product of everything to the **left** of `i`, times the product of everything to the **right** of `i`. Both can be built incrementally. Walk left to right keeping a running product of what you have passed (a *prefix product*), then walk right to left doing the same from the other end (a *suffix product*). Multiplying the two for each position gives the answer, with no division needed.

## Approach

1. Create `answer` of length `n`.
2. Left pass: keep `left = 1`. For `i` from `0` to `n - 1`, set `answer[i] = left`, then `left *= nums[i]`. Now `answer[i]` holds the product of everything before `i` (1 for the first position, since nothing is there).
3. Right pass: keep `right = 1`. For `i` from `n - 1` down to `0`, do `answer[i] *= right`, then `right *= nums[i]`. This multiplies in the product of everything after `i`.
4. Return `answer`.

The brute force multiplies the other n - 1 numbers for each position, which is O(n²). The "multiply everything, then divide by `nums[i]`" trick is O(n) but is forbidden, and it breaks when the array contains a zero.

## Complexity

- **Time:** O(n). Two passes over the array.
- **Space:** O(1) extra besides the output array (the problem does not count the output). Two separate prefix and suffix arrays would also work, at O(n) extra space.

## Common mistakes

- Updating the running product *before* writing it, which includes `nums[i]` in its own answer. Write first, then multiply.
- Starting the running products at 0 instead of 1.
- Using division anyway: it is not allowed, and it fails on arrays with zeros (division by zero, or a wrong answer for the zero's own position).

## Follow-up questions

- Can you solve it with O(1) extra space, not counting the output? (Reuse the output array for the prefix products and keep the suffix product in one variable, as above.)
- What changes if products could overflow? (Use 64-bit integers, big integers, or work with logarithms if only signs and magnitudes matter.)

## Related problems

- Trapping Rain Water
- Maximum Product Subarray
- Subarray Product Less Than K

## Solutions

```python
class Solution:
    def productExceptSelf(self, nums: List[int]) -> List[int]:
        n = len(nums)
        answer = [1] * n
        left = 1
        for i in range(n):
            answer[i] = left  # product of everything before i
            left *= nums[i]
        right = 1
        for i in range(n - 1, -1, -1):
            answer[i] *= right  # times product of everything after i
            right *= nums[i]
        return answer
```

```java
class Solution {
    public int[] productExceptSelf(int[] nums) {
        int n = nums.length;
        int[] answer = new int[n];
        int left = 1;
        for (int i = 0; i < n; i++) {
            answer[i] = left; // product of everything before i
            left *= nums[i];
        }
        int right = 1;
        for (int i = n - 1; i >= 0; i--) {
            answer[i] *= right; // times product of everything after i
            right *= nums[i];
        }
        return answer;
    }
}
```

```cpp
class Solution {
public:
    vector<int> productExceptSelf(vector<int>& nums) {
        int n = nums.size();
        vector<int> answer(n);
        int left = 1;
        for (int i = 0; i < n; i++) {
            answer[i] = left;  // product of everything before i
            left *= nums[i];
        }
        int right = 1;
        for (int i = n - 1; i >= 0; i--) {
            answer[i] *= right;  // times product of everything after i
            right *= nums[i];
        }
        return answer;
    }
};
```

```javascript
/**
 * @param {number[]} nums
 * @return {number[]}
 */
var productExceptSelf = function (nums) {
  const n = nums.length;
  const answer = new Array(n);
  let left = 1;
  for (let i = 0; i < n; i++) {
    answer[i] = left; // product of everything before i
    left *= nums[i];
  }
  let right = 1;
  for (let i = n - 1; i >= 0; i--) {
    answer[i] *= right; // times product of everything after i
    right *= nums[i];
  }
  return answer;
};
```

```go
func productExceptSelf(nums []int) []int {
	n := len(nums)
	answer := make([]int, n)
	left := 1
	for i := 0; i < n; i++ {
		answer[i] = left // product of everything before i
		left *= nums[i]
	}
	right := 1
	for i := n - 1; i >= 0; i-- {
		answer[i] *= right // times product of everything after i
		right *= nums[i]
	}
	return answer
}
```
