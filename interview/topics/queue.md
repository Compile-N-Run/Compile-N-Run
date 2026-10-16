---
title: Queue
topic: Queue
group: structures
description: "Queues in coding interviews: first-in first-out storage, the push-at-the-back pop-at-the-front loop behind BFS, streams and time windows, how to get an O(1) queue in each language, and where to start practising."
---

## What it is

A queue is a line. Items join at the back and leave from the front, so the first item in is the first item out (FIFO). The two operations are `enqueue` (push to the back) and `dequeue` (pop from the front); a `peek` at the front and a size count round it out.

A queue shows up whenever order of arrival must be preserved: tasks to run in the order they were submitted, nodes to visit in the order they were discovered, events that expire oldest first. The structure is trivial; what trips people up is getting an O(1) `dequeue`, because the obvious "array and remove the first element" shifts everything and costs O(n) per pop.

How each language gives you a real queue:

- **Python:** `collections.deque` with `append` and `popleft`. A list's `pop(0)` is O(n).
- **Java:** `ArrayDeque` through the `Queue` interface (`offer`, `poll`, `peek`).
- **C++:** `std::queue` (`push`, `pop`, `front`) or `std::deque` when you also need the back.
- **JavaScript:** no built-in queue, and `Array.shift()` is O(n). Keep an array plus a `head` index.
- **Go:** a slice with a `head` index, reslicing occasionally to drop the dead prefix.

A **deque** (double-ended queue) allows push and pop at both ends; it is what the sliding-window-maximum trick needs, and most of the types above are deques already.

## When to use it

- Breadth-first search: visiting a graph or grid level by level, shortest path in unweighted graphs, "minimum number of steps", anything that spreads outward (rotting oranges, word ladder). The queue holds the frontier.
- A stream of events where old ones expire: "how many requests in the last 3000 ms", "moving average of the last k values", rate limiters, hit counters. Push every new event at the back; pop from the front while the front is too old.
- Simulations that process things in order of arrival: tickets, printer jobs, round-robin scheduling, "first unique character in a stream".
- Design problems that say "implement a queue" or "circular buffer" with a fixed capacity. The answer is an array with `head`, `tail` and `size`, indices wrapping with `% capacity`.
- "Sliding window maximum/minimum": a deque holding candidate indices in sorted order, which is the monotonic queue.
- Level-order traversal of a tree, or any processing that needs "everything discovered at depth d before anything at depth d + 1".

## How it works

Take the expiring-events pattern, because it is the shape of several easy design questions and it shows every queue operation. The task: calls arrive at increasing timestamps; after each call, report how many calls happened in the last 3000 milliseconds, including this one.

Keep a queue of timestamps. For each new call at time `t`, push `t` at the back. Then, while the front of the queue is older than `t - 3000`, pop it. The queue now holds exactly the calls in the window, so its size is the answer. Every timestamp is pushed once and popped at most once, so the whole stream costs O(n) no matter how many calls each step evicts.

Trace it on calls at `[1, 100, 3001, 3002, 7000]` with a window of 3000:

| t | push | front too old? | queue after | answer |
|---|---|---|---|---|
| 1 | 1 | no | `[1]` | 1 |
| 100 | 100 | no | `[1, 100]` | 2 |
| 3001 | 3001 | 1 >= 3001 - 3000, keep | `[1, 100, 3001]` | 3 |
| 3002 | 3002 | 1 < 2, pop; 100 stays | `[100, 3001, 3002]` | 3 |
| 7000 | 7000 | 100, 3001, 3002 all < 4000, pop all | `[7000]` | 1 |

For BFS the loop is the same with a twist: popping a node pushes its unvisited neighbours. To count levels, note the queue size at the start of each round and pop exactly that many before incrementing the distance.

## Template

The skeleton is the expiring-events loop: push at the back, evict from the front, read the size. The `main` runs the trace above. The JavaScript and Go versions show the head-index trick for an O(1) pop.

```python
from collections import deque


def recent_counts(times, window):
    """For each timestamp, how many timestamps fall in (t - window, t]."""
    queue = deque()                   # O(1) at both ends
    answers = []
    for t in times:
        queue.append(t)               # problem-specific: what each queue entry holds
        while queue and queue[0] < t - window:   # problem-specific: when the front expires
            queue.popleft()
        answers.append(len(queue))    # problem-specific: what to read from the queue
    return answers


if __name__ == "__main__":
    print(recent_counts([1, 100, 3001, 3002, 7000], 3000))  # [1, 2, 3, 3, 1]
```

```java
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.List;
import java.util.Queue;

public class Main {
    /** For each timestamp, how many timestamps fall in (t - window, t]. */
    static List<Integer> recentCounts(int[] times, int window) {
        Queue<Integer> queue = new ArrayDeque<>();   // O(1) offer and poll
        List<Integer> answers = new ArrayList<>();
        for (int t : times) {
            queue.offer(t);                          // problem-specific: what each queue entry holds
            while (!queue.isEmpty() && queue.peek() < t - window) {   // problem-specific: when the front expires
                queue.poll();
            }
            answers.add(queue.size());               // problem-specific: what to read from the queue
        }
        return answers;
    }

    public static void main(String[] args) {
        System.out.println(recentCounts(new int[] {1, 100, 3001, 3002, 7000}, 3000)); // [1, 2, 3, 3, 1]
    }
}
```

