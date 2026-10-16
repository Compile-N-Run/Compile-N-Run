---
title: Depth-First Search
topic: Depth-First Search
group: graphs
description: "Depth-first search explained for interviews: go as deep as you can before backtracking, with a visited set to avoid loops, on graphs, grids and trees, with a template in Python, Java, C++, JavaScript and Go."
---

## What it is

Depth-first search (DFS) is a way of visiting every node reachable from a starting point. From the current node you pick one unvisited neighbour, move to it, and keep going deeper until you are stuck; then you step back to the previous node and try its next neighbour. The name describes the order: depth first, breadth later.

Written recursively it is tiny: mark the node as visited, then call yourself on every neighbour that has not been visited. That recursion, plus a visited set so you never walk in circles, is the whole algorithm. DFS answers "what can I reach from here?" and is the engine behind counting islands, finding connected components, detecting cycles, exploring mazes, and the tree recursion in [Tree](/interview/topics/tree/) and [Binary Tree](/interview/topics/binary-tree/) (which is DFS with no visited set, because trees have no cycles).

## When to use it

- You need to explore everything connected to a starting point: a region in a grid, a component in a graph, all files under a folder.
- The problem says "connected", "reachable", "region", "island", "cluster" or "group".
- You must detect a cycle in a graph, or decide whether an ordering is possible (see [Topological Sort](/interview/topics/topological-sort/)).
- You want to try every path and undo choices: backtracking in a word-search grid, generating combinations. That is DFS with un-marking on the way back.
- The answer depends on finishing all descendants before the node itself (post-order), which DFS gives you naturally and BFS does not.
- If the question is about the *shortest* path in an unweighted graph, do not use DFS: see [Breadth-First Search](/interview/topics/breadth-first-search/).

## How it works

Take an undirected graph with six nodes and edges 0-1, 1-2, 3-4; node 5 is alone. Suppose we count how many connected components it has.

1. Build an adjacency list: `adj[0] = [1]`, `adj[1] = [0, 2]`, `adj[2] = [1]`, `adj[3] = [4]`, `adj[4] = [3]`, `adj[5] = []`.
2. Keep a `visited` array, all false. Loop over every node as a possible start.
3. Node 0 is unvisited, so this is a new component (count = 1). `dfs(0)`: mark 0; neighbour 1 is unvisited, `dfs(1)`: mark 1; neighbour 0 is visited, skip; neighbour 2 is unvisited, `dfs(2)`: mark 2; its only neighbour 1 is visited; return. Back in `dfs(1)`, no more neighbours; return. Back in `dfs(0)`; return.
4. Nodes 1 and 2 are now visited, skip them. Node 3 is unvisited: count = 2, `dfs(3)` marks 3 and 4.
5. Node 4 is visited. Node 5 is unvisited: count = 3, `dfs(5)` marks it and finds nothing.

Answer: 3. Every node was marked exactly once and every edge looked at twice (once from each end), so the total work is O(V + E).

Three details carry across all DFS problems:

- **Mark before you recurse.** Mark a node visited when you enter it, not after exploring it; otherwise a cycle like 0-1-2-0 sends you round forever.
- **Grids are graphs.** A cell's neighbours are the four cells up, down, left and right that are inside the grid. You rarely build an adjacency list; you compute neighbours on the fly and either keep a visited grid or overwrite visited cells in place (turning `'1'` into `'0'` in the islands problem).
- **Recursion depth.** A 1000 × 1000 grid can recurse a million levels deep. Python will overflow. When the graph can be large and skinny, write the iterative version with an explicit stack (see Variations).

## Template

The skeleton counts connected components in an undirected graph given as an edge list; the two commented lines inside `dfs` are where problem-specific work goes.

```python
def dfs(node, adj, visited):
    """Visit node, then every unvisited neighbour, as deep as possible before backtracking."""
    visited[node] = True
    # problem-specific: work on the way in (pre-order), e.g. count this node
    for nxt in adj[node]:
        if not visited[nxt]:
            dfs(nxt, adj, visited)
    # problem-specific: work on the way out (post-order), e.g. combine results


def count_components(n, edges):
    adj = [[] for _ in range(n)]
    for a, b in edges:
        adj[a].append(b)
        adj[b].append(a)  # drop this line for a directed graph
    visited = [False] * n
    components = 0
    for start in range(n):
        if not visited[start]:
            components += 1
            dfs(start, adj, visited)
    return components


if __name__ == "__main__":
    print(count_components(6, [(0, 1), (1, 2), (3, 4)]))  # 3
```

```java
import java.util.*;

public class Main {
    // Visit node, then every unvisited neighbour, as deep as possible before backtracking.
    static void dfs(int node, List<List<Integer>> adj, boolean[] visited) {
        visited[node] = true;
        // problem-specific: work on the way in (pre-order), e.g. count this node
        for (int next : adj.get(node)) {
            if (!visited[next]) dfs(next, adj, visited);
        }
        // problem-specific: work on the way out (post-order), e.g. combine results
    }

    static int countComponents(int n, int[][] edges) {
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
        for (int[] e : edges) {
            adj.get(e[0]).add(e[1]);
            adj.get(e[1]).add(e[0]); // drop this line for a directed graph
        }
        boolean[] visited = new boolean[n];
        int components = 0;
        for (int start = 0; start < n; start++) {
            if (!visited[start]) {
                components++;
                dfs(start, adj, visited);
            }
        }
        return components;
    }

    public static void main(String[] args) {
        System.out.println(countComponents(6, new int[][] {{0, 1}, {1, 2}, {3, 4}})); // 3
    }
}
```

