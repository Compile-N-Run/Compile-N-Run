---
title: Graph Theory
topic: Graph Theory
group: graphs
description: "Graphs explained for interviews: nodes and edges, adjacency lists versus matrices, directed and undirected graphs, traversal, cycle detection and connected components, with a template in Python, Java, C++, JavaScript and Go."
---

## What it is

A graph is a set of **nodes** (also called vertices) and a set of **edges**, each edge joining two nodes. That is all. Cities and roads, people and friendships, courses and prerequisites, web pages and links: when a problem describes things and relationships between pairs of things, it is describing a graph.

A few words you need:

- **Undirected** edges go both ways (a friendship); **directed** edges go one way (a prerequisite, a link). Directed graphs are also called digraphs.
- An edge may carry a **weight** (a distance, a cost); otherwise all edges count the same.
- A **path** is a sequence of nodes joined by edges; a **cycle** is a path that returns to where it began.
- An undirected graph is **connected** if every node can reach every other; the maximal connected pieces are its **components**.
- A directed graph with no cycles is a **DAG** (directed acyclic graph); every dependency problem lives here.
- A **tree** is a connected undirected graph with no cycles, which means exactly n - 1 edges for n nodes.
- The **degree** of a node is how many edges touch it; in a directed graph, **in-degree** counts incoming and **out-degree** outgoing edges.

Interview graph questions are mostly about three things: choosing a representation, traversing (with [Depth-First Search](/interview/topics/depth-first-search/) or [Breadth-First Search](/interview/topics/breadth-first-search/)), and recognising which classic algorithm the wording points to.

## When to use it

- The input is a list of pairs: `edges`, `prerequisites`, `connections`, `flights`, `equations`.
- Words like "connected", "reachable", "network", "neighbours", "dependencies", "cycle", "route".
- A grid where you can move between adjacent cells: that is a graph with up to four edges per cell, no edge list needed.
- A set of states and moves between them (strings one edit apart, lock combinations): an implicit graph, with neighbours generated on the fly.
- "Is it possible to finish / order / assign?" questions on directed dependencies: cycle detection and [Topological Sort](/interview/topics/topological-sort/).
- "Minimum cost / shortest / cheapest" on weighted edges: [Shortest Path](/interview/topics/shortest-path/).

## How it works

**Representation.** The first step of nearly every graph problem is turning the input into something you can walk.

- An **adjacency list** stores, for each node, the list of its neighbours: `adj[u] = [v1, v2, ...]`. It uses O(V + E) space and lets you loop over a node's neighbours in time proportional to how many it has. This is what you want almost always. For weighted graphs store `(neighbour, weight)` pairs.
- An **adjacency matrix** is a V × V table with `m[u][v] = true` (or the weight) when an edge exists. O(V²) space, O(1) edge lookup, O(V) to list neighbours. Fine for small dense graphs, wasteful otherwise.
- The raw **edge list** is good for one thing: building one of the other two. If node names are strings, number them first with a hash map, or use a map from name to neighbour list directly.

For an undirected graph, add each edge in both directions. Forgetting that is the most common graph bug.

**Traversal.** DFS (recursion or a stack) and BFS (a queue) each visit every node reachable from a start in O(V + E). With a `seen` set, wrapping either in a loop over all nodes visits every component once. The template below uses an iterative DFS with an explicit stack, which avoids recursion limits.

**Connected components.** Run the outer loop; each time you find an unseen node, that is a new component, and the traversal from it marks the whole component. For six nodes with edges 0-1, 1-2, 2-0 and 3-4, the starts are 0, 3 and 5, so there are 3 components.

