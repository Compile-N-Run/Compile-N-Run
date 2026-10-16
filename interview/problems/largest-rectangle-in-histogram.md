---
title: Largest Rectangle in Histogram
leetcode: largest-rectangle-in-histogram
description: "Largest Rectangle in Histogram explained: find the biggest rectangle that fits under a bar chart with a monotonic stack in O(n) time, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given an array `heights` of non-negative integers describing a histogram: bar `i` has width 1 and height `heights[i]`, and the bars stand next to each other with no gaps.

Return the area of the largest rectangle that fits entirely inside the histogram. The rectangle must be aligned with the bars, so it covers a run of consecutive bars and its height can be at most the shortest bar in that run.

The array has at least one bar.

## Examples

- `heights = [2, 1, 4, 5, 1, 3]` → `8`. The bars of height 4 and 5 together hold a 4 × 2 rectangle. The full width (6 bars) only reaches height 1.
- `heights = [3, 3, 3]` → `9`. All three bars at height 3.
- `heights = [1, 2, 3, 4, 5]` → `9`. The last three bars give 3 × 3; taller rectangles are narrower (4 × 2 = 8, 5 × 1 = 5).
- `heights = [6, 0, 6]` → `6`. A bar of height 0 splits the histogram, so each 6 stands alone.

## Key idea

Every candidate rectangle has some bar as its *shortest* bar. For bar `i` the best rectangle with height `heights[i]` stretches left and right until it meets a bar that is strictly shorter. So we only need, for each bar, the nearest shorter bar on each side.

A stack of indexes with increasing heights gives both at once. When a new bar is shorter than the bar on top of the stack, the top bar has just found its right boundary (the new bar). Its left boundary is the bar right below it in the stack, because everything between them was taller and has already been popped. Pop it, compute its area, and repeat. A height-0 bar added at the end flushes whatever is left on the stack.

## Approach

1. Create an empty stack of indexes and set `best = 0`.
2. For `i` from `0` to `n` (one step past the end), let `h = heights[i]`, or `0` when `i == n`:
   1. While the stack is not empty and `heights[top] >= h`:
      - Pop `top`. Its height is `heights[top]`.
      - The left boundary is the new top of the stack, or `-1` if the stack is empty. The width is `i - left - 1`.
      - Update `best` with `height * width`.
   2. Push `i`.
3. Return `best`.

The brute force tries every pair of start and end bars while tracking the minimum height, which is O(n²) and too slow for 100,000 bars.

## Complexity

- **Time:** O(n). Each index is pushed once and popped once.
- **Space:** O(n) for the stack when the heights only increase.

## Common mistakes

- Forgetting to empty the stack at the end. Without the extra height-0 step, an increasing histogram such as `[1, 2, 3]` returns 0.
- Using `i - top` as the width. Bars that were popped earlier, between the new stack top and `top`, are taller and belong to the rectangle too; the left edge is the next index still on the stack.
- Worrying about equal heights. Popping on `>=` gives the earlier of two equal bars too small a width, but the later bar spans the same run, so the maximum is still found.

## Follow-up questions

- *Largest rectangle of 1s in a binary matrix?* That is Maximal Rectangle: build a histogram of consecutive 1s for each row and run this algorithm on every row, O(rows × columns).
- *Can you do it with two passes instead?* Compute the nearest smaller index to the left and to the right with two monotonic-stack passes, then take `heights[i] * (right[i] - left[i] - 1)`.

## Related problems

- Maximal Rectangle: this problem applied row by row to a matrix.
- [Maximal Square](/interview/problems/maximal-square/): the square-only version on a matrix, solved with a simpler DP.
- [Daily Temperatures](/interview/problems/daily-temperatures/): the same monotonic stack, looking for the next warmer day.
- [Trapping Rain Water](/interview/problems/trapping-rain-water/): another histogram problem.

## Solutions

```python
class Solution:
    def largestRectangleArea(self, heights: List[int]) -> int:
        stack = []  # indexes with increasing heights
        best = 0
        for i in range(len(heights) + 1):
            h = heights[i] if i < len(heights) else 0  # height 0 at the end empties the stack
            while stack and heights[stack[-1]] >= h:
                height = heights[stack.pop()]
                left = stack[-1] if stack else -1  # nearest shorter bar on the left
                best = max(best, height * (i - left - 1))
            stack.append(i)
        return best
```

```java
class Solution {
    public int largestRectangleArea(int[] heights) {
        int n = heights.length;
        int[] stack = new int[n + 1]; // indexes with increasing heights
        int top = 0, best = 0;
        for (int i = 0; i <= n; i++) {
            int h = i < n ? heights[i] : 0; // height 0 at the end empties the stack
            while (top > 0 && heights[stack[top - 1]] >= h) {
                int height = heights[stack[--top]];
                int left = top > 0 ? stack[top - 1] : -1; // nearest shorter bar on the left
                best = Math.max(best, height * (i - left - 1));
            }
            stack[top++] = i;
        }
        return best;
    }
}
```

```cpp
class Solution {
public:
    int largestRectangleArea(vector<int>& heights) {
        int n = heights.size(), best = 0;
        vector<int> stack;  // indexes with increasing heights
        for (int i = 0; i <= n; i++) {
            int h = i < n ? heights[i] : 0;  // height 0 at the end empties the stack
            while (!stack.empty() && heights[stack.back()] >= h) {
                int height = heights[stack.back()];
                stack.pop_back();
                int left = stack.empty() ? -1 : stack.back();  // nearest shorter bar on the left
                best = max(best, height * (i - left - 1));
            }
            stack.push_back(i);
        }
        return best;
    }
};
```

```javascript
/**
 * @param {number[]} heights
 * @return {number}
 */
var largestRectangleArea = function (heights) {
  const n = heights.length;
  const stack = []; // indexes with increasing heights
  let best = 0;
  for (let i = 0; i <= n; i++) {
    const h = i < n ? heights[i] : 0; // height 0 at the end empties the stack
    while (stack.length && heights[stack[stack.length - 1]] >= h) {
      const height = heights[stack.pop()];
      const left = stack.length ? stack[stack.length - 1] : -1; // nearest shorter bar on the left
      best = Math.max(best, height * (i - left - 1));
    }
    stack.push(i);
  }
  return best;
};
```

```go
func largestRectangleArea(heights []int) int {
	n, best := len(heights), 0
	stack := []int{} // indexes with increasing heights
	for i := 0; i <= n; i++ {
		h := 0 // height 0 at the end empties the stack
		if i < n {
			h = heights[i]
		}
		for len(stack) > 0 && heights[stack[len(stack)-1]] >= h {
			height := heights[stack[len(stack)-1]]
			stack = stack[:len(stack)-1]
			left := -1 // nearest shorter bar on the left
			if len(stack) > 0 {
				left = stack[len(stack)-1]
			}
			best = max(best, height*(i-left-1))
		}
		stack = append(stack, i)
	}
	return best
}
```
