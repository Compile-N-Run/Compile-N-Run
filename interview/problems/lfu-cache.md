---
title: LFU Cache
leetcode: lfu-cache
description: "LFU Cache explained: build a fixed-size key-value cache that evicts the least frequently used key (oldest first on ties) with O(1) get and put using frequency buckets, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

Design a class `LFUCache` that stores integer keys and integer values and holds at most `capacity` entries (capacity is at least 1). Every key has a **use count**: it starts at 1 when the key is inserted and goes up by 1 every time the key is read with `get` or overwritten with `put`.

- **Constructor(capacity):** create an empty cache with room for `capacity` entries.
- **get(key):** return the value stored for `key`, or `-1` if the key is not in the cache. A successful `get` increases the key's use count.
- **put(key, value):** if the key exists, overwrite its value and increase its use count. Otherwise insert it with a use count of 1; if the cache is already full, first remove the key with the **smallest use count**. If several keys share that smallest count, remove the one among them that was used **least recently**.

Both operations must run in O(1) average time. In Go the constructor is a function named `Constructor` and the methods are `Get` and `Put`.

## Examples

Capacity `2`:

- `put(1, 10)`, `put(2, 20)` → both keys have count 1.
- `get(1)` → `10`. Key 1 now has count 2.
- `put(3, 30)` → the cache is full. Key 2 has the smallest count (1), so it is evicted.
- `get(2)` → `-1`; `get(3)` → `30`, and key 3 now has count 2 as well.
- `put(4, 40)` → keys 1 and 3 are tied at count 2. Key 1 was used longer ago, so key 1 is evicted.
- `get(1)` → `-1`; `get(3)` → `30`; `get(4)` → `40`.

Capacity `1`: `put(5, 50)`, `get(5)` → `50`, `put(6, 60)`, then `get(5)` → `-1` and `get(6)` → `60`. A brand-new key always replaces the only entry, no matter how often the old one was used.

## Key idea

Group the keys into **buckets by use count**: bucket 1 holds every key used once, bucket 2 every key used twice, and so on. Inside each bucket, keep the keys in the order they were last used, oldest first, exactly like the list in an [LRU Cache](/interview/problems/lru-cache/). The key to evict is then the oldest key in the lowest non-empty bucket.

Two observations make everything O(1):

- Using a key only moves it from bucket `f` to bucket `f + 1` (to the newest end). Removing a known key from an ordered bucket and appending it to another are O(1) with a linked list, `LinkedHashSet`, `OrderedDict` or insertion-ordered `Set`.
- We can track `minFreq`, the lowest non-empty bucket, without searching. When a key moves up from bucket `minFreq` and leaves it empty, the new minimum is `minFreq + 1`. When a new key is inserted, the minimum becomes 1.

## Approach

1. Keep three hash maps: `vals` (key → value), `freq` (key → use count) and `buckets` (count → keys ordered from least to most recently used). Also keep `minFreq`.
2. Write a helper `touch(key)` that records one use:
   1. Let `f = freq[key]`. Remove `key` from `buckets[f]`.
   2. If `buckets[f]` is now empty, delete it, and if `f == minFreq`, set `minFreq = f + 1`.
   3. Set `freq[key] = f + 1` and append `key` to the newest end of `buckets[f + 1]`.
3. **get(key):** if the key is not in `vals`, return `-1`. Otherwise `touch(key)` and return its value.
4. **put(key, value):**
   1. If the key exists, update `vals[key]`, `touch(key)` and stop. Overwrites never evict.
   2. If the cache is full, take the oldest key in `buckets[minFreq]`, remove it from that bucket (deleting the bucket if empty) and from `vals` and `freq`.
   3. Insert the new key with `freq = 1` at the newest end of `buckets[1]` and set `minFreq = 1`.

A simpler design scans all keys for the smallest count (and oldest time) on every eviction, or keeps keys in a heap ordered by `(count, last use time)`. Those cost O(n) or O(log n) per operation instead of O(1).

## Complexity

- **Time:** O(1) average for both `get` and `put`. Each does a constant number of hash map lookups and ordered-bucket inserts and removals.
- **Space:** O(capacity) for the maps and buckets.

## Common mistakes

- Forgetting that `put` on an existing key counts as a use. It must increase the count just like `get`.
- Breaking ties by insertion time instead of last use. Inside a bucket, a key moves to the newest end every time it arrives there.
- Recomputing `minFreq` by scanning the buckets. It only ever changes in the two ways described above.
- Evicting when the key already exists. An overwrite does not change the size of the cache.
- Removing the evicted key from the bucket but not from `vals` and `freq` (or the other way round).

