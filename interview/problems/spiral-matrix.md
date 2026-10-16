---
title: Spiral Matrix
leetcode: spiral-matrix
description: "Spiral Matrix explained: read an m x n grid clockwise from the outside in by shrinking four boundaries layer by layer, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given a matrix of integers with `m` rows and `n` columns (both at least 1). Return all of its elements in *spiral order*: start at the top-left corner, walk right along the top row, down the right column, left along the bottom row, up the left column, and keep circling inwards clockwise until every element has been visited exactly once.

The matrix does not have to be square; it can be a single row or a single column.

## Examples

- `matrix = [[10, 20, 30], [40, 50, 60], [70, 80, 90]]` → `[10, 20, 30, 60, 90, 80, 70, 40, 50]`. The outer ring comes first, then the centre.
- `matrix = [[1, 2, 3, 4], [5, 6, 7, 8]]` → `[1, 2, 3, 4, 8, 7, 6, 5]`. Two rows: across the top, then back along the bottom.
- `matrix = [[7], [8], [9]]` → `[7, 8, 9]`. A single column is read straight down.

## Key idea

Keep four boundaries for the part of the matrix not visited yet: `top`, `bottom`, `left` and `right`. One lap of the spiral reads the top row, the right column, the bottom row and the left column of that rectangle, and after each side you move the matching boundary inwards. The only subtle part is the last, thin layer: once the top row or the right column has been read, the rectangle may already be empty, so check the boundaries again before reading the bottom row and the left column, otherwise a middle row or column gets read twice.

## Approach

1. Set `top = 0`, `bottom = m - 1`, `left = 0`, `right = n - 1`, and an empty `result`.
2. While `top <= bottom` and `left <= right`:
   1. Read the top row from `left` to `right`, then `top += 1`.
   2. Read the right column from `top` to `bottom`, then `right -= 1`.
   3. If `top <= bottom`: read the bottom row from `right` down to `left`, then `bottom -= 1`.
   4. If `left <= right`: read the left column from `bottom` up to `top`, then `left += 1`.
3. Return `result`, which now holds all `m · n` elements.

An alternative is to simulate a walker with a direction vector and a `visited` grid, turning right whenever the next cell is outside the matrix or already visited. It is also O(m · n) but needs O(m · n) extra memory for the visited marks.

## Complexity

- **Time:** O(m · n). Every element is appended exactly once.
- **Space:** O(1) extra besides the output list.

## Common mistakes

- Dropping the two inner checks: for `[[1, 2, 3]]` the bottom-row step would read `3, 2, 1` again, and for a single column the left-column step repeats it.
- Mixing up rows and columns in the loop bounds (`matrix[i][right]` walks a column, `matrix[top][j]` walks a row).
- Using `m` for both dimensions and failing on non-square input.

## Follow-up questions

- Fill an `n x n` matrix with `1..n²` in spiral order (Spiral Matrix II: same boundaries, write instead of read).
- Return the elements counter-clockwise, or starting from the centre.

## Related problems

- Spiral Matrix II
- Rotate Image (also works layer by layer)
- Diagonal Traverse

## Solutions

```python
class Solution:
    def spiralOrder(self, matrix: List[List[int]]) -> List[int]:
        top, bottom = 0, len(matrix) - 1
        left, right = 0, len(matrix[0]) - 1
        result = []
        while top <= bottom and left <= right:
            for j in range(left, right + 1):
                result.append(matrix[top][j])
            top += 1
            for i in range(top, bottom + 1):
                result.append(matrix[i][right])
            right -= 1
            if top <= bottom:  # a bottom row is left
                for j in range(right, left - 1, -1):
                    result.append(matrix[bottom][j])
                bottom -= 1
            if left <= right:  # a left column is left
                for i in range(bottom, top - 1, -1):
                    result.append(matrix[i][left])
                left += 1
        return result
```

```java
class Solution {
    public List<Integer> spiralOrder(int[][] matrix) {
        int top = 0, bottom = matrix.length - 1;
        int left = 0, right = matrix[0].length - 1;
        List<Integer> result = new ArrayList<>();
        while (top <= bottom && left <= right) {
            for (int j = left; j <= right; j++) {
                result.add(matrix[top][j]);
            }
            top++;
            for (int i = top; i <= bottom; i++) {
                result.add(matrix[i][right]);
            }
            right--;
            if (top <= bottom) { // a bottom row is left
                for (int j = right; j >= left; j--) {
                    result.add(matrix[bottom][j]);
                }
                bottom--;
            }
            if (left <= right) { // a left column is left
                for (int i = bottom; i >= top; i--) {
                    result.add(matrix[i][left]);
                }
                left++;
            }
        }
        return result;
    }
}
```

```cpp
class Solution {
public:
    vector<int> spiralOrder(vector<vector<int>>& matrix) {
        int top = 0, bottom = matrix.size() - 1;
        int left = 0, right = matrix[0].size() - 1;
        vector<int> result;
        while (top <= bottom && left <= right) {
            for (int j = left; j <= right; j++) result.push_back(matrix[top][j]);
            top++;
            for (int i = top; i <= bottom; i++) result.push_back(matrix[i][right]);
            right--;
            if (top <= bottom) {  // a bottom row is left
                for (int j = right; j >= left; j--) result.push_back(matrix[bottom][j]);
                bottom--;
            }
            if (left <= right) {  // a left column is left
                for (int i = bottom; i >= top; i--) result.push_back(matrix[i][left]);
                left++;
            }
        }
        return result;
    }
};
```

```javascript
/**
 * @param {number[][]} matrix
 * @return {number[]}
 */
var spiralOrder = function (matrix) {
  let top = 0;
  let bottom = matrix.length - 1;
  let left = 0;
  let right = matrix[0].length - 1;
  const result = [];
  while (top <= bottom && left <= right) {
    for (let j = left; j <= right; j++) {
      result.push(matrix[top][j]);
    }
    top++;
    for (let i = top; i <= bottom; i++) {
      result.push(matrix[i][right]);
    }
    right--;
    if (top <= bottom) { // a bottom row is left
      for (let j = right; j >= left; j--) {
        result.push(matrix[bottom][j]);
      }
      bottom--;
    }
    if (left <= right) { // a left column is left
      for (let i = bottom; i >= top; i--) {
        result.push(matrix[i][left]);
      }
      left++;
    }
  }
  return result;
};
```

```go
func spiralOrder(matrix [][]int) []int {
	top, bottom := 0, len(matrix)-1
	left, right := 0, len(matrix[0])-1
	result := make([]int, 0, len(matrix)*len(matrix[0]))
	for top <= bottom && left <= right {
		for j := left; j <= right; j++ {
			result = append(result, matrix[top][j])
		}
		top++
		for i := top; i <= bottom; i++ {
			result = append(result, matrix[i][right])
		}
		right--
		if top <= bottom { // a bottom row is left
			for j := right; j >= left; j-- {
				result = append(result, matrix[bottom][j])
			}
			bottom--
		}
		if left <= right { // a left column is left
			for i := bottom; i >= top; i-- {
				result = append(result, matrix[i][left])
			}
			left++
		}
	}
	return result
}
```
