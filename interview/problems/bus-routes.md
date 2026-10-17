---
title: Bus Routes
leetcode: bus-routes
description: "Bus Routes explained: find the fewest buses needed to travel between two stops with a breadth-first search over routes instead of stops, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given `routes`, where `routes[i]` lists the stops that bus `i` visits (it loops over them forever, so from any stop on the route you can reach any other stop on the same route without changing bus). You start at stop `source`, not on any bus, and want to reach stop `target`.

Return the smallest number of buses you must take. Return `0` if `source` equals `target`, and `-1` if `target` cannot be reached. You only move between stops by bus; changing bus is free and only possible at a stop that both routes share.

LeetCode allows up to 500 routes with up to 100,000 stops in total, so anything that works per pair of stops is too slow.

## Examples

- `routes = [[10, 20, 30], [30, 40, 50]]`, `source = 10`, `target = 50` → `2`. Bus 0 from 10 to 30, change to bus 1, ride to 50.
- `routes = [[1, 2, 3]]`, `source = 1`, `target = 3` → `1`. One bus does it.
- `routes = [[1, 2], [3, 4]]`, `source = 1`, `target = 4` → `-1`. The two routes share no stop.
- `routes = [[5, 6]]`, `source = 5`, `target = 5` → `0`. You are already there.
- `routes = [[1, 2, 3, 4, 5], [2, 10], [5, 10]]`, `source = 1`, `target = 10` → `2`. Either transfer at 2 or at 5.

## Key idea

We are counting buses, not stops, so run the breadth-first search over **routes**. Two routes are neighbours when they share a stop, and the answer is one more than the number of transfers between the first route and a route that contains `target`. Instead of building the route graph explicitly (which costs O(routes² · stops)), index each stop by the routes that serve it: when we board a route, we visit all of its stops, and at each stop we discover every unvisited route that stops there. Each route is boarded once and each stop expanded once, so the whole search is linear in the total length of the routes.

## Approach

1. If `source == target`, return `0`.
2. Build `routesAt`: a hash map from stop to the list of route indices that contain it.
3. Seed a queue with every route that contains `source`, mark those routes as visited, and set `buses = 1`.
4. BFS level by level. For every route in the current level:
   1. If the route contains `target`, return `buses`.
   2. For every stop on the route that has not been expanded yet, mark it expanded and push every unvisited route of `routesAt[stop]` onto the next level.
5. Increment `buses` after each level. If the queue empties, return `-1`.

Searching over stops instead (BFS where each stop is a node and the edges are "same route") finds the fewest *stops*, not the fewest *buses*, and also needs a per-route visited set to avoid walking each route's stops again and again; the route-level search is both simpler and faster.

## Complexity

- **Time:** O(S), where `S` is the total number of stops across all routes: building the index and the BFS each touch every (route, stop) pair at most once. Checking "does this route contain target" by scanning is covered by the same bound since each route is scanned once.
- **Space:** O(S) for the stop index, the visited sets and the queue.

## Common mistakes

- Forgetting the `source == target` check and returning 1 (or -1 when no route contains the stop).
- Only marking routes as visited. Without also marking stops as expanded, a stop shared by many routes is re-scanned every time one of them is reached, which is quadratic on dense inputs.
- Returning the number of transfers instead of the number of buses (off by one).
- BFS over stops counting stops instead of buses.

## Follow-up questions

- The timetable also has travel times per route segment: now what? (Dijkstra over stops with the cost on edges; the number of buses is no longer the objective.)
- Which buses, not just how many? (Keep a parent pointer per route and rebuild the chain at the end.)

## Related problems

- [Word Ladder](/interview/problems/word-ladder/)
- [Rotting Oranges](/interview/problems/rotting-oranges/)
- [Number of Islands](/interview/problems/number-of-islands/)
- Minimum Number of Vertices to Reach All Nodes

## Solutions

```python
class Solution:
    def numBusesToDestination(self, routes: List[List[int]], source: int, target: int) -> int:
        if source == target:
            return 0
        routes_at = defaultdict(list)  # stop -> routes that serve it
        for r, stops in enumerate(routes):
            for stop in stops:
                routes_at[stop].append(r)
        queue = deque(routes_at[source])
        seen_routes = set(queue)
        seen_stops = {source}
        buses = 1
        while queue:
            for _ in range(len(queue)):
                r = queue.popleft()
                for stop in routes[r]:
                    if stop == target:
                        return buses
                    if stop in seen_stops:
                        continue
                    seen_stops.add(stop)
                    for nxt in routes_at[stop]:
                        if nxt not in seen_routes:
                            seen_routes.add(nxt)
                            queue.append(nxt)
            buses += 1
        return -1
```

