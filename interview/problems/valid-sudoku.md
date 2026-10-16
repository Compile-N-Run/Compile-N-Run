---
title: Valid Sudoku
leetcode: valid-sudoku
description: "Valid Sudoku explained: check that no digit repeats in any row, column or 3x3 box of a partly filled 9x9 board in one pass with seen-tables, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You get a 9×9 Sudoku board. Each cell holds either a digit character `'1'` to `'9'` or `'.'` for an empty cell. Decide whether the digits already placed break any Sudoku rule:

- no digit appears twice in the same row,
- no digit appears twice in the same column,
- no digit appears twice in the same 3×3 box (the nine boxes are rows 0-2, 3-5, 6-8 crossed with columns 0-2, 3-5, 6-8).

Return `true` if all three rules hold for the filled cells, `false` otherwise. Empty cells are ignored, and you do **not** have to check whether the puzzle can actually be solved. The board is passed as `char[][]` in Java, `vector<vector<char>>` in C++, `[][]byte` in Go and as nested lists/arrays of one-character strings in Python and JavaScript.

## Examples

- A completely empty board → `true`: nothing is placed, so nothing can clash.
- A board whose only digits are a `'5'` at row 0, column 0 and another `'5'` at row 0, column 8 → `false`: the same row holds two 5s.
- A board whose only digits are a `'9'` at (row 3, column 3) and a `'9'` at (row 5, column 5) → `false`: different rows and columns, but both cells are in the centre box.
- Row 0 is `1 2 3 4 5 6 7 8 .` and there is a `'9'` at row 1, column 8, nothing else → `true`. The top-right cell can never be filled (only 9 is missing from row 0, and column 8 already has a 9), but no rule is broken *yet*, and that is all we check.

## Key idea

Each rule is a "have I seen this digit here before?" question, which a lookup table answers in O(1). Keep one table per row, one per column and one per box. Walk over the 81 cells once; for each digit, check the three tables that cover its cell and then mark it in all three. The only trick is numbering the boxes: the cell at `(r, c)` belongs to box `(r / 3) * 3 + c / 3` (integer division), which gives box numbers 0 to 8 from left to right, top to bottom.

## Approach

1. Create three 9×9 boolean tables `rows`, `cols`, `boxes`, all `false`. `rows[r][d]` means "digit `d` already appears in row `r`", and the same for columns and boxes.
2. For every cell `(r, c)`:
   1. If it is `'.'`, skip it.
   2. Let `d` be the digit minus 1 (so `'1'` becomes 0 and `'9'` becomes 8) and `b = (r / 3) * 3 + c / 3`.
   3. If `rows[r][d]`, `cols[c][d]` or `boxes[b][d]` is already `true`, return `false`.
   4. Otherwise set all three to `true`.
3. If the loop finishes, return `true`.

Checking each row, then each column, then each box in three separate passes also works and is just as fast; the single pass is simply shorter.

## Complexity

- **Time:** O(1) for a fixed 9×9 board (81 cells, constant work each). For a general N×N board it is O(N²).
- **Space:** O(1): three 9×9 tables (O(N²) in general).

## Common mistakes

- Trying to solve the puzzle. The task only asks whether the filled cells already conflict.
- Getting the box index wrong, for example `r / 3 + c / 3`, which maps different boxes to the same number (box (0,1) and box (1,0) both give 1).
- Treating `'.'` as a digit and reporting duplicate empty cells.
- Converting the character to a number with the wrong offset: subtract `'1'` (or `'0'` and then 1), not the character itself.

## Follow-up questions

- How would you actually solve the Sudoku? That is Sudoku Solver: backtracking that tries each digit in an empty cell, using the same three tables to reject clashes instantly.
- Can you use less memory? Store each table row as a 9-bit integer mask instead of nine booleans, and test or set a digit with bit operations.

## Related problems

- Sudoku Solver
- [Valid Anagram](/interview/problems/valid-anagram/) (another "count or mark what you have seen" problem)

## Solutions

```python
class Solution:
    def isValidSudoku(self, board: List[List[str]]) -> bool:
        rows = [[False] * 9 for _ in range(9)]
        cols = [[False] * 9 for _ in range(9)]
        boxes = [[False] * 9 for _ in range(9)]
        for r in range(9):
            for c in range(9):
                ch = board[r][c]
                if ch == '.':
                    continue
                d = int(ch) - 1
                b = (r // 3) * 3 + c // 3
                if rows[r][d] or cols[c][d] or boxes[b][d]:
                    return False
                rows[r][d] = cols[c][d] = boxes[b][d] = True
        return True
```

```java
class Solution {
    public boolean isValidSudoku(char[][] board) {
        boolean[][] rows = new boolean[9][9], cols = new boolean[9][9], boxes = new boolean[9][9];
        for (int r = 0; r < 9; r++) {
            for (int c = 0; c < 9; c++) {
                if (board[r][c] == '.') continue;
                int d = board[r][c] - '1';
                int b = (r / 3) * 3 + c / 3;
                if (rows[r][d] || cols[c][d] || boxes[b][d]) return false;
                rows[r][d] = cols[c][d] = boxes[b][d] = true;
            }
        }
        return true;
    }
}
```

```cpp
class Solution {
public:
    bool isValidSudoku(vector<vector<char>>& board) {
        bool rows[9][9] = {}, cols[9][9] = {}, boxes[9][9] = {};
        for (int r = 0; r < 9; r++) {
            for (int c = 0; c < 9; c++) {
                if (board[r][c] == '.') continue;
                int d = board[r][c] - '1';
                int b = (r / 3) * 3 + c / 3;
                if (rows[r][d] || cols[c][d] || boxes[b][d]) return false;
                rows[r][d] = cols[c][d] = boxes[b][d] = true;
            }
        }
        return true;
    }
};
```

```javascript
/**
 * @param {character[][]} board
 * @return {boolean}
 */
var isValidSudoku = function (board) {
  const table = () => Array.from({ length: 9 }, () => new Array(9).fill(false));
  const rows = table(), cols = table(), boxes = table();
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] === '.') continue;
      const d = Number(board[r][c]) - 1;
      const b = Math.floor(r / 3) * 3 + Math.floor(c / 3);
      if (rows[r][d] || cols[c][d] || boxes[b][d]) return false;
      rows[r][d] = cols[c][d] = boxes[b][d] = true;
    }
  }
  return true;
};
```

```go
func isValidSudoku(board [][]byte) bool {
	var rows, cols, boxes [9][9]bool
	for r := 0; r < 9; r++ {
		for c := 0; c < 9; c++ {
			if board[r][c] == '.' {
				continue
			}
			d := board[r][c] - '1'
			b := (r/3)*3 + c/3
			if rows[r][d] || cols[c][d] || boxes[b][d] {
				return false
			}
			rows[r][d], cols[c][d], boxes[b][d] = true, true, true
		}
	}
	return true
}
```
