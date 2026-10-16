---
title: Breadth-First Search
topic: Breadth-First Search
group: graphs
description: "Breadth-first search explained for interviews: explore a graph level by level with a queue so the first time you reach a node is the shortest way, on graphs, grids and trees, with a template in Python, Java, C++, JavaScript and Go."
---

## What it is

Breadth-first search (BFS) visits a graph in rings around the starting point: first the start, then everything one step away, then everything two steps away, and so on. A queue makes this happen: you take the node at the front, add its unvisited neighbours to the back, and repeat. Because the queue is first-in, first-out, nodes are processed in order of their distance from the start.

That ordering is why BFS matters. When every edge costs the same, the *first* time BFS reaches a node is along a shortest path, so BFS is the shortest-path algorithm for unweighted graphs: fewest moves, fewest steps, minimum number of word changes. It is also the natural way to process a tree level by level. For weighted edges, see [Shortest Path](/interview/topics/shortest-path/); for exploring without caring about distance, [Depth-First Search](/interview/topics/depth-first-search/) is usually shorter to write.

## When to use it

- The problem asks for the *minimum number of steps*, *shortest path*, *fewest moves* or *least time* and every step costs the same.
- Something spreads outward in rounds: rotting oranges, fire, infection, "how many minutes until". Each round is one BFS level.
- A tree or graph must be processed level by level: values per level, the rightmost node on each level, the widest level.
- You need the distance from a source to every node, or the nearest cell of some kind to every cell in a grid.
- The state space is implicit: positions of a lock, strings one edit apart, a knight on a board. Each state is a node and each legal move is an edge; BFS finds the fewest moves.

## How it works

Take an undirected graph with nodes 0 to 5 and edges 0-1, 0-2, 1-3, 2-3, 3-4. Node 5 has no edges. We want the distance from node 0 to every node.

1. Keep `dist` for every node, `-1` for "not reached yet". Set `dist[0] = 0` and put 0 in the queue.
2. Pop 0. Its neighbours 1 and 2 are unreached: set `dist[1] = dist[2] = 1`, push both. Queue: `[1, 2]`.
3. Pop 1. Neighbour 0 is reached, skip. Neighbour 3 is unreached: `dist[3] = 2`, push. Queue: `[2, 3]`.
4. Pop 2. Neighbours 0 and 3 are both reached already. Nothing to add. Queue: `[3]`.
5. Pop 3. Neighbours 1, 2 reached. Neighbour 4 unreached: `dist[4] = 3`, push. Queue: `[4]`.
6. Pop 4. Neighbour 3 reached. Queue is empty; stop.

Result: `[0, 1, 1, 2, 3, -1]`. Node 5 keeps `-1` because nothing leads to it. Node 3 was reachable through 1 and through 2, both at distance 2; we recorded it the first time (via 1) and ignored the second, which is exactly right.

Three habits that keep BFS correct:

- **Mark when you enqueue, not when you dequeue.** If you mark on dequeue, the same node can be pushed several times before it is processed, blowing up the queue and corrupting distances. Setting `dist` (or `visited`) at push time means each node enters the queue once.
- **The distance array doubles as the visited set.** `dist[x] == -1` means never seen. You do not need a separate structure.
- **Levels, when you need them.** If the problem counts rounds rather than per-node distances, process the queue one level at a time: note the queue's length `k`, pop exactly `k` nodes, push their neighbours, and increment the round counter once. The template records distances per node instead, which covers the same information.

## Template

The skeleton computes the distance from `start` to every node in an unweighted graph given as an adjacency list. Return early from the marked spot when you only need the distance to one target.

```python
from collections import deque


def bfs(start, adj):
    """Return the distance (in edges) from start to every node, -1 if unreachable."""
    dist = [-1] * len(adj)
    dist[start] = 0
    queue = deque([start])
    while queue:
        node = queue.popleft()
        # problem-specific: if node is the target, return dist[node] here
        for nxt in adj[node]:
            if dist[nxt] == -1:  # first time we reach nxt, so this is the shortest way
                dist[nxt] = dist[node] + 1
                queue.append(nxt)
    return dist


if __name__ == "__main__":
    adj = [[1, 2], [0, 3], [0, 3], [1, 2, 4], [3], []]
    print(bfs(0, adj))  # [0, 1, 1, 2, 3, -1]
```

```java
import java.util.*;

public class Main {
    // Return the distance (in edges) from start to every node, -1 if unreachable.
    static int[] bfs(int start, List<List<Integer>> adj) {
        int[] dist = new int[adj.size()];
        Arrays.fill(dist, -1);
        dist[start] = 0;
        Deque<Integer> queue = new ArrayDeque<>();
        queue.add(start);
        while (!queue.isEmpty()) {
            int node = queue.poll();
            // problem-specific: if node is the target, return dist[node] here
            for (int next : adj.get(node)) {
                if (dist[next] == -1) { // first time we reach next, so this is the shortest way
                    dist[next] = dist[node] + 1;
                    queue.add(next);
                }
            }
        }
        return dist;
    }

    public static void main(String[] args) {
        List<List<Integer>> adj = List.of(
            List.of(1, 2), List.of(0, 3), List.of(0, 3), List.of(1, 2, 4), List.of(3), List.of());
        System.out.println(Arrays.toString(bfs(0, adj))); // [0, 1, 1, 2, 3, -1]
    }
}
```

