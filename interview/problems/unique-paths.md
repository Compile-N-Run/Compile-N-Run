---
title: Unique Paths
leetcode: unique-paths
description: "Unique Paths explained: count the ways a robot can cross an m by n grid moving only right or down, with a one-row dynamic programming table, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

A robot stands in the top-left cell of a grid with `m` rows and `n` columns and wants to reach the bottom-right cell. At every step it may move one cell **right** or one cell **down**, never left or up. Return the number of distinct paths from the start to the finish.

Both `m` and `n` are at least 1 and at most 100, and the answer is guaranteed to fit in a 32-bit signed integer.

## Examples

- `m = 2`, `n = 2` → `2`: right-then-down or down-then-right.
- `m = 3`, `n = 2` → `3`: the single right move can happen before, between or after the two down moves.
- `m = 1`, `n = 10` → `1`. A single row leaves no choice: go right nine times.
- `m = 4`, `n = 4` → `20`.

## Key idea

The only way to arrive at a cell is from the cell above it or the cell to its left, so the number of paths to a cell is the sum of the paths to those two neighbours. Cells in the first row or first column have exactly one path (keep moving in one direction). Filling the grid row by row from that rule gives the answer in the bottom-right corner, and since each row only looks at the row above, one array is enough: before updating `row[j]` it still holds the value from the row above, and `row[j - 1]` has already been updated for the current row.

## Approach

1. Create an array `row` of length `n` filled with `1`: the number of paths to each cell of the first row.
2. Repeat `m - 1` times (once for each remaining row): for `j` from `1` to `n - 1`, set `row[j] += row[j - 1]`. The old `row[j]` is "from above", `row[j - 1]` is "from the left".
3. Return `row[n - 1]`.

Trying every sequence of moves recursively (`paths(r, c) = paths(r + 1, c) + paths(r, c + 1)`) recomputes the same cells exponentially often; the table remembers each cell once.

A closed form also exists: every path is a sequence of `m - 1` downs and `n - 1` rights in some order, so the answer is the binomial coefficient `C(m + n - 2, m - 1)`. Computing it iteratively (`result = result * (k + i) / i`) takes O(min(m, n)) time, but needs care to avoid overflow in the intermediate product; the DP is the version interviewers expect you to write first.

## Complexity

- **Time:** O(m · n), one addition per cell.
- **Space:** O(n) for the single row (O(m · n) if you keep the whole table).

## Common mistakes

- Starting the table at zero instead of one; the first row and column must be filled with `1`, or everything stays zero.
- Off-by-one in the loop count: there are `m - 1` rows to process after the first, not `m`.
- Overflowing a 32-bit integer in the combinatorial formula when multiplying before dividing; use 64-bit arithmetic or the DP.

## Follow-up questions

- Some cells are blocked. How does the recurrence change? (Unique Paths II: a blocked cell has zero paths, and the first row and column stop being all ones after the first obstacle.)
- Each cell has a cost and you want the cheapest path. (Minimum Path Sum: replace the sum of the two neighbours with the minimum, plus the cell's cost.)
- The robot may also move diagonally down-right, or the grid is huge but `m` is tiny. (Add a third term, or use the closed form.)

## Related problems

- [Climbing Stairs](/interview/problems/climbing-stairs/)
- [Maximal Square](/interview/problems/maximal-square/)
- [Edit Distance](/interview/problems/edit-distance/)
- Unique Paths II
- Minimum Path Sum

## Solutions

```python
class Solution:
    def uniquePaths(self, m: int, n: int) -> int:
        row = [1] * n  # paths to each cell of the first row
        for _ in range(m - 1):
            for j in range(1, n):
                row[j] += row[j - 1]  # old row[j] = from above, row[j - 1] = from the left
        return row[-1]
```

```java
class Solution {
    public int uniquePaths(int m, int n) {
        int[] row = new int[n]; // paths to each cell of the first row
        Arrays.fill(row, 1);
        for (int i = 1; i < m; i++) {
            for (int j = 1; j < n; j++) {
                row[j] += row[j - 1]; // old row[j] = from above, row[j - 1] = from the left
            }
        }
        return row[n - 1];
    }
}
```

```cpp
class Solution {
public:
    int uniquePaths(int m, int n) {
        vector<int> row(n, 1);  // paths to each cell of the first row
        for (int i = 1; i < m; i++) {
            for (int j = 1; j < n; j++) {
                row[j] += row[j - 1];  // old row[j] = from above, row[j - 1] = from the left
            }
        }
        return row[n - 1];
    }
};
```

```javascript
/**
 * @param {number} m
 * @param {number} n
 * @return {number}
 */
var uniquePaths = function (m, n) {
  const row = new Array(n).fill(1); // paths to each cell of the first row
  for (let i = 1; i < m; i++) {
    for (let j = 1; j < n; j++) {
      row[j] += row[j - 1]; // old row[j] = from above, row[j - 1] = from the left
    }
  }
  return row[n - 1];
};
```

```go
func uniquePaths(m int, n int) int {
	row := make([]int, n) // paths to each cell of the first row
	for j := range row {
		row[j] = 1
	}
	for i := 1; i < m; i++ {
		for j := 1; j < n; j++ {
			row[j] += row[j-1] // old row[j] = from above, row[j-1] = from the left
		}
	}
	return row[n-1]
}
```
