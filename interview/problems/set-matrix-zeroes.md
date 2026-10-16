---
title: Set Matrix Zeroes
leetcode: set-matrix-zeroes
description: "Set Matrix Zeroes explained: zero out every row and column that contains a zero, in place and with O(1) extra space by using the first row and column as markers, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given an `m x n` matrix of integers. Wherever a cell holds `0`, its entire row and its entire column must become `0`. Modify the matrix in place; nothing is returned.

The trap is that newly written zeros must not trigger more zeroing: only the zeros present in the *original* matrix count. The expected solution uses O(1) extra space, not an O(m + n) set of marked rows and columns.

## Examples

- `[[1, 2, 3], [4, 0, 6], [7, 8, 9]]` → `[[1, 0, 3], [0, 0, 0], [7, 0, 9]]`. The middle cell clears row 1 and column 1.
- `[[0, 5], [7, 8]]` → `[[0, 0], [0, 8]]`. Row 0 and column 0 are cleared; cell `(1, 1)` keeps its value.
- `[[1, 1, 1], [0, 1, 1]]` → `[[0, 1, 1], [0, 0, 0]]`. A zero in the first column but not in the first row.
- `[[3, 4], [5, 6]]` → unchanged. No zeros, nothing to do.

## Key idea

We need to remember, for every row and every column, whether it must be cleared. That is `m + n` booleans, and the matrix already gives us exactly that much free storage: the first row can hold the flags for the columns and the first column can hold the flags for the rows. Writing a `0` into `matrix[0][j]` as "column j must be cleared" is safe because if a column needs clearing, its cell in the first row becomes `0` anyway. The only subtlety is the cell `(0, 0)`, which belongs to both the first row and the first column, so one of the two headers needs a separate boolean.

## Approach

1. Scan the first column and remember in a boolean `firstColZero` whether it contains a `0`. The first row needs no extra flag: `matrix[0][0]` will serve as its flag.
2. For every cell `(i, j)` with `j >= 1` (all rows, skipping only the first column, which step 1 already covered): if it is `0`, set `matrix[i][0] = 0` and `matrix[0][j] = 0`. If `(i, j)` lies in the first row, this writes `matrix[0][0] = 0`, which is exactly the "clear the first row" flag.
3. Walk the inner cells again (rows `1..m-1`, columns `1..n-1`) and set a cell to `0` when its row flag `matrix[i][0]` or its column flag `matrix[0][j]` is `0`.
4. If `matrix[0][0]` is `0`, clear the whole first row.
5. If `firstColZero`, clear the whole first column.

Steps 4 and 5 come last because the first row and column are the flags; clearing them earlier would destroy the information the inner cells depend on.

The simple alternative keeps a set of rows and a set of columns to clear, in O(m + n) extra space. Scanning for zeros and immediately clearing rows and columns is wrong, because the zeros it writes are later mistaken for original zeros and the whole matrix ends up cleared.

## Complexity

- **Time:** O(m × n). Two passes over the matrix.
- **Space:** O(1). One boolean plus loop counters; the flags live inside the matrix.

## Common mistakes

- Clearing rows and columns while still scanning, so freshly written zeros cascade and wipe out everything.
- Reading `matrix[0][0]` for both the first row and the first column. The two cases must be told apart, which is what the separate `firstColZero` flag is for.
- Clearing the first row or column before processing the inner cells, which erases the flags.
- Starting the inner loops at index 0 in step 3: the first row and column must be handled separately, after the inner cells.

## Follow-up questions

- Why is the O(m + n) solution often acceptable in an interview, and when is the O(1) version worth it? (Clarity versus memory; the O(1) trick is the "follow-up" LeetCode asks for.)
- How would you solve it if the matrix were streamed row by row and could not be stored? (Collect the zero columns in one pass; rows are decided as they arrive, but the column clearing needs a second pass, so streaming alone is not enough.)

## Related problems

- [Rotate Image](/interview/problems/rotate-image/) (another in-place matrix transformation)
- [Spiral Matrix](/interview/problems/spiral-matrix/)
- Game of Life (in-place state encoding)

## Solutions

```python
class Solution:
    def setZeroes(self, matrix: List[List[int]]) -> None:
        m, n = len(matrix), len(matrix[0])
        first_col_zero = any(matrix[i][0] == 0 for i in range(m))
        # Record zeros of the inner cells in the first row and first column.
        for i in range(m):
            for j in range(1, n):
                if matrix[i][j] == 0:
                    matrix[i][0] = 0
                    matrix[0][j] = 0
        # Clear the inner cells according to the flags.
        for i in range(1, m):
            for j in range(1, n):
                if matrix[i][0] == 0 or matrix[0][j] == 0:
                    matrix[i][j] = 0
        if matrix[0][0] == 0:  # the first row flag (set by a zero anywhere in row 0)
            for j in range(n):
                matrix[0][j] = 0
        if first_col_zero:
            for i in range(m):
                matrix[i][0] = 0
```

