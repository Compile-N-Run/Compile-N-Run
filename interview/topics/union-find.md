---
title: Union-Find
topic: Union-Find
group: structures
description: "Union-Find (disjoint set union) tracks which items belong to the same group while groups keep merging, answering 'are these two connected?' in almost constant time."
---

## What it is

Union-Find, also called a *disjoint set union* (DSU), keeps a collection of items split into groups that never overlap. It answers two questions:

- `find(x)`: which group is `x` in? It returns a representative item, the group's *root*; two items are in the same group exactly when their roots are equal.
- `union(a, b)`: merge the groups of `a` and `b` into one.

Each group is a tree stored in a single `parent` array: `parent[x]` is the node above `x`, and a root is its own parent. `find` walks up to the root; `union` points one root at the other. Two small tweaks make both operations nearly O(1): *path compression* (while walking up, re-point nodes closer to the root) and *union by size* (hang the smaller tree under the larger one so trees stay shallow).

The structure only knows about membership. It cannot tell you the path between two items, and it cannot split a group once merged. In exchange it handles a stream of "these two are now connected" updates far faster than rebuilding a graph each time.

## When to use it

- Edges arrive one at a time and you must know, after each, whether two nodes are connected or how many connected components remain.
- Detecting a cycle in an undirected graph: an edge whose endpoints are already in one group closes a cycle.
- Grouping things by an "is equivalent to" relation: accounts that share an email, strings that are one swap apart, variables that must be equal.
- Kruskal's minimum spanning tree: sort edges by weight and add each one unless it would form a cycle.
- Offline tricks: sort queries by a threshold, union edges below the threshold, answer the query, continue.
- Words in the statement: *connected*, *groups*, *provinces*, *merge*, *same network*, *redundant edge*, *friends of friends*.

## How it works

Take six items `0..5` and the edges `(0,1)`, `(1,2)`, `(3,4)`, `(0,2)`. Start with every item its own root: `parent = [0, 1, 2, 3, 4, 5]`, `size = [1, 1, 1, 1, 1, 1]`.

| union | roots found | result | parent after |
|---|---|---|---|
| (0, 1) | 0 and 1, sizes 1 and 1 | hang 1 under 0 | `[0, 0, 2, 3, 4, 5]` |
| (1, 2) | find(1) = 0, find(2) = 2; size 2 vs 1 | hang 2 under 0 | `[0, 0, 0, 3, 4, 5]` |
| (3, 4) | 3 and 4 | hang 4 under 3 | `[0, 0, 0, 3, 3, 5]` |
| (0, 2) | both 0 | already together: this edge closes a cycle | unchanged |

Three unions succeeded, so the component count is `6 - 3 = 3`: `{0, 1, 2}`, `{3, 4}` and `{5}` on its own.

Path compression shows up on long chains. If `find` walks `7 → 6 → 5 → 0`, it re-points `7` and `6` at their grandparents on the way, so the next `find(7)` is shorter. Together with union by size this makes any sequence of m operations on n items cost O(m α(n)), where α is the inverse Ackermann function, below 5 for any input you will ever see.

The template keeps `parent` and `size` as plain arrays and exposes `find` and `union`, with `union` returning whether a merge happened; that return value is what counts components and detects cycles.

## Template

```python
def make_sets(n):
    """n elements 0..n-1, each in its own set."""
    parent = list(range(n))     # parent[x] == x means x is a root
    size = [1] * n              # size[root] = how many elements in that set
    return parent, size


def find(parent, x):
    """The root of x's set, flattening the path on the way (path compression)."""
    while parent[x] != x:
        parent[x] = parent[parent[x]]   # point x at its grandparent
        x = parent[x]
    return x


def union(parent, size, a, b):
    """Merge the sets of a and b. Returns False if they were already together."""
    ra, rb = find(parent, a), find(parent, b)
    if ra == rb:
        return False
    if size[ra] < size[rb]:             # union by size: hang the smaller under the larger
        ra, rb = rb, ra
    parent[rb] = ra
    size[ra] += size[rb]
    return True


parent, size = make_sets(6)
edges = [(0, 1), (1, 2), (3, 4), (0, 2)]  # (0, 2) closes a cycle
components = 6
for a, b in edges:
    if union(parent, size, a, b):
        components -= 1
    else:
        print("cycle at", (a, b))            # cycle at (0, 2)
print(components)                            # 3  ({0,1,2}, {3,4}, {5})
print(find(parent, 1) == find(parent, 2))    # True
```

