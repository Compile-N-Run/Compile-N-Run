---
title: Reconstruct Itinerary
leetcode: reconstruct-itinerary
description: "Reconstruct Itinerary explained: use every flight ticket exactly once starting from JFK and return the lexically smallest route with Hierholzer's Eulerian-path algorithm, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given a list of plane tickets, each a pair `[from, to]` of three-letter airport codes (up to 300 tickets, and the same pair can appear more than once). All the tickets belong to one traveller who starts at `JFK`. Rebuild the full trip: a sequence of airports that starts with `JFK` and uses **every ticket exactly once**, as a list of airport codes in travel order.

You are guaranteed that at least one such trip exists. If several trips use all the tickets, return the one that is smallest in lexical order when read as a single sequence of codes (compare the first airports, then the second, and so on).

## Examples

- `[["JFK", "LHR"], ["LHR", "CDG"], ["CDG", "JFK"], ["JFK", "AMS"]]` → `["JFK", "LHR", "CDG", "JFK", "AMS"]`. From `JFK`, `AMS` comes before `LHR` alphabetically, but flying to `AMS` first would strand the other three tickets, so the only complete trip goes to `LHR` first and ends in `AMS`.
- `[["JFK", "KUL"], ["JFK", "NRT"], ["NRT", "JFK"]]` → `["JFK", "NRT", "JFK", "KUL"]`. Same lesson: the alphabetically earlier `KUL` is a dead end that must come last.
- `[["JFK", "NRT"], ["NRT", "JFK"], ["JFK", "NRT"]]` → `["JFK", "NRT", "JFK", "NRT"]`. Duplicate tickets are separate flights.
- `[["JFK", "ZRH"]]` → `["JFK", "ZRH"]`.

## Key idea

Airports are nodes and tickets are directed edges; the trip is a path that uses every edge once, an **Eulerian path**. Hierholzer's algorithm finds one in linear time: walk from the start, always taking an unused edge, until you get stuck. Where you got stuck is necessarily the *last* airport of the trip (a dead end can only be the end). Record it, back up one step and continue walking from the previous airport with its remaining edges; every time you get stuck again, you have found the airport that comes just before the ones already recorded. Reversing the recorded list gives the trip.

To get the lexically smallest trip, always take the smallest unused destination first. Because the algorithm builds the route from the end and only commits an airport once all its tickets are used, taking the smallest choice first is always safe.

## Approach

1. Group tickets by departure airport into a map `graph[from] → list of destinations`. Sort each list in **descending** order so that the smallest destination sits at the end and can be removed with a constant-time `pop`.
2. Keep an empty list `route`.
3. Define `visit(airport)`: while `graph[airport]` still has destinations, pop the last (smallest) one and call `visit` on it. When no destinations remain, append `airport` to `route`.
4. Call `visit("JFK")`.
5. Reverse `route` and return it. It has exactly `tickets + 1` airports.

Why reversing is correct: an airport is appended only after every ticket leaving it has been used, so the first airport appended is the final stop, the second is the stop before it, and so on. Dead ends (like `AMS` in the first example) are appended before the airports that lead to them and therefore land at the end of the reversed route.

The naive alternative is backtracking: try destinations in sorted order and undo when the trip cannot be completed. It returns the same answer but can take exponential time on adversarial inputs, while Hierholzer never backtracks.

## Complexity

- **Time:** O(E log E) for sorting the destination lists, where `E` is the number of tickets; the walk itself uses each ticket once.
- **Space:** O(E) for the adjacency lists, the route and the recursion stack (at most `E + 1` deep).

## Common mistakes

- Greedily flying to the smallest destination and never reconsidering, which gets stuck in a dead end (first example) while unused tickets remain.
- Removing a destination from the list but revisiting it, or using a set of visited *airports* instead of consuming *tickets*: airports may be visited many times; tickets are used once.
- Forgetting to reverse the route at the end.
- Sorting ascending and removing from the front of the list (`list.pop(0)` / `shift`), which still works but costs O(E) per removal; sort descending and pop from the back, or use a min-heap.
- Treating duplicate tickets as one edge; each copy must appear in the route.

## Follow-up questions

