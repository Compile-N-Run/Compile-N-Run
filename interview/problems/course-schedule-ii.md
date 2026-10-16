---
title: Course Schedule II
leetcode: course-schedule-ii
description: "Course Schedule II explained: return an order in which to take every course, or an empty list if prerequisites form a cycle, using Kahn's topological sort, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

There are `numCourses` courses, numbered `0` to `numCourses - 1`, and a list `prerequisites` of pairs `[a, b]`, each meaning "course `b` must be completed before course `a`".

Return an order in which you can take all the courses: a list containing every course exactly once, where each course appears after all of its prerequisites. If several orders work, any one of them is accepted. If no order exists, return an empty list.

There is at least one course. The list of pairs can be empty, no pair appears twice, no course is its own prerequisite, and every course number is valid.

## Examples

- `numCourses = 3`, `prerequisites = [[1, 0], [2, 1]]` → `[0, 1, 2]`. This chain allows only one order.
- `numCourses = 4`, `prerequisites = [[1, 0], [2, 0], [3, 1], [3, 2]]` → `[0, 1, 2, 3]`. Course 0 unlocks 1 and 2, and 3 needs both. `[0, 2, 1, 3]` is equally correct.
- `numCourses = 3`, `prerequisites = [[0, 2], [2, 0]]` → `[]`. Courses 0 and 2 wait on each other, so not every course can be taken, even though course 1 is free.
- `numCourses = 3`, `prerequisites = []` → `[0, 1, 2]`. With no rules, any arrangement of the three courses is fine.

## Key idea

This is [Course Schedule](/interview/problems/course-schedule/) with one change: instead of answering yes or no, write down the order. Model each pair `[a, b]` as an arrow `b → a` and run **Kahn's algorithm**: repeatedly take a course whose prerequisites are all done (in-degree zero) and remove its outgoing arrows. The order in which courses leave the queue is a valid schedule, because a course only enters the queue after every one of its prerequisites has already been taken.

If the queue empties before every course has been taken, the leftover courses are stuck on or behind a cycle, and the answer is an empty list.

## Approach

1. Build an adjacency list `graph[b]` with every course that `b` unlocks, and an array `indegree[a]` with the number of prerequisites of `a`.
2. Put every course with `indegree == 0` into a queue.
3. While the queue is not empty:
   1. Remove a course `c` and append it to `order`.
   2. For each course `next` in `graph[c]`, decrease `indegree[next]`. If it reaches zero, all of its prerequisites are in `order`, so add `next` to the queue.
4. If `order` contains all `numCourses` courses, return it. Otherwise return an empty list.

A depth-first search also works: after finishing all of a course's dependents, push the course onto a list, and reverse the list at the end (reverse postorder). It needs the same three-color cycle check as Course Schedule and recursion that can go `numCourses` deep, so Kahn's version is usually simpler to get right.

## Complexity

- **Time:** O(V + E), where V is `numCourses` and E the number of pairs. Each pair is read once to build the graph and each arrow is followed once when its source course is taken.
- **Space:** O(V + E) for the adjacency list, the in-degree array, the queue and the output.

## Common mistakes

- Reversing the arrows. With `[a, b]` the arrow goes from `b` to `a`; getting it backwards still detects cycles correctly but outputs the order backwards, with every course before its prerequisites.
- Returning the partial order when a cycle exists. The task asks for an empty list, not the courses you managed to take.
- Leaving out courses that appear in no pair. They have in-degree 0, start in the queue and must appear in the answer.
- Testing against one fixed answer. Many orders can be correct; a checker should verify that every course appears once and every prerequisite comes first.

## Follow-up questions

- Return the lexicographically smallest valid order. (Use a min-heap instead of a plain queue.)
- How many semesters are needed if you can take any number of courses per semester? (Process the queue one level at a time and count the levels.)
- Is the order unique? (Only if the queue never holds more than one course at a time.)

## Related problems

- [Course Schedule](/interview/problems/course-schedule/): the yes/no version of this problem.
- Alien Dictionary: derive the arrows from sorted words, then topologically sort letters.
- Parallel Courses: the minimum number of semesters, using the level-by-level version.

## Solutions

```python
class Solution:
    def findOrder(self, numCourses: int, prerequisites: List[List[int]]) -> List[int]:
        graph = [[] for _ in range(numCourses)]  # b -> courses that b unlocks
        indegree = [0] * numCourses
        for a, b in prerequisites:
            graph[b].append(a)
            indegree[a] += 1
        queue = deque(c for c in range(numCourses) if indegree[c] == 0)
        order = []
        while queue:
            c = queue.popleft()
            order.append(c)
            for nxt in graph[c]:
                indegree[nxt] -= 1
                if indegree[nxt] == 0:
                    queue.append(nxt)
        return order if len(order) == numCourses else []
```

```java
class Solution {
    public int[] findOrder(int numCourses, int[][] prerequisites) {
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
        int[] order = new int[numCourses];
        int taken = 0;
        while (!queue.isEmpty()) {
            int c = queue.poll();
            order[taken++] = c;
            for (int next : graph.get(c)) {
                if (--indegree[next] == 0) {
                    queue.offer(next);
                }
            }
        }
        return taken == numCourses ? order : new int[0];
    }
}
```

```cpp
class Solution {
public:
    vector<int> findOrder(int numCourses, vector<vector<int>>& prerequisites) {
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
        vector<int> order;
        while (!q.empty()) {
            int c = q.front();
            q.pop();
            order.push_back(c);
            for (int next : graph[c]) {
                if (--indegree[next] == 0) q.push(next);
            }
        }
        if ((int)order.size() != numCourses) return {};
        return order;
    }
};
```

```javascript
/**
 * @param {number} numCourses
 * @param {number[][]} prerequisites
 * @return {number[]}
 */
var findOrder = function (numCourses, prerequisites) {
  const graph = Array.from({ length: numCourses }, () => []); // b -> courses that b unlocks
  const indegree = new Array(numCourses).fill(0);
  for (const [a, b] of prerequisites) {
    graph[b].push(a);
    indegree[a]++;
  }
  const order = []; // doubles as the queue: order[head..] are taken but not yet expanded
  for (let c = 0; c < numCourses; c++) {
    if (indegree[c] === 0) order.push(c);
  }
  for (let head = 0; head < order.length; head++) {
    for (const next of graph[order[head]]) {
      if (--indegree[next] === 0) order.push(next);
    }
  }
  return order.length === numCourses ? order : [];
};
```

```go
func findOrder(numCourses int, prerequisites [][]int) []int {
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
	order := []int{}
	for len(queue) > 0 {
		c := queue[0]
		queue = queue[1:]
		order = append(order, c)
		for _, next := range graph[c] {
			indegree[next]--
			if indegree[next] == 0 {
				queue = append(queue, next)
			}
		}
	}
	if len(order) != numCourses {
		return []int{}
	}
	return order
}
```
