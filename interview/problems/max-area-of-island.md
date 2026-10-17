---
title: Max Area of Island
leetcode: max-area-of-island
description: "Max Area of Island explained: find the largest group of 4-directionally connected 1 cells in a binary grid with a flood fill that counts cells, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given a rectangular grid of `0`s (water) and `1`s (land). An **island** is a group of land cells connected horizontally or vertically; diagonal neighbours do not count, and the grid is surrounded by water. The **area** of an island is the number of cells in it.

Return the area of the largest island. If the grid has no land at all, return `0`.

## Examples

- `[[0, 1, 1, 0], [0, 1, 0, 0], [1, 0, 0, 1]]` → `3`. The three `1`s in the top-left corner form one island; the two `1`s on the bottom row are separate islands of area 1.
- `[[1, 0, 1], [0, 1, 0], [1, 0, 1]]` → `1`. The five `1`s only touch diagonally, so each is its own island.
- `[[1, 1, 1], [1, 1, 1]]` → `6`. The whole grid is one island.
- `[[0, 0], [0, 0]]` → `0`. No land.

## Key idea

Walk over every cell. Whenever you find a `1` you have not seen yet, you are standing on an unexplored island: flood-fill from there, visiting every connected land cell, and count how many cells the fill touches. Mark each visited cell (the simplest way is to set it to `0`, "sink" it) so no island is ever counted twice. The answer is the largest count of any fill. This is the same scan-and-flood pattern as Number of Islands, except the fill returns a size instead of just being counted.

## Approach

1. Set `best = 0`.
2. For each cell `(r, c)` that holds a `1`:
   1. Start a flood fill from `(r, c)` with an explicit stack: push the cell and set it to `0` right away.
   2. While the stack is not empty, pop a cell, add 1 to `area`, and for each of its four neighbours that is inside the grid and still `1`, set it to `0` and push it.
   3. `best = max(best, area)`.
3. Return `best`.

Sinking a cell *when it is pushed* (not when it is popped) means a cell is never pushed twice, so the stack never exceeds the island's size. A recursive DFS is the same algorithm using the call stack; the iterative version avoids stack overflows on big islands (a 50×50 grid of all `1`s would recurse 2,500 levels deep, more than Python's default limit). A BFS with a queue works identically.

## Complexity

- **Time:** O(m·n). Each cell is visited a constant number of times: once by the outer scan and at most once by a flood fill.
- **Space:** O(m·n) in the worst case for the stack (a grid that is almost all land). Marking in place costs nothing extra; use a separate `visited` grid if the input must not change.

## Common mistakes

- Counting diagonal neighbours as connected. Only the four orthogonal neighbours join an island.
- Marking a cell visited when it is *popped* instead of when it is *pushed*. The cell can then be pushed several times from different neighbours and counted more than once.
- Forgetting the bounds check on neighbours, which throws an index error on the grid's edge.
- Returning the number of islands or the total land area instead of the largest single island.

## Follow-up questions

- Return the island itself (its cells) rather than its size. (Collect the cells during the fill.)
- What if you may flip one `0` to `1` first and want the biggest possible island? (Making A Large Island: label each island with an id and size, then for each `0` sum the sizes of the distinct islands around it.)
- How would you do it on a grid too large for memory? (Process it in bands, or use union-find keyed by cell id while streaming rows.)

## Related problems

- [Number of Islands](/interview/problems/number-of-islands/)
- [Rotting Oranges](/interview/problems/rotting-oranges/)
- [Word Search](/interview/problems/word-search/)
- Making A Large Island
- Island Perimeter

## Solutions