```java
public class Main {
    static int[] parent, size;

    // n elements 0..n-1, each in its own set.
    static void makeSets(int n) {
        parent = new int[n];   // parent[x] == x means x is a root
        size = new int[n];     // size[root] = how many elements in that set
        for (int i = 0; i < n; i++) { parent[i] = i; size[i] = 1; }
    }

    // The root of x's set, flattening the path on the way (path compression).
    static int find(int x) {
        while (parent[x] != x) {
            parent[x] = parent[parent[x]];   // point x at its grandparent
            x = parent[x];
        }
        return x;
    }

    // Merge the sets of a and b. Returns false if they were already together.
    static boolean union(int a, int b) {
        int ra = find(a), rb = find(b);
        if (ra == rb) return false;
        if (size[ra] < size[rb]) { int t = ra; ra = rb; rb = t; }  // union by size
        parent[rb] = ra;
        size[ra] += size[rb];
        return true;
    }

    public static void main(String[] args) {
        makeSets(6);
        int[][] edges = {{0, 1}, {1, 2}, {3, 4}, {0, 2}};  // {0, 2} closes a cycle
        int components = 6;
        for (int[] e : edges) {
            if (union(e[0], e[1])) components--;
            else System.out.println("cycle at " + e[0] + "-" + e[1]);  // cycle at 0-2
        }
        System.out.println(components);              // 3
        System.out.println(find(1) == find(2));      // true
    }
}
```

```cpp
#include <iostream>
#include <numeric>
#include <vector>

std::vector<int> parent, sz;

// n elements 0..n-1, each in its own set.
void makeSets(int n) {
    parent.resize(n);
    std::iota(parent.begin(), parent.end(), 0);  // parent[x] == x means x is a root
    sz.assign(n, 1);                             // sz[root] = how many elements in that set
}

// The root of x's set, flattening the path on the way (path compression).
int find(int x) {
    while (parent[x] != x) {
        parent[x] = parent[parent[x]];  // point x at its grandparent
        x = parent[x];
    }
    return x;
}

// Merge the sets of a and b. Returns false if they were already together.
bool unite(int a, int b) {
    int ra = find(a), rb = find(b);
    if (ra == rb) return false;
    if (sz[ra] < sz[rb]) std::swap(ra, rb);  // union by size
    parent[rb] = ra;
    sz[ra] += sz[rb];
    return true;
}

int main() {
    makeSets(6);
    std::vector<std::pair<int, int>> edges = {{0, 1}, {1, 2}, {3, 4}, {0, 2}};  // {0, 2} closes a cycle
    int components = 6;
    for (auto [a, b] : edges) {
        if (unite(a, b)) components--;
        else std::cout << "cycle at " << a << '-' << b << '\n';  // cycle at 0-2
    }
    std::cout << components << '\n';                        // 3
    std::cout << std::boolalpha << (find(1) == find(2)) << '\n';  // true
}
```

```javascript
// n elements 0..n-1, each in its own set.
function makeSets(n) {
  const parent = Array.from({ length: n }, (_, i) => i); // parent[x] === x means x is a root
  const size = new Array(n).fill(1);                     // size[root] = elements in that set
  return { parent, size };
}

// The root of x's set, flattening the path on the way (path compression).
function find(ds, x) {
  while (ds.parent[x] !== x) {
    ds.parent[x] = ds.parent[ds.parent[x]];  // point x at its grandparent
    x = ds.parent[x];
  }
  return x;
}

// Merge the sets of a and b. Returns false if they were already together.
function union(ds, a, b) {
  let ra = find(ds, a), rb = find(ds, b);
  if (ra === rb) return false;
  if (ds.size[ra] < ds.size[rb]) [ra, rb] = [rb, ra];  // union by size
  ds.parent[rb] = ra;
  ds.size[ra] += ds.size[rb];
  return true;
}

const ds = makeSets(6);
const edges = [[0, 1], [1, 2], [3, 4], [0, 2]];  // [0, 2] closes a cycle
let components = 6;
for (const [a, b] of edges) {
  if (union(ds, a, b)) components--;
  else console.log("cycle at", a, b);              // cycle at 0 2
}
console.log(components);                           // 3
console.log(find(ds, 1) === find(ds, 2));          // true
```

