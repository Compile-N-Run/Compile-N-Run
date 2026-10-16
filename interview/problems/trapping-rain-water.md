---
title: Trapping Rain Water
leetcode: trapping-rain-water
description: "Trapping Rain Water explained: compute how much water collects between bars of different heights with two pointers in O(n) time and O(1) space, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given an array `height` of non-negative integers. Each value is the height of a bar of width 1, and the bars stand side by side with no gaps. After it rains, water settles in the dips between taller bars.

Return the total amount of water (in unit squares) that stays trapped. Water can spill off the left and right ends, so nothing is held past the outermost bars.

The array has at least one element.

## Examples

- `height = [3, 0, 2, 0, 4]` → `7`. Above the bars of height 0, 2 and 0 the water rises to level 3 (the lower of the walls 3 and 4), holding `3 + 1 + 3 = 7`.
- `height = [1, 2, 3, 4]` → `0`. The bars only go up, so every drop runs off the left side.
- `height = [5, 1, 1, 5, 2, 4]` → `10`. The pool between the two 5s holds `4 + 4 = 8`, and the dip at height 2 holds `2` more because its walls are 5 and 4.
- `height = [6]` → `0`. A single bar cannot hold water.

## Key idea

Look at one position `i`. The water above it rises to the height of the *shorter* of two walls: the tallest bar to its left and the tallest bar to its right. So it holds `min(leftMax, rightMax) - height[i]` units (never negative, because the maxima include `height[i]` itself).

With two pointers we do not even need both maxima for every position. Keep `left` and `right` pointers moving inward and track `leftMax` and `rightMax`. If `leftMax` is smaller than `rightMax`, the water at `left` is limited by `leftMax` for sure: whatever lies between the pointers, the right side already has a wall at least as tall as `rightMax`. So we can settle position `left` and move on. The same reasoning works mirrored for the right side.

## Approach

1. Set `left = 0`, `right = n - 1`, `leftMax = rightMax = 0`, `water = 0`.
2. While `left < right`:
   1. Update `leftMax = max(leftMax, height[left])` and `rightMax = max(rightMax, height[right])`.
   2. If `leftMax < rightMax`, add `leftMax - height[left]` to `water` and move `left` one step right.
   3. Otherwise add `rightMax - height[right]` to `water` and move `right` one step left.
3. Return `water`.

A simpler O(n)-space version first builds two arrays: the running maximum from the left and from the right, then sums `min(leftMax[i], rightMax[i]) - height[i]`. The brute force recomputes both maxima for every position by scanning outward, which takes O(n²) time.

## Complexity

- **Time:** O(n). Each step moves one pointer inward, so there are at most `n - 1` steps.
- **Space:** O(1). Only a few counters are used.

## Common mistakes

- Using the taller wall instead of the shorter one: water spills over the lower side.
- Adding `min(leftMax, rightMax) - height[i]` with maxima that do not include `height[i]`, which can go negative. Update the maximum before adding.
- Counting water above the first or last bar; it always runs off the edge.

## Follow-up questions

- *Can you solve it with a stack?* A monotonic decreasing stack of indexes fills the water layer by layer each time a taller bar closes a basin; it is also O(n).
- *What about a 2D height map?* Trapping Rain Water II uses a min-heap that grows inward from the border.

## Related problems

- Container With Most Water: two walls and a two-pointer scan, but only the single best pair counts.
- Trapping Rain Water II: the same question on a grid.

## Solutions

```python
class Solution:
    def trap(self, height: List[int]) -> int:
        left, right = 0, len(height) - 1
        left_max = right_max = water = 0
        while left < right:
            left_max = max(left_max, height[left])
            right_max = max(right_max, height[right])
            if left_max < right_max:
                water += left_max - height[left]  # left wall decides the level here
                left += 1
            else:
                water += right_max - height[right]
                right -= 1
        return water
```

```java
class Solution {
    public int trap(int[] height) {
        int left = 0, right = height.length - 1;
        int leftMax = 0, rightMax = 0, water = 0;
        while (left < right) {
            leftMax = Math.max(leftMax, height[left]);
            rightMax = Math.max(rightMax, height[right]);
            if (leftMax < rightMax) {
                water += leftMax - height[left]; // left wall decides the level here
                left++;
            } else {
                water += rightMax - height[right];
                right--;
            }
        }
        return water;
    }
}
```

```cpp
class Solution {
public:
    int trap(vector<int>& height) {
        int left = 0, right = (int)height.size() - 1;
        int leftMax = 0, rightMax = 0, water = 0;
        while (left < right) {
            leftMax = max(leftMax, height[left]);
            rightMax = max(rightMax, height[right]);
            if (leftMax < rightMax) {
                water += leftMax - height[left];  // left wall decides the level here
                left++;
            } else {
                water += rightMax - height[right];
                right--;
            }
        }
        return water;
    }
};
```

```javascript
/**
 * @param {number[]} height
 * @return {number}
 */
var trap = function (height) {
  let left = 0, right = height.length - 1;
  let leftMax = 0, rightMax = 0, water = 0;
  while (left < right) {
    leftMax = Math.max(leftMax, height[left]);
    rightMax = Math.max(rightMax, height[right]);
    if (leftMax < rightMax) {
      water += leftMax - height[left]; // left wall decides the level here
      left++;
    } else {
      water += rightMax - height[right];
      right--;
    }
  }
  return water;
};
```

```go
func trap(height []int) int {
	left, right := 0, len(height)-1
	leftMax, rightMax, water := 0, 0, 0
	for left < right {
		leftMax = max(leftMax, height[left])
		rightMax = max(rightMax, height[right])
		if leftMax < rightMax {
			water += leftMax - height[left] // left wall decides the level here
			left++
		} else {
			water += rightMax - height[right]
			right--
		}
	}
	return water
}
```
