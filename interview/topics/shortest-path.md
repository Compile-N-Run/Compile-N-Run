---
title: Shortest Path
topic: Shortest Path
group: graphs
description: "Shortest paths explained for interviews: BFS when every edge costs the same, Dijkstra with a min-heap for non-negative weights, and when Bellman-Ford or Floyd-Warshall is the right tool, with a template in Python, Java, C++, JavaScript and Go."
---

## What it is

A shortest path problem asks for the cheapest way to get from one node of a graph to another, where "cheapest" adds up the weights of the edges along the way: the fewest moves, the least travel time, the lowest fare, the smallest total effort. The answer is a number (the distance), sometimes also the path itself, and often the distance from one source to *every* node, because the standard algorithms compute that anyway.

Which algorithm to use depends on the weights:

- **All edges cost the same** (or 1): [Breadth-First Search](/interview/topics/breadth-first-search/). O(V + E).
- **Weights are non-negative**: Dijkstra's algorithm with a min-heap. O((V + E) log V). This is the one interviewers expect you to write.
- **Some weights are negative**: Bellman-Ford, O(V · E), which also detects negative cycles.
- **Every pair of nodes**, small graph: Floyd-Warshall, O(V³), three nested loops.

The general-graph background (adjacency lists, directed versus undirected) is in [Graph Theory](/interview/topics/graph-theory/).

## When to use it

- "Shortest", "cheapest", "minimum cost", "minimum time", "least effort" between two places, with a cost on each step.
- Edges are given as `(from, to, weight)` triples: flights with prices, roads with lengths, `times[i] = (u, v, w)` for network delay.
- A grid where entering a cell has a cost (its height difference, an obstacle you must remove, a time), rather than every step costing 1.
- "Maximum probability" or "minimum of the maximum edge" along a path: Dijkstra works with any combining rule that only gets worse as the path grows.
- "Within k stops" or "negative weights allowed": Bellman-Ford, limited to k + 1 rounds.
- "Distance between every pair of cities": Floyd-Warshall if there are at most a few hundred nodes.

## How it works

**Dijkstra's idea.** Keep a `dist` array, initially infinite everywhere except `dist[source] = 0`. Repeatedly take the unfinished node with the smallest known distance; its distance is now final, because every other way of reaching it would pass through something at least as far away (this is where non-negative weights matter). Then **relax** its outgoing edges: for each edge `node → next` of weight `w`, if `dist[node] + w < dist[next]`, you have found a shorter way, so update `dist[next]`. A min-heap of `(distance, node)` pairs finds the smallest unfinished node quickly.

Five nodes, directed edges 0→1 (4), 0→2 (1), 2→1 (2), 1→3 (1), 2→3 (5). Source 0.

- Start: `dist = [0, inf, inf, inf, inf]`, heap `[(0, 0)]`.
- Pop (0, 0). Relax 0→1: `dist[1] = 4`. Relax 0→2: `dist[2] = 1`. Heap: `[(1, 2), (4, 1)]`.
- Pop (1, 2). Relax 2→1: `1 + 2 = 3 < 4`, so `dist[1] = 3`, push (3, 1). Relax 2→3: `dist[3] = 6`. Heap: `[(3, 1), (4, 1), (6, 3)]`.
- Pop (3, 1). Relax 1→3: `3 + 1 = 4 < 6`, so `dist[3] = 4`, push (4, 3). Heap: `[(4, 1), (4, 3), (6, 3)]`.
- Pop (4, 1). But `dist[1]` is 3, smaller than 4: this is a **stale** entry left over from before we found the better route. Skip it.
- Pop (4, 3). Relax nothing (3 has no outgoing edges). Pop (6, 3): stale, skip.
- Done: `dist = [0, 3, 1, 4, inf]`. Node 4 is unreachable.

The stale-entry check (`if d > dist[node]: continue`) is what lets you push duplicates freely instead of needing a heap with a decrease-key operation. Each node is *processed* once; the heap may hold up to E entries.

