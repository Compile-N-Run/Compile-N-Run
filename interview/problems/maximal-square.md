---
title: Maximal Square
leetcode: maximal-square
description: "Maximal Square explained: find the area of the largest all-1 square in a binary matrix with a bottom-up dynamic programming table in O(m × n) time, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given an `m × n` grid filled with the characters `'0'` and `'1'`. Find the largest square block made up only of `'1'` cells and return its **area** (side length squared). If the grid has no `'1'` at all, return `0`.

The grid has at least one row and one column. Note that the cells are characters, not numbers: `char[][]` in Java, `vector<vector<char>>` in C++, `[][]byte` in Go and one-character strings in Python and JavaScript.

## Examples

- `matrix = [["1","1","0"], ["1","1","1"], ["0","1","1"]]` → `4`. The top-left 2 × 2 block is all 1s (so is the bottom-right one), but no 3 × 3 block is.
- `matrix = [["0","0"], ["0","0"]]` → `0`. There is no `'1'` to build a square from.
- `matrix = [["1"]]` → `1`. A single 1 is a 1 × 1 square.
- `matrix = [["1","1","1","1"], ["1","1","1","1"], ["1","1","1","0"]]` → `9`. The left 3 × 3 block is full; a 4-wide square would need a fourth row.

## Key idea

Let `dp[i][j]` be the side of the largest all-1 square whose **bottom-right corner** is cell `(i, j)`. If the cell is `'0'`, that is 0. If it is `'1'`, the square can only grow as far as its three neighbours allow:

```
dp[i][j] = 1 + min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])
```

The cell above, the cell to the left and the cell diagonally up-left each end a square; a square of side `k` at `(i, j)` needs all three of them to end squares of side at least `k - 1`. The smallest of the three is the bottleneck. The answer is the largest value anywhere in `dp`, squared.

## Approach

1. Create a table `dp` of size `(m + 1) × (n + 1)` filled with 0. The extra top row and left column mean cells on the border need no special case.
2. For each cell `(i, j)` in row-major order, if `matrix[i][j] == '1'`, set `dp[i + 1][j + 1] = 1 + min(dp[i][j + 1], dp[i + 1][j], dp[i][j])` and update the best side.
3. Return `best * best`.

The brute force treats every cell as a top-left corner and grows the square one ring at a time while checking the new cells. That can approach O((m × n)²) on a grid full of 1s.

## Complexity

- **Time:** O(m × n). Each cell is computed once from three neighbours.
- **Space:** O(m × n) for the table. Because each row only reads the previous row, it can be reduced to O(n) with one row and a variable holding the old diagonal value.

## Common mistakes

- Returning the side length instead of the area.
- Comparing the cell with the number `1` instead of the character `'1'`. In Java, C++ and Go that silently never matches.
- Taking the maximum of the three neighbours instead of the minimum: a large square above does not help if the cell to the left is 0.

## Follow-up questions

- *Largest rectangle of 1s instead of a square?* That is Maximal Rectangle; build a histogram per row and use the stack method from [Largest Rectangle in Histogram](/interview/problems/largest-rectangle-in-histogram/).
- *Count all the squares of 1s?* The same table works: the sum of all `dp` values is the number of squares (Count Square Submatrices with All Ones).

## Related problems

- [Largest Rectangle in Histogram](/interview/problems/largest-rectangle-in-histogram/): the building block for the rectangle version.
- Maximal Rectangle: the rectangle version of this problem.
- [Number of Islands](/interview/problems/number-of-islands/): another question on a grid of `'0'` and `'1'` characters.

## Solutions

```python
class Solution:
    def maximalSquare(self, matrix: List[List[str]]) -> int:
        m, n = len(matrix), len(matrix[0])
        dp = [[0] * (n + 1) for _ in range(m + 1)]  # dp[i+1][j+1]: side of the best square ending at (i, j)
        best = 0
        for i in range(m):
            for j in range(n):
                if matrix[i][j] == '1':
                    dp[i + 1][j + 1] = 1 + min(dp[i][j + 1], dp[i + 1][j], dp[i][j])
                    best = max(best, dp[i + 1][j + 1])
        return best * best
```

```java
class Solution {
    public int maximalSquare(char[][] matrix) {
        int m = matrix.length, n = matrix[0].length, best = 0;
        int[][] dp = new int[m + 1][n + 1]; // dp[i+1][j+1]: side of the best square ending at (i, j)
        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                if (matrix[i][j] == '1') {
                    dp[i + 1][j + 1] = 1 + Math.min(Math.min(dp[i][j + 1], dp[i + 1][j]), dp[i][j]);
                    best = Math.max(best, dp[i + 1][j + 1]);
                }
            }
        }
        return best * best;
    }
}
```

```cpp
class Solution {
public:
    int maximalSquare(vector<vector<char>>& matrix) {
        int m = matrix.size(), n = matrix[0].size(), best = 0;
        vector<vector<int>> dp(m + 1, vector<int>(n + 1, 0));  // dp[i+1][j+1]: side of the best square ending at (i, j)
        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                if (matrix[i][j] == '1') {
                    dp[i + 1][j + 1] = 1 + min({dp[i][j + 1], dp[i + 1][j], dp[i][j]});
                    best = max(best, dp[i + 1][j + 1]);
                }
            }
        }
        return best * best;
    }
};
```

```javascript
/**
 * @param {character[][]} matrix
 * @return {number}
 */
var maximalSquare = function (matrix) {
  const m = matrix.length, n = matrix[0].length;
  // dp[i+1][j+1]: side of the best square ending at (i, j)
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  let best = 0;
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (matrix[i][j] === '1') {
        dp[i + 1][j + 1] = 1 + Math.min(dp[i][j + 1], dp[i + 1][j], dp[i][j]);
        best = Math.max(best, dp[i + 1][j + 1]);
      }
    }
  }
  return best * best;
};
```

```go
func maximalSquare(matrix [][]byte) int {
	m, n, best := len(matrix), len(matrix[0]), 0
	dp := make([][]int, m+1) // dp[i+1][j+1]: side of the best square ending at (i, j)
	for i := range dp {
		dp[i] = make([]int, n+1)
	}
	for i := 0; i < m; i++ {
		for j := 0; j < n; j++ {
			if matrix[i][j] == '1' {
				dp[i+1][j+1] = 1 + min(dp[i][j+1], dp[i+1][j], dp[i][j])
				best = max(best, dp[i+1][j+1])
			}
		}
	}
	return best * best
}
```