```go
package main

import "fmt"

// DSU holds n elements 0..n-1; parent[x] == x means x is a root.
type DSU struct {
	parent []int
	size   []int // size[root] = how many elements in that set
}

func makeSets(n int) *DSU {
	d := &DSU{parent: make([]int, n), size: make([]int, n)}
	for i := range d.parent {
		d.parent[i] = i
		d.size[i] = 1
	}
	return d
}

// find returns the root of x's set, flattening the path on the way (path compression).
func (d *DSU) find(x int) int {
	for d.parent[x] != x {
		d.parent[x] = d.parent[d.parent[x]] // point x at its grandparent
		x = d.parent[x]
	}
	return x
}

// union merges the sets of a and b. Returns false if they were already together.
func (d *DSU) union(a, b int) bool {
	ra, rb := d.find(a), d.find(b)
	if ra == rb {
		return false
	}
	if d.size[ra] < d.size[rb] { // union by size
		ra, rb = rb, ra
	}
	d.parent[rb] = ra
	d.size[ra] += d.size[rb]
	return true
}

func main() {
	d := makeSets(6)
	edges := [][2]int{{0, 1}, {1, 2}, {3, 4}, {0, 2}} // {0, 2} closes a cycle
	components := 6
	for _, e := range edges {
		if d.union(e[0], e[1]) {
			components--
		} else {
			fmt.Println("cycle at", e[0], e[1]) // cycle at 0 2
		}
	}
	fmt.Println(components)             // 3
	fmt.Println(d.find(1) == d.find(2)) // true
}
```

## Variations

- **Counting components**: start with `n` and subtract one for every union that returns true.
- **Non-integer items**: map each string or pair to an index with a hash map first, growing the arrays as new items appear.
- **Grid cells**: cell `(r, c)` is item `r * cols + c`; union each land cell with its land neighbours.
- **Union by rank** uses tree height instead of size; either keeps trees shallow, and size is easier to explain.
- **Weighted union-find**: store a value on each edge to the parent (such as a ratio) and accumulate it during `find`; this solves Evaluate Division.
- **Offline processing**: when queries ask "is there a path using only edges lighter than w", sort both edges and queries by weight and union edges as the threshold rises.
- **Adding nodes over time** (Number of Islands II): start with every cell unset and union a cell with its neighbours only when it becomes land.

## Common mistakes

- Comparing `parent[a] == parent[b]` instead of `find(a) == find(b)`. Only roots identify groups.
- Setting `parent[b] = a` instead of `parent[rootB] = rootA`. Linking non-roots splits the structure.
- Skipping path compression *and* union by size. The code still works, but a chain of n unions makes `find` O(n), and the interviewer will ask.
- Writing `find` recursively in Python on a graph with hundreds of thousands of nodes; the iterative loop in the template avoids the recursion limit.
- Using it on a directed graph. Union-Find models undirected connectivity only; "can I reach b from a" in a directed graph needs a search.
- Forgetting that the number of items must be known, or at least mapped, before the first union; size the arrays up front or grow them through a map.

## Complexity

With both optimisations, `find` and `union` cost amortised O(α(n)), effectively constant; processing m edges on n nodes is O(n + m α(n)). Space is O(n) for the two arrays. Compared with a DFS over an adjacency list, which is O(n + m) for a single connectivity question, Union-Find wins when the graph changes between questions.

## Where to start

1. 547. Number of Provinces: an adjacency matrix, union every pair that is connected, count the groups.
2. 1971. Find if Path Exists in Graph: one union per edge, one `find` comparison at the end.
3. 684. Redundant Connection: the first edge whose endpoints already share a root is the answer; cycle detection in its purest form.
4. [200. Number of Islands](/interview/problems/number-of-islands/): usually solved with DFS, but doing it with Union-Find teaches the grid-to-index mapping.
5. 721. Accounts Merge: map emails to account indexes, union accounts that share one, then group by root.
6. [128. Longest Consecutive Sequence](/interview/problems/longest-consecutive-sequence/): a hash-set answer is standard; the Union-Find version (union `x` with `x + 1`, track sizes) shows how the `size` array becomes the answer.
7. 1584. Min Cost to Connect All Points: Kruskal's algorithm, where Union-Find is the cycle check.
8. [399. Evaluate Division](/interview/problems/evaluate-division/): the weighted variant, where each `find` multiplies ratios along the path.
