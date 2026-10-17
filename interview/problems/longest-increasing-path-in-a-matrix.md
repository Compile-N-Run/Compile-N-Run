---
title: Longest Increasing Path in a Matrix
leetcode: longest-increasing-path-in-a-matrix
description: "Longest Increasing Path in a Matrix explained: find the longest chain of strictly increasing neighbouring cells with a memoized depth-first search, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given a grid of integers with at least one cell. From any cell you may step up, down, left or right (never diagonally and never off the grid), but only onto a cell holding a **strictly larger** value. Return the number of cells in the longest path you can walk this way. A single cell counts as a path of length 1, so the answer is never less than 1.

## Examples

- `[[1, 2, 3], [6, 5, 4], [7, 8, 9]]` → `9`. Starting at 1 you can snake through every cell: right along the first row, down, left along the second row, down, right along the third.
- `[[9, 1], [8, 2]]` → `4`. `1 → 2 → 8 → 9` visits all four cells.
- `[[5, 5], [5, 5]]` → `1`. Every neighbour is equal, not larger, so no step is allowed.
- `[[7]]` → `1`. A single cell is a path by itself.

## Key idea

Because every step goes to a strictly larger value, a path can never return to a cell it has visited: the moves form a directed graph with no cycles. That has a useful consequence: the longest path *starting* at a cell depends only on that cell, not on how you got there. So compute `longest(r, c)` = 1 + the best `longest` among the larger neighbours, store the answer the first time you compute it, and reuse it every time another cell asks. Each cell is solved once, which turns an exponential search into a linear one.

## Approach

1. Create a `memo` grid of the same size filled with 0 ("not computed yet").
2. Define `dfs(r, c)`:
   1. If `memo[r][c]` is set, return it.
   2. Set `best = 1` (the cell by itself).
   3. For each of the four neighbours that is inside the grid and holds a value larger than `matrix[r][c]`, set `best = max(best, 1 + dfs(neighbour))`.
   4. Store `best` in `memo[r][c]` and return it.
3. Call `dfs` from every cell and return the maximum result.

Without the memo, the plain search explores every increasing path separately and can take exponential time on a grid like the snake in the first example. An equivalent iterative solution treats the grid as a DAG and peels it layer by layer (a topological sort): start with the cells that have no larger neighbour, remove them, repeat, and count the layers. It uses the same O(mn) work and avoids deep recursion.

## Complexity

- **Time:** O(m·n). Each cell's answer is computed once, and that computation looks at four neighbours.
- **Space:** O(m·n) for the memo grid plus the recursion stack, which in the worst case (one long snake) is also as deep as the number of cells.

## Common mistakes

- Keeping a `visited` set and clearing it on the way back, as in a regular grid DFS. The strictly-increasing rule already prevents cycles, and the memo only works if answers never depend on the current path.
- Treating equal neighbours as valid steps. `[[5, 5]]` has answer 1, not 2.
- Returning 0 for a cell with no larger neighbours. The cell itself is a path of length 1.
- Recursion depth: on a 200×200 snake the recursion goes 40,000 calls deep. Python's default limit is 1,000, so in Python either raise the limit or use the iterative topological-sort version.

## Follow-up questions

- Can you solve it without recursion? (Yes: the layer-peeling topological sort described above.)
- What changes if diagonal moves are allowed? (Eight neighbours instead of four; the rest of the method is identical.)
- How would you also return the path itself, not just its length? (Store, for each cell, which neighbour gave the best answer, then follow those pointers from the cell with the maximum value.)

## Related problems

- [Number of Islands](/interview/problems/number-of-islands/)
- [Longest Increasing Subsequence](/interview/problems/longest-increasing-subsequence/)
- [Word Search](/interview/problems/word-search/)
- Number of Increasing Paths in a Grid

## Solutions

```python
class Solution:
    def longestIncreasingPath(self, matrix: List[List[int]]) -> int:
        rows, cols = len(matrix), len(matrix[0])
        memo = [[0] * cols for _ in range(rows)]  # 0 means not computed yet

        def dfs(r: int, c: int) -> int:
            if memo[r][c]:
                return memo[r][c]
            best = 1
            for nr, nc in ((r - 1, c), (r + 1, c), (r, c - 1), (r, c + 1)):
                if 0 <= nr < rows and 0 <= nc < cols and matrix[nr][nc] > matrix[r][c]:
                    best = max(best, 1 + dfs(nr, nc))
            memo[r][c] = best
            return best

        return max(dfs(r, c) for r in range(rows) for c in range(cols))
```

