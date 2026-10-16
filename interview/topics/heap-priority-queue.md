---
title: Heap (Priority Queue)
topic: Heap (Priority Queue)
group: structures
description: "A heap always knows its smallest or largest item and updates in O(log n): the structure for top-k, k-way merge, scheduling and any loop that keeps asking for the best thing next."
---

## What it is

A heap is a container with one promise: the smallest item is always at the top (a *min-heap*), or the largest is (a *max-heap*). You can add an item in O(log n), remove the top in O(log n), and look at the top in O(1). That is all it does. It does not keep the rest sorted, and it cannot find an arbitrary item quickly.

A *priority queue* is the interface ("give me the most urgent thing next"); a heap is the usual way to build one, so interviews use the two names interchangeably. Think of a hospital waiting room: people arrive in any order, but the most urgent case is always seen first, and a new arrival may jump ahead of everyone.

Under the hood a heap is a complete binary tree packed into an array. The children of index `i` sit at `2i + 1` and `2i + 2`, and every parent is no bigger than its children. Adding appends at the end and swaps the new item upward while it is smaller than its parent ("sift up"); removing the top moves the last item into slot 0 and swaps it downward with its smaller child until it fits ("sift down"). The tree has height log n, so each operation touches at most log n levels.

Every language in the templates has one, with quirks worth memorising: Python's `heapq` is a min-heap only (negate numbers for a max-heap); Java's `PriorityQueue` is a min-heap unless you pass a comparator; C++'s `priority_queue` is a **max**-heap by default; Go's `container/heap` makes you implement five small methods; JavaScript has none, so you write a short class.

## When to use it

- The statement says *k largest*, *k smallest*, *k most frequent*, *k closest* or *kth*.
- *Merge k sorted* lists, arrays or streams.
- You repeatedly need the minimum or maximum of a collection that keeps changing: the meeting that ends soonest, the task with the earliest deadline, the cheapest unexplored edge.
- Running statistics on a stream, such as the median after every insertion.
- You catch yourself writing `sort()` inside a loop. A heap turns that O(n log n) per step into O(log n).

## How it works

The most common interview shape is "keep the k largest". The trick is to use a *min*-heap of size k: its top is the weakest item you are keeping, which is exactly the one to throw out when something better arrives.

Trace `k = 3` on `[5, 1, 9, 3, 7, 2]`:

| push | heap after (top first) | note |
|---|---|---|
| 5 | `[5]` | |
| 1 | `[1, 5]` | |
| 9 | `[1, 5, 9]` | size 3, full |
| 3 | `[3, 5, 9]` | size went to 4, so pop the top (1) |
| 7 | `[5, 7, 9]` | pop 3 |
| 2 | `[5, 7, 9]` | 2 was pushed and immediately popped |

The heap ends holding `5, 7, 9`, the three largest, and each push cost O(log 3) rather than O(log n). To get the k *smallest* instead, keep a max-heap of size k, or negate the keys.

When items are more than a number, push a tuple or a small struct whose first field is the ordering key: `(distance, x, y)` for closest points, `(count, value)` for frequencies, `(value, listIndex, position)` for a k-way merge.

## Template

```python
import heapq


def k_largest(nums, k):
    """Return the k largest values, smallest of them first."""
    heap = []                       # min-heap: heap[0] is the smallest kept value
    for x in nums:
        # the "key" pushed decides the order; wrap it in a tuple
        # (key, payload) when you need to carry more than a number
        heapq.heappush(heap, x)
        if len(heap) > k:           # too many: drop the smallest
            heapq.heappop(heap)
    return sorted(heap)


print(k_largest([5, 1, 9, 3, 7, 2], 3))   # [5, 7, 9]
```

```java
import java.util.*;

public class Main {
    // Return the k largest values, smallest of them first.
    static List<Integer> kLargest(int[] nums, int k) {
        // min-heap: peek() is the smallest kept value
        // (use (a, b) -> b - a, or a comparator on a record, for other orders)
        PriorityQueue<Integer> heap = new PriorityQueue<>();
        for (int x : nums) {
            heap.offer(x);
            if (heap.size() > k) {  // too many: drop the smallest
                heap.poll();
            }
        }
        List<Integer> out = new ArrayList<>(heap);
        Collections.sort(out);
        return out;
    }

    public static void main(String[] args) {
        System.out.println(kLargest(new int[]{5, 1, 9, 3, 7, 2}, 3)); // [5, 7, 9]
    }
}
```

```cpp
#include <algorithm>
#include <iostream>
#include <queue>
#include <vector>

// Return the k largest values, smallest of them first.
std::vector<int> kLargest(const std::vector<int>& nums, int k) {
    // min-heap: top() is the smallest kept value
    // (drop the std::greater<int> for a max-heap, or pass a lambda for structs)
    std::priority_queue<int, std::vector<int>, std::greater<int>> heap;
    for (int x : nums) {
        heap.push(x);
        if ((int)heap.size() > k) {  // too many: drop the smallest
            heap.pop();
        }
    }
    std::vector<int> out;
    while (!heap.empty()) {
        out.push_back(heap.top());
        heap.pop();
    }
    return out;  // popped in increasing order
}

int main() {
    for (int x : kLargest({5, 1, 9, 3, 7, 2}, 3)) std::cout << x << ' ';  // 5 7 9
    std::cout << '\n';
}
```

