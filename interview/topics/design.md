---
title: Design
topic: Design
group: structures
description: "Design problems ask for a class with several operations and a time limit on each; the skill is choosing one data structure per operation and keeping them in sync when no single structure does it all."
---

## What it is

Most interview problems want one function. A *design* problem wants a class: a constructor and a handful of methods that will be called in any order, each with a required running time, usually O(1) or O(log n). The caller might `put` a million times and `get` once, or the other way round, so every method has to be fast on its own.

The interesting part is never the code; it is the choice of structures. One structure rarely supports every operation at the required speed, so the answer is usually two of them wired together: a hash map that finds things, plus something else that keeps them in an order the map cannot express. A map plus a doubly linked list gives an LRU cache. A map plus an array gives O(1) insert, delete and random pick. Two heaps give a running median. The map is almost always the first half; the question is what the second half is.

Design problems also test whether you ask about the rules before coding: what happens on a duplicate key, on a missing key, when capacity is zero, when timestamps arrive out of order.

## When to use it

- The statement starts with *Design a ...* or *Implement a class that supports ...*.
- Several operations are listed with a complexity each, such as *all operations in O(1)*.
- The input is a sequence of calls (`["put", "get", "put"]`) rather than a single array.
- Words like *cache*, *rate limiter*, *counter*, *iterator*, *stream*, *leaderboard*, *file system*, *time-based*.

## How it works

Use the same five steps every time.

1. **List the operations and their required cost.** Write them down; the costs decide everything.
2. **Match each operation to the structure that gives that cost.** Lookup by key: hash map. Min or max: heap. Most recent or oldest: deque or linked list. Order plus fast membership: map pointing into a list. Position by index: array. "Value at a time at or before t": sorted list plus binary search.
3. **Combine when they conflict.** If one structure has the item and another has its order, store in the map a *pointer into* the other structure (a node, an index), so the map lets you jump straight to it.
4. **State the invariant** that ties them together, for example "every key in the map has exactly one node in the list, and the list holds nothing else", and make every method keep it.
5. **Walk a short call sequence by hand** before writing code, including a remove of something that is not there and an add of something that already is.

Take a set with O(1) `add`, `remove`, `contains` and `anyItem`. A hash set gives the first three but has no way to return an element by position. An array gives position but `remove` is O(n). Combine them: an array `items` and a map `index` from value to its slot in the array. `add` appends and records the slot. `remove(x)` looks up `x`'s slot `i`, moves the *last* element into slot `i`, updates that element's entry in the map, pops the array and deletes `x` from the map. Nothing shifts, so every step is O(1).

Trace `add(10)`, `add(20)`, `add(30)`, `remove(10)`:

| call | items | index |
|---|---|---|
| add(10) | `[10]` | `{10: 0}` |
| add(20) | `[10, 20]` | `{10: 0, 20: 1}` |
| add(30) | `[10, 20, 30]` | `{10: 0, 20: 1, 30: 2}` |
| remove(10) | `[30, 20]` | `{20: 1, 30: 0}` |

The template is this class. It is also the core of Insert Delete GetRandom O(1), where `anyItem` becomes a random index.

## Template

```python
class Registry:
    """A set with O(1) add, remove, contains and 'pick any'.

    Two structures, one job each: the list holds the items so we can index
    them, the dict maps each item to its index so we can find it in O(1).
    """

    def __init__(self):
        self.items = []         # the values, in no particular order
        self.index = {}         # value -> its position in self.items

    def add(self, x):
        if x in self.index:
            return False
        self.index[x] = len(self.items)
        self.items.append(x)
        return True

    def remove(self, x):
        if x not in self.index:
            return False
        i = self.index.pop(x)
        last = self.items.pop()         # take the last item...
        if i < len(self.items):         # ...and move it into the hole, unless it was the hole
            self.items[i] = last
            self.index[last] = i
        return True

    def contains(self, x):
        return x in self.index

    def any_item(self):
        return self.items[0]            # swap for random.choice(self.items) when asked


r = Registry()
r.add(10); r.add(20); r.add(30)
r.remove(10)
print(r.contains(10), r.contains(30), len(r.items))   # False True 2
```

