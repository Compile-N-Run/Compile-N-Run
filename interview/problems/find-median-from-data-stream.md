---
title: Find Median from Data Stream
leetcode: find-median-from-data-stream
description: "Find Median from Data Stream explained: design a MedianFinder that accepts numbers one at a time and reports the running median using a max-heap and a min-heap, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

Design a class `MedianFinder` that receives integers one at a time and can report the median of everything it has received so far.

- `MedianFinder()` creates an empty finder.
- `addNum(num)` adds the integer `num`.
- `findMedian()` returns the median of all numbers added so far, as a floating-point value. For an odd count it is the middle value in sorted order; for an even count it is the average of the two middle values.

`findMedian` is only called after at least one number has been added. Additions and queries can be interleaved in any order, and there can be tens of thousands of calls, so each one has to be fast. Answers within `10^-5` of the true median are accepted.

## Examples

Each line is one call, followed by what it returns.

- `addNum(4)`, `findMedian()` → `4.0`. One number: it is the median.
- then `addNum(10)`, `findMedian()` → `7.0`. Sorted: `[4, 10]`, average of the two.
- then `addNum(1)`, `findMedian()` → `4.0`. Sorted: `[1, 4, 10]`.
- then `addNum(7)`, `findMedian()` → `5.5`. Sorted: `[1, 4, 7, 10]`, average of 4 and 7.

## Key idea

The median only depends on the two numbers in the middle. Split everything seen so far into a **lower half** and an **upper half**, and keep each half in a heap:

- the lower half in a **max-heap**, so its largest value (the one just below the middle) is on top;
- the upper half in a **min-heap**, so its smallest value (the one just above the middle) is on top.

If we keep the halves the same size (the lower half may hold one extra element), the median is either the top of the lower half or the average of the two tops. Adding a number only needs a couple of heap pushes and pops, which cost O(log n).

## Approach

1. Keep two heaps: `low` (max-heap) and `high` (min-heap). Invariants: every value in `low` is `<=` every value in `high`, and `low` has either the same number of elements as `high` or one more.
2. `addNum(num)`:
   1. Push `num` onto `low`.
   2. Pop the largest value from `low` and push it onto `high`. This step keeps the ordering invariant: whatever moves across is no larger than anything left in `low`, and if `num` belonged in the upper half, it is the value that moves.
   3. If `high` now has more elements than `low`, pop the smallest from `high` and push it onto `low`. This restores the size invariant.
3. `findMedian()`:
   - If `low` has more elements, return the top of `low`.
   - Otherwise return the average of the two tops.

A simpler design keeps a sorted list and inserts each number in place (binary search plus shifting). Queries are O(1), but each insertion is O(n) because of the shifting, which adds up to O(n²) over many calls.

## Complexity

- **Time:** `addNum` is O(log n): a constant number of heap pushes and pops. `findMedian` is O(1): it only reads the heap tops.
- **Space:** O(n). Every number added is stored in one of the two heaps.

## Common mistakes