**Cycle detection, undirected.** During DFS, remember the node you came from (the parent). Reaching a seen neighbour that is not the parent means you have found a second way to get there, which closes a cycle. In the example, going 0 → 1 → 2 and seeing 0 (seen, not 2's parent) reports the cycle 0-1-2-0. The graph 3-4 has no such edge. This also tells you whether a graph is a tree: connected and no cycle.

**Cycle detection, directed.** The parent trick does not work (a → b and b → a is a cycle, not a repeat of the same edge). Use three colours: white (unvisited), grey (on the current recursion path), black (finished). Meeting a grey node means a cycle. Or run Kahn's algorithm from [Topological Sort](/interview/topics/topological-sort/) and check whether every node got ordered.

**Union-Find.** For components and undirected cycle checks you can skip traversal: keep a parent array, `find` a node's root with path compression, `union` two roots. An edge whose endpoints already share a root closes a cycle. It is the better tool when edges arrive one at a time.

## Template

Build an adjacency list from an edge list, count components with an iterative DFS, and detect a cycle in an undirected graph.

```python
def build_graph(n, edges, directed=False):
    adj = [[] for _ in range(n)]
    for a, b in edges:
        adj[a].append(b)
        if not directed:
            adj[b].append(a)
    return adj


def components(adj):
    """Count connected components with an iterative DFS (a stack instead of recursion)."""
    seen = [False] * len(adj)
    count = 0
    for start in range(len(adj)):
        if seen[start]:
            continue
        count += 1
        stack = [start]
        seen[start] = True
        while stack:
            node = stack.pop()
            # problem-specific: process node (collect it, add to a sum, ...)
            for nxt in adj[node]:
                if not seen[nxt]:
                    seen[nxt] = True
                    stack.append(nxt)
    return count


def has_cycle(adj):
    """Undirected graph: a seen neighbour that is not the node we came from closes a cycle."""
    seen = [False] * len(adj)

    def dfs(node, parent):
        seen[node] = True
        for nxt in adj[node]:
            if not seen[nxt]:
                if dfs(nxt, node):
                    return True
            elif nxt != parent:
                return True
        return False

    return any(not seen[s] and dfs(s, -1) for s in range(len(adj)))


if __name__ == "__main__":
    adj = build_graph(6, [(0, 1), (1, 2), (2, 0), (3, 4)])
    print(components(adj), has_cycle(adj))  # 3 True
```

```java
import java.util.*;

public class Main {
    static List<List<Integer>> buildGraph(int n, int[][] edges, boolean directed) {
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
        for (int[] e : edges) {
            adj.get(e[0]).add(e[1]);
            if (!directed) adj.get(e[1]).add(e[0]);
        }
        return adj;
    }

    // Count connected components with an iterative DFS (a stack instead of recursion).
    static int components(List<List<Integer>> adj) {
        boolean[] seen = new boolean[adj.size()];
        int count = 0;
        for (int start = 0; start < adj.size(); start++) {
            if (seen[start]) continue;
            count++;
            Deque<Integer> stack = new ArrayDeque<>();
            stack.push(start);
            seen[start] = true;
            while (!stack.isEmpty()) {
                int node = stack.pop();
                // problem-specific: process node (collect it, add to a sum, ...)
                for (int next : adj.get(node)) {
                    if (!seen[next]) {
                        seen[next] = true;
                        stack.push(next);
                    }
                }
            }
        }
        return count;
    }

    // Undirected graph: a seen neighbour that is not the node we came from closes a cycle.
    static boolean hasCycle(List<List<Integer>> adj) {
        boolean[] seen = new boolean[adj.size()];
        for (int s = 0; s < adj.size(); s++) {
            if (!seen[s] && dfs(s, -1, adj, seen)) return true;
        }
        return false;
    }

    static boolean dfs(int node, int parent, List<List<Integer>> adj, boolean[] seen) {
        seen[node] = true;
        for (int next : adj.get(node)) {
            if (!seen[next]) {
                if (dfs(next, node, adj, seen)) return true;
            } else if (next != parent) {
                return true;
            }
        }
        return false;
    }

    public static void main(String[] args) {
        List<List<Integer>> adj = buildGraph(6, new int[][] {{0, 1}, {1, 2}, {2, 0}, {3, 4}}, false);
        System.out.println(components(adj) + " " + hasCycle(adj)); // 3 true
    }
}
```

```cpp
#include <iostream>
#include <vector>
using namespace std;

vector<vector<int>> buildGraph(int n, const vector<pair<int, int>>& edges, bool directed = false) {
    vector<vector<int>> adj(n);
    for (auto [a, b] : edges) {
        adj[a].push_back(b);
        if (!directed) adj[b].push_back(a);
    }
    return adj;
}

// Count connected components with an iterative DFS (a stack instead of recursion).
int components(const vector<vector<int>>& adj) {
    vector<bool> seen(adj.size(), false);
    int count = 0;
    for (int start = 0; start < (int)adj.size(); start++) {
        if (seen[start]) continue;
        count++;
        vector<int> stack = {start};
        seen[start] = true;
        while (!stack.empty()) {
            int node = stack.back();
            stack.pop_back();
            // problem-specific: process node (collect it, add to a sum, ...)
            for (int next : adj[node]) {
                if (!seen[next]) {
                    seen[next] = true;
                    stack.push_back(next);
                }
            }
        }
    }
    return count;
}

// Undirected graph: a seen neighbour that is not the node we came from closes a cycle.
bool dfs(int node, int parent, const vector<vector<int>>& adj, vector<bool>& seen) {
    seen[node] = true;
    for (int next : adj[node]) {
        if (!seen[next]) {
            if (dfs(next, node, adj, seen)) return true;
        } else if (next != parent) {
            return true;
        }
    }
    return false;
}

bool hasCycle(const vector<vector<int>>& adj) {
    vector<bool> seen(adj.size(), false);
    for (int s = 0; s < (int)adj.size(); s++) {
        if (!seen[s] && dfs(s, -1, adj, seen)) return true;
    }
    return false;
}

int main() {
    auto adj = buildGraph(6, {{0, 1}, {1, 2}, {2, 0}, {3, 4}});
    cout << components(adj) << ' ' << boolalpha << hasCycle(adj) << endl;  // 3 true
}
```

```javascript
function buildGraph(n, edges, directed = false) {
  const adj = Array.from({ length: n }, () => []);
  for (const [a, b] of edges) {
    adj[a].push(b);
    if (!directed) adj[b].push(a);
  }
  return adj;
}

// Count connected components with an iterative DFS (a stack instead of recursion).
function components(adj) {
  const seen = new Array(adj.length).fill(false);
  let count = 0;
  for (let start = 0; start < adj.length; start++) {
    if (seen[start]) continue;
    count++;
    const stack = [start];
    seen[start] = true;
    while (stack.length > 0) {
      const node = stack.pop();
      // problem-specific: process node (collect it, add to a sum, ...)
      for (const next of adj[node]) {
        if (!seen[next]) {
          seen[next] = true;
          stack.push(next);
        }
      }
    }
  }
  return count;
}

// Undirected graph: a seen neighbour that is not the node we came from closes a cycle.
function hasCycle(adj) {
  const seen = new Array(adj.length).fill(false);
  function dfs(node, parent) {
    seen[node] = true;
    for (const next of adj[node]) {
      if (!seen[next]) {
        if (dfs(next, node)) return true;
      } else if (next !== parent) {
        return true;
      }
    }
    return false;
  }
  for (let s = 0; s < adj.length; s++) {
    if (!seen[s] && dfs(s, -1)) return true;
  }
  return false;
}

const adj = buildGraph(6, [[0, 1], [1, 2], [2, 0], [3, 4]]);
console.log(components(adj), hasCycle(adj)); // 3 true
```

```go
package main

import "fmt"

func buildGraph(n int, edges [][2]int, directed bool) [][]int {
	adj := make([][]int, n)
	for _, e := range edges {
		adj[e[0]] = append(adj[e[0]], e[1])
		if !directed {
			adj[e[1]] = append(adj[e[1]], e[0])
		}
	}
	return adj
}

// Count connected components with an iterative DFS (a stack instead of recursion).
func components(adj [][]int) int {
	seen := make([]bool, len(adj))
	count := 0
	for start := range adj {
		if seen[start] {
			continue
		}
		count++
		stack := []int{start}
		seen[start] = true
		for len(stack) > 0 {
			node := stack[len(stack)-1]
			stack = stack[:len(stack)-1]
			// problem-specific: process node (collect it, add to a sum, ...)
			for _, next := range adj[node] {
				if !seen[next] {
					seen[next] = true
					stack = append(stack, next)
				}
			}
		}
	}
	return count
}

// Undirected graph: a seen neighbour that is not the node we came from closes a cycle.
func hasCycle(adj [][]int) bool {
	seen := make([]bool, len(adj))
	var dfs func(node, parent int) bool
	dfs = func(node, parent int) bool {
		seen[node] = true
		for _, next := range adj[node] {
			if !seen[next] {
				if dfs(next, node) {
					return true
				}
			} else if next != parent {
				return true
			}
		}
		return false
	}
	for s := range adj {
		if !seen[s] && dfs(s, -1) {
			return true
		}
	}
	return false
}

func main() {
	adj := buildGraph(6, [][2]int{{0, 1}, {1, 2}, {2, 0}, {3, 4}}, false)
	fmt.Println(components(adj), hasCycle(adj)) // 3 true
}
```

## Variations

- **Bipartite check.** Colour nodes with two colours during BFS or DFS so that neighbours differ; a neighbour with the same colour means the graph is not bipartite. "Can these people be split into two groups with no dislikes inside a group?" is this question.
- **Cloning a graph.** DFS or BFS with a hash map from original node to its copy; create the copy on first visit, then wire up neighbours.
- **Grid as graph.** Each cell is a node with up to four neighbours; islands and flood fill never build an adjacency list.
- **Weighted graphs.** Store `(neighbour, weight)` and move to Dijkstra or Bellman-Ford; see [Shortest Path](/interview/topics/shortest-path/).
- **Minimum spanning tree** (Kruskal with Union-Find, or Prim with a heap) when the question is the cheapest set of edges that connects everything.

## Common mistakes

- Adding undirected edges in one direction only.
- Searching only from node 0 and missing the other components.
- Treating parallel edges or self-loops as cycles by accident, or missing them when the problem says they can occur. Ask.
- Using the undirected parent trick on a directed graph, or three-colour DFS when a parent check would do.
- Assuming node labels are `0..n-1`. They may be strings, or integers with gaps; map them first.

## Complexity

Building an adjacency list is O(V + E); DFS and BFS over it are O(V + E) time and O(V) extra space. An adjacency matrix costs O(V²) to build and store, and O(V²) to traverse. Union-Find operations are effectively O(1) each with path compression and union by rank.

## Where to start

1. 1971. Find if Path Exists in Graph: build the adjacency list, run one traversal.
2. 323. Number of Connected Components in an Undirected Graph: the component count in the template.
3. 261. Graph Valid Tree: connected plus no cycle, or Union-Find with an edge count.
4. 133. Clone Graph: traversal with a map from node to copy.
5. 785. Is Graph Bipartite?: two-colouring during traversal.
6. [207. Course Schedule](/interview/problems/course-schedule/): directed cycle detection, the gateway to topological sort.
7. [399. Evaluate Division](/interview/problems/evaluate-division/): nodes are strings and edges carry weights; the representation step is most of the work.
8. 684. Redundant Connection: Union-Find finding the edge that closes a cycle.
