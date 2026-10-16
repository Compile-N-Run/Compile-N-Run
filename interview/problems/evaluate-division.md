---
title: Evaluate Division
leetcode: evaluate-division
description: "Evaluate Division explained: turn known ratios like a / b = 2 into a weighted graph and answer each query by multiplying edge weights along a DFS path, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given a list of facts about variables, each of the form "`A / B` equals some number". The facts come as two parallel inputs: `equations[i] = [A, B]` (two variable names, which are short strings) and `values[i]`, the positive real value of `A / B`.

You are also given a list of `queries`, each a pair `[C, D]`. For every query, work out `C / D` using only the given facts and return all the answers as a list of floating-point numbers, in query order. If a query cannot be determined from the facts, its answer is `-1.0`. That includes any query that mentions a variable never seen in the equations, even `x / x`.

The facts never contradict each other, no value is zero, and the inputs are small (at most a few dozen equations and queries).

## Examples

- `equations = [["a", "b"], ["b", "c"]]`, `values = [3.0, 0.5]`:
  - query `["a", "c"]` → `1.5`, because `a / c = (a / b) * (b / c) = 3 * 0.5`.
  - query `["c", "a"]` → `0.6667`, the reciprocal of `1.5`.
  - query `["b", "b"]` → `1.0`. Any known variable divided by itself is 1.
  - query `["a", "z"]` → `-1.0`. Nothing is known about `z`.
- `equations = [["p", "q"], ["r", "s"]]`, `values = [4.0, 2.0]`, query `["p", "s"]` → `-1.0`. The two facts share no variable, so they cannot be combined.
- `equations = [["x", "y"]]`, `values = [5.0]`, query `["x", "x"]` → `1.0`, but query `["w", "w"]` → `-1.0` because `w` never appears.

## Key idea

Treat every variable as a node in a graph. A fact `A / B = v` becomes two directed edges: `A → B` with weight `v` and `B → A` with weight `1 / v`.

Ratios chain by multiplication: `a / c = (a / b) * (b / c)`. So the answer to `C / D` is the product of the edge weights along *any* path from `C` to `D`. Because the facts are consistent, every path gives the same product, so the first path a depth-first search finds is good enough. If no path exists (or a variable is missing), the answer is `-1.0`.

## Approach

1. Build an adjacency map: `graph[A]` is a list of `(neighbour, weight)` pairs. For each equation `[A, B]` with value `v`, add `(B, v)` to `graph[A]` and `(A, 1 / v)` to `graph[B]`.
2. For each query `[C, D]`:
   1. If `C` or `D` is not in the graph, the answer is `-1.0`.
   2. Otherwise run a DFS from `C`, carrying the product of the weights so far (start at `1.0`) and a `visited` set so cycles do not loop forever.
   3. When the DFS reaches `D`, return the product. If it finishes without reaching `D`, return `-1.0`.
3. Collect the answers in query order.

With `a / b = 3` and `b / c = 0.5`, the query `c / a` follows `c → b` (weight `1 / 0.5 = 2`) then `b → a` (weight `1 / 3`), giving `2 * 1/3 ≈ 0.6667`.

The DFS handles `C == D` naturally: the start node is the target, so the product `1.0` is returned immediately.

A union-find with weights answers each query in almost constant time and is a good follow-up, but for inputs this small the plain DFS is simpler and what most interviewers expect first.

## Complexity

- **Time:** O(Q · (V + E)), where Q is the number of queries, V the number of variables and E the number of equations. Building the graph is O(E) and each query may visit the whole graph once.
- **Space:** O(V + E) for the graph, plus O(V) for the visited set and recursion stack of one search.

## Common mistakes

- Adding only the forward edge. Without `B → A` with weight `1 / v`, queries in the reverse direction fail.
- Returning `1.0` for `x / x` when `x` is unknown. Check that both variables exist before searching.
- Forgetting the visited set: the graph always has cycles (every edge has a reverse edge), so the DFS would recurse forever.
- Comparing doubles with `==` in tests; answers like `2 / 3` need a small tolerance.

## Follow-up questions

