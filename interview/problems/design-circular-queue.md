---
title: Design Circular Queue
leetcode: design-circular-queue
description: "Design Circular Queue explained: build a fixed-size FIFO queue on one array with a head index and a count so slots are reused in a ring, every operation in O(1), with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

Design a class `MyCircularQueue` that behaves like a first-in-first-out queue with a fixed capacity `k` (at least 1), storing integers. A *circular* queue reuses the space freed at the front: once elements are removed, new ones may take their slots, so the queue never has to shift anything. It supports:

- **Constructor(k):** create an empty queue that can hold at most `k` values.
- **enQueue(value):** append `value` at the back. Return `true` on success, `false` if the queue is already full.
- **deQueue():** remove the value at the front. Return `true` on success, `false` if the queue is empty.
- **Front():** return the value at the front, or `-1` if the queue is empty.
- **Rear():** return the value at the back, or `-1` if the queue is empty.
- **isEmpty()** and **isFull():** report the state.

You may not use a language's built-in queue or deque; the point is to build it on a plain array. In Go the constructor is `Constructor` and the methods are `EnQueue`, `DeQueue`, `Front`, `Rear`, `IsEmpty` and `IsFull`.

## Examples

Capacity `3`:

- `enQueue(4)`, `enQueue(9)`, `enQueue(2)` → all `true`; the queue is now `4, 9, 2` from front to back.
- `enQueue(7)` → `false`, there is no room. `isFull()` → `true`.
- `deQueue()` → `true`, removing `4`. `Front()` → `9`.
- `enQueue(7)` → `true`. It takes the slot `4` left behind, and `Rear()` → `7`.

Capacity `1`: `Front()` → `-1` and `deQueue()` → `false` on the empty queue; `enQueue(5)` → `true`; a second `enQueue(6)` → `false`; `Front()` and `Rear()` → `5`.

## Key idea

Keep an array of exactly `k` slots and treat it as a ring: after the last slot comes slot `0` again. Two numbers describe the queue: `head`, the index of the front element, and `count`, how many elements are stored. The back element is then at `(head + count - 1) mod k`, and the slot where the next element goes is `(head + count) mod k`. Removing the front just moves `head` one step around the ring; nothing is copied. Storing `count` rather than a `tail` index avoids the classic ambiguity where `head == tail` could mean either empty or full.

## Approach

1. In the constructor, allocate an array of length `k`, set `head = 0` and `count = 0`.
2. **enQueue(value):** if `count == k`, return `false`. Otherwise write `value` at index `(head + count) mod k`, increase `count`, return `true`.
3. **deQueue():** if `count == 0`, return `false`. Otherwise set `head = (head + 1) mod k`, decrease `count`, return `true`. The old value can stay in the array; it will be overwritten later.
4. **Front():** return `-1` when empty, else `data[head]`.
5. **Rear():** return `-1` when empty, else `data[(head + count - 1) mod k]`.
6. **isEmpty()** is `count == 0`, **isFull()** is `count == k`.

A naive queue on a plain list removes the front by shifting every other element one position left, which makes `deQueue` O(k). The ring removes the shifting entirely.

## Complexity

- **Time:** O(1) for every operation: one or two index calculations, no loops.
- **Space:** O(k) for the array, allocated once.

## Common mistakes

- Tracking `head` and `tail` indexes without a count, then being unable to tell a full queue from an empty one when the two indexes coincide. Either keep a count or leave one slot unused.
- Forgetting the modulo when computing the back index or the next free slot, so writes run past the array end.
- Returning `data[tail]` for `Rear()` when `tail` points at the next free slot instead of the last stored element (off by one).
- Not returning `-1` from `Front()` and `Rear()` on an empty queue; whatever is in the array at `head` is stale.

## Follow-up questions

- *Can the queue grow when full?* Allocate a bigger array and copy the elements in order starting from `head`, then reset `head` to `0`.
- *How would you make it safe for one producer and one consumer thread?* A ring buffer with separate read and write indexes is the classic lock-free single-producer single-consumer queue.
- *How would a circular deque differ?* Add `insertFront` and `deleteLast`, which move `head` backwards (`(head - 1 + k) mod k`) and shrink `count`.

## Related problems

- [Min Stack](/interview/problems/min-stack/)
- [LRU Cache](/interview/problems/lru-cache/)
- [Design Hit Counter](/interview/problems/design-hit-counter/)
- Design Circular Deque
- Design Front Middle Back Queue

## Solutions

