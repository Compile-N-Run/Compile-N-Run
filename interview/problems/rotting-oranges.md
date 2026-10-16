---
title: Rotting Oranges
leetcode: rotting-oranges
description: "Rotting Oranges explained: count the minutes until rot spreads to every fresh orange in a grid with a multi-source breadth-first search, or report that some can never rot, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given a grid with `m` rows and `n` columns (both at least 1). Each cell holds one of three values:

- `0`: the cell is empty,
- `1`: the cell holds a fresh orange,
- `2`: the cell holds a rotten orange.

Every minute, each fresh orange that shares a side (up, down, left or right, not diagonally) with a rotten orange becomes rotten itself. Return the smallest number of minutes after which no fresh orange is left. If some fresh orange can never be reached by the rot, return `-1`. If there are no fresh oranges to begin with, the answer is `0`.

## Examples

- `grid = [[2, 1, 0], [1, 1, 1], [0, 1, 1]]` → `4`. The rot moves one step per minute, and the bottom-right orange is four steps away from the rotten corner.
- `grid = [[2, 1, 1, 1, 2]]` → `2`. Rot spreads from both ends at once and meets in the middle after two minutes.
- `grid = [[1, 0, 2]]` → `-1`. The empty cell blocks the only path to the fresh orange.
- `grid = [[0, 2], [0, 0]]` → `0`. There is nothing fresh to rot.

## Key idea

The rot spreads in waves: all oranges that are rotten at minute 0 infect their neighbours at minute 1, those infect theirs at minute 2, and so on. That is exactly breadth-first search, started from *every* rotten orange at the same time (a *multi-source* BFS). Put all initially rotten cells in a queue and process the queue one level at a time; each level is one minute. The minute when the last fresh orange is reached is the answer. Counting fresh oranges up front tells you at the end whether any were left unreachable.

## Approach

1. Scan the grid. Push the position of every rotten orange into a queue and count the fresh oranges in `fresh`.
2. Set `minutes = 0`. While the queue is not empty and `fresh > 0`:
   1. Process exactly the cells currently in the queue (one level). For each one, look at its four neighbours.
   2. Every neighbour inside the grid that is fresh becomes rotten right away (set it to `2`), `fresh` decreases by one, and the neighbour is pushed into the queue.
   3. After the level, `minutes += 1`.
3. Return `minutes` if `fresh == 0`, otherwise `-1`.

Marking an orange rotten *when it is pushed* (not when it is popped) ensures each cell enters the queue only once. A naive simulation that rescans the whole grid every minute also works but costs O((m · n)²) in the worst case, for example a long snake-shaped path.

## Complexity

- **Time:** O(m · n). Every cell is scanned once and enters the queue at most once; each queue entry checks four neighbours.
- **Space:** O(m · n) for the queue in the worst case (for example, when most oranges start rotten).

## Common mistakes

- Running a separate BFS from each rotten orange one after another: the minutes then reflect only one source, not the simultaneous spread, and the work grows to O((m · n)²).
- Counting a minute for the final level that rots nothing, which gives an answer one too large. The `fresh > 0` loop condition avoids it.
- Returning `-1` when there are no fresh oranges at all, or when there are no rotten ones and no fresh ones; the answer there is `0`.
- Checking diagonal neighbours.

## Follow-up questions

- How would you return the minute at which each orange rots? (Store the BFS level per cell instead of one counter.)
- What changes if rot also spreads diagonally? (Use eight directions; the algorithm stays the same.)

## Related problems

- Walls and Gates (multi-source BFS distances)
- 01 Matrix (distance to the nearest zero, same technique)
- Number of Islands (grid traversal with BFS or DFS)

## Solutions

```python
class Solution:
    def orangesRotting(self, grid: List[List[int]]) -> int:
        m, n = len(grid), len(grid[0])
        queue = deque()
        fresh = 0
        for i in range(m):
            for j in range(n):
                if grid[i][j] == 2:
                    queue.append((i, j))
                elif grid[i][j] == 1:
                    fresh += 1
        minutes = 0
        while queue and fresh > 0:
            for _ in range(len(queue)):  # one level = one minute
                i, j = queue.popleft()
                for ni, nj in ((i + 1, j), (i - 1, j), (i, j + 1), (i, j - 1)):
                    if 0 <= ni < m and 0 <= nj < n and grid[ni][nj] == 1:
                        grid[ni][nj] = 2  # rot it now so it is queued only once
                        fresh -= 1
                        queue.append((ni, nj))
            minutes += 1
        return minutes if fresh == 0 else -1
```