```python
class Solution:
    def maxAreaOfIsland(self, grid: List[List[int]]) -> int:
        rows, cols = len(grid), len(grid[0])
        best = 0
        for r in range(rows):
            for c in range(cols):
                if grid[r][c] != 1:
                    continue
                grid[r][c] = 0  # sink cells as they are pushed so none is counted twice
                stack, area = [(r, c)], 0
                while stack:
                    cr, cc = stack.pop()
                    area += 1
                    for nr, nc in ((cr - 1, cc), (cr + 1, cc), (cr, cc - 1), (cr, cc + 1)):
                        if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 1:
                            grid[nr][nc] = 0
                            stack.append((nr, nc))
                best = max(best, area)
        return best
```

```java
class Solution {
    public int maxAreaOfIsland(int[][] grid) {
        int rows = grid.length, cols = grid[0].length, best = 0;
        int[][] dirs = {{-1, 0}, {1, 0}, {0, -1}, {0, 1}};
        Deque<int[]> stack = new ArrayDeque<>();
        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                if (grid[r][c] != 1) {
                    continue;
                }
                grid[r][c] = 0; // sink cells as they are pushed so none is counted twice
                stack.push(new int[] {r, c});
                int area = 0;
                while (!stack.isEmpty()) {
                    int[] cell = stack.pop();
                    area++;
                    for (int[] d : dirs) {
                        int nr = cell[0] + d[0], nc = cell[1] + d[1];
                        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] == 1) {
                            grid[nr][nc] = 0;
                            stack.push(new int[] {nr, nc});
                        }
                    }
                }
                best = Math.max(best, area);
            }
        }
        return best;
    }
}
```

```cpp
class Solution {
public:
    int maxAreaOfIsland(vector<vector<int>>& grid) {
        int rows = grid.size(), cols = grid[0].size(), best = 0;
        const int dr[] = {-1, 1, 0, 0}, dc[] = {0, 0, -1, 1};
        vector<pair<int, int>> stack;
        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                if (grid[r][c] != 1) {
                    continue;
                }
                grid[r][c] = 0;  // sink cells as they are pushed so none is counted twice
                stack.push_back({r, c});
                int area = 0;
                while (!stack.empty()) {
                    auto [cr, cc] = stack.back();
                    stack.pop_back();
                    area++;
                    for (int k = 0; k < 4; k++) {
                        int nr = cr + dr[k], nc = cc + dc[k];
                        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] == 1) {
                            grid[nr][nc] = 0;
                            stack.push_back({nr, nc});
                        }
                    }
                }
                best = max(best, area);
            }
        }
        return best;
    }
};
```

```javascript
/**
 * @param {number[][]} grid
 * @return {number}
 */
var maxAreaOfIsland = function (grid) {
  const rows = grid.length, cols = grid[0].length;
  const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  let best = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] !== 1) continue;
      grid[r][c] = 0; // sink cells as they are pushed so none is counted twice
      const stack = [[r, c]];
      let area = 0;
      while (stack.length) {
        const [cr, cc] = stack.pop();
        area++;
        for (const [dr, dc] of dirs) {
          const nr = cr + dr, nc = cc + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === 1) {
            grid[nr][nc] = 0;
            stack.push([nr, nc]);
          }
        }
      }
      best = Math.max(best, area);
    }
  }
  return best;
};
```

```go
func maxAreaOfIsland(grid [][]int) int {
	rows, cols, best := len(grid), len(grid[0]), 0
	dirs := [4][2]int{{-1, 0}, {1, 0}, {0, -1}, {0, 1}}
	for r := 0; r < rows; r++ {
		for c := 0; c < cols; c++ {
			if grid[r][c] != 1 {
				continue
			}
			grid[r][c] = 0 // sink cells as they are pushed so none is counted twice
			stack, area := [][2]int{{r, c}}, 0
			for len(stack) > 0 {
				cell := stack[len(stack)-1]
				stack = stack[:len(stack)-1]
				area++
				for _, d := range dirs {
					nr, nc := cell[0]+d[0], cell[1]+d[1]
					if nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] == 1 {
						grid[nr][nc] = 0
						stack = append(stack, [2]int{nr, nc})
					}
				}
			}
			best = max(best, area)
		}
	}
	return best
}
```
