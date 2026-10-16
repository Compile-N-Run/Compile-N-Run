---
title: Task Scheduler
leetcode: task-scheduler
description: "Task Scheduler explained: find the shortest schedule for CPU tasks that need a cooldown of n slots between repeats, using the most frequent task to count forced idle slots, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

A CPU has a list of `tasks`, each labelled with an uppercase letter; the same letter may appear many times, and tasks with the same label are interchangeable. The CPU does one task per time unit, or stays idle for that unit. Between two tasks with the **same** label there must be at least `n` time units, filled with other tasks or with idle units. Tasks can run in any order.

Return the smallest number of time units needed to finish every task. The list has at least one task and `n` is zero or more.

## Examples

- `tasks = ["A","A","A","B","B","B"]`, `n = 2` → `8`. One schedule is `A B idle A B idle A B`: every `A` is three units apart, and nothing else can fill the gaps.
- `tasks = ["A","A","A","B","B","B"]`, `n = 0` → `6`. No cooldown, so run them back to back.
- `tasks = ["A","A","A","A","A","A","B","C","D","E","F","G"]`, `n = 2` → `16`. The six `A`s force five gaps of two slots, but there are only six other tasks for those ten slots, so four slots stay idle: 6 + 10 = 16.
- `tasks = ["A","B","C","D"]`, `n = 5` → `4`. No label repeats, so the cooldown never matters.

## Key idea

The task that appears most often decides the shape of the schedule. If the most frequent label appears `f` times, those `f` copies must be spread out with at least `n` slots between them, so the schedule is at least `(f - 1) × (n + 1) + 1` long: `f - 1` full "frames" of size `n + 1` plus the final copy. If several labels share that top frequency, each of them adds one more slot after the last frame, because they all need a final copy too. Every other task fits into the empty slots of the frames without creating new conflicts (fill frame by frame, cycling through the labels). When the frames are more than full, no idle time is needed at all and the answer is simply the number of tasks. So the answer is the larger of the two.

## Approach

1. Count how often each of the 26 labels appears.
2. Let `f` be the highest count and `m` the number of labels whose count equals `f`.
3. Compute `frames = (f - 1) * (n + 1) + m`.
4. Return `max(len(tasks), frames)`.

A simulation with a max-heap (always run the most frequent available task, park the ones in cooldown in a queue) also works and is a good thing to mention; it is O(T log 26) but longer to write and easier to get wrong.

## Complexity

- **Time:** O(T), where `T` is the number of tasks: one counting pass plus a scan of 26 counts.
- **Space:** O(1): a 26-entry count table.

## Common mistakes

- Forgetting the `max` with the number of tasks. When the input has many different labels the frames are overfull and the formula alone gives a value that is too small.
- Counting only one label at the top frequency. For `AAABBB` with `n = 2`, `m = 2` gives the final `A B` instead of just `A`.
- Using `n` instead of `n + 1` as the frame length: the cooldown counts the slots *between* two copies, so the distance between their start times is `n + 1`.
- Trying to build the actual schedule and simulate idle slots one by one, which is correct but slow for large `n`.

## Follow-up questions

- *Produce an actual schedule, not just its length.* Run the heap-and-cooldown simulation and record the task picked at each step.
- *What if tasks must keep their input order?* Then no reordering is allowed; walk the list and keep the last time each label ran, inserting idles when needed (Task Scheduler II).
- *Why does filling the frames never create a new conflict?* Every label other than the top ones appears at most `f - 1` times, which is at most once per frame when you fill round-robin.

## Related problems

- [Top K Frequent Elements](/interview/problems/top-k-frequent-elements/)
- [Kth Largest Element in an Array](/interview/problems/kth-largest-element-in-an-array/)
- [Meeting Rooms II](/interview/problems/meeting-rooms-ii/)
- Reorganize String
- Rearrange String k Distance Apart
- Task Scheduler II

## Solutions

```python
class Solution:
    def leastInterval(self, tasks: List[str], n: int) -> int:
        counts = Counter(tasks)
        top = max(counts.values())
        with_top = sum(1 for c in counts.values() if c == top)
        frames = (top - 1) * (n + 1) + with_top  # the most frequent labels force this much time
        return max(len(tasks), frames)
```

```java
class Solution {
    public int leastInterval(char[] tasks, int n) {
        int[] counts = new int[26];
        for (char task : tasks) {
            counts[task - 'A']++;
        }
        int top = 0, withTop = 0;
        for (int c : counts) {
            if (c > top) {
                top = c;
                withTop = 1;
            } else if (c == top) {
                withTop++;
            }
        }
        int frames = (top - 1) * (n + 1) + withTop; // the most frequent labels force this much time
        return Math.max(tasks.length, frames);
    }
}
```

```cpp
class Solution {
public:
    int leastInterval(vector<char>& tasks, int n) {
        int counts[26] = {0};
        for (char task : tasks) {
            counts[task - 'A']++;
        }
        int top = 0, withTop = 0;
        for (int c : counts) {
            if (c > top) {
                top = c;
                withTop = 1;
            } else if (c == top) {
                withTop++;
            }
        }
        int frames = (top - 1) * (n + 1) + withTop;  // the most frequent labels force this much time
        return max((int)tasks.size(), frames);
    }
};
```

```javascript
/**
 * @param {character[]} tasks
 * @param {number} n
 * @return {number}
 */
var leastInterval = function (tasks, n) {
  const counts = new Array(26).fill(0);
  const A = 'A'.charCodeAt(0);
  for (const task of tasks) {
    counts[task.charCodeAt(0) - A]++;
  }
  let top = 0;
  let withTop = 0;
  for (const c of counts) {
    if (c > top) {
      top = c;
      withTop = 1;
    } else if (c === top) {
      withTop++;
    }
  }
  const frames = (top - 1) * (n + 1) + withTop; // the most frequent labels force this much time
  return Math.max(tasks.length, frames);
};
```

```go
func leastInterval(tasks []byte, n int) int {
	var counts [26]int
	for _, task := range tasks {
		counts[task-'A']++
	}
	top, withTop := 0, 0
	for _, c := range counts {
		if c > top {
			top, withTop = c, 1
		} else if c == top {
			withTop++
		}
	}
	frames := (top-1)*(n+1) + withTop // the most frequent labels force this much time
	return max(len(tasks), frames)
}
```