```java
class Solution {
    private static final int[][] DIRS = {{-1, 0}, {1, 0}, {0, -1}, {0, 1}};
    private int[][] matrix, memo;

    public int longestIncreasingPath(int[][] matrix) {
        this.matrix = matrix;
        this.memo = new int[matrix.length][matrix[0].length]; // 0 means not computed yet
        int best = 0;
        for (int r = 0; r < matrix.length; r++) {
            for (int c = 0; c < matrix[0].length; c++) {
                best = Math.max(best, dfs(r, c));
            }
        }
        return best;
    }

    private int dfs(int r, int c) {
        if (memo[r][c] != 0) {
            return memo[r][c];
        }
        int best = 1;
        for (int[] d : DIRS) {
            int nr = r + d[0], nc = c + d[1];
            if (nr >= 0 && nr < matrix.length && nc >= 0 && nc < matrix[0].length && matrix[nr][nc] > matrix[r][c]) {
                best = Math.max(best, 1 + dfs(nr, nc));
            }
        }
        memo[r][c] = best;
        return best;
    }
}
```

```cpp
class Solution {
    vector<vector<int>> memo;  // 0 means not computed yet

    int dfs(const vector<vector<int>>& matrix, int r, int c) {
        if (memo[r][c]) {
            return memo[r][c];
        }
        int rows = matrix.size(), cols = matrix[0].size(), best = 1;
        const int dr[] = {-1, 1, 0, 0}, dc[] = {0, 0, -1, 1};
        for (int k = 0; k < 4; k++) {
            int nr = r + dr[k], nc = c + dc[k];
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && matrix[nr][nc] > matrix[r][c]) {
                best = max(best, 1 + dfs(matrix, nr, nc));
            }
        }
        return memo[r][c] = best;
    }

public:
    int longestIncreasingPath(vector<vector<int>>& matrix) {
        int rows = matrix.size(), cols = matrix[0].size(), best = 0;
        memo.assign(rows, vector<int>(cols, 0));
        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                best = max(best, dfs(matrix, r, c));
            }
        }
        return best;
    }
};
```

```javascript
/**
 * @param {number[][]} matrix
 * @return {number}
 */
var longestIncreasingPath = function (matrix) {
  const rows = matrix.length, cols = matrix[0].length;
  const memo = Array.from({ length: rows }, () => new Array(cols).fill(0)); // 0 means not computed yet
  const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];

  const dfs = (r, c) => {
    if (memo[r][c]) return memo[r][c];
    let best = 1;
    for (const [dr, dc] of dirs) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && matrix[nr][nc] > matrix[r][c]) {
        best = Math.max(best, 1 + dfs(nr, nc));
      }
    }
    memo[r][c] = best;
    return best;
  };

  let best = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      best = Math.max(best, dfs(r, c));
    }
  }
  return best;
};
```

```go
func longestIncreasingPath(matrix [][]int) int {
	rows, cols := len(matrix), len(matrix[0])
	memo := make([][]int, rows) // 0 means not computed yet
	for r := range memo {
		memo[r] = make([]int, cols)
	}
	dirs := [4][2]int{{-1, 0}, {1, 0}, {0, -1}, {0, 1}}

	var dfs func(r, c int) int
	dfs = func(r, c int) int {
		if memo[r][c] != 0 {
			return memo[r][c]
		}
		best := 1
		for _, d := range dirs {
			nr, nc := r+d[0], c+d[1]
			if nr >= 0 && nr < rows && nc >= 0 && nc < cols && matrix[nr][nc] > matrix[r][c] {
				best = max(best, 1+dfs(nr, nc))
			}
		}
		memo[r][c] = best
		return best
	}

	best := 0
	for r := 0; r < rows; r++ {
		for c := 0; c < cols; c++ {
			best = max(best, dfs(r, c))
		}
	}
	return best
}
```