```cpp
#include <iostream>
#include <queue>
#include <vector>
using namespace std;

// Return the distance (in edges) from start to every node, -1 if unreachable.
vector<int> bfs(int start, const vector<vector<int>>& adj) {
    vector<int> dist(adj.size(), -1);
    dist[start] = 0;
    queue<int> q;
    q.push(start);
    while (!q.empty()) {
        int node = q.front();
        q.pop();
        // problem-specific: if node is the target, return dist[node] here
        for (int next : adj[node]) {
            if (dist[next] == -1) {  // first time we reach next, so this is the shortest way
                dist[next] = dist[node] + 1;
                q.push(next);
            }
        }
    }
    return dist;
}

int main() {
    vector<vector<int>> adj = {{1, 2}, {0, 3}, {0, 3}, {1, 2, 4}, {3}, {}};
    for (int d : bfs(0, adj)) cout << d << ' ';
    cout << endl;  // 0 1 1 2 3 -1
}
```

```javascript
// Return the distance (in edges) from start to every node, -1 if unreachable.
function bfs(start, adj) {
  const dist = new Array(adj.length).fill(-1);
  dist[start] = 0;
  const queue = [start];
  let head = 0; // index of the front; shifting an array is O(n), this is O(1)
  while (head < queue.length) {
    const node = queue[head++];
    // problem-specific: if node is the target, return dist[node] here
    for (const next of adj[node]) {
      if (dist[next] === -1) {
        // first time we reach next, so this is the shortest way
        dist[next] = dist[node] + 1;
        queue.push(next);
      }
    }
  }
  return dist;
}

const adj = [[1, 2], [0, 3], [0, 3], [1, 2, 4], [3], []];
console.log(bfs(0, adj)); // [0, 1, 1, 2, 3, -1]
```

```go
package main

import "fmt"

// Return the distance (in edges) from start to every node, -1 if unreachable.
func bfs(start int, adj [][]int) []int {
	dist := make([]int, len(adj))
	for i := range dist {
		dist[i] = -1
	}
	dist[start] = 0
	queue := []int{start}
	for len(queue) > 0 {
		node := queue[0]
		queue = queue[1:]
		// problem-specific: if node is the target, return dist[node] here
		for _, next := range adj[node] {
			if dist[next] == -1 { // first time we reach next, so this is the shortest way
				dist[next] = dist[node] + 1
				queue = append(queue, next)
			}
		}
	}
	return dist
}

func main() {
	adj := [][]int{{1, 2}, {0, 3}, {0, 3}, {1, 2, 4}, {3}, {}}
	fmt.Println(bfs(0, adj)) // [0 1 1 2 3 -1]
}
```

## Variations

- **Grid BFS.** Nodes are cells `(r, c)`; neighbours are the four (sometimes eight) adjacent cells inside the grid that are passable. Store `dist` as a 2-D array or encode the cell as `r * cols + c`.
- **Multi-source BFS.** To find the distance from *every* cell to the nearest cell of some kind (nearest 0 in a 0/1 matrix, nearest gate, all rotten oranges at once), push all the sources into the queue at the start with distance 0. One BFS then does what a BFS per source would have done.
- **Level-order on a tree.** Same loop, no visited set (trees have no cycles), and the per-level `k` trick to split output by level.
- **Implicit graphs.** Word Ladder's nodes are words and its edges are single-letter changes; Open the Lock's nodes are 4-digit combinations. Generate neighbours on the fly and keep visited as a hash set of states.
- **Bidirectional BFS.** Search from both ends and stop when the frontiers meet; the frontiers stay much smaller. Worth mentioning for Word Ladder, rarely required.
- **0-1 BFS.** When edges cost 0 or 1, use a deque: push cost-0 moves to the front and cost-1 moves to the back. This keeps the queue sorted by distance without a heap.

## Common mistakes

- Marking visited at dequeue time, so nodes are enqueued many times. On dense graphs this is the difference between passing and timing out.
- Using DFS for a shortest path. DFS returns the first path it stumbles on.
- Forgetting the bounds check on a grid, or checking a cell *after* reading it.
- Modifying the queue while counting a level: capture its length before the inner loop.
- Starting with the sources at distance 1 instead of 0 in multi-source problems, so every answer is off by one.
- Using a list's `pop(0)` in Python or `shift()` in JavaScript on large inputs; both are O(n). Use `deque` or a head index.

## Complexity

O(V + E) time: every node enters the queue once and every edge is looked at once per endpoint. O(V) space for the distances and the queue. On a grid, V is the number of cells and E is about 4V, so O(rows × cols).

## Where to start

1. 102. Binary Tree Level Order Traversal: the queue plus the per-level count, with no visited set to worry about.
2. 1971. Find if Path Exists in Graph: BFS on an adjacency list, returning as soon as the target is popped.
3. [994. Rotting Oranges](/interview/problems/rotting-oranges/): multi-source BFS on a grid, counting rounds.
4. 542. 01 Matrix: multi-source BFS where the answer is the distance grid itself.
5. 1091. Shortest Path in Binary Matrix: single-source grid BFS with eight directions.
6. [200. Number of Islands](/interview/problems/number-of-islands/): usually solved with DFS; solve it with BFS to see that both work for reachability.
7. 752. Open the Lock: an implicit graph of states with a hash set as visited.
8. [127. Word Ladder](/interview/problems/word-ladder/): an implicit graph where generating neighbours efficiently is half the problem.
