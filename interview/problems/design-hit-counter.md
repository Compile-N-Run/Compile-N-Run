---
title: Design Hit Counter
leetcode: design-hit-counter
description: "Design Hit Counter explained: record hits by timestamp and report how many happened in the last 300 seconds using a queue that drops expired hits, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

Design a class `HitCounter` that records hits (say, visits to a web page) and reports how many hits happened in the last 5 minutes. Time is given in whole seconds.

- **Constructor():** create a counter with no hits.
- **hit(timestamp):** record one hit at `timestamp`. Several hits may share the same second.
- **getHits(timestamp):** return how many hits happened in the 300 seconds ending at `timestamp`, that is, hits at times `t` with `timestamp - 300 < t <= timestamp`.

Every call (to either method) has a timestamp greater than or equal to the previous call's, and timestamps start at 1. In Go the constructor is `Constructor` and the methods are `Hit` and `GetHits`. This is a LeetCode Premium problem.

## Examples

- `hit(2)`, `hit(2)`, `hit(5)` → three hits recorded.
- `getHits(5)` → `3`.
- `getHits(301)` → `3`. The window is seconds 2 through 301, which still includes the hits at 2.
- `getHits(302)` → `1`. The window is now 3 through 302; both hits at 2 have expired, only the one at 5 is left.
- `getHits(305)` → `0`. A hit at 5 counts until second 304 and no later.

## Key idea

Because time never goes backwards, hits expire in exactly the order they arrived. That is first-in, first-out, so a **queue** of hit timestamps fits perfectly: new hits join at the back, and before answering `getHits` we remove hits from the front while they are too old. Whatever is left in the queue is exactly the hits in the window, so the answer is the queue's size.

## Approach

1. Keep a queue `hits` of timestamps.
2. **hit(timestamp):** push `timestamp` onto the back of the queue.
3. **getHits(timestamp):**
   1. While the queue is not empty and its front `t` satisfies `timestamp - t >= 300`, pop it. That hit is outside the window now, and since later calls only have larger timestamps, it will never count again.
   2. Return the size of the queue.

A simpler idea stores every hit in a list and counts the matching ones on each `getHits`. That is O(total hits) per query and the list never shrinks.

## Complexity

- **Time:** O(1) for `hit`. `getHits` is O(1) amortized: each hit is pushed once and popped at most once over the counter's whole life.
- **Space:** O(h), where `h` is the number of hits still inside the 300-second window (plus any not yet cleaned up).

## Common mistakes

- Getting the window edge wrong. A hit at second 1 counts at `getHits(300)` but not at `getHits(301)`: remove when `timestamp - t >= 300`, not `> 300`.
- Forgetting that several hits can share a second and storing timestamps in a set, which loses the duplicates.
- Only removing old hits in `hit`. If there is a long pause with no hits, `getHits` must still clean up before answering.

## Follow-up questions

- *What if there are huge numbers of hits per second?* The queue then holds one entry per hit. Use 300 buckets instead: `times[i]` and `counts[i]` for `i = timestamp % 300`. On a hit, if `times[i] != timestamp`, reset the bucket to this second with count 1, otherwise add one. `getHits` sums the counts of buckets whose time is within the window. Memory is fixed at 300 buckets no matter how many hits arrive. Storing `(timestamp, count)` pairs in the queue, merging hits that share a second, is another fix.
- *What if calls can come from many threads at once?* Protect the structure with a lock, or give each thread its own counter and add them up.
- *What if timestamps can arrive out of order?* The queue's front is no longer the oldest hit; the bucket design still works as long as a hit is not more than 300 seconds late.

## Related problems

- [Logger Rate Limiter](/interview/problems/logger-rate-limiter/): another stream of timestamped events with a time window.
- [Time Based Key-Value Store](/interview/problems/time-based-key-value-store/): store values by timestamp and look them up later.
- Number of Recent Calls

## Solutions

```python
class HitCounter:
    def __init__(self):
        self.hits = deque()  # timestamps of hits, oldest first

    def hit(self, timestamp: int) -> None:
        self.hits.append(timestamp)

    def getHits(self, timestamp: int) -> int:
        while self.hits and timestamp - self.hits[0] >= 300:
            self.hits.popleft()  # outside the 300-second window for good
        return len(self.hits)
```

```java
class HitCounter {
    private final Deque<Integer> hits = new ArrayDeque<>(); // timestamps of hits, oldest first

    public HitCounter() {}

    public void hit(int timestamp) {
        hits.addLast(timestamp);
    }

    public int getHits(int timestamp) {
        while (!hits.isEmpty() && timestamp - hits.peekFirst() >= 300) {
            hits.pollFirst(); // outside the 300-second window for good
        }
        return hits.size();
    }
}
```

```cpp
class HitCounter {
    queue<int> hits;  // timestamps of hits, oldest first

public:
    HitCounter() {}

    void hit(int timestamp) {
        hits.push(timestamp);
    }

    int getHits(int timestamp) {
        while (!hits.empty() && timestamp - hits.front() >= 300) {
            hits.pop();  // outside the 300-second window for good
        }
        return hits.size();
    }
};
```

```javascript
var HitCounter = function () {
  this.hits = []; // timestamps of hits, oldest first
  this.head = 0; // index of the oldest hit still counted (avoids O(n) shift)
};

/**
 * @param {number} timestamp
 * @return {void}
 */
HitCounter.prototype.hit = function (timestamp) {
  this.hits.push(timestamp);
};

/**
 * @param {number} timestamp
 * @return {number}
 */
HitCounter.prototype.getHits = function (timestamp) {
  while (this.head < this.hits.length && timestamp - this.hits[this.head] >= 300) {
    this.head++; // outside the 300-second window for good
  }
  return this.hits.length - this.head;
};
```

```go
type HitCounter struct {
	hits []int // timestamps of hits, oldest first
}

func Constructor() HitCounter {
	return HitCounter{}
}

func (this *HitCounter) Hit(timestamp int) {
	this.hits = append(this.hits, timestamp)
}

func (this *HitCounter) GetHits(timestamp int) int {
	for len(this.hits) > 0 && timestamp-this.hits[0] >= 300 {
		this.hits = this.hits[1:] // outside the 300-second window for good
	}
	return len(this.hits)
}
```
