---
title: Insert Delete GetRandom O(1)
leetcode: insert-delete-getrandom-o1
description: "Insert Delete GetRandom O(1) explained: design a set with constant-time insert, remove and uniform random pick by pairing an array with a value-to-index hash map, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

Design a class `RandomizedSet` that stores a set of distinct integers and supports three operations, each in O(1) time on average:

- `insert(val)`: add `val` if it is not already in the set. Return `true` if it was added, `false` if it was already there.
- `remove(val)`: delete `val` if it is in the set. Return `true` if it was removed, `false` if it was not present.
- `getRandom()`: return one of the values currently in the set, chosen uniformly at random (every member equally likely).

The set starts empty. `getRandom` is only called when the set holds at least one value. Values can be any 32-bit integer, including negatives. In Go the constructor is `Constructor()` and the methods are `Insert`, `Remove` and `GetRandom`.

## Examples

A sequence of calls on one object:

- `insert(4)` → `true`; the set is `{4}`.
- `insert(4)` → `false`; 4 is already present.
- `insert(-2)` → `true`; the set is `{4, -2}`.
- `getRandom()` → `4` or `-2`, each with probability 1/2.
- `remove(4)` → `true`, then `remove(4)` → `false`.
- `getRandom()` → `-2`, the only member left.

## Key idea

A hash set gives O(1) insert and remove, but cannot pick a random element without walking through it. An array gives O(1) random picks (choose a random index), but removing from the middle shifts everything after it. Use **both**: an array `values` holding the members, and a hash map `index` from each value to its position in the array. The trick for removal is to avoid the shift: copy the **last** element of the array into the hole left by the removed value, update that element's index in the map, and drop the last slot. Removing the last slot of an array is O(1).

## Approach

1. Keep `values` (a dynamic array) and `index` (a hash map value → position in `values`).
2. `insert(val)`:
   1. If `val` is in `index`, return `false`.
   2. Otherwise record `index[val] = len(values)`, append `val` to `values`, and return `true`.
3. `remove(val)`:
   1. If `val` is not in `index`, return `false`.
   2. Let `i = index[val]` and `last = values[len - 1]`.
   3. Move `last` into the hole: `values[i] = last` and `index[last] = i`.
   4. Remove the final slot of `values` and delete `val` from `index`. Return `true`.
4. `getRandom()`: pick a random index `r` in `[0, len(values))` and return `values[r]`.

The order in step 3 matters when `val` is itself the last element: writing `last` onto itself is harmless, and deleting `val` from the map *after* updating `index[last]` makes sure it really disappears.

## Complexity

- **Time:** O(1) average for every operation. Hash map lookups, inserts and deletes are O(1) on average, and the array only changes at its end (appending is amortised O(1)).
- **Space:** O(n) for the array and the map, where `n` is the number of values stored.

## Common mistakes

- Removing from the middle of the array with `remove`/`splice`/`erase`. That shifts the following elements and costs O(n).
- Forgetting to update the moved element's index in the map. The next removal of that value then deletes the wrong slot.
- Deleting `val` from the map before updating `index[last]`. When `val` is the last element, that puts `val` straight back into the map.
- Building a list from the hash set inside `getRandom`, which is O(n) per call.

## Follow-up questions

- What if duplicates are allowed? That is Insert Delete GetRandom O(1) - Duplicates allowed: the map stores a *set* of positions for each value, and removal takes any one of them.
- Why is `getRandom` uniform? Each member occupies exactly one array slot, and the random index is uniform over the slots.

## Related problems

- Insert Delete GetRandom O(1) - Duplicates allowed
- LRU Cache (another design problem that combines two data structures)

## Solutions

```python
import random


class RandomizedSet:
    def __init__(self):
        self.values = []  # the members, in any order
        self.index = {}  # value -> position in self.values

    def insert(self, val: int) -> bool:
        if val in self.index:
            return False
        self.index[val] = len(self.values)
        self.values.append(val)
        return True

    def remove(self, val: int) -> bool:
        if val not in self.index:
            return False
        i, last = self.index[val], self.values[-1]
        self.values[i] = last  # move the last value into the hole
        self.index[last] = i
        self.values.pop()
        del self.index[val]
        return True

    def getRandom(self) -> int:
        return random.choice(self.values)
```

```java
class RandomizedSet {
    private final List<Integer> values = new ArrayList<>(); // the members, in any order
    private final Map<Integer, Integer> index = new HashMap<>(); // value -> position in values
    private final Random random = new Random();

    public RandomizedSet() {}

    public boolean insert(int val) {
        if (index.containsKey(val)) return false;
        index.put(val, values.size());
        values.add(val);
        return true;
    }

    public boolean remove(int val) {
        Integer i = index.get(val);
        if (i == null) return false;
        int last = values.get(values.size() - 1);
        values.set(i, last); // move the last value into the hole
        index.put(last, i);
        values.remove(values.size() - 1);
        index.remove(val);
        return true;
    }

    public int getRandom() {
        return values.get(random.nextInt(values.size()));
    }
}
```

```cpp
class RandomizedSet {
    vector<int> values;              // the members, in any order
    unordered_map<int, int> index;  // value -> position in values

public:
    RandomizedSet() {}

    bool insert(int val) {
        if (index.count(val)) return false;
        index[val] = values.size();
        values.push_back(val);
        return true;
    }

    bool remove(int val) {
        auto it = index.find(val);
        if (it == index.end()) return false;
        int i = it->second, last = values.back();
        values[i] = last;  // move the last value into the hole
        index[last] = i;
        values.pop_back();
        index.erase(val);
        return true;
    }

    int getRandom() {
        return values[rand() % values.size()];
    }
};
```

```javascript
var RandomizedSet = function () {
  this.values = []; // the members, in any order
  this.index = new Map(); // value -> position in this.values
};

/**
 * @param {number} val
 * @return {boolean}
 */
RandomizedSet.prototype.insert = function (val) {
  if (this.index.has(val)) return false;
  this.index.set(val, this.values.length);
  this.values.push(val);
  return true;
};

/**
 * @param {number} val
 * @return {boolean}
 */
RandomizedSet.prototype.remove = function (val) {
  if (!this.index.has(val)) return false;
  const i = this.index.get(val);
  const last = this.values[this.values.length - 1];
  this.values[i] = last; // move the last value into the hole
  this.index.set(last, i);
  this.values.pop();
  this.index.delete(val);
  return true;
};

/**
 * @return {number}
 */
RandomizedSet.prototype.getRandom = function () {
  return this.values[Math.floor(Math.random() * this.values.length)];
};
```

```go
import "math/rand"

type RandomizedSet struct {
	values []int       // the members, in any order
	index  map[int]int // value -> position in values
}

func Constructor() RandomizedSet {
	return RandomizedSet{index: make(map[int]int)}
}

func (this *RandomizedSet) Insert(val int) bool {
	if _, ok := this.index[val]; ok {
		return false
	}
	this.index[val] = len(this.values)
	this.values = append(this.values, val)
	return true
}

func (this *RandomizedSet) Remove(val int) bool {
	i, ok := this.index[val]
	if !ok {
		return false
	}
	last := this.values[len(this.values)-1]
	this.values[i] = last // move the last value into the hole
	this.index[last] = i
	this.values = this.values[:len(this.values)-1]
	delete(this.index, val)
	return true
}

func (this *RandomizedSet) GetRandom() int {
	return this.values[rand.Intn(len(this.values))]
}
```