```cpp
#include <iostream>
#include <vector>
using namespace std;

// Visit node, then every unvisited neighbour, as deep as possible before backtracking.
void dfs(int node, const vector<vector<int>>& adj, vector<bool>& visited) {
    visited[node] = true;
    // problem-specific: work on the way in (pre-order), e.g. count this node
    for (int next : adj[node]) {
        if (!visited[next]) dfs(next, adj, visited);
    }
    // problem-specific: work on the way out (post-order), e.g. combine results
}

int countComponents(int n, const vector<pair<int, int>>& edges) {
    vector<vector<int>> adj(n);
    for (auto [a, b] : edges) {
        adj[a].push_back(b);
        adj[b].push_back(a);  // drop this line for a directed graph
    }
    vector<bool> visited(n, false);
    int components = 0;
    for (int start = 0; start < n; start++) {
        if (!visited[start]) {
            components++;
            dfs(start, adj, visited);
        }
    }
    return components;
}

int main() {
    cout << countComponents(6, {{0, 1}, {1, 2}, {3, 4}}) << endl;  // 3
}
```

```javascript
// Visit node, then every unvisited neighbour, as deep as possible before backtracking.
function dfs(node, adj, visited) {
  visited[node] = true;
  // problem-specific: work on the way in (pre-order), e.g. count this node
  for (const next of adj[node]) {
    if (!visited[next]) dfs(next, adj, visited);
  }
  // problem-specific: work on the way out (post-order), e.g. combine results
}

function countComponents(n, edges) {
  const adj = Array.from({ length: n }, () => []);
  for (const [a, b] of edges) {
    adj[a].push(b);
    adj[b].push(a); // drop this line for a directed graph
  }
  const visited = new Array(n).fill(false);
  let components = 0;
  for (let start = 0; start < n; start++) {
    if (!visited[start]) {
      components++;
      dfs(start, adj, visited);
    }
  }
  return components;
}

console.log(countComponents(6, [[0, 1], [1, 2], [3, 4]])); // 3
```

```go
package main

import "fmt"

// Visit node, then every unvisited neighbour, as deep as possible before backtracking.
func dfs(node int, adj [][]int, visited []bool) {
	visited[node] = true
	// problem-specific: work on the way in (pre-order), e.g. count this node
	for _, next := range adj[node] {
		if !visited[next] {
			dfs(next, adj, visited)
		}
	}
	// problem-specific: work on the way out (post-order), e.g. combine results
}

func countComponents(n int, edges [][2]int) int {
	adj := make([][]int, n)
	for _, e := range edges {
		adj[e[0]] = append(adj[e[0]], e[1])
		adj[e[1]] = append(adj[e[1]], e[0]) // drop this line for a directed graph
	}
	visited := make([]bool, n)
	components := 0
	for start := 0; start < n; start++ {
		if !visited[start] {
			components++
			dfs(start, adj, visited)
		}
	}
	return components
}

func main() {
	fmt.Println(countComponents(6, [][2]int{{0, 1}, {1, 2}, {3, 4}})) // 3
}
```

## Variations

- **Iterative with a stack.** Push the start; while the stack is not empty, pop a node, skip it if already visited, mark it, push its neighbours. Same order of magnitude of work, no recursion limit. Post-order work is harder to place in this form; if you need it, push each node twice (once to expand, once to finish) or stick with recursion.
- **Grid DFS.** `dfs(r, c)`: return if out of bounds or the cell is not of the kind we want or already visited; mark it; recurse on `(r+1, c)`, `(r-1, c)`, `(r, c+1)`, `(r, c-1)`. The outer loop over all cells counts regions exactly like the component count above.
- **Backtracking.** When exploring paths rather than regions (Word Search), un-mark the cell after the recursive calls return so other paths may use it. The visited state is per path, not global.
- **Cycle detection in a directed graph.** Use three states instead of two: unvisited, *in progress* (on the current recursion path), done. Reaching an in-progress node means a cycle. This is how Course Schedule is solved with DFS.
- **Memoised DFS.** When the same node is reached by many paths and its answer never changes (Longest Increasing Path in a Matrix), cache the result per node; this turns an exponential search into O(V + E).

## Common mistakes

- Marking a node visited *after* the recursive calls instead of before, which loops forever on a cycle.
- Forgetting the outer loop over all nodes, so components not connected to node 0 are never counted.
- Forgetting the bounds check in grid DFS, or checking it after indexing into the grid.
- Resetting the visited structure inside the recursion, or sharing it between independent test cases.
- Using DFS to find a shortest path. DFS finds *a* path; the first one it finds is not the shortest.
- Recursing a million levels deep in Python without raising the limit or switching to a stack.

## Complexity

O(V + E) time for a graph with V nodes and E edges, since each node is marked once and each edge examined a constant number of times. For an R × C grid that is O(R · C). Space is O(V) for the visited set plus the recursion stack (or explicit stack), which can also reach O(V).

## Where to start

1. 733. Flood Fill: grid DFS from one cell, replacing a colour.
2. [200. Number of Islands](/interview/problems/number-of-islands/): the outer loop over all cells plus a region DFS; the single most common DFS interview question.
3. 695. Max Area of Island: the same DFS, now returning a count upwards.
4. 841. Keys and Rooms: reachability in a directed graph with an adjacency list.
5. 323. Number of Connected Components in an Undirected Graph: the template as it stands.
6. [79. Word Search](/interview/problems/word-search/): DFS with backtracking, un-marking cells after each attempt.
7. [207. Course Schedule](/interview/problems/course-schedule/): cycle detection with three node states.
8. [399. Evaluate Division](/interview/problems/evaluate-division/): DFS on a weighted graph, multiplying along the path.