## Follow-up questions

- How does this compare with LRU in practice? (LFU keeps popular keys even after a burst of one-off reads, but old keys with high counts can linger forever; real systems add aging or decay.)
- How would you make the counts decay over time so that keys popular long ago can be evicted?

## Related problems

- [LRU Cache](/interview/problems/lru-cache/) (the same design with a single recency list)
- Insert Delete GetRandom O(1) (another design problem that combines hash maps with a second structure)

## Solutions

```python
class LFUCache:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.vals = {}  # key -> value
        self.freq = {}  # key -> use count
        self.buckets = defaultdict(OrderedDict)  # count -> keys, least recently used first
        self.min_freq = 0

    def _touch(self, key: int) -> None:
        f = self.freq[key]
        bucket = self.buckets[f]
        del bucket[key]
        if not bucket:
            del self.buckets[f]
            if self.min_freq == f:
                self.min_freq = f + 1
        self.freq[key] = f + 1
        self.buckets[f + 1][key] = None  # newest end of the next bucket

    def get(self, key: int) -> int:
        if key not in self.vals:
            return -1
        self._touch(key)
        return self.vals[key]

    def put(self, key: int, value: int) -> None:
        if key in self.vals:
            self.vals[key] = value
            self._touch(key)
            return
        if len(self.vals) == self.capacity:
            bucket = self.buckets[self.min_freq]
            oldest, _ = bucket.popitem(last=False)
            if not bucket:
                del self.buckets[self.min_freq]
            del self.vals[oldest]
            del self.freq[oldest]
        self.vals[key] = value
        self.freq[key] = 1
        self.buckets[1][key] = None
        self.min_freq = 1
```

```java
class LFUCache {
    private final int capacity;
    private final Map<Integer, Integer> vals = new HashMap<>(); // key -> value
    private final Map<Integer, Integer> freq = new HashMap<>(); // key -> use count
    private final Map<Integer, LinkedHashSet<Integer>> buckets = new HashMap<>(); // count -> keys, oldest first
    private int minFreq = 0;

    public LFUCache(int capacity) {
        this.capacity = capacity;
    }

    private void touch(int key) {
        int f = freq.get(key);
        LinkedHashSet<Integer> bucket = buckets.get(f);
        bucket.remove(key);
        if (bucket.isEmpty()) {
            buckets.remove(f);
            if (minFreq == f) {
                minFreq = f + 1;
            }
        }
        freq.put(key, f + 1);
        buckets.computeIfAbsent(f + 1, k -> new LinkedHashSet<>()).add(key);
    }

    public int get(int key) {
        if (!vals.containsKey(key)) {
            return -1;
        }
        touch(key);
        return vals.get(key);
    }

    public void put(int key, int value) {
        if (vals.containsKey(key)) {
            vals.put(key, value);
            touch(key);
            return;
        }
        if (vals.size() == capacity) {
            LinkedHashSet<Integer> bucket = buckets.get(minFreq);
            int oldest = bucket.iterator().next();
            bucket.remove(oldest);
            if (bucket.isEmpty()) {
                buckets.remove(minFreq);
            }
            vals.remove(oldest);
            freq.remove(oldest);
        }
        vals.put(key, value);
        freq.put(key, 1);
        buckets.computeIfAbsent(1, k -> new LinkedHashSet<>()).add(key);
        minFreq = 1;
    }
}
```

```cpp
class LFUCache {
    struct Entry {
        int val, freq;
        list<int>::iterator pos;  // where the key sits in its bucket
    };

    int capacity, minFreq = 0;
    unordered_map<int, Entry> entries;
    unordered_map<int, list<int>> buckets;  // count -> keys, oldest at the front

    void touch(int key) {
        Entry& e = entries[key];
        list<int>& bucket = buckets[e.freq];
        bucket.erase(e.pos);
        if (bucket.empty()) {
            buckets.erase(e.freq);
            if (minFreq == e.freq) {
                minFreq++;
            }
        }
        e.freq++;
        list<int>& next = buckets[e.freq];
        e.pos = next.insert(next.end(), key);
    }

public:
    LFUCache(int capacity) : capacity(capacity) {}

    int get(int key) {
        auto it = entries.find(key);
        if (it == entries.end()) {
            return -1;
        }
        touch(key);
        return it->second.val;
    }

    void put(int key, int value) {
        auto it = entries.find(key);
        if (it != entries.end()) {
            it->second.val = value;
            touch(key);
            return;
        }
        if ((int)entries.size() == capacity) {
            list<int>& bucket = buckets[minFreq];
            int oldest = bucket.front();
            bucket.pop_front();
            if (bucket.empty()) {
                buckets.erase(minFreq);
            }
            entries.erase(oldest);
        }
        list<int>& first = buckets[1];
        entries[key] = {value, 1, first.insert(first.end(), key)};
        minFreq = 1;
    }
};
```