```java
class Solution {
    public int orangesRotting(int[][] grid) {
        int m = grid.length, n = grid[0].length;
        Deque<int[]> queue = new ArrayDeque<>();
        int fresh = 0;
        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                if (grid[i][j] == 2) {
                    queue.add(new int[] {i, j});
                } else if (grid[i][j] == 1) {
                    fresh++;
                }
            }
        }
        int[][] dirs = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
        int minutes = 0;
        while (!queue.isEmpty() && fresh > 0) {
            for (int size = queue.size(); size > 0; size--) { // one level = one minute
                int[] cell = queue.poll();
                for (int[] d : dirs) {
                    int ni = cell[0] + d[0], nj = cell[1] + d[1];
                    if (ni >= 0 && ni < m && nj >= 0 && nj < n && grid[ni][nj] == 1) {
                        grid[ni][nj] = 2; // rot it now so it is queued only once
                        fresh--;
                        queue.add(new int[] {ni, nj});
                    }
                }
            }
            minutes++;
        }
        return fresh == 0 ? minutes : -1;
    }
}
```

```cpp
class Solution {
public:
    int orangesRotting(vector<vector<int>>& grid) {
        int m = grid.size(), n = grid[0].size();
        queue<pair<int, int>> q;
        int fresh = 0;
        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                if (grid[i][j] == 2) q.push({i, j});
                else if (grid[i][j] == 1) fresh++;
            }
        }
        int dirs[4][2] = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
        int minutes = 0;
        while (!q.empty() && fresh > 0) {
            for (int size = q.size(); size > 0; size--) {  // one level = one minute
                auto [i, j] = q.front();
                q.pop();
                for (auto& d : dirs) {
                    int ni = i + d[0], nj = j + d[1];
                    if (ni >= 0 && ni < m && nj >= 0 && nj < n && grid[ni][nj] == 1) {
                        grid[ni][nj] = 2;  // rot it now so it is queued only once
                        fresh--;
                        q.push({ni, nj});
                    }
                }
            }
            minutes++;
        }
        return fresh == 0 ? minutes : -1;
    }
};
```

```javascript
/**
 * @param {number[][]} grid
 * @return {number}
 */
var orangesRotting = function (grid) {
  const m = grid.length;
  const n = grid[0].length;
  let queue = [];
  let fresh = 0;
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (grid[i][j] === 2) {
        queue.push([i, j]);
      } else if (grid[i][j] === 1) {
        fresh++;
      }
    }
  }
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  let minutes = 0;
  while (queue.length > 0 && fresh > 0) {
    const next = []; // the following level = the next minute
    for (const [i, j] of queue) {
      for (const [di, dj] of dirs) {
        const ni = i + di;
        const nj = j + dj;
        if (ni >= 0 && ni < m && nj >= 0 && nj < n && grid[ni][nj] === 1) {
          grid[ni][nj] = 2; // rot it now so it is queued only once
          fresh--;
          next.push([ni, nj]);
        }
      }
    }
    queue = next;
    minutes++;
  }
  return fresh === 0 ? minutes : -1;
};
```

```go
func orangesRotting(grid [][]int) int {
	m, n := len(grid), len(grid[0])
	queue := [][2]int{}
	fresh := 0
	for i := 0; i < m; i++ {
		for j := 0; j < n; j++ {
			if grid[i][j] == 2 {
				queue = append(queue, [2]int{i, j})
			} else if grid[i][j] == 1 {
				fresh++
			}
		}
	}
	dirs := [][2]int{{1, 0}, {-1, 0}, {0, 1}, {0, -1}}
	minutes := 0
	for len(queue) > 0 && fresh > 0 {
		next := [][2]int{} // the following level = the next minute
		for _, cell := range queue {
			for _, d := range dirs {
				ni, nj := cell[0]+d[0], cell[1]+d[1]
				if ni >= 0 && ni < m && nj >= 0 && nj < n && grid[ni][nj] == 1 {
					grid[ni][nj] = 2 // rot it now so it is queued only once
					fresh--
					next = append(next, [2]int{ni, nj})
				}
			}
		}
		queue = next
		minutes++
	}
	if fresh > 0 {
		return -1
	}
	return minutes
}
```
