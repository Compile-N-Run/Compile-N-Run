---
title: Topological Sort
topic: Topological Sort
group: graphs
description: "Topological sort explained for interviews: order the nodes of a directed acyclic graph so every edge points forward, using Kahn's in-degree queue or DFS post-order, and detect cycles for free, with a template in Python, Java, C++, JavaScript and Go."
---

## What it is

A topological order of a directed graph is a list of its nodes in which every edge points from an earlier node to a later one. If the edges mean "must come before" (a prerequisite before its course, a library before the code that imports it, a task before the task that needs its output), a topological order is a valid schedule.

Such an order exists exactly when the graph has no cycle, which is why the input is always a directed acyclic graph (DAG) or the question is "can this be done at all?". The same algorithm answers both: produce the order if possible, and report a cycle if not. Most graphs have many valid orders; unless the problem asks for a particular one (smallest lexicographically, say), any order is fine.

## When to use it

- The problem has "prerequisites", "dependencies", "must be built before", "comes before" or "ordering" with directed pairs.
- "Can all the courses/tasks be finished?" is asking whether the dependency graph has a cycle.
- "Return an order in which to take them" is asking for a topological order.
- Minimum number of semesters/rounds when tasks run in parallel: the longest chain in a DAG, computed level by level in Kahn's algorithm.
- Reconstruct an unknown ordering from pairwise observations (an alien alphabet from sorted words).
- Trimming leaves from a tree inward, layer by layer (minimum height trees), is the same in-degree queue on an undirected graph.

## How it works

The usual interview method is **Kahn's algorithm**, which works from the nodes that have nothing before them.

1. Build an adjacency list and count each node's **in-degree**: how many edges point into it.
2. Put every node with in-degree 0 into a queue. These have no prerequisites, so they can go first.
3. Pop a node, append it to the order, and for each outgoing edge decrease the neighbour's in-degree by one. If a neighbour's in-degree hits 0, all of its prerequisites are done, so push it.
4. When the queue empties, if the order contains every node you are done. If it is shorter, the remaining nodes all sit on or behind a cycle: their in-degree never reached 0 because they are waiting for each other.

Six tasks with edges 5→2, 5→0, 4→0, 4→1, 2→3, 3→1 (a→b means a must come before b):

- In-degrees: `0:2, 1:2, 2:1, 3:1, 4:0, 5:0`. Queue: `[4, 5]`.
- Pop 4. Order `[4]`. Edges to 0 and 1 drop their in-degrees to 1 and 1. Nothing new.
- Pop 5. Order `[4, 5]`. Node 2 drops to 0 (push), node 0 drops to 0 (push). Queue `[2, 0]`.
- Pop 2. Order `[4, 5, 2]`. Node 3 drops to 0, push. Queue `[0, 3]`.
- Pop 0. Nothing points out of it. Pop 3: node 1 drops to 0, push. Pop 1.
- Order `[4, 5, 2, 0, 3, 1]`, six nodes, so no cycle. Check an edge: 3→1, and 3 comes before 1. Good.

Add an edge 1→5 and the picture changes: 5's in-degree starts at 1, so only 4 is in the queue; after it, 0 and 1 still wait, and 5 waits on 1. The queue empties with one node in the order. Fewer than six means a cycle (here 5→2→3→1→5).

The other method is **DFS with post-order**: run DFS, and append each node to a list *after* all of its outgoing neighbours have been fully explored. Reversing that list gives a topological order. Cycles are detected with three colours (white, grey on the current path, black done); hitting a grey node means a cycle. Both methods are O(V + E). Kahn's is easier to get right under pressure, gives levels for free, and has no recursion limit, so it is the template below.

## Template

Kahn's algorithm on `n` nodes with edges `(a, b)` meaning "a before b". It returns the order, or an empty list when a cycle makes ordering impossible.