**Bellman-Ford.** Instead of a heap, loop V - 1 times over the whole edge list, relaxing every edge. After round i, every shortest path using at most i edges is correct. It handles negative weights, and if a V-th round still improves something there is a negative cycle. Capping the rounds at k + 1 and relaxing from a *copy* of the previous round's distances gives "cheapest path with at most k stops".

**Floyd-Warshall.** `dist[i][j]` starts as the direct edge weight (infinite if none, 0 on the diagonal). For each intermediate node `k`, for every pair `(i, j)`, set `dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j])`. Three loops, `k` outermost.

## Template

Dijkstra from one source over a directed weighted graph given as `(a, b, w)` triples. Uncomment the marked line for an undirected graph.

```python
import heapq


def dijkstra(n, edges, source):
    """edges are (a, b, w): a one-way road a -> b of length w >= 0. Returns dist to every node (inf if unreachable)."""
    adj = [[] for _ in range(n)]
    for a, b, w in edges:
        adj[a].append((b, w))
        # adj[b].append((a, w))  # add for an undirected graph
    INF = float("inf")
    dist = [INF] * n
    dist[source] = 0
    heap = [(0, source)]  # (distance so far, node)
    while heap:
        d, node = heapq.heappop(heap)
        if d > dist[node]:
            continue  # stale entry: we already found something shorter
        # problem-specific: if node is the target, return d here
        for nxt, w in adj[node]:
            if d + w < dist[nxt]:  # relax the edge
                dist[nxt] = d + w
                heapq.heappush(heap, (dist[nxt], nxt))
    return dist


if __name__ == "__main__":
    edges = [(0, 1, 4), (0, 2, 1), (2, 1, 2), (1, 3, 1), (2, 3, 5)]
    print(dijkstra(5, edges, 0))  # [0, 3, 1, 4, inf]
```

```java
import java.util.*;

public class Main {
    static final int INF = Integer.MAX_VALUE;

    // edges are {a, b, w}: a one-way road a -> b of length w >= 0. Returns dist to every node (INF if unreachable).
    static int[] dijkstra(int n, int[][] edges, int source) {
        List<List<int[]>> adj = new ArrayList<>();
        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
        for (int[] e : edges) {
            adj.get(e[0]).add(new int[] {e[1], e[2]});
            // adj.get(e[1]).add(new int[] {e[0], e[2]}); // add for an undirected graph
        }
        int[] dist = new int[n];
        Arrays.fill(dist, INF);
        dist[source] = 0;
        PriorityQueue<int[]> heap = new PriorityQueue<>((x, y) -> Integer.compare(x[0], y[0])); // {distance so far, node}
        heap.add(new int[] {0, source});
        while (!heap.isEmpty()) {
            int[] top = heap.poll();
            int d = top[0], node = top[1];
            if (d > dist[node]) continue; // stale entry: we already found something shorter
            // problem-specific: if node is the target, return d here
            for (int[] edge : adj.get(node)) {
                int next = edge[0], w = edge[1];
                if (d + w < dist[next]) { // relax the edge
                    dist[next] = d + w;
                    heap.add(new int[] {dist[next], next});
                }
            }
        }
        return dist;
    }

    public static void main(String[] args) {
        int[][] edges = {{0, 1, 4}, {0, 2, 1}, {2, 1, 2}, {1, 3, 1}, {2, 3, 5}};
        int[] dist = dijkstra(5, edges, 0);
        for (int d : dist) System.out.print((d == INF ? "inf" : String.valueOf(d)) + " ");
        System.out.println(); // 0 3 1 4 inf
    }
}
```

