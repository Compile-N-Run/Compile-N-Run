---
title: Jump Game
leetcode: jump-game
description: "Jump Game explained: decide whether you can hop from the first index of an array to the last when each value is your maximum jump, with a greedy farthest-reach scan, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given a non-empty array of non-negative integers `nums`. You start standing on index `0`. The value `nums[i]` is the *longest* jump you may take from index `i`: from there you can move forward by any number of steps from `1` up to `nums[i]` (a value of `0` means you are stuck on that square).

Return `true` if you can reach the last index, and `false` otherwise. An array with a single element is already solved, because you start on the last index.

## Examples

- `nums = [2, 0, 1, 0]` → `true`. Jump 2 steps from index 0 to index 2, then 1 step to index 3.
- `nums = [1, 1, 0, 2]` → `false`. You can only ever get to index 2, whose value is `0`, so index 3 is out of reach.
- `nums = [3, 0, 0, 0, 5]` → `false`. From index 0 you can land on 1, 2 or 3, but all of them hold `0`.
- `nums = [0]` → `true`. You already stand on the last index.

## Key idea

You do not need to know *which* jumps to take, only how far you could possibly get. Walk through the array once and keep `farthest`, the largest index reachable so far. Every index up to `farthest` is reachable too, because you could always choose a shorter jump. If you ever step onto an index beyond `farthest`, there is a gap you cannot cross, so the answer is `false`. If `farthest` reaches the last index, the answer is `true`.

## Approach

1. Set `farthest = 0`.
2. For each index `i` from left to right:
   1. If `i > farthest`, index `i` cannot be reached. Return `false`.
   2. Update `farthest = max(farthest, i + nums[i])`.
   3. If `farthest >= n - 1`, return `true`.
3. (The loop always returns, but returning `true` after it is harmless.)

A brute-force search tries every jump length from every index, which branches exponentially. Dynamic programming that marks each index reachable from earlier ones fixes that but is still O(n²). The greedy scan is O(n).

## Complexity

- **Time:** O(n). One pass over the array.
- **Space:** O(1). Only the `farthest` variable.

## Common mistakes

- Always taking the biggest jump. In `[2, 3, 0, 0, 1]` the 2-step jump lands on a `0` and gets stuck, while the 1-step jump reaches the `3`, which can reach the end. Track the farthest reach instead of simulating one path.
- Checking `nums[i] == 0` and returning `false` right away. A zero is only a problem if nothing before it can jump past it.
- Forgetting the single-element case, which is `true` even when the value is `0`.

## Follow-up questions

- What is the *minimum* number of jumps to reach the end? (Jump Game II: a greedy BFS over "levels" of reach.)
- What if you can jump both left and right, and must land on a zero? (Jump Game III: a BFS or DFS over indexes.)

## Related problems

- Jump Game II
- Jump Game III
- Gas Station (another greedy single pass)

## Solutions

```python
class Solution:
    def canJump(self, nums: List[int]) -> bool:
        farthest = 0
        for i, step in enumerate(nums):
            if i > farthest:
                return False  # a gap we cannot cross
            farthest = max(farthest, i + step)
            if farthest >= len(nums) - 1:
                return True
        return True
```

```java
class Solution {
    public boolean canJump(int[] nums) {
        int farthest = 0;
        for (int i = 0; i < nums.length; i++) {
            if (i > farthest) {
                return false; // a gap we cannot cross
            }
            farthest = Math.max(farthest, i + nums[i]);
            if (farthest >= nums.length - 1) {
                return true;
            }
        }
        return true;
    }
}
```

```cpp
class Solution {
public:
    bool canJump(vector<int>& nums) {
        int n = nums.size(), farthest = 0;
        for (int i = 0; i < n; i++) {
            if (i > farthest) {
                return false;  // a gap we cannot cross
            }
            farthest = max(farthest, i + nums[i]);
            if (farthest >= n - 1) {
                return true;
            }
        }
        return true;
    }
};
```

```javascript
/**
 * @param {number[]} nums
 * @return {boolean}
 */
var canJump = function (nums) {
  let farthest = 0;
  for (let i = 0; i < nums.length; i++) {
    if (i > farthest) {
      return false; // a gap we cannot cross
    }
    farthest = Math.max(farthest, i + nums[i]);
    if (farthest >= nums.length - 1) {
      return true;
    }
  }
  return true;
};
```

```go
func canJump(nums []int) bool {
	farthest := 0
	for i, step := range nums {
		if i > farthest {
			return false // a gap we cannot cross
		}
		farthest = max(farthest, i+step)
		if farthest >= len(nums)-1 {
			return true
		}
	}
	return true
}
```