```cpp
#include <iostream>
#include <queue>
#include <vector>

// For each timestamp, how many timestamps fall in (t - window, t].
std::vector<int> recentCounts(const std::vector<int>& times, int window) {
    std::queue<int> queue;                 // O(1) push and pop
    std::vector<int> answers;
    for (int t : times) {
        queue.push(t);                     // problem-specific: what each queue entry holds
        while (!queue.empty() && queue.front() < t - window) {   // problem-specific: when the front expires
            queue.pop();
        }
        answers.push_back(queue.size());   // problem-specific: what to read from the queue
    }
    return answers;
}

int main() {
    for (int x : recentCounts({1, 100, 3001, 3002, 7000}, 3000)) std::cout << x << ' ';  // 1 2 3 3 1
    std::cout << '\n';
}
```

```javascript
// For each timestamp, how many timestamps fall in (t - window, t].
function recentCounts(times, window) {
  const queue = [];   // array plus a head index: shift() would be O(n)
  let head = 0;
  const answers = [];
  for (const t of times) {
    queue.push(t);                                   // problem-specific: what each queue entry holds
    while (head < queue.length && queue[head] < t - window) {   // problem-specific: when the front expires
      head++;                                        // pop from the front in O(1)
    }
    answers.push(queue.length - head);               // problem-specific: what to read from the queue
    if (head > 1024 && head * 2 > queue.length) {    // occasionally drop the dead prefix
      queue.splice(0, head);
      head = 0;
    }
  }
  return answers;
}

console.log(recentCounts([1, 100, 3001, 3002, 7000], 3000)); // [ 1, 2, 3, 3, 1 ]
```

```go
package main

import "fmt"

// recentCounts returns, for each timestamp, how many timestamps fall in (t - window, t].
func recentCounts(times []int, window int) []int {
	queue := []int{} // slice plus a head index for an O(1) pop
	head := 0
	answers := []int{}
	for _, t := range times {
		queue = append(queue, t) // problem-specific: what each queue entry holds
		for head < len(queue) && queue[head] < t-window { // problem-specific: when the front expires
			head++ // pop from the front in O(1)
		}
		answers = append(answers, len(queue)-head) // problem-specific: what to read from the queue
		if head > 1024 && head*2 > len(queue) { // occasionally drop the dead prefix
			queue = append([]int{}, queue[head:]...)
			head = 0
		}
	}
	return answers
}

func main() {
	fmt.Println(recentCounts([]int{1, 100, 3001, 3002, 7000}, 3000)) // [1 2 3 3 1]
}
```

## Variations

- **BFS queue.** Entries are nodes (or grid cells); popping one pushes its unvisited neighbours and marks them visited *when pushed*, not when popped, or you push duplicates.
- **Level-by-level BFS.** `size = len(queue)` at the start of a round; pop exactly `size` items; then `depth += 1`.
- **Circular buffer.** An array of fixed capacity with `head` and `count`; the back is `(head + count) % capacity`. Full when `count == capacity`, empty when `count == 0`.
- **Queue from two stacks.** Push onto `in`; to pop, if `out` is empty move everything from `in` to `out` first. Each element moves once, so amortised O(1).
- **Monotonic deque.** For a sliding window maximum, keep indices whose values decrease from front to back: pop the back while it is smaller than the new value, pop the front when it leaves the window, and the front is the maximum.
- **Queue plus map** for "first unique" streams: the queue holds candidates in order, the map holds counts; pop the front while its count is above one.

## Common mistakes

- Using `list.pop(0)` in Python or `shift()` in JavaScript on large inputs. Both are O(n) and turn an O(n) algorithm into O(n²).
- In BFS, marking a cell visited when it is popped instead of when it is pushed. The queue fills with duplicates and the answer is still right but the time is not.
- Off-by-one on the window edge: "last 3000 ms including t" means keep `front >= t - 3000`, so evict while `front < t - 3000`.
- Forgetting that a circular buffer with `head == tail` is ambiguous (empty or full); keep a `count`, or leave one slot unused.
- Treating the queue as a stack by popping from the back. If the problem says "order of arrival", every pop must come from the front.

## Complexity

Enqueue and dequeue are O(1) with a proper deque, a head index, or a circular array. A loop that pushes each item once and pops it at most once is O(n) in total even when a single step pops many items. Space is O(n) worst case, or O(capacity) for a circular buffer, or O(window) for an expiring-events queue.

## Where to start

1. 933. Number of Recent Calls — the template as a class with a 3000 ms window.
2. 346. Moving Average from Data Stream — a fixed-size queue plus a running sum.
3. [622. Design Circular Queue](/interview/problems/design-circular-queue/) — build the structure yourself with wrapping indices.
4. 232. Implement Queue using Stacks — the two-stack construction and its amortised argument.
5. [362. Design Hit Counter](/interview/problems/design-hit-counter/) — expiring events, then the follow-up about many hits per second.
6. 387. First Unique Character in a String — queue plus counts; the stream version is 1429. First Unique Number.
7. 649. Dota2 Senate — a simulation with two queues of indices that cycle back to the end.
8. [239. Sliding Window Maximum](/interview/problems/sliding-window-maximum/) — the monotonic deque.