```java
import java.util.*;

public class Main {
    // A set with O(1) add, remove, contains and "pick any".
    // Two structures, one job each: the list holds the items so we can index them,
    // the map sends each item to its index so we can find it in O(1).
    static class Registry {
        private final List<Integer> items = new ArrayList<>();   // values, in no particular order
        private final Map<Integer, Integer> index = new HashMap<>();  // value -> position in items

        boolean add(int x) {
            if (index.containsKey(x)) return false;
            index.put(x, items.size());
            items.add(x);
            return true;
        }

        boolean remove(int x) {
            Integer i = index.remove(x);
            if (i == null) return false;
            int last = items.remove(items.size() - 1);   // take the last item...
            if (i < items.size()) {                      // ...and move it into the hole
                items.set(i, last);
                index.put(last, i);
            }
            return true;
        }

        boolean contains(int x) { return index.containsKey(x); }

        int anyItem() { return items.get(0); }   // swap for a random index when asked

        int size() { return items.size(); }
    }

    public static void main(String[] args) {
        Registry r = new Registry();
        r.add(10); r.add(20); r.add(30);
        r.remove(10);
        System.out.println(r.contains(10) + " " + r.contains(30) + " " + r.size());  // false true 2
    }
}
```

```cpp
#include <iostream>
#include <unordered_map>
#include <vector>

// A set with O(1) add, remove, contains and "pick any".
// Two structures, one job each: the vector holds the items so we can index them,
// the map sends each item to its index so we can find it in O(1).
class Registry {
    std::vector<int> items;                 // values, in no particular order
    std::unordered_map<int, int> index;     // value -> position in items

public:
    bool add(int x) {
        if (index.count(x)) return false;
        index[x] = items.size();
        items.push_back(x);
        return true;
    }

    bool remove(int x) {
        auto it = index.find(x);
        if (it == index.end()) return false;
        int i = it->second;
        index.erase(it);
        int last = items.back();            // take the last item...
        items.pop_back();
        if (i < (int)items.size()) {        // ...and move it into the hole
            items[i] = last;
            index[last] = i;
        }
        return true;
    }

    bool contains(int x) const { return index.count(x) > 0; }

    int anyItem() const { return items[0]; }   // swap for a random index when asked

    int size() const { return items.size(); }
};

int main() {
    Registry r;
    r.add(10); r.add(20); r.add(30);
    r.remove(10);
    std::cout << std::boolalpha << r.contains(10) << ' ' << r.contains(30) << ' ' << r.size() << '\n';  // false true 2
}
```

```javascript
// A set with O(1) add, remove, contains and "pick any".
// Two structures, one job each: the array holds the items so we can index them,
// the Map sends each item to its index so we can find it in O(1).
class Registry {
  constructor() {
    this.items = [];          // values, in no particular order
    this.index = new Map();   // value -> position in items
  }

  add(x) {
    if (this.index.has(x)) return false;
    this.index.set(x, this.items.length);
    this.items.push(x);
    return true;
  }

  remove(x) {
    if (!this.index.has(x)) return false;
    const i = this.index.get(x);
    this.index.delete(x);
    const last = this.items.pop();      // take the last item...
    if (i < this.items.length) {        // ...and move it into the hole
      this.items[i] = last;
      this.index.set(last, i);
    }
    return true;
  }

  contains(x) { return this.index.has(x); }

  anyItem() { return this.items[0]; }   // swap for a random index when asked

  size() { return this.items.length; }
}

const r = new Registry();
r.add(10); r.add(20); r.add(30);
r.remove(10);
console.log(r.contains(10), r.contains(30), r.size());  // false true 2
```