- How would you answer many more queries quickly? (Weighted union-find: store each variable's ratio to its root, then `C / D = ratio(C) / ratio(D)` if they share a root.)
- What if the facts could contradict each other? (Detect it during union-find when two variables already share a root but the new ratio disagrees.)

## Related problems

- [Course Schedule](/interview/problems/course-schedule/)
- Number of Provinces
- Accounts Merge

## Solutions

```python
class Solution:
    def calcEquation(self, equations: List[List[str]], values: List[float], queries: List[List[str]]) -> List[float]:
        graph = defaultdict(list)  # variable -> [(neighbour, ratio)]
        for (a, b), v in zip(equations, values):
            graph[a].append((b, v))
            graph[b].append((a, 1.0 / v))

        def dfs(node, target, product, visited):
            if node == target:
                return product
            visited.add(node)
            for nxt, w in graph[node]:
                if nxt not in visited:
                    found = dfs(nxt, target, product * w, visited)
                    if found != -1.0:
                        return found
            return -1.0

        answers = []
        for c, d in queries:
            if c not in graph or d not in graph:
                answers.append(-1.0)
            else:
                answers.append(dfs(c, d, 1.0, set()))
        return answers
```

```java
class Solution {
    private final Map<String, Map<String, Double>> graph = new HashMap<>();

    public double[] calcEquation(List<List<String>> equations, double[] values, List<List<String>> queries) {
        graph.clear();
        for (int i = 0; i < equations.size(); i++) {
            String a = equations.get(i).get(0), b = equations.get(i).get(1);
            graph.computeIfAbsent(a, k -> new HashMap<>()).put(b, values[i]);
            graph.computeIfAbsent(b, k -> new HashMap<>()).put(a, 1.0 / values[i]);
        }
        double[] answers = new double[queries.size()];
        for (int i = 0; i < queries.size(); i++) {
            String c = queries.get(i).get(0), d = queries.get(i).get(1);
            if (!graph.containsKey(c) || !graph.containsKey(d)) {
                answers[i] = -1.0;
            } else {
                answers[i] = dfs(c, d, 1.0, new HashSet<>());
            }
        }
        return answers;
    }

    private double dfs(String node, String target, double product, Set<String> visited) {
        if (node.equals(target)) {
            return product;
        }
        visited.add(node);
        for (Map.Entry<String, Double> edge : graph.get(node).entrySet()) {
            if (!visited.contains(edge.getKey())) {
                double found = dfs(edge.getKey(), target, product * edge.getValue(), visited);
                if (found != -1.0) {
                    return found;
                }
            }
        }
        return -1.0;
    }
}
```

```cpp
class Solution {
    unordered_map<string, vector<pair<string, double>>> graph;  // variable -> (neighbour, ratio)

    double dfs(const string& node, const string& target, double product, unordered_set<string>& visited) {
        if (node == target) {
            return product;
        }
        visited.insert(node);
        for (auto& [next, w] : graph[node]) {
            if (!visited.count(next)) {
                double found = dfs(next, target, product * w, visited);
                if (found != -1.0) {
                    return found;
                }
            }
        }
        return -1.0;
    }

public:
    vector<double> calcEquation(vector<vector<string>>& equations, vector<double>& values, vector<vector<string>>& queries) {
        graph.clear();
        for (size_t i = 0; i < equations.size(); i++) {
            const string &a = equations[i][0], &b = equations[i][1];
            graph[a].push_back({b, values[i]});
            graph[b].push_back({a, 1.0 / values[i]});
        }
        vector<double> answers;
        for (auto& q : queries) {
            if (!graph.count(q[0]) || !graph.count(q[1])) {
                answers.push_back(-1.0);
            } else {
                unordered_set<string> visited;
                answers.push_back(dfs(q[0], q[1], 1.0, visited));
            }
        }
        return answers;
    }
};
```

```javascript
/**
 * @param {string[][]} equations
 * @param {number[]} values
 * @param {string[][]} queries
 * @return {number[]}
 */
var calcEquation = function (equations, values, queries) {
  const graph = new Map(); // variable -> [[neighbour, ratio]]
  equations.forEach(([a, b], i) => {
    if (!graph.has(a)) graph.set(a, []);
    if (!graph.has(b)) graph.set(b, []);
    graph.get(a).push([b, values[i]]);
    graph.get(b).push([a, 1 / values[i]]);
  });

  const dfs = (node, target, product, visited) => {
    if (node === target) return product;
    visited.add(node);
    for (const [next, w] of graph.get(node)) {
      if (!visited.has(next)) {
        const found = dfs(next, target, product * w, visited);
        if (found !== -1) return found;
      }
    }
    return -1;
  };

  return queries.map(([c, d]) =>
    graph.has(c) && graph.has(d) ? dfs(c, d, 1, new Set()) : -1
  );
};
```

```go
type edge struct {
	to    string
	ratio float64
}

func calcEquation(equations [][]string, values []float64, queries [][]string) []float64 {
	graph := map[string][]edge{}
	for i, eq := range equations {
		a, b := eq[0], eq[1]
		graph[a] = append(graph[a], edge{b, values[i]})
		graph[b] = append(graph[b], edge{a, 1 / values[i]})
	}

	var dfs func(node, target string, product float64, visited map[string]bool) float64
	dfs = func(node, target string, product float64, visited map[string]bool) float64 {
		if node == target {
			return product
		}
		visited[node] = true
		for _, e := range graph[node] {
			if !visited[e.to] {
				if found := dfs(e.to, target, product*e.ratio, visited); found != -1 {
					return found
				}
			}
		}
		return -1
	}

	answers := make([]float64, len(queries))
	for i, q := range queries {
		_, okC := graph[q[0]]
		_, okD := graph[q[1]]
		if !okC || !okD {
			answers[i] = -1
		} else {
			answers[i] = dfs(q[0], q[1], 1, map[string]bool{})
		}
	}
	return answers
}
```
