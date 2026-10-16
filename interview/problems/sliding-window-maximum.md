---
title: Sliding Window Maximum
leetcode: sliding-window-maximum
description: "Sliding Window Maximum explained: report the largest value in every window of size k in linear time with a monotonic deque, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given an array of integers `nums` and a window size `k`. Picture a window that covers `k` consecutive elements, starting at the left end of the array and moving one position to the right at a time until it touches the right end.

Return an array with the largest value inside the window at each of its positions, from left to right. For an array of length `n` there are `n - k + 1` windows, so the answer has that many entries.

`k` is always between 1 and the length of `nums`, and the array is never empty. Values can be negative.

## Examples

- `nums = [2, 5, 1, 3, 4, 0]`, `k = 3` → `[5, 5, 4, 4]`. The windows are `[2,5,1]`, `[5,1,3]`, `[1,3,4]` and `[3,4,0]`.
- `nums = [6, 4, 2]`, `k = 1` → `[6, 4, 2]`. Every window holds a single element, so each element is its own maximum.
- `nums = [-3, -1, -7, -2]`, `k = 4` → `[-1]`. There is only one window: the whole array.
- `nums = [1, 3, 3, 2]`, `k = 2` → `[3, 3, 3]`. Duplicates are fine; a value can be the maximum of several windows.

## Key idea

When a new number enters the window, every older number that is *smaller* than it can never be a maximum again: the new number is bigger and will stay in the window longer than they will. So we can throw those older numbers away for good.

If we keep only the survivors in a double-ended queue (deque), they are always in decreasing order from front to back. The front is the largest value in the window, which is exactly the answer. This structure is called a *monotonic deque*. We store indexes rather than values so we can tell when the front has slid out of the window.

## Approach

1. Create an empty deque `dq` that will hold indexes, and an empty result list.
2. For each index `i` from left to right:
   1. If the index at the front of `dq` is `i - k` (or smaller), it has just left the window. Remove it from the front.
   2. While the value at the back of `dq` is less than or equal to `nums[i]`, remove it from the back. Those elements are dominated by `nums[i]`.
   3. Push `i` onto the back.
   4. Once the first full window is formed (`i >= k - 1`), append `nums[dq.front]` to the result.
3. Return the result.

The brute force scans all `k` elements of every window, which costs O(n · k) and is too slow when both `n` and `k` are large (for example `n = 100000`, `k = 50000`). A max-heap brings it to O(n log n), but the deque is simpler to reason about and linear.

## Complexity

- **Time:** O(n). Each index is pushed onto the deque once and popped at most once, so all the inner `while` loops together do at most `n` pops.
- **Space:** O(k) for the deque (it never holds more than `k` indexes), plus the output array.

## Common mistakes

- Storing values instead of indexes in the deque. With values you cannot tell whether the front has already slid out of the window, especially when there are duplicates.
- Popping from the back only when the value is strictly smaller. That also works, but it keeps duplicate values around; either `<` or `<=` is correct as long as you are consistent.
- Starting to record answers too early: the first answer belongs to the window ending at index `k - 1`.
- Using a plain array with `shift()` (JavaScript) or `pop(0)` (Python) for the front removal, which is O(n) per call and makes the whole thing quadratic. Use a real deque or a moving head pointer.

## Follow-up questions

- How would you solve it with a heap? (Push `(value, index)` pairs and lazily discard tops whose index is outside the window; O(n log n).)
- Can you return the minimum instead? (Same deque, with the comparison flipped.)

## Related problems

- Min Stack
- Longest Continuous Subarray With Absolute Diff Less Than or Equal to Limit
- Shortest Subarray with Sum at Least K

## Solutions

```python
class Solution:
    def maxSlidingWindow(self, nums: List[int], k: int) -> List[int]:
        dq = deque()  # indexes; their values decrease from front to back
        result = []
        for i, x in enumerate(nums):
            if dq and dq[0] <= i - k:
                dq.popleft()  # the front slid out of the window
            while dq and nums[dq[-1]] <= x:
                dq.pop()  # dominated by x, can never be a maximum again
            dq.append(i)
            if i >= k - 1:
                result.append(nums[dq[0]])
        return result
```

```java
class Solution {
    public int[] maxSlidingWindow(int[] nums, int k) {
        int n = nums.length;
        int[] result = new int[n - k + 1];
        Deque<Integer> dq = new ArrayDeque<>(); // indexes; values decrease from front to back
        for (int i = 0; i < n; i++) {
            if (!dq.isEmpty() && dq.peekFirst() <= i - k) {
                dq.pollFirst(); // the front slid out of the window
            }
            while (!dq.isEmpty() && nums[dq.peekLast()] <= nums[i]) {
                dq.pollLast(); // dominated by nums[i]
            }
            dq.offerLast(i);
            if (i >= k - 1) {
                result[i - k + 1] = nums[dq.peekFirst()];
            }
        }
        return result;
    }
}
```

```cpp
class Solution {
public:
    vector<int> maxSlidingWindow(vector<int>& nums, int k) {
        deque<int> dq;  // indexes; values decrease from front to back
        vector<int> result;
        for (int i = 0; i < (int)nums.size(); i++) {
            if (!dq.empty() && dq.front() <= i - k) {
                dq.pop_front();  // the front slid out of the window
            }
            while (!dq.empty() && nums[dq.back()] <= nums[i]) {
                dq.pop_back();  // dominated by nums[i]
            }
            dq.push_back(i);
            if (i >= k - 1) {
                result.push_back(nums[dq.front()]);
            }
        }
        return result;
    }
};
```

```javascript
/**
 * @param {number[]} nums
 * @param {number} k
 * @return {number[]}
 */
var maxSlidingWindow = function (nums, k) {
  // An array plus a head pointer acts as a deque without O(n) shift() calls.
  const dq = new Array(nums.length);
  let head = 0, tail = 0; // dq[head..tail-1] holds indexes, values decreasing
  const result = [];
  for (let i = 0; i < nums.length; i++) {
    if (head < tail && dq[head] <= i - k) {
      head++; // the front slid out of the window
    }
    while (head < tail && nums[dq[tail - 1]] <= nums[i]) {
      tail--; // dominated by nums[i]
    }
    dq[tail++] = i;
    if (i >= k - 1) {
      result.push(nums[dq[head]]);
    }
  }
  return result;
};
```

```go
func maxSlidingWindow(nums []int, k int) []int {
	dq := []int{} // indexes; values decrease from front to back
	result := make([]int, 0, len(nums)-k+1)
	for i, x := range nums {
		if len(dq) > 0 && dq[0] <= i-k {
			dq = dq[1:] // the front slid out of the window
		}
		for len(dq) > 0 && nums[dq[len(dq)-1]] <= x {
			dq = dq[:len(dq)-1] // dominated by x
		}
		dq = append(dq, i)
		if i >= k-1 {
			result = append(result, nums[dq[0]])
		}
	}
	return result
}
```