```javascript
/**
 * @param {number} capacity
 */
var LFUCache = function (capacity) {
  this.capacity = capacity;
  this.vals = new Map(); // key -> value
  this.freq = new Map(); // key -> use count
  this.buckets = new Map(); // count -> Set of keys (a Set keeps insertion order: oldest first)
  this.minFreq = 0;
};

LFUCache.prototype.touch = function (key) {
  const f = this.freq.get(key);
  const bucket = this.buckets.get(f);
  bucket.delete(key);
  if (bucket.size === 0) {
    this.buckets.delete(f);
    if (this.minFreq === f) {
      this.minFreq = f + 1;
    }
  }
  this.freq.set(key, f + 1);
  if (!this.buckets.has(f + 1)) {
    this.buckets.set(f + 1, new Set());
  }
  this.buckets.get(f + 1).add(key);
};

/**
 * @param {number} key
 * @return {number}
 */
LFUCache.prototype.get = function (key) {
  if (!this.vals.has(key)) {
    return -1;
  }
  this.touch(key);
  return this.vals.get(key);
};

/**
 * @param {number} key
 * @param {number} value
 * @return {void}
 */
LFUCache.prototype.put = function (key, value) {
  if (this.vals.has(key)) {
    this.vals.set(key, value);
    this.touch(key);
    return;
  }
  if (this.vals.size === this.capacity) {
    const bucket = this.buckets.get(this.minFreq);
    const oldest = bucket.values().next().value;
    bucket.delete(oldest);
    if (bucket.size === 0) {
      this.buckets.delete(this.minFreq);
    }
    this.vals.delete(oldest);
    this.freq.delete(oldest);
  }
  this.vals.set(key, value);
  this.freq.set(key, 1);
  if (!this.buckets.has(1)) {
    this.buckets.set(1, new Set());
  }
  this.buckets.get(1).add(key);
  this.minFreq = 1;
};
```

```go
import "container/list"

type LFUCache struct {
	capacity, minFreq int
	vals, freq        map[int]int           // key -> value, key -> use count
	pos               map[int]*list.Element // key -> its element in its bucket
	buckets           map[int]*list.List    // count -> keys, oldest at the front
}

func Constructor(capacity int) LFUCache {
	return LFUCache{capacity: capacity, vals: map[int]int{}, freq: map[int]int{},
		pos: map[int]*list.Element{}, buckets: map[int]*list.List{}}
}

func (this *LFUCache) bucket(f int) *list.List {
	b, ok := this.buckets[f]
	if !ok {
		b = list.New()
		this.buckets[f] = b
	}
	return b
}

func (this *LFUCache) touch(key int) {
	f := this.freq[key]
	b := this.buckets[f]
	b.Remove(this.pos[key])
	if b.Len() == 0 {
		delete(this.buckets, f)
		if this.minFreq == f {
			this.minFreq = f + 1
		}
	}
	this.freq[key] = f + 1
	this.pos[key] = this.bucket(f + 1).PushBack(key)
}

func (this *LFUCache) Get(key int) int {
	val, ok := this.vals[key]
	if !ok {
		return -1
	}
	this.touch(key)
	return val
}

func (this *LFUCache) Put(key int, value int) {
	if _, ok := this.vals[key]; ok {
		this.vals[key] = value
		this.touch(key)
		return
	}
	if len(this.vals) == this.capacity {
		b := this.buckets[this.minFreq]
		oldest := b.Remove(b.Front()).(int)
		if b.Len() == 0 {
			delete(this.buckets, this.minFreq)
		}
		delete(this.vals, oldest)
		delete(this.freq, oldest)
		delete(this.pos, oldest)
	}
	this.vals[key] = value
	this.freq[key] = 1
	this.pos[key] = this.bucket(1).PushBack(key)
	this.minFreq = 1
}
```
