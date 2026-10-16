---
title: Course Schedule
leetcode: course-schedule
description: "Course Schedule explained: decide whether every course can be finished given prerequisite pairs by detecting a cycle with Kahn's topological sort, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

There are `numCourses` courses, numbered `0` to `numCourses - 1`. You are given a list `prerequisites` of pairs `[a, b]`, each meaning "course `b` must be completed before course `a` can be taken".

Return `true` if there is some order in which all courses can be completed, and `false` otherwise.

There is at least one course. The list of pairs can be empty, and no pair appears twice. Every course number in a pair is valid.

## Examples

- `numCourses = 3`, `prerequisites = [[1, 0], [2, 1]]` → `true`. Take course 0, then 1, then 2.
- `numCourses = 2`, `prerequisites = [[0, 1], [1, 0]]` → `false`. Each course waits for the other, so neither can ever start.
- `numCourses = 4`, `prerequisites = []` → `true`. No rules at all.
- `numCourses = 4`, `prerequisites = [[1, 0], [2, 1], [3, 2], [1, 3]]` → `false`. Courses 1, 2 and 3 form a loop, even though course 0 is free.

## Key idea

Draw each course as a node and each pair `[a, b]` as an arrow `b → a` ("b unlocks a"). All courses can be finished exactly when this directed graph has **no cycle**: a cycle is a group of courses that all wait on each other.

To detect a cycle, simulate taking courses. Any course with no unfinished prerequisites (its *in-degree*, the number of arrows pointing into it, is zero) can be taken right now. Taking it removes its outgoing arrows, which may free up more courses. If this process manages to take every course, there is no cycle. If it gets stuck with courses left over, those courses sit on or behind a cycle. This is called **Kahn's algorithm** for topological sorting.

## Approach

1. Build an adjacency list `graph[b]` listing every course `a` that `b` unlocks, and an array `indegree[a]` counting how many prerequisites `a` has.
2. Put every course with `indegree == 0` into a queue.
3. While the queue is not empty:
   1. Remove a course `c` and count it as taken.
   2. For every course `next` in `graph[c]`, decrease `indegree[next]` by one. If it reaches zero, add `next` to the queue.
4. Return `taken == numCourses`.

A depth-first search works too: color nodes white/gray/black and report a cycle when the search reaches a gray node (one still on the current path). Kahn's version avoids recursion, which matters in languages with small default stacks.

## Complexity

- **Time:** O(V + E), where V is `numCourses` and E the number of pairs. Building the graph touches each pair once, and each course enters the queue at most once and scans its outgoing arrows once.
- **Space:** O(V + E) for the adjacency list, the in-degree array and the queue.

## Common mistakes

- Reversing the arrow direction. With `[a, b]`, `b` comes first. (For this yes/no question a reversed graph has the same cycles, so the answer is still right, but for Course Schedule II the order would come out backwards.)
- Checking only whether some course has no prerequisites. A free course does not help if the others form a loop, as in the last example.
- Forgetting courses that appear in no pair at all: they have in-degree 0 and must be counted.
- In the DFS version, using a single "visited" flag. You need to tell "on the current path" (a cycle) apart from "fully explored earlier" (fine).

## Follow-up questions

- Return an actual order in which to take the courses. (Course Schedule II: record the order in which courses leave the queue.)
- What is the minimum number of semesters if you can take any number of courses at once? (Process the queue level by level and count the levels.)

## Related problems

- Course Schedule II
- Alien Dictionary
- Minimum Height Trees

## Solutions

```python
class Solution:
    def canFinish(self, numCourses: int, prerequisites: List[List[int]]) -> bool:
        graph = [[] for _ in range(numCourses)]  # b -> courses that b unlocks
        indegree = [0] * numCourses
        for a, b in prerequisites:
            graph[b].append(a)
            indegree[a] += 1
        queue = deque(c for c in range(numCourses) if indegree[c] == 0)
        taken = 0
        while queue:
            c = queue.popleft()
            taken += 1
            for nxt in graph[c]:
                indegree[nxt] -= 1
                if indegree[nxt] == 0:
                    queue.append(nxt)
        return taken == numCourses
```

```java
class Solution {
    public boolean canFinish(int numCourses, int[][] prerequisites) {
        List<List<Integer>> graph = new ArrayList<>(); // b -> courses that b unlocks
        for (int i = 0; i < numCourses; i++) {
            graph.add(new ArrayList<>());
        }
        int[] indegree = new int[numCourses];
        for (int[] p : prerequisites) {
            graph.get(p[1]).add(p[0]);
            indegree[p[0]]++;
        }
        Deque<Integer> queue = new ArrayDeque<>();
        for (int c = 0; c < numCourses; c++) {
            if (indegree[c] == 0) {
                queue.offer(c);
            }
        }
        int taken = 0;
        while (!queue.isEmpty()) {
            int c = queue.poll();
            taken++;
            for (int next : graph.get(c)) {
                if (--indegree[next] == 0) {
                    queue.offer(next);
                }
            }
        }
        return taken == numCourses;
    }
}
```

```cpp
class Solution {
public:
    bool canFinish(int numCourses, vector<vector<int>>& prerequisites) {
        vector<vector<int>> graph(numCourses);  // b -> courses that b unlocks
        vector<int> indegree(numCourses, 0);
        for (auto& p : prerequisites) {
            graph[p[1]].push_back(p[0]);
            indegree[p[0]]++;
        }
        queue<int> q;
        for (int c = 0; c < numCourses; c++) {
            if (indegree[c] == 0) q.push(c);
        }
        int taken = 0;
        while (!q.empty()) {
            int c = q.front();
            q.pop();
            taken++;
            for (int next : graph[c]) {
                if (--indegree[next] == 0) q.push(next);
            }
        }
        return taken == numCourses;
    }
};
```

```javascript
/**
 * @param {number} numCourses
 * @param {number[][]} prerequisites
 * @return {boolean}
 */
var canFinish = function (numCourses, prerequisites) {
  const graph = Array.from({ length: numCourses }, () => []); // b -> courses that b unlocks
  const indegree = new Array(numCourses).fill(0);
  for (const [a, b] of prerequisites) {
    graph[b].push(a);
    indegree[a]++;
  }
  const queue = [];
  for (let c = 0; c < numCourses; c++) {
    if (indegree[c] === 0) queue.push(c);
  }
  // Read with a moving index instead of shift(), which is O(n).
  for (let head = 0; head < queue.length; head++) {
    for (const next of graph[queue[head]]) {
      if (--indegree[next] === 0) queue.push(next);
    }
  }
  return queue.length === numCourses; // every course that entered the queue was taken
};
```

```go
func canFinish(numCourses int, prerequisites [][]int) bool {
	graph := make([][]int, numCourses) // b -> courses that b unlocks
	indegree := make([]int, numCourses)
	for _, p := range prerequisites {
		graph[p[1]] = append(graph[p[1]], p[0])
		indegree[p[0]]++
	}
	queue := []int{}
	for c := 0; c < numCourses; c++ {
		if indegree[c] == 0 {
			queue = append(queue, c)
		}
	}
	taken := 0
	for len(queue) > 0 {
		c := queue[0]
		queue = queue[1:]
		taken++
		for _, next := range graph[c] {
			indegree[next]--
			if indegree[next] == 0 {
				queue = append(queue, next)
			}
		}
	}
	return taken == numCourses
}
```