```cpp
#include <iostream>
#include <queue>
#include <tuple>
#include <vector>
using namespace std;

const long long INF = 1e18;

// edges are {a, b, w}: a one-way road a -> b of length w >= 0. Returns dist to every node (INF if unreachable).
vector<long long> dijkstra(int n, const vector<tuple<int, int, int>>& edges, int source) {
    vector<vector<pair<int, int>>> adj(n);
    for (auto [a, b, w] : edges) {
        adj[a].push_back({b, w});
        // adj[b].push_back({a, w});  // add for an undirected graph
    }
    vector<long long> dist(n, INF);
    dist[source] = 0;
    // (distance so far, node); greater<> turns the max-heap into a min-heap
    priority_queue<pair<long long, int>, vector<pair<long long, int>>, greater<>> heap;
    heap.push({0, source});
    while (!heap.empty()) {
        auto [d, node] = heap.top();
        heap.pop();
        if (d > dist[node]) continue;  // stale entry: we already found something shorter
        // problem-specific: if node is the target, return d here
        for (auto [next, w] : adj[node]) {
            if (d + w < dist[next]) {  // relax the edge
                dist[next] = d + w;
                heap.push({dist[next], next});
            }
        }
    }
    return dist;
}

int main() {
    vector<tuple<int, int, int>> edges = {{0, 1, 4}, {0, 2, 1}, {2, 1, 2}, {1, 3, 1}, {2, 3, 5}};
    for (long long d : dijkstra(5, edges, 0)) {
        if (d == INF) cout << "inf ";
        else cout << d << ' ';
    }
    cout << endl;  // 0 3 1 4 inf
}
```

```javascript
// A small binary min-heap of [distance, node] pairs; JavaScript has no built-in priority queue.
class MinHeap {
  constructor() {
    this.a = [];
  }
  get size() {
    return this.a.length;
  }
  push(item) {
    const a = this.a;
    a.push(item);
    let i = a.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (a[p][0] <= a[i][0]) break;
      [a[p], a[i]] = [a[i], a[p]];
      i = p;
    }
  }
  pop() {
    const a = this.a;
    const top = a[0];
    const last = a.pop();
    if (a.length > 0) {
      a[0] = last;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1, r = l + 1;
        let s = i;
        if (l < a.length && a[l][0] < a[s][0]) s = l;
        if (r < a.length && a[r][0] < a[s][0]) s = r;
        if (s === i) break;
        [a[s], a[i]] = [a[i], a[s]];
        i = s;
      }
    }
    return top;
  }
}

// edges are [a, b, w]: a one-way road a -> b of length w >= 0. Returns dist to every node (Infinity if unreachable).
function dijkstra(n, edges, source) {
  const adj = Array.from({ length: n }, () => []);
  for (const [a, b, w] of edges) {
    adj[a].push([b, w]);
    // adj[b].push([a, w]); // add for an undirected graph
  }
  const dist = new Array(n).fill(Infinity);
  dist[source] = 0;
  const heap = new MinHeap(); // [distance so far, node]
  heap.push([0, source]);
  while (heap.size > 0) {
    const [d, node] = heap.pop();
    if (d > dist[node]) continue; // stale entry: we already found something shorter
    // problem-specific: if node is the target, return d here
    for (const [next, w] of adj[node]) {
      if (d + w < dist[next]) {
        // relax the edge
        dist[next] = d + w;
        heap.push([dist[next], next]);
      }
    }
  }
  return dist;
}

const edges = [[0, 1, 4], [0, 2, 1], [2, 1, 2], [1, 3, 1], [2, 3, 5]];
console.log(dijkstra(5, edges, 0)); // [0, 3, 1, 4, Infinity]
```