- How do you check whether an Eulerian path exists at all? (Every airport must have in-degree equal to out-degree, except that the start may have one extra departure and the end one extra arrival, and all edges must be connected.)
- What if the traveller could start anywhere? (Pick the airport with out-degree minus in-degree equal to 1, or any airport if the graph is a cycle.)
- Can you write it without recursion? (Yes, with an explicit stack: push airports while they have destinations, pop and record when they do not.)

## Related problems

- [Course Schedule II](/interview/problems/course-schedule-ii/) (another "use every edge, order matters" graph problem, there a topological order)
- [Word Ladder](/interview/problems/word-ladder/)
- Valid Arrangement of Pairs (the same algorithm on a different graph)

## Solutions

```python
class Solution:
    def findItinerary(self, tickets: List[List[str]]) -> List[str]:
        graph = defaultdict(list)
        for src, dst in sorted(tickets, reverse=True):  # smallest destination ends up last, so pop() gives it
            graph[src].append(dst)
        route = []

        def visit(airport: str) -> None:
            destinations = graph[airport]
            while destinations:
                visit(destinations.pop())
            route.append(airport)  # all tickets out of this airport are used: it is the next stop from the end

        visit('JFK')
        return route[::-1]
```

```java
class Solution {
    private final Map<String, PriorityQueue<String>> graph = new HashMap<>(); // min-heap: poll() gives the smallest
    private final LinkedList<String> route = new LinkedList<>();

    public List<String> findItinerary(List<List<String>> tickets) {
        for (List<String> t : tickets) {
            graph.computeIfAbsent(t.get(0), k -> new PriorityQueue<>()).add(t.get(1));
        }
        visit("JFK");
        return route;
    }

    private void visit(String airport) {
        PriorityQueue<String> destinations = graph.get(airport);
        while (destinations != null && !destinations.isEmpty()) {
            visit(destinations.poll());
        }
        route.addFirst(airport); // adding at the front builds the reversed order directly
    }
}
```

```cpp
class Solution {
public:
    vector<string> findItinerary(vector<vector<string>>& tickets) {
        for (auto& t : tickets) graph[t[0]].push_back(t[1]);
        for (auto& [airport, destinations] : graph) {
            sort(destinations.rbegin(), destinations.rend());  // smallest at the back, so pop_back() gives it
        }
        visit("JFK");
        reverse(route.begin(), route.end());
        return route;
    }

private:
    unordered_map<string, vector<string>> graph;
    vector<string> route;

    void visit(const string& airport) {
        vector<string>& destinations = graph[airport];
        while (!destinations.empty()) {
            string next = destinations.back();
            destinations.pop_back();
            visit(next);
        }
        route.push_back(airport);  // all tickets out of this airport are used: it is the next stop from the end
    }
};
```

```javascript
/**
 * @param {string[][]} tickets
 * @return {string[]}
 */
var findItinerary = function (tickets) {
  const graph = new Map();
  for (const [src, dst] of tickets) {
    if (!graph.has(src)) graph.set(src, []);
    graph.get(src).push(dst);
  }
  for (const destinations of graph.values()) {
    destinations.sort((a, b) => (a < b ? 1 : a > b ? -1 : 0)); // descending, so pop() gives the smallest
  }
  const route = [];
  const visit = (airport) => {
    const destinations = graph.get(airport);
    while (destinations && destinations.length) {
      visit(destinations.pop());
    }
    route.push(airport); // all tickets out of this airport are used: it is the next stop from the end
  };
  visit('JFK');
  return route.reverse();
};
```

```go
import "sort"

func findItinerary(tickets [][]string) []string {
	graph := map[string][]string{}
	for _, t := range tickets {
		graph[t[0]] = append(graph[t[0]], t[1])
	}
	for _, destinations := range graph {
		sort.Sort(sort.Reverse(sort.StringSlice(destinations))) // smallest at the end, so popping gives it
	}
	route := []string{}
	var visit func(airport string)
	visit = func(airport string) {
		for len(graph[airport]) > 0 {
			destinations := graph[airport]
			next := destinations[len(destinations)-1]
			graph[airport] = destinations[:len(destinations)-1]
			visit(next)
		}
		route = append(route, airport) // all tickets out of this airport are used: it is the next stop from the end
	}
	visit("JFK")
	for i, j := 0, len(route)-1; i < j; i, j = i+1, j-1 {
		route[i], route[j] = route[j], route[i]
	}
	return route
}
```
