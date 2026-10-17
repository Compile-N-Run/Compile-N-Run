---
title: Flatten Nested List Iterator
leetcode: flatten-nested-list-iterator
description: "Flatten Nested List Iterator explained: design an iterator that walks a list whose items are integers or further nested lists, unwrapping lists lazily with a stack, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given a nested list of integers: each element is either a single integer or another list whose elements are again integers or lists, to any depth. Design a class `NestedIterator` that hands out the integers one at a time in left-to-right, depth-first order, as if the structure had been flattened.

- **Constructor(nestedList):** receives the nested list.
- **next():** returns the next integer.
- **hasNext():** returns `true` if any integer is left, `false` otherwise.

LeetCode supplies the `NestedInteger` interface and you must not implement it: `isInteger()` tells whether an element is a plain integer, `getInteger()` returns that integer, and `getList()` returns the element's children when it is a list. The judge calls your iterator like this: `while (it.hasNext()) result.add(it.next())`, and the result must equal the flattened list. Empty lists are allowed anywhere and contribute nothing. In Go the constructor is `Constructor`, the methods `Next` and `HasNext`.

## Examples

- `[[4, 5], 6, [7, [8]]]` → the calls return `4, 5, 6, 7, 8`, then `hasNext()` is `false`.
- `[1, [2, [3, [4, [5]]]]]` → `1, 2, 3, 4, 5`. Depth does not matter.
- `[[], [[]], 9]` → `9`. Empty lists are skipped, and `hasNext()` must report `true` before the `9` is reached even though the first two elements hold nothing.
- `[]` or `[[[]]]` → `hasNext()` is `false` straight away.

## Key idea

Flattening everything in the constructor works but defeats the purpose of an iterator: it costs memory for every integer up front, even if the caller only wants the first one. A **stack** gives laziness for free. Push the top-level elements in reverse order so that the first element is on top. When asked `hasNext`, look at the top: if it is an integer, the answer is yes; if it is a list, pop it and push its children (again in reverse) and look again. Lists are unwrapped only when the iteration actually reaches them, and `next` simply pops the integer that `hasNext` has exposed.

## Approach

1. **Constructor:** create an empty stack and push the elements of `nestedList` from last to first.
2. **hasNext():** while the stack is not empty and its top is a list, pop that list and push its children from last to first. Return `true` if the stack is non-empty afterwards (its top is then an integer), otherwise `false`.
3. **next():** call `hasNext()` first so that the top is guaranteed to be an integer, then pop it and return its value.

The eager alternative flattens recursively in the constructor into an array and keeps an index. It is simpler to write but uses O(total integers) extra memory immediately and does no real iteration. A third design keeps a stack of `(list, index)` pairs, which avoids copying children onto the stack and is what you would write for an iterator over a huge, deep structure.

## Complexity

- **Time:** O(1) amortised per `next()` / `hasNext()` call. Each `NestedInteger` is pushed and popped exactly once over the whole iteration, so the total work is O(n), where `n` is the number of integers plus lists.
- **Space:** O(d + w): the stack holds at most the siblings along the current path, where `d` is the nesting depth and `w` the widest list.

## Common mistakes

- Pushing children in their natural order, which iterates each list backwards. Push from last to first so the first child ends up on top.
- Returning `true` from `hasNext` because the stack is non-empty when the top is a list that turns out to be empty. The unwrapping loop in `hasNext` must run until the top is an integer.
- Doing the unwrapping only in `next` and leaving `hasNext` as `!stack.isEmpty()`. Then `[[]]` reports an element that does not exist.
- Changing state in `hasNext` in a way that is not idempotent, so two `hasNext()` calls in a row skip an element. Unwrapping lists is fine; popping an integer is not.

## Follow-up questions

- *How would you support `peek()`?* `hasNext()` already exposes the next integer at the top of the stack; `peek` returns it without popping.
- *What if lists could be modified while iterating?* Hold `(list, index)` pairs and re-check the list's size on every call, or snapshot the structure first.
- *Can you flatten in the constructor instead?* Yes, with a simple recursion; mention the memory trade-off and the fact that the caller may stop early.

