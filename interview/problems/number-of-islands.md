---
title: Number of Islands
leetcode: number-of-islands
description: "Number of Islands explained: count groups of connected land cells in a grid by flood-filling each new island with an explicit stack, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given a rectangular grid of characters with at least one row and one column. Each cell is either `'1'` (land) or `'0'` (water). Land cells that touch **horizontally or vertically** belong to the same island; cells that touch only at a corner (diagonally) do not. Everything outside the grid counts as water.

Return the number of islands.

The cells are characters, not numbers: `char` in Java and C++, one-character strings in Python and JavaScript, and `byte` in Go.

## Examples

- `["110", "010", "001"]` → `2`. The three land cells in the top-left touch each other; the bottom-right cell only touches them diagonally, so it is its own island.
- `["101", "010", "101"]` → `5`. No two land cells share a side, so each one is a separate island.
- `["000"]` → `0`. There is no land.
- `["1111", "1001", "1111"]` → `1`. A ring of land is a single island, even with water in the middle.

## Key idea

Scan the grid cell by cell. The first time you meet a land cell you have not visited, you have found a new island, so add one to the count. Then **flood-fill** that island: visit every land cell reachable from it through up, down, left and right moves, and mark each one as visited (here, by turning it into `'0'`). Because the whole island is wiped out, the scan will never count it again.

## Approach

1. Set `count = 0`.
2. Loop over every cell `(r, c)`. If it is `'1'`:
   1. Increase `count`.
   2. Set the cell to `'0'` and push it onto a stack.
   3. While the stack is not empty, pop a cell and look at its four neighbours. For each neighbour that is inside the grid and is `'1'`, set it to `'0'` and push it.
3. Return `count`.

Marking a cell as water **when it is pushed** (not when it is popped) ensures no cell is pushed twice.

The same flood fill is often written as a recursive DFS, which is shorter. But a grid that is all land can need one recursive call per cell (up to 90,000 for a 300 × 300 grid), which overflows Python's default recursion limit and can overflow the call stack in other languages. An explicit stack (or a queue for BFS) avoids that.

## Complexity

- **Time:** O(m · n) for an `m × n` grid. Every cell is scanned once and pushed and popped at most once.
- **Space:** O(m · n) in the worst case for the stack, when most of the grid is one island.

## Common mistakes

- Treating diagonal neighbours as connected. Only the four side neighbours count.
- Comparing cells with the number `1` instead of the character `'1'`.
- Forgetting to mark cells as visited, which loops forever or counts the same island many times.
- Checking the bounds after reading the neighbour, which reads outside the grid.
- Using deep recursion on large grids without thinking about stack depth.

## Follow-up questions

- What if you must not modify the input? (Keep a separate `visited` grid of booleans.)
- What if land is added one cell at a time and you must report the island count after each addition? (Number of Islands II, solved with union-find.)
- How would you find the size of the largest island? (Max Area of Island: count cells during each flood fill.)

## Related problems

- Max Area of Island
- Surrounded Regions
- Rotting Oranges

## Solutions

```python
class Solution:
    def numIslands(self, grid: List[List[str]]) -> int:
        rows, cols = len(grid), len(grid[0])
        count = 0
        for r in range(rows):
            for c in range(cols):
                if grid[r][c] != '1':
                    continue
                count += 1
                grid[r][c] = '0'  # mark when pushed so no cell is pushed twice
                stack = [(r, c)]
                while stack:
                    i, j = stack.pop()
                    for ni, nj in ((i + 1, j), (i - 1, j), (i, j + 1), (i, j - 1)):
                        if 0 <= ni < rows and 0 <= nj < cols and grid[ni][nj] == '1':
                            grid[ni][nj] = '0'
                            stack.append((ni, nj))
        return count
```

```java
class Solution {
    public int numIslands(char[][] grid) {
        int rows = grid.length, cols = grid[0].length, count = 0;
        int[][] dirs = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
        Deque<int[]> stack = new ArrayDeque<>();
        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                if (grid[r][c] != '1') {
                    continue;
                }
                count++;
                grid[r][c] = '0'; // mark when pushed so no cell is pushed twice
                stack.push(new int[] {r, c});
                while (!stack.isEmpty()) {
                    int[] cell = stack.pop();
                    for (int[] d : dirs) {
                        int ni = cell[0] + d[0], nj = cell[1] + d[1];
                        if (ni >= 0 && ni < rows && nj >= 0 && nj < cols && grid[ni][nj] == '1') {
                            grid[ni][nj] = '0';
                            stack.push(new int[] {ni, nj});
                        }
                    }
                }
            }
        }
        return count;
    }
}
```

```cpp
class Solution {
public:
    int numIslands(vector<vector<char>>& grid) {
        int rows = grid.size(), cols = grid[0].size(), count = 0;
        const int dirs[4][2] = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
        vector<pair<int, int>> stack;
        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                if (grid[r][c] != '1') {
                    continue;
                }
                count++;
                grid[r][c] = '0';  // mark when pushed so no cell is pushed twice
                stack.push_back({r, c});
                while (!stack.empty()) {
                    auto [i, j] = stack.back();
                    stack.pop_back();
                    for (auto& d : dirs) {
                        int ni = i + d[0], nj = j + d[1];
                        if (ni >= 0 && ni < rows && nj >= 0 && nj < cols && grid[ni][nj] == '1') {
                            grid[ni][nj] = '0';
                            stack.push_back({ni, nj});
                        }
                    }
                }
            }
        }
        return count;
    }
};
```

```javascript
/**
 * @param {character[][]} grid
 * @return {number}
 */
var numIslands = function (grid) {
  const rows = grid.length;
  const cols = grid[0].length;
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  let count = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] !== "1") {
        continue;
      }
      count++;
      grid[r][c] = "0"; // mark when pushed so no cell is pushed twice
      const stack = [[r, c]];
      while (stack.length > 0) {
        const [i, j] = stack.pop();
        for (const [di, dj] of dirs) {
          const ni = i + di;
          const nj = j + dj;
          if (ni >= 0 && ni < rows && nj >= 0 && nj < cols && grid[ni][nj] === "1") {
            grid[ni][nj] = "0";
            stack.push([ni, nj]);
          }
        }
      }
    }
  }
  return count;
};
```

```go
func numIslands(grid [][]byte) int {
	rows, cols := len(grid), len(grid[0])
	dirs := [4][2]int{{1, 0}, {-1, 0}, {0, 1}, {0, -1}}
	count := 0
	stack := [][2]int{}
	for r := 0; r < rows; r++ {
		for c := 0; c < cols; c++ {
			if grid[r][c] != '1' {
				continue
			}
			count++
			grid[r][c] = '0' // mark when pushed so no cell is pushed twice
			stack = append(stack, [2]int{r, c})
			for len(stack) > 0 {
				cell := stack[len(stack)-1]
				stack = stack[:len(stack)-1]
				for _, d := range dirs {
					ni, nj := cell[0]+d[0], cell[1]+d[1]
					if ni >= 0 && ni < rows && nj >= 0 && nj < cols && grid[ni][nj] == '1' {
						grid[ni][nj] = '0'
						stack = append(stack, [2]int{ni, nj})
					}
				}
			}
		}
	}
	return count
}
```
