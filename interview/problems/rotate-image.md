---
title: Rotate Image
leetcode: rotate-image
description: "Rotate Image explained: turn an n x n matrix 90 degrees clockwise in place by transposing it and reversing each row, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given a square matrix `matrix` with `n` rows and `n` columns (think of it as an image made of numbers). Turn it 90 degrees clockwise.

The rotation must happen *in place*: change the given matrix directly instead of building a second `n × n` matrix and returning it. The function returns nothing. The matrix has at least one row, and values may be negative.

## Examples

- `[[1, 2], [3, 4]]` becomes `[[3, 1], [4, 2]]`. The left column `3, 1` (read bottom to top) becomes the top row.
- `[[1, 2, 3], [4, 5, 6], [7, 8, 9]]` becomes `[[7, 4, 1], [8, 5, 2], [9, 6, 3]]`.
- `[[5]]` stays `[[5]]`. A single cell does not move.

## Key idea

A clockwise rotation can be split into two simple moves that are each easy to do in place:

1. **Transpose:** swap `matrix[i][j]` with `matrix[j][i]`, flipping the matrix over its main diagonal (top-left to bottom-right). Rows become columns.
2. **Reverse each row:** mirror the matrix left to right.

Check with the 3 × 3 example: transposing gives `[[1, 4, 7], [2, 5, 8], [3, 6, 9]]`, and reversing each row gives `[[7, 4, 1], [8, 5, 2], [9, 6, 3]]`, which is the rotated matrix. In formula terms, the cell at row `i`, column `j` must move to row `j`, column `n - 1 - i`; the transpose moves it to `(j, i)` and the row reversal to `(j, n - 1 - i)`.

## Approach

1. For every row `i` and every column `j > i`, swap `matrix[i][j]` and `matrix[j][i]`. Only visit cells above the diagonal; visiting every cell would swap each pair twice and undo the work.
2. For every row, reverse it in place with two pointers (or the language's built-in reverse).

Copying into a new matrix with `rotated[j][n - 1 - i] = matrix[i][j]` is the simplest correct solution, but it uses O(n²) extra memory, which the problem forbids.

## Complexity

- **Time:** O(n²). Each cell is swapped a constant number of times.
- **Space:** O(1). All work is done with swaps inside the matrix.

## Common mistakes

- Swapping across the whole matrix during the transpose (`j` from `0`), which swaps every pair back and leaves the matrix unchanged.
- Reversing the columns instead of the rows, which rotates counter-clockwise.
- Assigning a new matrix to the parameter (`matrix = rotated` in Python or Java) instead of changing the existing one; the caller never sees it.

## Follow-up questions

- Rotate counter-clockwise: transpose, then reverse each column (or reverse the rows' order).
- Rotate by 180 degrees: reverse the order of the rows and then reverse each row.
- Do it in a single pass: rotate four cells at a time, ring by ring, moving each into the next corner position.

## Related problems

- Spiral Matrix
- Transpose Matrix
- Determine Whether Matrix Can Be Obtained By Rotation

## Solutions

```python
class Solution:
    def rotate(self, matrix: List[List[int]]) -> None:
        n = len(matrix)
        for i in range(n):  # transpose: swap across the main diagonal
            for j in range(i + 1, n):
                matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]
        for row in matrix:  # mirror left to right
            row.reverse()
```

```java
class Solution {
    public void rotate(int[][] matrix) {
        int n = matrix.length;
        for (int i = 0; i < n; i++) { // transpose: swap across the main diagonal
            for (int j = i + 1; j < n; j++) {
                int tmp = matrix[i][j];
                matrix[i][j] = matrix[j][i];
                matrix[j][i] = tmp;
            }
        }
        for (int[] row : matrix) { // mirror left to right
            for (int left = 0, right = n - 1; left < right; left++, right--) {
                int tmp = row[left];
                row[left] = row[right];
                row[right] = tmp;
            }
        }
    }
}
```

```cpp
class Solution {
public:
    void rotate(vector<vector<int>>& matrix) {
        int n = matrix.size();
        for (int i = 0; i < n; i++) {  // transpose: swap across the main diagonal
            for (int j = i + 1; j < n; j++) {
                swap(matrix[i][j], matrix[j][i]);
            }
        }
        for (auto& row : matrix) {  // mirror left to right
            reverse(row.begin(), row.end());
        }
    }
};
```

```javascript
/**
 * @param {number[][]} matrix
 * @return {void} Do not return anything, modify matrix in-place instead.
 */
var rotate = function (matrix) {
  const n = matrix.length;
  for (let i = 0; i < n; i++) { // transpose: swap across the main diagonal
    for (let j = i + 1; j < n; j++) {
      [matrix[i][j], matrix[j][i]] = [matrix[j][i], matrix[i][j]];
    }
  }
  for (const row of matrix) { // mirror left to right
    row.reverse();
  }
};
```

```go
func rotate(matrix [][]int) {
	n := len(matrix)
	for i := 0; i < n; i++ { // transpose: swap across the main diagonal
		for j := i + 1; j < n; j++ {
			matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]
		}
	}
	for _, row := range matrix { // mirror left to right
		for left, right := 0, n-1; left < right; left, right = left+1, right-1 {
			row[left], row[right] = row[right], row[left]
		}
	}
}
```