```java
class Solution {
    public void setZeroes(int[][] matrix) {
        int m = matrix.length, n = matrix[0].length;
        boolean firstColZero = false;
        for (int i = 0; i < m; i++) {
            if (matrix[i][0] == 0) firstColZero = true;
        }
        // Record zeros of the inner cells in the first row and first column.
        for (int i = 0; i < m; i++) {
            for (int j = 1; j < n; j++) {
                if (matrix[i][j] == 0) {
                    matrix[i][0] = 0;
                    matrix[0][j] = 0;
                }
            }
        }
        // Clear the inner cells according to the flags.
        for (int i = 1; i < m; i++) {
            for (int j = 1; j < n; j++) {
                if (matrix[i][0] == 0 || matrix[0][j] == 0) matrix[i][j] = 0;
            }
        }
        if (matrix[0][0] == 0) { // the first row flag (set by a zero anywhere in row 0)
            Arrays.fill(matrix[0], 0);
        }
        if (firstColZero) {
            for (int i = 0; i < m; i++) matrix[i][0] = 0;
        }
    }
}
```

```cpp
class Solution {
public:
    void setZeroes(vector<vector<int>>& matrix) {
        int m = matrix.size(), n = matrix[0].size();
        bool firstColZero = false;
        for (int i = 0; i < m; i++) {
            if (matrix[i][0] == 0) firstColZero = true;
        }
        // Record zeros of the inner cells in the first row and first column.
        for (int i = 0; i < m; i++) {
            for (int j = 1; j < n; j++) {
                if (matrix[i][j] == 0) {
                    matrix[i][0] = 0;
                    matrix[0][j] = 0;
                }
            }
        }
        // Clear the inner cells according to the flags.
        for (int i = 1; i < m; i++) {
            for (int j = 1; j < n; j++) {
                if (matrix[i][0] == 0 || matrix[0][j] == 0) matrix[i][j] = 0;
            }
        }
        if (matrix[0][0] == 0) {  // the first row flag (set by a zero anywhere in row 0)
            fill(matrix[0].begin(), matrix[0].end(), 0);
        }
        if (firstColZero) {
            for (int i = 0; i < m; i++) matrix[i][0] = 0;
        }
    }
};
```

```javascript
/**
 * @param {number[][]} matrix
 * @return {void} Do not return anything, modify matrix in-place instead.
 */
var setZeroes = function (matrix) {
  const m = matrix.length;
  const n = matrix[0].length;
  let firstColZero = false;
  for (let i = 0; i < m; i++) {
    if (matrix[i][0] === 0) firstColZero = true;
  }
  // Record zeros of the inner cells in the first row and first column.
  for (let i = 0; i < m; i++) {
    for (let j = 1; j < n; j++) {
      if (matrix[i][j] === 0) {
        matrix[i][0] = 0;
        matrix[0][j] = 0;
      }
    }
  }
  // Clear the inner cells according to the flags.
  for (let i = 1; i < m; i++) {
    for (let j = 1; j < n; j++) {
      if (matrix[i][0] === 0 || matrix[0][j] === 0) matrix[i][j] = 0;
    }
  }
  if (matrix[0][0] === 0) {
    // the first row flag (set by a zero anywhere in row 0)
    matrix[0].fill(0);
  }
  if (firstColZero) {
    for (let i = 0; i < m; i++) matrix[i][0] = 0;
  }
};
```

```go
func setZeroes(matrix [][]int) {
	m, n := len(matrix), len(matrix[0])
	firstColZero := false
	for i := 0; i < m; i++ {
		if matrix[i][0] == 0 {
			firstColZero = true
		}
	}
	// Record zeros of the inner cells in the first row and first column.
	for i := 0; i < m; i++ {
		for j := 1; j < n; j++ {
			if matrix[i][j] == 0 {
				matrix[i][0] = 0
				matrix[0][j] = 0
			}
		}
	}
	// Clear the inner cells according to the flags.
	for i := 1; i < m; i++ {
		for j := 1; j < n; j++ {
			if matrix[i][0] == 0 || matrix[0][j] == 0 {
				matrix[i][j] = 0
			}
		}
	}
	if matrix[0][0] == 0 { // the first row flag (set by a zero anywhere in row 0)
		for j := 0; j < n; j++ {
			matrix[0][j] = 0
		}
	}
	if firstColZero {
		for i := 0; i < m; i++ {
			matrix[i][0] = 0
		}
	}
}
```