```python
class MyCircularQueue:
    def __init__(self, k: int):
        self.data = [0] * k
        self.k = k
        self.head = 0  # index of the front element
        self.count = 0

    def enQueue(self, value: int) -> bool:
        if self.count == self.k:
            return False
        self.data[(self.head + self.count) % self.k] = value
        self.count += 1
        return True

    def deQueue(self) -> bool:
        if self.count == 0:
            return False
        self.head = (self.head + 1) % self.k
        self.count -= 1
        return True

    def Front(self) -> int:
        return -1 if self.count == 0 else self.data[self.head]

    def Rear(self) -> int:
        return -1 if self.count == 0 else self.data[(self.head + self.count - 1) % self.k]

    def isEmpty(self) -> bool:
        return self.count == 0

    def isFull(self) -> bool:
        return self.count == self.k
```

```java
class MyCircularQueue {
    private final int[] data;
    private int head = 0; // index of the front element
    private int count = 0;

    public MyCircularQueue(int k) {
        data = new int[k];
    }

    public boolean enQueue(int value) {
        if (count == data.length) {
            return false;
        }
        data[(head + count) % data.length] = value;
        count++;
        return true;
    }

    public boolean deQueue() {
        if (count == 0) {
            return false;
        }
        head = (head + 1) % data.length;
        count--;
        return true;
    }

    public int Front() {
        return count == 0 ? -1 : data[head];
    }

    public int Rear() {
        return count == 0 ? -1 : data[(head + count - 1) % data.length];
    }

    public boolean isEmpty() {
        return count == 0;
    }

    public boolean isFull() {
        return count == data.length;
    }
}
```

```cpp
class MyCircularQueue {
    vector<int> data;
    int head = 0;  // index of the front element
    int count = 0;

public:
    MyCircularQueue(int k) : data(k) {}

    bool enQueue(int value) {
        if (count == (int)data.size()) {
            return false;
        }
        data[(head + count) % data.size()] = value;
        count++;
        return true;
    }

    bool deQueue() {
        if (count == 0) {
            return false;
        }
        head = (head + 1) % data.size();
        count--;
        return true;
    }

    int Front() {
        return count == 0 ? -1 : data[head];
    }

    int Rear() {
        return count == 0 ? -1 : data[(head + count - 1) % data.size()];
    }

    bool isEmpty() {
        return count == 0;
    }

    bool isFull() {
        return count == (int)data.size();
    }
};
```

```javascript
/**
 * @param {number} k
 */
var MyCircularQueue = function (k) {
  this.data = new Array(k).fill(0);
  this.k = k;
  this.head = 0; // index of the front element
  this.count = 0;
};

/**
 * @param {number} value
 * @return {boolean}
 */
MyCircularQueue.prototype.enQueue = function (value) {
  if (this.count === this.k) {
    return false;
  }
  this.data[(this.head + this.count) % this.k] = value;
  this.count++;
  return true;
};

/**
 * @return {boolean}
 */
MyCircularQueue.prototype.deQueue = function () {
  if (this.count === 0) {
    return false;
  }
  this.head = (this.head + 1) % this.k;
  this.count--;
  return true;
};

/**
 * @return {number}
 */
MyCircularQueue.prototype.Front = function () {
  return this.count === 0 ? -1 : this.data[this.head];
};

/**
 * @return {number}
 */
MyCircularQueue.prototype.Rear = function () {
  return this.count === 0 ? -1 : this.data[(this.head + this.count - 1) % this.k];
};

/**
 * @return {boolean}
 */
MyCircularQueue.prototype.isEmpty = function () {
  return this.count === 0;
};

/**
 * @return {boolean}
 */
MyCircularQueue.prototype.isFull = function () {
  return this.count === this.k;
};
```

```go
type MyCircularQueue struct {
	data  []int
	head  int // index of the front element
	count int
}

func Constructor(k int) MyCircularQueue {
	return MyCircularQueue{data: make([]int, k)}
}

func (this *MyCircularQueue) EnQueue(value int) bool {
	if this.count == len(this.data) {
		return false
	}
	this.data[(this.head+this.count)%len(this.data)] = value
	this.count++
	return true
}

func (this *MyCircularQueue) DeQueue() bool {
	if this.count == 0 {
		return false
	}
	this.head = (this.head + 1) % len(this.data)
	this.count--
	return true
}

func (this *MyCircularQueue) Front() int {
	if this.count == 0 {
		return -1
	}
	return this.data[this.head]
}

func (this *MyCircularQueue) Rear() int {
	if this.count == 0 {
		return -1
	}
	return this.data[(this.head+this.count-1)%len(this.data)]
}

func (this *MyCircularQueue) IsEmpty() bool {
	return this.count == 0
}

func (this *MyCircularQueue) IsFull() bool {
	return this.count == len(this.data)
}
```