```python
from collections import deque


def topo_order(n, edges):
    """Kahn's algorithm. edges are (a, b) meaning a must come before b. Returns [] if there is a cycle."""
    adj = [[] for _ in range(n)]
    indegree = [0] * n
    for a, b in edges:
        adj[a].append(b)
        indegree[b] += 1
    queue = deque(i for i in range(n) if indegree[i] == 0)
    order = []
    while queue:
        node = queue.popleft()
        order.append(node)
        # problem-specific: process node; one level of the queue is one "round" if you need rounds
        for nxt in adj[node]:
            indegree[nxt] -= 1
            if indegree[nxt] == 0:  # all of nxt's prerequisites are done
                queue.append(nxt)
    return order if len(order) == n else []  # fewer than n nodes means a cycle blocked the rest


if __name__ == "__main__":
    print(topo_order(6, [(5, 2), (5, 0), (4, 0), (4, 1), (2, 3), (3, 1)]))  # [4, 5, 2, 0, 3, 1]
    print(topo_order(3, [(0, 1), (1, 2), (2, 0)]))  # []
```

```java
import java.util.*;

public class Main {
    // Kahn's algorithm. edges are {a, b} meaning a must come before b. Returns an empty list if there is a cycle.
    static List<Integer> topoOrder(int n, int[][] edges) {
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
        int[] indegree = new int[n];
        for (int[] e : edges) {
            adj.get(e[0]).add(e[1]);
            indegree[e[1]]++;
        }
        Deque<Integer> queue = new ArrayDeque<>();
        for (int i = 0; i < n; i++) if (indegree[i] == 0) queue.add(i);
        List<Integer> order = new ArrayList<>();
        while (!queue.isEmpty()) {
            int node = queue.poll();
            order.add(node);
            // problem-specific: process node; one level of the queue is one "round" if you need rounds
            for (int next : adj.get(node)) {
                if (--indegree[next] == 0) queue.add(next); // all of next's prerequisites are done
            }
        }
        return order.size() == n ? order : new ArrayList<>(); // fewer than n nodes means a cycle blocked the rest
    }

    public static void main(String[] args) {
        System.out.println(topoOrder(6, new int[][] {{5, 2}, {5, 0}, {4, 0}, {4, 1}, {2, 3}, {3, 1}})); // [4, 5, 2, 0, 3, 1]
        System.out.println(topoOrder(3, new int[][] {{0, 1}, {1, 2}, {2, 0}})); // []
    }
}
```

```cpp
#include <iostream>
#include <queue>
#include <vector>
using namespace std;

// Kahn's algorithm. edges are {a, b} meaning a must come before b. Returns an empty vector if there is a cycle.
vector<int> topoOrder(int n, const vector<pair<int, int>>& edges) {
    vector<vector<int>> adj(n);
    vector<int> indegree(n, 0);
    for (auto [a, b] : edges) {
        adj[a].push_back(b);
        indegree[b]++;
    }
    queue<int> q;
    for (int i = 0; i < n; i++) if (indegree[i] == 0) q.push(i);
    vector<int> order;
    while (!q.empty()) {
        int node = q.front();
        q.pop();
        order.push_back(node);
        // problem-specific: process node; one level of the queue is one "round" if you need rounds
        for (int next : adj[node]) {
            if (--indegree[next] == 0) q.push(next);  // all of next's prerequisites are done
        }
    }
    if ((int)order.size() != n) return {};  // fewer than n nodes means a cycle blocked the rest
    return order;
}

int main() {
    for (int x : topoOrder(6, {{5, 2}, {5, 0}, {4, 0}, {4, 1}, {2, 3}, {3, 1}})) cout << x << ' ';
    cout << endl;  // 4 5 2 0 3 1
    cout << topoOrder(3, {{0, 1}, {1, 2}, {2, 0}}).size() << endl;  // 0
}
```

```javascript
// Kahn's algorithm. edges are [a, b] meaning a must come before b. Returns [] if there is a cycle.
function topoOrder(n, edges) {
  const adj = Array.from({ length: n }, () => []);
  const indegree = new Array(n).fill(0);
  for (const [a, b] of edges) {
    adj[a].push(b);
    indegree[b]++;
  }
  const queue = [];
  for (let i = 0; i < n; i++) if (indegree[i] === 0) queue.push(i);
  const order = [];
  let head = 0;
  while (head < queue.length) {
    const node = queue[head++];
    order.push(node);
    // problem-specific: process node; one level of the queue is one "round" if you need rounds
    for (const next of adj[node]) {
      if (--indegree[next] === 0) queue.push(next); // all of next's prerequisites are done
    }
  }
  return order.length === n ? order : []; // fewer than n nodes means a cycle blocked the rest
}

console.log(topoOrder(6, [[5, 2], [5, 0], [4, 0], [4, 1], [2, 3], [3, 1]])); // [4, 5, 2, 0, 3, 1]
console.log(topoOrder(3, [[0, 1], [1, 2], [2, 0]])); // []
```

