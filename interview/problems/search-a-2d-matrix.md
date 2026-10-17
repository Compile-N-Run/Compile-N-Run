---
title: Search a 2D Matrix
leetcode: search-a-2d-matrix
description: "Search a 2D Matrix explained: find a value in a row-sorted matrix whose rows continue each other by binary searching it as one flat sorted array, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given an `m × n` matrix of integers with two properties: every row is sorted in increasing order, and the first value of each row is larger than the last value of the row above it. In other words, reading the matrix row by row gives one sorted list. Given a `target`, return `true` if it appears in the matrix and `false` otherwise.

The matrix has at least one row and one column, and the solution is expected to run in O(log(m · n)) time.

## Examples

For `matrix = [[2, 4, 6], [9, 11, 13], [20, 25, 30]]`:

- `target = 11` → `true` (row 1, column 1).
- `target = 12` → `false`. It would sit between 11 and 13, which are neighbours.
- `target = 2` → `true` and `target = 30` → `true`: the very first and very last values.
- `target = 1` → `false` and `target = 31` → `false`: outside the range of the matrix.

`matrix = [[7]]`, `target = 7` → `true`; `target = 8` → `false`.

## Key idea

Because each row continues where the previous one ended, the matrix is just a sorted array of `m · n` values stored in `m` chunks. Treat an index `k` in that virtual array as the cell at row `k / n` and column `k % n`, and run an ordinary binary search on `k` from `0` to `m · n - 1`. There is no need to copy the values into a real array.

## Approach

1. Let `m` and `n` be the number of rows and columns; set `lo = 0` and `hi = m · n - 1`.
2. While `lo <= hi`:
   1. `mid = lo + (hi - lo) / 2`, and the value is `matrix[mid / n][mid % n]`.
   2. If it equals `target`, return `true`.
   3. If it is smaller, search the right half: `lo = mid + 1`; otherwise `hi = mid - 1`.
3. Return `false` when the range is empty.

Two alternatives are also common: binary search for the row (the last row whose first value is `<= target`), then binary search inside that row, which is O(log m + log n) with two loops; and the "staircase" walk from the top-right corner (go left if the value is too big, down if too small), which is O(m + n) and does not need the rows to continue each other (it is the method for Search a 2D Matrix II).

## Complexity

- **Time:** O(log(m · n)), one binary search over the flattened indices.
- **Space:** O(1).

## Common mistakes

- Swapping the division and the modulo: with `n` columns, row is `mid / n` and column is `mid % n`. Using `m` instead of `n` only works for square matrices.
- Running the search with `hi = m · n` and `lo <= hi`, which reads one cell past the end.
- Using the staircase walk and claiming O(log(m · n)); it is linear in `m + n`.
- Checking only whether `target` lies between the first and last values of a row without searching inside it.

## Follow-up questions

- The rows are sorted and the columns are sorted, but a row's first value can be smaller than the previous row's last value. (Search a 2D Matrix II: the staircase walk from the top-right corner in O(m + n).)
- Return the position instead of a boolean, or the count of values below `target`. (The same binary search returns `lo` as the insertion point.)

## Related problems

- [Find First and Last Position of Element in Sorted Array](/interview/problems/find-first-and-last-position-of-element-in-sorted-array/)
- [Search in Rotated Sorted Array](/interview/problems/search-in-rotated-sorted-array/)
- [Koko Eating Bananas](/interview/problems/koko-eating-bananas/)
- Search a 2D Matrix II
- Binary Search

## Solutions

```python
class Solution:
    def searchMatrix(self, matrix: List[List[int]], target: int) -> bool:
        m, n = len(matrix), len(matrix[0])
        lo, hi = 0, m * n - 1
        while lo <= hi:
            mid = (lo + hi) // 2
            value = matrix[mid // n][mid % n]  # mid as a position in the flattened matrix
            if value == target:
                return True
            if value < target:
                lo = mid + 1
            else:
                hi = mid - 1
        return False
```

```java
class Solution {
    public boolean searchMatrix(int[][] matrix, int target) {
        int m = matrix.length, n = matrix[0].length;
        int lo = 0, hi = m * n - 1;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            int value = matrix[mid / n][mid % n]; // mid as a position in the flattened matrix
            if (value == target) return true;
            if (value < target) lo = mid + 1;
            else hi = mid - 1;
        }
        return false;
    }
}
```

```cpp
class Solution {
public:
    bool searchMatrix(vector<vector<int>>& matrix, int target) {
        int m = matrix.size(), n = matrix[0].size();
        int lo = 0, hi = m * n - 1;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            int value = matrix[mid / n][mid % n];  // mid as a position in the flattened matrix
            if (value == target) return true;
            if (value < target) lo = mid + 1;
            else hi = mid - 1;
        }
        return false;
    }
};
```

```javascript
/**
 * @param {number[][]} matrix
 * @param {number} target
 * @return {boolean}
 */
var searchMatrix = function (matrix, target) {
  const m = matrix.length, n = matrix[0].length;
  let lo = 0, hi = m * n - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const value = matrix[Math.floor(mid / n)][mid % n]; // mid as a position in the flattened matrix
    if (value === target) return true;
    if (value < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return false;
};
```

```go
func searchMatrix(matrix [][]int, target int) bool {
	m, n := len(matrix), len(matrix[0])
	lo, hi := 0, m*n-1
	for lo <= hi {
		mid := lo + (hi-lo)/2
		value := matrix[mid/n][mid%n] // mid as a position in the flattened matrix
		if value == target {
			return true
		}
		if value < target {
			lo = mid + 1
		} else {
			hi = mid - 1
		}
	}
	return false
}
```
