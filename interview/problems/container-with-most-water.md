---
title: Container With Most Water
leetcode: container-with-most-water
description: "Container With Most Water explained: pick the two vertical lines that hold the most water by moving two pointers inward from both ends, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given an array `height` of non-negative integers. Picture a vertical line at every index `i`, rising from the ground to height `height[i]`.

Choose two of these lines. Together with the ground they form a container, and the water it holds is a rectangle: its width is the distance between the two indexes and its height is the shorter of the two lines (anything higher would spill over). Return the largest amount of water any pair of lines can hold. The lines between the chosen two do not get in the way, and the container cannot be tilted.

The array has at least two elements.

## Examples

- `height = [2, 7, 4, 1, 6, 3]` → `18`. The lines at indexes 1 and 4 (heights 7 and 6) are 3 apart: `min(7, 6) * 3 = 18`.
- `height = [5, 5]` → `5`. The only pair has width 1 and height 5.
- `height = [1, 8, 1, 1, 8, 1]` → `24`. The two 8s are 3 apart: `8 * 3 = 24`. The outermost pair is wider (5) but only 1 tall, so it holds just 5.

## Key idea

Start with the widest container: the first and last lines. Every other container is narrower, so the only way to beat the current one is with a taller shorter-side.

Now look at the shorter of the two lines. Pairing it with *any* line between the pointers gives a narrower container whose height is still at most that short line, so none of those pairs can do better. The short line has been fully used: drop it by moving its pointer inward. Repeating this checks every pair that could possibly be the best, in a single pass.

## Approach

1. Set `left = 0`, `right = n - 1`, `best = 0`.
2. While `left < right`:
   1. Compute the area `min(height[left], height[right]) * (right - left)` and update `best`.
   2. Move the pointer at the shorter line inward: `left++` if `height[left] < height[right]`, otherwise `right--`.
3. Return `best`.

The brute force tries every pair of lines with two nested loops, which is O(n²) and too slow for large inputs.

## Complexity

- **Time:** O(n). Each step moves one pointer inward, so there are `n - 1` steps.
- **Space:** O(1). Only two pointers and the best area are stored.

## Common mistakes

- Moving the pointer at the *taller* line. That can never help, because the height is still capped by the shorter line while the width shrinks, so you may skip the best pair.
- Using the taller line (or the sum) as the height instead of the shorter one.
- Confusing it with Trapping Rain Water: here only the two chosen lines matter, and the bars between them are ignored.

## Follow-up questions

- *Why is it safe to skip pairs?* Be ready to explain the argument from the key idea: every skipped pair uses the shorter line with a smaller width, so it cannot beat an area already computed.
- *What do you do when both lines are equal?* Moving either pointer is fine; any better container must exclude both of them anyway.

## Related problems

- Trapping Rain Water: total water held across all bars, also solved with two pointers.
- Two Sum II (sorted input): the same move-one-pointer-inward pattern.

## Solutions

```python
class Solution:
    def maxArea(self, height: List[int]) -> int:
        left, right = 0, len(height) - 1
        best = 0
        while left < right:
            best = max(best, min(height[left], height[right]) * (right - left))
            if height[left] < height[right]:  # the shorter line cannot do better
                left += 1
            else:
                right -= 1
        return best
```

```java
class Solution {
    public int maxArea(int[] height) {
        int left = 0, right = height.length - 1, best = 0;
        while (left < right) {
            best = Math.max(best, Math.min(height[left], height[right]) * (right - left));
            if (height[left] < height[right]) { // the shorter line cannot do better
                left++;
            } else {
                right--;
            }
        }
        return best;
    }
}
```

```cpp
class Solution {
public:
    int maxArea(vector<int>& height) {
        int left = 0, right = (int)height.size() - 1, best = 0;
        while (left < right) {
            best = max(best, min(height[left], height[right]) * (right - left));
            if (height[left] < height[right]) {  // the shorter line cannot do better
                left++;
            } else {
                right--;
            }
        }
        return best;
    }
};
```

```javascript
/**
 * @param {number[]} height
 * @return {number}
 */
var maxArea = function (height) {
  let left = 0, right = height.length - 1, best = 0;
  while (left < right) {
    best = Math.max(best, Math.min(height[left], height[right]) * (right - left));
    if (height[left] < height[right]) { // the shorter line cannot do better
      left++;
    } else {
      right--;
    }
  }
  return best;
};
```

```go
func maxArea(height []int) int {
	left, right, best := 0, len(height)-1, 0
	for left < right {
		best = max(best, min(height[left], height[right])*(right-left))
		if height[left] < height[right] { // the shorter line cannot do better
			left++
		} else {
			right--
		}
	}
	return best
}
```