```javascript
// JavaScript has no built-in heap, so interviews expect this small one.
class MinHeap {
  constructor(less = (a, b) => a < b) { this.a = []; this.less = less; }
  size() { return this.a.length; }
  peek() { return this.a[0]; }
  push(x) {
    const a = this.a;
    a.push(x);
    let i = a.length - 1;
    while (i > 0) {                       // sift up while smaller than parent
      const p = (i - 1) >> 1;
      if (!this.less(a[i], a[p])) break;
      [a[i], a[p]] = [a[p], a[i]];
      i = p;
    }
  }
  pop() {
    const a = this.a;
    const top = a[0];
    const last = a.pop();
    if (a.length > 0) {
      a[0] = last;
      let i = 0;
      for (;;) {                          // sift down to the smaller child
        const l = 2 * i + 1, r = l + 1;
        let m = i;
        if (l < a.length && this.less(a[l], a[m])) m = l;
        if (r < a.length && this.less(a[r], a[m])) m = r;
        if (m === i) break;
        [a[i], a[m]] = [a[m], a[i]];
        i = m;
      }
    }
    return top;
  }
}

// Return the k largest values, smallest of them first.
function kLargest(nums, k) {
  const heap = new MinHeap();             // pass (a, b) => a.key < b.key for objects
  for (const x of nums) {
    heap.push(x);
    if (heap.size() > k) heap.pop();      // too many: drop the smallest
  }
  const out = [];
  while (heap.size() > 0) out.push(heap.pop());
  return out;
}

console.log(kLargest([5, 1, 9, 3, 7, 2], 3)); // [ 5, 7, 9 ]
```

```go
package main

import (
	"container/heap"
	"fmt"
)

// IntHeap is a min-heap of ints; container/heap drives it through these methods.
type IntHeap []int

func (h IntHeap) Len() int            { return len(h) }
func (h IntHeap) Less(i, j int) bool  { return h[i] < h[j] } // flip to > for a max-heap
func (h IntHeap) Swap(i, j int)       { h[i], h[j] = h[j], h[i] }
func (h *IntHeap) Push(x interface{}) { *h = append(*h, x.(int)) }
func (h *IntHeap) Pop() interface{} {
	old := *h
	n := len(old)
	x := old[n-1]
	*h = old[:n-1]
	return x
}

// kLargest returns the k largest values, smallest of them first.
func kLargest(nums []int, k int) []int {
	h := &IntHeap{}
	heap.Init(h)
	for _, x := range nums {
		heap.Push(h, x)
		if h.Len() > k { // too many: drop the smallest
			heap.Pop(h)
		}
	}
	out := []int{}
	for h.Len() > 0 {
		out = append(out, heap.Pop(h).(int))
	}
	return out
}

func main() {
	fmt.Println(kLargest([]int{5, 1, 9, 3, 7, 2}, 3)) // [5 7 9]
}
```

## Variations

- **Size-k heap** for top-k, as above: O(n log k) time and O(k) space.
- **Two heaps** for a running median: a max-heap for the lower half and a min-heap for the upper half, rebalanced so their sizes differ by at most one. The median is then one top or the average of both.
- **k-way merge**: push the first element of every list as `(value, which list, index)`; pop the smallest, push that list's next element, repeat.
- **Scheduling**: sort events by start time, keep a min-heap of end times; the heap size is how many events overlap right now.
- **Lazy deletion**: a heap cannot remove an arbitrary item. When an item becomes invalid, leave it and skip it when it reaches the top (check a timestamp or a "removed" set). This is how a heap solves sliding-window problems.
- **Heapify**: building a heap from n items at once is O(n), cheaper than n pushes.

## Common mistakes

- Forgetting that C++'s `priority_queue` is a max-heap: `priority_queue<int, vector<int>, greater<int>>` for a min-heap.
- Python tuples with equal first fields compare the second field; if that is an object without `<`, the push crashes. Add an index as a tie-breaker: `(key, i, obj)`.
- Writing a Java comparator as `a - b`; it overflows on large values. Use `Integer.compare(a, b)`.
- Changing an item's priority after it was pushed. The heap does not notice. Push a new entry and lazily skip the stale one.
- Popping k times from a heap of all n items when the problem wanted the k largest *in no particular order*; a size-k heap or quickselect is cheaper, and the interviewer may ask.
- Using a heap where a monotonic deque gives O(n), as in Sliding Window Maximum. Know both and say why you picked one.

## Complexity

Push and pop cost O(log n), peek O(1), and building from an array O(n). A size-k heap over n items costs O(n log k) time and O(k) space, which is the usual answer for top-k problems; a full sort costs O(n log n).

## Where to start

1. [215. Kth Largest Element in an Array](/interview/problems/kth-largest-element-in-an-array/): the size-k min-heap in its purest form.
2. 1046. Last Stone Weight: a max-heap you pop twice and push once; good for getting comfortable with your language's API.
3. [347. Top K Frequent Elements](/interview/problems/top-k-frequent-elements/): count first, then heap on `(count, value)` pairs.
4. 973. K Closest Points to Origin: the heap key is computed (squared distance) and you keep the k *smallest*, so the heap flips to a max-heap.
5. [23. Merge k Sorted Lists](/interview/problems/merge-k-sorted-lists/): the k-way merge pattern with tuples that carry a list pointer.
6. [253. Meeting Rooms II](/interview/problems/meeting-rooms-ii/): a heap of end times answers "how many overlap right now".
7. [295. Find Median from Data Stream](/interview/problems/find-median-from-data-stream/): two heaps balanced against each other.
8. [239. Sliding Window Maximum](/interview/problems/sliding-window-maximum/): solve it with a heap and lazy deletion, then learn why the monotonic deque beats it.