```go
package main

import "fmt"

// Registry is a set with O(1) add, remove, contains and "pick any".
// Two structures, one job each: the slice holds the items so we can index them,
// the map sends each item to its index so we can find it in O(1).
type Registry struct {
	items []int       // values, in no particular order
	index map[int]int // value -> position in items
}

func NewRegistry() *Registry {
	return &Registry{index: map[int]int{}}
}

func (r *Registry) Add(x int) bool {
	if _, ok := r.index[x]; ok {
		return false
	}
	r.index[x] = len(r.items)
	r.items = append(r.items, x)
	return true
}

func (r *Registry) Remove(x int) bool {
	i, ok := r.index[x]
	if !ok {
		return false
	}
	delete(r.index, x)
	last := r.items[len(r.items)-1] // take the last item...
	r.items = r.items[:len(r.items)-1]
	if i < len(r.items) { // ...and move it into the hole
		r.items[i] = last
		r.index[last] = i
	}
	return true
}

func (r *Registry) Contains(x int) bool { _, ok := r.index[x]; return ok }

func (r *Registry) AnyItem() int { return r.items[0] } // swap for a random index when asked

func (r *Registry) Size() int { return len(r.items) }

func main() {
	r := NewRegistry()
	r.Add(10)
	r.Add(20)
	r.Add(30)
	r.Remove(10)
	fmt.Println(r.Contains(10), r.Contains(30), r.Size()) // false true 2
}
```

## Variations

- **Map plus doubly linked list**: O(1) move-to-front and evict-from-back, the LRU cache. Sentinel head and tail nodes remove every edge case.
- **Map of counters plus buckets of linked lists**: LFU cache and All O'one, where items move between frequency buckets.
- **Two heaps**: a max-heap of the lower half and a min-heap of the upper half, for a running median.
- **Map from key to a sorted list of (timestamp, value)**: binary search for the latest value at or before a time (Time Based Key-Value Store), valid because timestamps arrive in increasing order.
- **Queue or deque of timestamps**: pop expired entries from the front for a hit counter or rate limiter in a sliding time window.
- **Circular buffer**: a fixed array with head and tail indexes that wrap with `%`, for a bounded queue with no allocation.
- **Stack plus auxiliary stack**: Min Stack keeps the minimum so far beside each pushed value.
- **Wrapper around an iterator**: peeking iterators and flatteners hold one element of look-ahead.

## Common mistakes

- Updating one structure and not the other. After every mutation, both must describe the same set of keys; write the invariant in a comment and check it in each method.
- Doing an O(n) scan "just once" inside a method that must be O(1), such as `list.remove(x)` or `del` on the middle of an array.
- Skipping the "already exists" and "not present" branches; many designs return a boolean for exactly that reason.
- Reading only the method names and missing a constraint in the description, such as "timestamps are strictly increasing", which is what makes the binary-search design legal.
- Forgetting to store the key inside a node, so that when you evict a node from the list you cannot delete it from the map.
- Reaching for threads and locks. Unless the interviewer asks about concurrency, a single-threaded design with the right complexities is the answer; mention locking as a follow-up.
- Using a language built-in (`OrderedDict`, `LinkedHashMap`) without being able to explain what it hides. It is fine to use it after you have described the map-plus-list design.

## Complexity

Each method has the complexity the problem demands, so state it method by method, and name the one that costs the most. Space is normally O(n) for n stored items; a second structure that points into the first adds a constant factor, not a new term. Amortised costs are acceptable when you say so, such as a circular buffer that occasionally doubles.

## Where to start

1. [155. Min Stack](/interview/problems/min-stack/): one extra structure (a second stack) beside the obvious one.
2. [622. Design Circular Queue](/interview/problems/design-circular-queue/): a fixed array with wrapping indexes.
3. [359. Logger Rate Limiter](/interview/problems/logger-rate-limiter/): a map from message to the next time it may print.
4. [362. Design Hit Counter](/interview/problems/design-hit-counter/): a queue of timestamps trimmed from the front.
5. [380. Insert Delete GetRandom O(1)](/interview/problems/insert-delete-getrandom-o1/): the template with a random index.
6. [146. LRU Cache](/interview/problems/lru-cache/): map plus doubly linked list, the design problem everyone is expected to know.
7. [981. Time Based Key-Value Store](/interview/problems/time-based-key-value-store/): map of sorted lists with binary search.
8. [295. Find Median from Data Stream](/interview/problems/find-median-from-data-stream/): two heaps kept in balance.