```go
package main

import (
	"container/heap"
	"fmt"
	"math"
)

// item is (distance so far, node); minHeap orders items by distance for container/heap.
type item struct{ dist, node int }
type minHeap []item

func (h minHeap) Len() int            { return len(h) }
func (h minHeap) Less(i, j int) bool  { return h[i].dist < h[j].dist }
func (h minHeap) Swap(i, j int)       { h[i], h[j] = h[j], h[i] }
func (h *minHeap) Push(x interface{}) { *h = append(*h, x.(item)) }
func (h *minHeap) Pop() interface{} {
	old := *h
	x := old[len(old)-1]
	*h = old[:len(old)-1]
	return x
}

// edges are {a, b, w}: a one-way road a -> b of length w >= 0. Returns dist to every node (math.MaxInt if unreachable).
func dijkstra(n int, edges [][3]int, source int) []int {
	adj := make([][][2]int, n)
	for _, e := range edges {
		adj[e[0]] = append(adj[e[0]], [2]int{e[1], e[2]})
		// adj[e[1]] = append(adj[e[1]], [2]int{e[0], e[2]}) // add for an undirected graph
	}
	dist := make([]int, n)
	for i := range dist {
		dist[i] = math.MaxInt
	}
	dist[source] = 0
	h := &minHeap{{0, source}}
	for h.Len() > 0 {
		top := heap.Pop(h).(item)
		d, node := top.dist, top.node
		if d > dist[node] {
			continue // stale entry: we already found something shorter
		}
		// problem-specific: if node is the target, return d here
		for _, edge := range adj[node] {
			next, w := edge[0], edge[1]
			if d+w < dist[next] { // relax the edge
				dist[next] = d + w
				heap.Push(h, item{dist[next], next})
			}
		}
	}
	return dist
}

func main() {
	edges := [][3]int{{0, 1, 4}, {0, 2, 1}, {2, 1, 2}, {1, 3, 1}, {2, 3, 5}}
	for _, d := range dijkstra(5, edges, 0) {
		if d == math.MaxInt {
			fmt.Print("inf ")
		} else {
			fmt.Print(d, " ")
		}
	}
	fmt.Println() // 0 3 1 4 inf
}
```

## Variations

- **Single target.** Return as soon as the target is popped from the heap; its distance is final at that moment. Popping is the right moment, not pushing.
- **Grid Dijkstra.** Nodes are cells, the "edge weight" is the cost of stepping into a cell (or, in Path With Minimum Effort, the height difference).
- **Different combining rule.** For "maximum probability" use a max-heap and multiply; for "minimise the largest edge on the path" relax with `max(d, w)` instead of `d + w`. Dijkstra is correct whenever extending a path can never make it better.
- **Recovering the path.** Keep `prev[next] = node` whenever you relax an edge; walk `prev` backwards from the target.
- **At most k stops.** Bellman-Ford with k + 1 rounds, relaxing from a copy of the previous round so that one round cannot chain several edges. Dijkstra with a plain visited set gets this wrong.
- **Negative weights.** Bellman-Ford; run one extra round to detect a negative cycle. Dijkstra may give wrong answers because a popped node is no longer final.

## Common mistakes

- Forgetting the stale-entry check, so the loop processes a node several times with out-of-date distances and the result is slow or wrong with early exit.
- Marking a node "visited" when it is *pushed* instead of when it is *popped*. Nodes can be pushed with a bad distance before a better one is found.
- Using Dijkstra on negative weights.
- Overflow: `INF + w` wraps around in languages with fixed-size integers. Either skip edges from unreachable nodes (the stale check handles it) or use a large sentinel and 64-bit integers.
- Building the graph undirected when the edges are one-way, or the other way round.

## Complexity

Dijkstra with a binary heap: O((V + E) log V) time (each edge may push one entry, each pop is log of the heap size), O(V + E) space. Bellman-Ford: O(V · E) time, O(V) extra space. Floyd-Warshall: O(V³) time, O(V²) space. BFS on unweighted graphs: O(V + E).

## Where to start

1. 1091. Shortest Path in Binary Matrix: unweighted, so plain BFS; make sure you can tell the two cases apart.
2. 743. Network Delay Time: Dijkstra from one source, answer is the largest finished distance; the template as written.
3. 1514. Path with Maximum Probability: Dijkstra with a max-heap and multiplication.
4. 1631. Path With Minimum Effort: grid Dijkstra where the path cost is the largest step, not the sum.
5. 787. Cheapest Flights Within K Stops: Bellman-Ford limited to k + 1 rounds.
6. 1334. Find the City With the Smallest Number of Neighbors at a Threshold Distance: Floyd-Warshall on a small graph, or Dijkstra from every node.
7. [399. Evaluate Division](/interview/problems/evaluate-division/): weighted graph where a path's value is a product; carrying the ratio along a search is the same relaxation idea.
