---
title: Jump Game II
leetcode: jump-game-ii
description: "Jump Game II explained: count the fewest jumps needed to reach the end of an array by sweeping it in greedy layers like a breadth-first search, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given an array `nums` of non-negative integers. You start on index `0`, and from index `i` you may jump forward by any amount from `1` to `nums[i]`. It is guaranteed that the last index can be reached. Return the **minimum number of jumps** needed to get from index `0` to the last index.

The array has at least one element. If it has exactly one element you are already at the end, so the answer is `0`.

## Examples

- `[3, 1, 1, 4, 1, 1, 1]` → `2`. From index 0 jump to index 3 (value 4), and from there jump 3 steps to the last index 6.
- `[1, 1, 1, 1]` → `3`. Every position allows only a single step.
- `[4, 1, 1, 1, 1]` → `1`. The first value reaches the last index directly.
- `[1, 3, 0, 0, 2, 0, 1]` → `3`. Index 0 → 1, then 1 → 4 (the only way past the zeros), then 4 → 6.
- `[5]` → `0`. One element means no jump at all.

## Key idea

Group the indices by the fewest jumps needed to reach them. Every index you can reach in `j` jumps lies in one contiguous range, and the range for `j + 1` jumps starts right after it and ends at the **farthest** position any index of the current range can reach. So scan left to right, remember how far the current layer can throw you, and when you walk off the end of the current layer, count one jump and let the next layer run up to that farthest point. This is a breadth-first search in which each layer is just a pair of boundaries.

## Approach

1. Keep three numbers: `jumps` (layers completed so far), `layerEnd` (last index of the current layer, initially `0`) and `farthest` (the farthest index reachable from anything seen so far, initially `0`).
2. For each index `i` from `0` to `n - 2`:
   1. Update `farthest = max(farthest, i + nums[i])`.
   2. If `i == layerEnd`, the current layer is exhausted: add one to `jumps` and set `layerEnd = farthest`.
3. Return `jumps`.

The loop stops before the last index on purpose: once the last index belongs to the current layer, no further jump is counted. The guarantee that the end is reachable means `farthest` always moves past `layerEnd`, so the sweep never gets stuck.

A simpler dynamic programme computes `dp[i]` = fewest jumps to reach `i` by looking at every earlier index that can reach `i`. It is correct but O(n²), which is too slow for arrays of ten thousand elements. The greedy sweep is O(n) because each index is handled once.

## Complexity

- **Time:** O(n). A single pass over the array.
- **Space:** O(1). Only three counters.

## Common mistakes

- Looping through the last index as well, which counts an extra jump whenever `i == layerEnd` happens there.
- Jumping greedily to the position with the largest value instead of the position that reaches the farthest (`i + nums[i]`, not `nums[i]`).
- Returning `1` for a single-element array; no jump is needed.
- Updating `layerEnd` before checking `i == layerEnd`, which merges two layers into one and undercounts.

## Follow-up questions

- *What if the end might be unreachable?* Return `-1` when `i == layerEnd` and `farthest == i` (the layer cannot grow); that is the check from Jump Game.
- *Can you also return the path?* Record, for each layer, the index that produced `farthest`, then the sequence of those indices is one optimal route.
- *What if you may jump backwards too, or to any index with the same value?* The layer trick no longer works directly; use a real breadth-first search over indices (Jump Game III and IV).

## Related problems

- [Jump Game](/interview/problems/jump-game/)
- Jump Game III
- Jump Game IV
- Minimum Number of Refueling Stops

## Solutions

```python
class Solution:
    def jump(self, nums: List[int]) -> int:
        jumps = layer_end = farthest = 0
        for i in range(len(nums) - 1):
            farthest = max(farthest, i + nums[i])
            if i == layer_end:  # the current layer is used up: take a jump
                jumps += 1
                layer_end = farthest
        return jumps
```

```java
class Solution {
    public int jump(int[] nums) {
        int jumps = 0, layerEnd = 0, farthest = 0;
        for (int i = 0; i < nums.length - 1; i++) {
            farthest = Math.max(farthest, i + nums[i]);
            if (i == layerEnd) { // the current layer is used up: take a jump
                jumps++;
                layerEnd = farthest;
            }
        }
        return jumps;
    }
}
```

```cpp
class Solution {
public:
    int jump(vector<int>& nums) {
        int jumps = 0, layerEnd = 0, farthest = 0;
        for (int i = 0; i + 1 < (int)nums.size(); i++) {
            farthest = max(farthest, i + nums[i]);
            if (i == layerEnd) {  // the current layer is used up: take a jump
                jumps++;
                layerEnd = farthest;
            }
        }
        return jumps;
    }
};
```

```javascript
/**
 * @param {number[]} nums
 * @return {number}
 */
var jump = function (nums) {
  let jumps = 0;
  let layerEnd = 0;
  let farthest = 0;
  for (let i = 0; i < nums.length - 1; i++) {
    farthest = Math.max(farthest, i + nums[i]);
    if (i === layerEnd) {
      // the current layer is used up: take a jump
      jumps++;
      layerEnd = farthest;
    }
  }
  return jumps;
};
```

```go
func jump(nums []int) int {
	jumps, layerEnd, farthest := 0, 0, 0
	for i := 0; i < len(nums)-1; i++ {
		farthest = max(farthest, i+nums[i])
		if i == layerEnd { // the current layer is used up: take a jump
			jumps++
			layerEnd = farthest
		}
	}
	return jumps
}
```