```go
package main

import "fmt"

// Kahn's algorithm. edges are {a, b} meaning a must come before b. Returns nil if there is a cycle.
func topoOrder(n int, edges [][2]int) []int {
	adj := make([][]int, n)
	indegree := make([]int, n)
	for _, e := range edges {
		adj[e[0]] = append(adj[e[0]], e[1])
		indegree[e[1]]++
	}
	queue := []int{}
	for i := 0; i < n; i++ {
		if indegree[i] == 0 {
			queue = append(queue, i)
		}
	}
	order := []int{}
	for len(queue) > 0 {
		node := queue[0]
		queue = queue[1:]
		order = append(order, node)
		// problem-specific: process node; one level of the queue is one "round" if you need rounds
		for _, next := range adj[node] {
			indegree[next]--
			if indegree[next] == 0 { // all of next's prerequisites are done
				queue = append(queue, next)
			}
		}
	}
	if len(order) != n { // fewer than n nodes means a cycle blocked the rest
		return nil
	}
	return order
}

func main() {
	fmt.Println(topoOrder(6, [][2]int{{5, 2}, {5, 0}, {4, 0}, {4, 1}, {2, 3}, {3, 1}})) // [4 5 2 0 3 1]
	fmt.Println(topoOrder(3, [][2]int{{0, 1}, {1, 2}, {2, 0}}))                         // []
}
```

## Variations

- **Just the yes/no.** Course Schedule only asks whether an order exists: return `len(order) == n`.
- **Rounds or levels.** Process the queue one level at a time (take its current length, pop that many) and count levels: that is the minimum number of semesters when any number of courses can be taken at once, or the longest chain in the DAG.
- **Smallest order.** Replace the queue with a min-heap and you get the lexicographically smallest topological order.
- **Edges hidden in the input.** Alien Dictionary gives sorted words; comparing each adjacent pair yields one edge from the first differing letters. Build the edges first, then this template.
- **Leaf trimming on undirected graphs.** Minimum Height Trees repeatedly removes all nodes of degree 1; it is Kahn's loop with degree instead of in-degree, stopping when one or two nodes remain.
- **DFS variant.** Post-order DFS with three colours gives the reverse of a topological order; useful when you already have a DFS written for something else.

## Common mistakes

- Building the edge backwards. Read the problem's pair format carefully: `[a, b]` may mean "take b before a" (as in Course Schedule) rather than "a before b".
- Forgetting to check `len(order) == n`, so a graph with a cycle returns a partial order that looks fine.
- Pushing a node when its in-degree is *decremented* rather than when it *reaches 0*.
- Starting the queue with only node 0 instead of all zero-in-degree nodes.
- Counting nodes from the edge list alone and missing isolated nodes that appear in no edge; they belong in the order too.
- Using the undirected parent-check cycle detection on a directed graph.

## Complexity

O(V + E) time: each node enters and leaves the queue once, and each edge decrements one in-degree once. O(V + E) space for the adjacency list, in-degrees and queue. The heap variant for the smallest order costs O((V + E) log V).

## Where to start

1. [207. Course Schedule](/interview/problems/course-schedule/): can the graph be ordered at all? The template with a boolean result.
2. [210. Course Schedule II](/interview/problems/course-schedule-ii/): return the order itself.
3. 1136. Parallel Courses: count levels of the queue to get the minimum number of semesters.
4. 802. Find Eventual Safe States: run Kahn's on the reversed graph; nodes that get ordered are safe.
5. 310. Minimum Height Trees: the leaf-trimming variant on an undirected tree.
6. 269. Alien Dictionary: derive the edges from adjacent words, then sort; the classic hard.
7. 444. Sequence Reconstruction: a topological order that must be unique, which means the queue never holds more than one node.