```java
class Solution {
    public int numBusesToDestination(int[][] routes, int source, int target) {
        if (source == target) return 0;
        Map<Integer, List<Integer>> routesAt = new HashMap<>(); // stop -> routes that serve it
        for (int r = 0; r < routes.length; r++) {
            for (int stop : routes[r]) routesAt.computeIfAbsent(stop, k -> new ArrayList<>()).add(r);
        }
        Deque<Integer> queue = new ArrayDeque<>(routesAt.getOrDefault(source, List.of()));
        boolean[] seenRoutes = new boolean[routes.length];
        for (int r : queue) seenRoutes[r] = true;
        Set<Integer> seenStops = new HashSet<>(List.of(source));
        for (int buses = 1; !queue.isEmpty(); buses++) {
            for (int size = queue.size(); size > 0; size--) {
                int r = queue.poll();
                for (int stop : routes[r]) {
                    if (stop == target) return buses;
                    if (!seenStops.add(stop)) continue;
                    for (int next : routesAt.get(stop)) {
                        if (!seenRoutes[next]) {
                            seenRoutes[next] = true;
                            queue.add(next);
                        }
                    }
                }
            }
        }
        return -1;
    }
}
```

```cpp
class Solution {
public:
    int numBusesToDestination(vector<vector<int>>& routes, int source, int target) {
        if (source == target) return 0;
        unordered_map<int, vector<int>> routesAt;  // stop -> routes that serve it
        for (int r = 0; r < (int)routes.size(); r++) {
            for (int stop : routes[r]) routesAt[stop].push_back(r);
        }
        queue<int> q;
        vector<bool> seenRoutes(routes.size(), false);
        for (int r : routesAt[source]) { seenRoutes[r] = true; q.push(r); }
        unordered_set<int> seenStops = {source};
        for (int buses = 1; !q.empty(); buses++) {
            for (int size = q.size(); size > 0; size--) {
                int r = q.front(); q.pop();
                for (int stop : routes[r]) {
                    if (stop == target) return buses;
                    if (!seenStops.insert(stop).second) continue;
                    for (int next : routesAt[stop]) {
                        if (!seenRoutes[next]) {
                            seenRoutes[next] = true;
                            q.push(next);
                        }
                    }
                }
            }
        }
        return -1;
    }
};
```

```javascript
/**
 * @param {number[][]} routes
 * @param {number} source
 * @param {number} target
 * @return {number}
 */
var numBusesToDestination = function (routes, source, target) {
  if (source === target) return 0;
  const routesAt = new Map(); // stop -> routes that serve it
  routes.forEach((stops, r) => {
    for (const stop of stops) {
      if (!routesAt.has(stop)) routesAt.set(stop, []);
      routesAt.get(stop).push(r);
    }
  });
  let level = routesAt.get(source) || [];
  const seenRoutes = new Set(level);
  const seenStops = new Set([source]);
  for (let buses = 1; level.length; buses++) {
    const next = [];
    for (const r of level) {
      for (const stop of routes[r]) {
        if (stop === target) return buses;
        if (seenStops.has(stop)) continue;
        seenStops.add(stop);
        for (const other of routesAt.get(stop)) {
          if (!seenRoutes.has(other)) {
            seenRoutes.add(other);
            next.push(other);
          }
        }
      }
    }
    level = next;
  }
  return -1;
};
```

```go
func numBusesToDestination(routes [][]int, source int, target int) int {
	if source == target {
		return 0
	}
	routesAt := map[int][]int{} // stop -> routes that serve it
	for r, stops := range routes {
		for _, stop := range stops {
			routesAt[stop] = append(routesAt[stop], r)
		}
	}
	level := routesAt[source]
	seenRoutes := make([]bool, len(routes))
	for _, r := range level {
		seenRoutes[r] = true
	}
	seenStops := map[int]bool{source: true}
	for buses := 1; len(level) > 0; buses++ {
		var next []int
		for _, r := range level {
			for _, stop := range routes[r] {
				if stop == target {
					return buses
				}
				if seenStops[stop] {
					continue
				}
				seenStops[stop] = true
				for _, other := range routesAt[stop] {
					if !seenRoutes[other] {
						seenRoutes[other] = true
						next = append(next, other)
					}
				}
			}
		}
		level = next
	}
	return -1
}
```
