---
title: Matrix
topic: Matrix
group: structures
description: "Matrix problems are grids of rows and columns: walk them with index arithmetic, flood-fill them with BFS or DFS, or transform them in place with careful ordering."
---

## What it is

A matrix is a two-dimensional array: a list of rows, each row a list of values, addressed as `grid[r][c]` with `r` running down and `c` running right. `rows = len(grid)` and `cols = len(grid[0])`, and they need not be equal.

Interview problems on matrices fall into a few families, and the tag covers all of them:

- **Walks with index arithmetic**: spiral order, diagonals, rotation, transposition, checking rows, columns and boxes.
- **Region search**: cells are connected to their neighbours, and you count or flood-fill the regions with BFS or DFS; islands are the classic.
- **Shortest paths on a grid**: BFS from one or many sources, each step moving to a neighbour.
- **Dynamic programming on a grid**: the answer for a cell depends on the cells above and to its left.
- **In-place tricks**: using the grid itself as the visited set or as flag storage to meet an O(1) extra space requirement.

The common skill is being careful and consistent with two coordinates: knowing which index is the row, checking bounds every time you step, and choosing an order of operations that does not destroy data you still need.

## When to use it

- The input is a 2D list and the statement says *grid*, *board*, *image*, *cells*, *adjacent* or *4-directionally connected*.
- Counting islands, regions, enclosures, or the size of the largest one.
- The shortest number of steps between cells, or the time for something to spread (fire, rot, water).
- *Rotate*, *transpose*, *spiral*, *diagonal*, *in place*, *O(1) extra space*.
- Searching for a path or a word by moving between neighbouring cells.

## How it works

The shared mechanics are a direction array and a bounds check. `DIRS = [(1,0), (-1,0), (0,1), (0,-1)]` lists the four neighbours as (row delta, column delta); add `(1,1), (1,-1), (-1,1), (-1,-1)` for eight. For each neighbour `(nr, nc)`, check `0 <= nr < rows and 0 <= nc < cols` before touching `grid[nr][nc]`.

Counting regions of 1s with BFS, on this grid:

```
1 1 0 0
0 1 0 1
0 0 0 1
1 0 0 0
```

Scan the cells row by row. The first `1` at `(0,0)` is unvisited, so a region starts: count becomes 1, and the BFS marks `(0,0)`, then `(0,1)`, then `(1,1)` as seen before moving on. The scan continues over marked or empty cells until `(1,3)`, which starts region 2 and swallows `(2,3)`. `(3,0)` starts region 3 with no neighbours. Answer: 3. Every cell enters the queue at most once because it is marked *when enqueued*, so the whole thing is O(rows × cols).

The same scan with DFS replaces the queue with recursion (or an explicit stack); BFS is the one to use when you need distances, because it visits cells in order of steps from the start.

## Template

```python
from collections import deque

DIRS = [(1, 0), (-1, 0), (0, 1), (0, -1)]   # down, up, right, left


def count_regions(grid):
    """Count connected groups of 1s, visiting each cell once with BFS."""
    rows, cols = len(grid), len(grid[0])
    seen = [[False] * cols for _ in range(rows)]
    regions = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] != 1 or seen[r][c]:
                continue
            regions += 1                       # a new region starts here
            queue = deque([(r, c)])
            seen[r][c] = True
            while queue:
                cr, cc = queue.popleft()
                # problem-specific work on cell (cr, cc) goes here
                for dr, dc in DIRS:
                    nr, nc = cr + dr, cc + dc
                    if 0 <= nr < rows and 0 <= nc < cols and not seen[nr][nc] and grid[nr][nc] == 1:
                        seen[nr][nc] = True    # mark when enqueued, not when dequeued
                        queue.append((nr, nc))
    return regions


grid = [
    [1, 1, 0, 0],
    [0, 1, 0, 1],
    [0, 0, 0, 1],
    [1, 0, 0, 0],
]
print(count_regions(grid))   # 3
```