## Related problems

- [Decode String](/interview/problems/decode-string/)
- [Design Circular Queue](/interview/problems/design-circular-queue/)
- Nested List Weight Sum
- Flatten 2D Vector
- Mini Parser

## Solutions

```python
class NestedIterator:
    def __init__(self, nestedList: [NestedInteger]):
        self.stack = list(reversed(nestedList))  # first element on top

    def next(self) -> int:
        self.hasNext()  # make sure the top is an integer
        return self.stack.pop().getInteger()

    def hasNext(self) -> bool:
        while self.stack and not self.stack[-1].isInteger():
            nested = self.stack.pop()
            self.stack.extend(reversed(nested.getList()))
        return len(self.stack) > 0
```

```java
class NestedIterator implements Iterator<Integer> {
    private final Deque<NestedInteger> stack = new ArrayDeque<>();

    public NestedIterator(List<NestedInteger> nestedList) {
        pushReversed(nestedList); // first element on top
    }

    private void pushReversed(List<NestedInteger> list) {
        for (int i = list.size() - 1; i >= 0; i--) stack.push(list.get(i));
    }

    @Override
    public Integer next() {
        hasNext(); // make sure the top is an integer
        return stack.pop().getInteger();
    }

    @Override
    public boolean hasNext() {
        while (!stack.isEmpty() && !stack.peek().isInteger()) {
            pushReversed(stack.pop().getList());
        }
        return !stack.isEmpty();
    }
}
```

```cpp
class NestedIterator {
    vector<const NestedInteger*> stack;  // first element on top

    void pushReversed(const vector<NestedInteger>& list) {
        for (auto it = list.rbegin(); it != list.rend(); ++it) stack.push_back(&*it);
    }

public:
    NestedIterator(vector<NestedInteger>& nestedList) {
        pushReversed(nestedList);
    }

    int next() {
        hasNext();  // make sure the top is an integer
        const NestedInteger* top = stack.back();
        stack.pop_back();
        return top->getInteger();
    }

    bool hasNext() {
        while (!stack.empty() && !stack.back()->isInteger()) {
            const NestedInteger* nested = stack.back();
            stack.pop_back();
            pushReversed(nested->getList());
        }
        return !stack.empty();
    }
};
```

```javascript
/**
 * @constructor
 * @param {NestedInteger[]} nestedList
 */
var NestedIterator = function (nestedList) {
  this.stack = nestedList.slice().reverse(); // first element on top
};

/**
 * @this NestedIterator
 * @returns {boolean}
 */
NestedIterator.prototype.hasNext = function () {
  while (this.stack.length && !this.stack[this.stack.length - 1].isInteger()) {
    const nested = this.stack.pop();
    const children = nested.getList();
    for (let i = children.length - 1; i >= 0; i--) this.stack.push(children[i]);
  }
  return this.stack.length > 0;
};

/**
 * @this NestedIterator
 * @returns {integer}
 */
NestedIterator.prototype.next = function () {
  this.hasNext(); // make sure the top is an integer
  return this.stack.pop().getInteger();
};
```

```go
type NestedIterator struct {
	stack []*NestedInteger // first element on top
}

func Constructor(nestedList []*NestedInteger) *NestedIterator {
	it := &NestedIterator{}
	it.pushReversed(nestedList)
	return it
}

func (this *NestedIterator) pushReversed(list []*NestedInteger) {
	for i := len(list) - 1; i >= 0; i-- {
		this.stack = append(this.stack, list[i])
	}
}

func (this *NestedIterator) Next() int {
	this.HasNext() // make sure the top is an integer
	top := this.stack[len(this.stack)-1]
	this.stack = this.stack[:len(this.stack)-1]
	return top.GetInteger()
}

func (this *NestedIterator) HasNext() bool {
	for len(this.stack) > 0 && !this.stack[len(this.stack)-1].IsInteger() {
		nested := this.stack[len(this.stack)-1]
		this.stack = this.stack[:len(this.stack)-1]
		this.pushReversed(nested.GetList())
	}
	return len(this.stack) > 0
}
```
