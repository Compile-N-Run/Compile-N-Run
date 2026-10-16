---
title: Min Stack
leetcode: min-stack
description: "Min Stack explained: design a stack that also returns its smallest element in O(1) time by storing the running minimum next to every value, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

Design a class `MinStack`, a normal last-in-first-out stack of integers with one extra feature: it can report its smallest element instantly. It supports:

- **Constructor():** create an empty stack.
- **push(val):** put `val` on top of the stack.
- **pop():** remove the top element (returns nothing).
- **top():** return the top element without removing it.
- **getMin():** return the smallest element currently in the stack.

Every operation must take O(1) time. `pop`, `top` and `getMin` are only called when the stack is not empty, and values can be any 32-bit signed integer. In Go the constructor is a function named `Constructor` and the methods are `Push`, `Pop`, `Top` and `GetMin`.

## Examples

- `push(4)`, `push(2)`, `push(7)` → `getMin()` returns `2` and `top()` returns `7`.
- Continuing: `pop()` removes 7, `pop()` removes 2 → now `getMin()` returns `4`. The minimum went back up once 2 left the stack.
- `push(3)`, `push(3)`, `pop()` → `getMin()` returns `3`. One copy of the duplicate minimum is still there.
- `push(-1)`, `push(5)` → `getMin()` returns `-1`, `top()` returns `5`.

## Key idea

A stack only ever changes at its top. So the minimum of the stack *at the moment an element sits on top* never changes until that element is popped. Store, next to each value, the minimum of everything from the bottom up to and including that value. The answer to `getMin` is then just the stored minimum of the top entry, and after a `pop` the entry below already knows the minimum of the shorter stack.

## Approach

1. Keep one stack whose entries are pairs `(value, minSoFar)`.
2. **push(val):** if the stack is empty, `minSoFar = val`; otherwise `minSoFar = min(val, minSoFar of the current top)`. Push the pair.
3. **pop():** remove the top pair. Nothing else to fix, because the pair below holds the correct minimum for the remaining stack.
4. **top():** return the value of the top pair.
5. **getMin():** return the `minSoFar` of the top pair.

Keeping a single "current minimum" variable is not enough: when the minimum is popped you would have to scan the whole stack to find the new one, which is O(n).

## Complexity

- **Time:** O(1) for every operation. Each one touches only the top of the stack.
- **Space:** O(n) for n elements, since each value is stored with one extra number.

## Common mistakes

- Tracking only one minimum variable and not knowing what the minimum becomes after it is popped.
- With the two-stack variant (a separate stack that only stores new minimums), pushing onto the min stack only when `val < currentMin`. Duplicates of the minimum must also be pushed (`val <= currentMin`), or popping one copy loses the other.
- Computing a difference such as `val - min` to save space, which can overflow a 32-bit integer when values are near the limits.

## Follow-up questions

- Can you use less extra memory? Keep a second stack that only receives a value when it is less than or equal to the current minimum, and pop it only when the popped value equals its top.
- How would you build a queue that reports its minimum in O(1)? (Two min stacks, or a monotonic deque.)
- What about a stack that also supports `getMax`? Store both running values in each entry.

## Related problems

- Sliding Window Maximum
- Max Stack
- Implement Queue using Stacks

## Solutions

```python
class MinStack:
    def __init__(self):
        self.stack = []  # pairs (value, minimum of the stack up to this value)

    def push(self, val: int) -> None:
        current_min = min(val, self.stack[-1][1]) if self.stack else val
        self.stack.append((val, current_min))

    def pop(self) -> None:
        self.stack.pop()

    def top(self) -> int:
        return self.stack[-1][0]

    def getMin(self) -> int:
        return self.stack[-1][1]
```

```java
class MinStack {
    private final Deque<int[]> stack = new ArrayDeque<>(); // {value, minimum up to this value}

    public MinStack() {}

    public void push(int val) {
        int currentMin = stack.isEmpty() ? val : Math.min(val, stack.peek()[1]);
        stack.push(new int[] {val, currentMin});
    }

    public void pop() {
        stack.pop();
    }

    public int top() {
        return stack.peek()[0];
    }

    public int getMin() {
        return stack.peek()[1];
    }
}
```

```cpp
class MinStack {
    vector<pair<int, int>> stack;  // {value, minimum up to this value}

public:
    MinStack() {}

    void push(int val) {
        int currentMin = stack.empty() ? val : min(val, stack.back().second);
        stack.push_back({val, currentMin});
    }

    void pop() {
        stack.pop_back();
    }

    int top() {
        return stack.back().first;
    }

    int getMin() {
        return stack.back().second;
    }
};
```

```javascript
var MinStack = function () {
  this.stack = []; // [value, minimum up to this value]
};

/**
 * @param {number} val
 * @return {void}
 */
MinStack.prototype.push = function (val) {
  const n = this.stack.length;
  const currentMin = n === 0 ? val : Math.min(val, this.stack[n - 1][1]);
  this.stack.push([val, currentMin]);
};

/**
 * @return {void}
 */
MinStack.prototype.pop = function () {
  this.stack.pop();
};

/**
 * @return {number}
 */
MinStack.prototype.top = function () {
  return this.stack[this.stack.length - 1][0];
};

/**
 * @return {number}
 */
MinStack.prototype.getMin = function () {
  return this.stack[this.stack.length - 1][1];
};
```

```go
type MinStack struct {
	stack [][2]int // {value, minimum up to this value}
}

func Constructor() MinStack {
	return MinStack{}
}

func (this *MinStack) Push(val int) {
	currentMin := val
	if n := len(this.stack); n > 0 && this.stack[n-1][1] < val {
		currentMin = this.stack[n-1][1]
	}
	this.stack = append(this.stack, [2]int{val, currentMin})
}

func (this *MinStack) Pop() {
	this.stack = this.stack[:len(this.stack)-1]
}

func (this *MinStack) Top() int {
	return this.stack[len(this.stack)-1][0]
}

func (this *MinStack) GetMin() int {
	return this.stack[len(this.stack)-1][1]
}
```