- Pushing the new number straight into the heap with fewer elements without comparing it to the other heap's top. That breaks the "everything low is below everything high" invariant and gives wrong medians.
- Forgetting that many standard heaps are min-heaps only (Python's `heapq`, Go's `container/heap` with the usual `Less`). Store negated values, or flip the comparison, for the max-heap.
- Integer division when averaging the two tops: `(a + b) / 2` in Java, C++ or Go drops the `.5`. Divide by `2.0`.
- Overflow when adding the two tops if values can be near the integer limits (not a risk with this problem's value range, but worth mentioning).

## Follow-up questions

- If every number is between 0 and 100, how would you change it? (Keep 101 counters and walk them to find the middle: O(1) insert and O(100) query.)
- If 99% of the numbers are in 0 to 100? (Counters for that range plus two small structures, or just counts, for the outliers below and above.)
- How would you support removing numbers, as in a sliding window median? (Lazy deletion with a hash map of pending removals, or a balanced tree / two multisets.)

## Related problems

- Sliding Window Median
- Median of Two Sorted Arrays
- Kth Largest Element in a Stream

## Solutions

```python
class MedianFinder:
    def __init__(self):
        self.low = []   # max-heap of the lower half, stored as negated values
        self.high = []  # min-heap of the upper half

    def addNum(self, num: int) -> None:
        heapq.heappush(self.low, -num)
        heapq.heappush(self.high, -heapq.heappop(self.low))  # largest of low moves up
        if len(self.high) > len(self.low):
            heapq.heappush(self.low, -heapq.heappop(self.high))

    def findMedian(self) -> float:
        if len(self.low) > len(self.high):
            return float(-self.low[0])
        return (-self.low[0] + self.high[0]) / 2
```

```java
class MedianFinder {
    private final PriorityQueue<Integer> low = new PriorityQueue<>(Collections.reverseOrder()); // max-heap
    private final PriorityQueue<Integer> high = new PriorityQueue<>();                          // min-heap

    public MedianFinder() {}

    public void addNum(int num) {
        low.offer(num);
        high.offer(low.poll()); // largest of low moves up
        if (high.size() > low.size()) {
            low.offer(high.poll());
        }
    }

    public double findMedian() {
        if (low.size() > high.size()) {
            return low.peek();
        }
        return (low.peek() + (double) high.peek()) / 2.0;
    }
}
```

```cpp
class MedianFinder {
    priority_queue<int> low;                             // max-heap of the lower half
    priority_queue<int, vector<int>, greater<int>> high; // min-heap of the upper half

public:
    MedianFinder() {}

    void addNum(int num) {
        low.push(num);
        high.push(low.top());  // largest of low moves up
        low.pop();
        if (high.size() > low.size()) {
            low.push(high.top());
            high.pop();
        }
    }

    double findMedian() {
        if (low.size() > high.size()) {
            return low.top();
        }
        return (low.top() + (double)high.top()) / 2.0;
    }
};
```

```javascript
// JavaScript has no built-in heap, so here is a small binary heap.
// `before(a, b)` returns true when a should sit above b.
class Heap {
  constructor(before) {
    this.items = [];
    this.before = before;
  }
  size() {
    return this.items.length;
  }
  peek() {
    return this.items[0];
  }
  push(value) {
    const a = this.items;
    a.push(value);
    let i = a.length - 1;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (!this.before(a[i], a[parent])) break;
      [a[i], a[parent]] = [a[parent], a[i]];
      i = parent;
    }
  }
  pop() {
    const a = this.items;
    const top = a[0];
    const last = a.pop();
    if (a.length > 0) {
      a[0] = last;
      let i = 0;
      while (true) {
        const l = 2 * i + 1, r = l + 1;
        let best = i;
        if (l < a.length && this.before(a[l], a[best])) best = l;
        if (r < a.length && this.before(a[r], a[best])) best = r;
        if (best === i) break;
        [a[i], a[best]] = [a[best], a[i]];
        i = best;
      }
    }
    return top;
  }
}

var MedianFinder = function () {
  this.low = new Heap((a, b) => a > b);  // max-heap of the lower half
  this.high = new Heap((a, b) => a < b); // min-heap of the upper half
};

/**
 * @param {number} num
 * @return {void}
 */
MedianFinder.prototype.addNum = function (num) {
  this.low.push(num);
  this.high.push(this.low.pop()); // largest of low moves up
  if (this.high.size() > this.low.size()) {
    this.low.push(this.high.pop());
  }
};

/**
 * @return {number}
 */
MedianFinder.prototype.findMedian = function () {
  if (this.low.size() > this.high.size()) {
    return this.low.peek();
  }
  return (this.low.peek() + this.high.peek()) / 2;
};
```

```go
import "container/heap"

// intHeap is a min-heap; the lower half stores negated values to act as a max-heap.
type intHeap []int

func (h intHeap) Len() int            { return len(h) }
func (h intHeap) Less(i, j int) bool  { return h[i] < h[j] }
func (h intHeap) Swap(i, j int)       { h[i], h[j] = h[j], h[i] }
func (h *intHeap) Push(x interface{}) { *h = append(*h, x.(int)) }
func (h *intHeap) Pop() interface{} {
	old := *h
	x := old[len(old)-1]
	*h = old[:len(old)-1]
	return x
}

type MedianFinder struct {
	low  *intHeap // lower half, negated (max-heap)
	high *intHeap // upper half (min-heap)
}

func Constructor() MedianFinder {
	return MedianFinder{low: &intHeap{}, high: &intHeap{}}
}

func (this *MedianFinder) AddNum(num int) {
	heap.Push(this.low, -num)
	heap.Push(this.high, -heap.Pop(this.low).(int)) // largest of low moves up
	if this.high.Len() > this.low.Len() {
		heap.Push(this.low, -heap.Pop(this.high).(int))
	}
}

func (this *MedianFinder) FindMedian() float64 {
	if this.low.Len() > this.high.Len() {
		return float64(-(*this.low)[0])
	}
	return float64(-(*this.low)[0]+(*this.high)[0]) / 2
}
```