```java
import java.util.*;

public class Main {
    static final int[][] DIRS = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};  // down, up, right, left

    // Count connected groups of 1s, visiting each cell once with BFS.
    static int countRegions(int[][] grid) {
        int rows = grid.length, cols = grid[0].length;
        boolean[][] seen = new boolean[rows][cols];
        int regions = 0;
        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                if (grid[r][c] != 1 || seen[r][c]) continue;
                regions++;                                   // a new region starts here
                Deque<int[]> queue = new ArrayDeque<>();
                queue.add(new int[]{r, c});
                seen[r][c] = true;
                while (!queue.isEmpty()) {
                    int[] cell = queue.poll();
                    int cr = cell[0], cc = cell[1];
                    // problem-specific work on cell (cr, cc) goes here
                    for (int[] d : DIRS) {
                        int nr = cr + d[0], nc = cc + d[1];
                        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !seen[nr][nc] && grid[nr][nc] == 1) {
                            seen[nr][nc] = true;             // mark when enqueued, not when dequeued
                            queue.add(new int[]{nr, nc});
                        }
                    }
                }
            }
        }
        return regions;
    }

    public static void main(String[] args) {
        int[][] grid = {
            {1, 1, 0, 0},
            {0, 1, 0, 1},
            {0, 0, 0, 1},
            {1, 0, 0, 0},
        };
        System.out.println(countRegions(grid));  // 3
    }
}
```

```cpp
#include <iostream>
#include <queue>
#include <vector>

const int DIRS[4][2] = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};  // down, up, right, left

// Count connected groups of 1s, visiting each cell once with BFS.
int countRegions(const std::vector<std::vector<int>>& grid) {
    int rows = grid.size(), cols = grid[0].size();
    std::vector<std::vector<bool>> seen(rows, std::vector<bool>(cols, false));
    int regions = 0;
    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
            if (grid[r][c] != 1 || seen[r][c]) continue;
            regions++;                                   // a new region starts here
            std::queue<std::pair<int, int>> q;
            q.push({r, c});
            seen[r][c] = true;
            while (!q.empty()) {
                auto [cr, cc] = q.front();
                q.pop();
                // problem-specific work on cell (cr, cc) goes here
                for (auto& d : DIRS) {
                    int nr = cr + d[0], nc = cc + d[1];
                    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !seen[nr][nc] && grid[nr][nc] == 1) {
                        seen[nr][nc] = true;             // mark when enqueued, not when dequeued
                        q.push({nr, nc});
                    }
                }
            }
        }
    }
    return regions;
}

int main() {
    std::vector<std::vector<int>> grid = {
        {1, 1, 0, 0},
        {0, 1, 0, 1},
        {0, 0, 0, 1},
        {1, 0, 0, 0},
    };
    std::cout << countRegions(grid) << '\n';  // 3
}
```

```javascript
const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];  // down, up, right, left

// Count connected groups of 1s, visiting each cell once with BFS.
function countRegions(grid) {
  const rows = grid.length, cols = grid[0].length;
  const seen = Array.from({ length: rows }, () => new Array(cols).fill(false));
  let regions = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] !== 1 || seen[r][c]) continue;
      regions++;                                   // a new region starts here
      const queue = [[r, c]];
      let head = 0;                                // index instead of shift(): O(1) dequeue
      seen[r][c] = true;
      while (head < queue.length) {
        const [cr, cc] = queue[head++];
        // problem-specific work on cell (cr, cc) goes here
        for (const [dr, dc] of DIRS) {
          const nr = cr + dr, nc = cc + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !seen[nr][nc] && grid[nr][nc] === 1) {
            seen[nr][nc] = true;                   // mark when enqueued, not when dequeued
            queue.push([nr, nc]);
          }
        }
      }
    }
  }
  return regions;
}

const grid = [
  [1, 1, 0, 0],
  [0, 1, 0, 1],
  [0, 0, 0, 1],
  [1, 0, 0, 0],
];
console.log(countRegions(grid));  // 3
```

