---
title: Kth Largest Element in an Array
leetcode: kth-largest-element-in-an-array
description: "Kth Largest Element in an Array explained: find the k-th largest value without fully sorting by keeping a min-heap of the k largest numbers seen so far, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given an array of integers `nums` and an integer `k`. Return the `k`-th largest value in the array, counting duplicates: it is the value that would sit at position `k` (1-based) if the array were sorted from largest to smallest. It is not the `k`-th largest *distinct* value.

`k` is always between 1 and the length of the array. Values can be negative. Interviewers usually ask whether you can do better than sorting the whole array.

## Examples

- `nums = [7, 2, 9, 4]`, `k = 2` → `7`. From largest to smallest the array is `9, 7, 4, 2`.
- `nums = [5, 5, 1]`, `k = 2` → `5`. Both 5s count, so the first and second largest are both 5.
- `nums = [-1, -8, -3]`, `k = 3` → `-8`, the smallest value, since `k` equals the length.
- `nums = [6]`, `k = 1` → `6`.

## Key idea

You only need to remember the `k` largest numbers seen so far, and among those, you constantly need the *smallest* one: it is the current `k`-th largest, and it is the one to throw away when a bigger number arrives. A **min-heap** gives the smallest element in O(1) and removes or inserts in O(log k). Keep the heap at size `k` while scanning the array; at the end its top is the answer.

## Approach

1. Create an empty min-heap.
2. For each number `x` in `nums`:
   1. Push `x` onto the heap.
   2. If the heap now holds more than `k` numbers, pop the smallest one. It cannot be among the `k` largest, because `k` numbers in the heap are at least as big.
3. After the scan the heap holds exactly the `k` largest values, and its top (the smallest of them) is the `k`-th largest. Return it.

Sorting the array and taking `nums[n - k]` also works and is a fine first answer, but it costs O(n log n). The heap is faster when `k` is much smaller than `n`.

JavaScript has no built-in heap, so its solution includes a small array-based min-heap: the parent of index `i` is at `(i - 1) >> 1`, its children at `2i + 1` and `2i + 2`. Pushing appends and "sifts up"; popping moves the last element to the root and "sifts down".

## Complexity

- **Time:** O(n log k). Each of the `n` numbers causes at most one push and one pop on a heap of size at most `k + 1`.
- **Space:** O(k) for the heap.

## Common mistakes

- Using a max-heap of all `n` numbers and popping `k - 1` times. It works, but it costs O(n + k log n) time and O(n) space; the size-`k` min-heap is the usual expected answer.
- Removing duplicates first. The problem counts repeated values separately.
- Off-by-one with sorting: after an ascending sort the answer is at index `n - k`, not `k` or `n - k - 1`.

## Follow-up questions

- Can you get O(n) on average? Yes, with **quickselect**: partition the array around a random pivot as in quicksort, then continue only into the side that contains position `n - k`. The expected time is O(n), with an O(n²) worst case; a three-way partition keeps arrays full of duplicates fast.
- What if the numbers arrive as a stream? Keep the same size-`k` min-heap; that is Kth Largest Element in a Stream.
- The values are small (for example between -10⁴ and 10⁴)? Counting sort over the value range finds the answer in O(n + range).

## Related problems

- Kth Largest Element in a Stream
- Top K Frequent Elements
- K Closest Points to Origin

## Solutions

```python
class Solution:
    def findKthLargest(self, nums: List[int], k: int) -> int:
        heap = []  # min-heap of the k largest values seen so far
        for x in nums:
            heapq.heappush(heap, x)
            if len(heap) > k:
                heapq.heappop(heap)  # drop the smallest
        return heap[0]
```

```java
class Solution {
    public int findKthLargest(int[] nums, int k) {
        PriorityQueue<Integer> heap = new PriorityQueue<>(); // min-heap of the k largest values seen so far
        for (int x : nums) {
            heap.offer(x);
            if (heap.size() > k) {
                heap.poll(); // drop the smallest
            }
        }
        return heap.peek();
    }
}
```

```cpp
class Solution {
public:
    int findKthLargest(vector<int>& nums, int k) {
        priority_queue<int, vector<int>, greater<int>> heap;  // min-heap of the k largest values seen so far
        for (int x : nums) {
            heap.push(x);
            if ((int)heap.size() > k) {
                heap.pop();  // drop the smallest
            }
        }
        return heap.top();
    }
};
```

```javascript
/**
 * @param {number[]} nums
 * @param {number} k
 * @return {number}
 */
var findKthLargest = function (nums, k) {
  const heap = []; // min-heap of the k largest values seen so far

  const push = (x) => {
    heap.push(x);
    let i = heap.length - 1;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (heap[parent] <= heap[i]) break;
      [heap[parent], heap[i]] = [heap[i], heap[parent]];
      i = parent;
    }
  };

  const pop = () => {
    const last = heap.pop();
    if (heap.length === 0) return;
    heap[0] = last;
    let i = 0;
    while (true) {
      const left = 2 * i + 1, right = left + 1;
      let smallest = i;
      if (left < heap.length && heap[left] < heap[smallest]) smallest = left;
      if (right < heap.length && heap[right] < heap[smallest]) smallest = right;
      if (smallest === i) break;
      [heap[smallest], heap[i]] = [heap[i], heap[smallest]];
      i = smallest;
    }
  };

  for (const x of nums) {
    push(x);
    if (heap.length > k) pop(); // drop the smallest
  }
  return heap[0];
};
```

```go
import "container/heap"

// minHeap implements heap.Interface for ints.
type minHeap []int

func (h minHeap) Len() int            { return len(h) }
func (h minHeap) Less(i, j int) bool  { return h[i] < h[j] }
func (h minHeap) Swap(i, j int)       { h[i], h[j] = h[j], h[i] }
func (h *minHeap) Push(x interface{}) { *h = append(*h, x.(int)) }
func (h *minHeap) Pop() interface{} {
	old := *h
	x := old[len(old)-1]
	*h = old[:len(old)-1]
	return x
}

func findKthLargest(nums []int, k int) int {
	h := &minHeap{} // min-heap of the k largest values seen so far
	for _, x := range nums {
		heap.Push(h, x)
		if h.Len() > k {
			heap.Pop(h) // drop the smallest
		}
	}
	return (*h)[0]
}
```