```go
package main

import "fmt"

var dirs = [][2]int{{1, 0}, {-1, 0}, {0, 1}, {0, -1}} // down, up, right, left

// countRegions counts connected groups of 1s, visiting each cell once with BFS.
func countRegions(grid [][]int) int {
	rows, cols := len(grid), len(grid[0])
	seen := make([][]bool, rows)
	for r := range seen {
		seen[r] = make([]bool, cols)
	}
	regions := 0
	for r := 0; r < rows; r++ {
		for c := 0; c < cols; c++ {
			if grid[r][c] != 1 || seen[r][c] {
				continue
			}
			regions++ // a new region starts here
			queue := [][2]int{{r, c}}
			seen[r][c] = true
			for len(queue) > 0 {
				cr, cc := queue[0][0], queue[0][1]
				queue = queue[1:]
				// problem-specific work on cell (cr, cc) goes here
				for _, d := range dirs {
					nr, nc := cr+d[0], cc+d[1]
					if nr >= 0 && nr < rows && nc >= 0 && nc < cols && !seen[nr][nc] && grid[nr][nc] == 1 {
						seen[nr][nc] = true // mark when enqueued, not when dequeued
						queue = append(queue, [2]int{nr, nc})
					}
				}
			}
		}
	}
	return regions
}

func main() {
	grid := [][]int{
		{1, 1, 0, 0},
		{0, 1, 0, 1},
		{0, 0, 0, 1},
		{1, 0, 0, 0},
	}
	fmt.Println(countRegions(grid)) // 3
}
```

## Variations

- **Multi-source BFS**: enqueue every source at once (all rotten oranges, all zeros) and the first time a cell is reached is its distance from the nearest source.
- **Mark the grid itself**: set a visited cell to `0` or `#` instead of keeping a `seen` array, when the problem lets you modify its input; restore it afterwards in backtracking (Word Search).
- **Rotation** by 90 degrees is a transpose (swap `grid[r][c]` with `grid[c][r]` for `c > r`) followed by reversing each row. Doing it as two simple passes avoids the four-way swap arithmetic.
- **Spiral order** keeps four bounds (`top`, `bottom`, `left`, `right`) and shrinks one after each side is consumed; check that `top <= bottom` and `left <= right` before the last two sides.
- **Grid DP**: `dp[r][c]` depends on `dp[r-1][c]`, `dp[r][c-1]` and sometimes `dp[r-1][c-1]` (Maximal Square); a single rolling row cuts space to O(cols).
- **Flattening**: cell `(r, c)` is index `r * cols + c`. A sorted matrix becomes a sorted array for binary search, and Union-Find uses it for grid cells.
- **Box index**: in a 9×9 Sudoku, cell `(r, c)` is in box `(r // 3) * 3 + c // 3`.

## Common mistakes

- Swapping the indexes, `grid[c][r]`, which only works on square grids and makes tests pass by accident.
- Using `len(grid)` for both dimensions. Name `rows` and `cols` at the top and use them everywhere.
- Marking a cell visited when it is *dequeued* instead of when it is *enqueued*; the same cell then enters the queue many times and the BFS blows up.
- Overwriting values you still need. In Set Matrix Zeroes, zeroing as you scan spreads zeros to cells that were not zero in the input; collect first, then write.
- Recursive DFS on a big grid in Python hits the recursion limit; use BFS or an explicit stack when the grid can be large.
- Off-by-one in the spiral bounds, which repeats a row or column on odd-sized grids. Trace a 3×3 and a 1×n by hand.
- Forgetting that `grid` might be a single row or single column.

## Complexity

Most matrix algorithms touch every cell a constant number of times: O(rows × cols) time. BFS and DFS use O(rows × cols) extra space for the visited set and queue in the worst case; in-place marking brings that down to O(1) beyond the recursion stack or queue. Transforms like rotation and spiral order are O(rows × cols) with O(1) extra space.

## Where to start

1. [36. Valid Sudoku](/interview/problems/valid-sudoku/): pure index arithmetic, including the box formula.
2. [54. Spiral Matrix](/interview/problems/spiral-matrix/): four shrinking bounds; the classic for careful loop control.
3. [48. Rotate Image](/interview/problems/rotate-image/): transpose and reverse, in place.
4. [73. Set Matrix Zeroes](/interview/problems/set-matrix-zeroes/): in-place flags in the first row and column.
5. [200. Number of Islands](/interview/problems/number-of-islands/): the template almost verbatim.
6. [994. Rotting Oranges](/interview/problems/rotting-oranges/): multi-source BFS counting rounds.
7. [79. Word Search](/interview/problems/word-search/): DFS with backtracking and in-place marking.
8. [221. Maximal Square](/interview/problems/maximal-square/): grid dynamic programming.
