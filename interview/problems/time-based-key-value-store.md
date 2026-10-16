---
title: Time Based Key-Value Store
leetcode: time-based-key-value-store
description: "Time Based Key-Value Store explained: design a key-value store that keeps every version of a value with its timestamp and answers 'what was the value at time t' with binary search, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

Design a class `TimeMap` that stores several versions of a value for the same key, each tagged with a timestamp, and can look up which version was current at a given time. Keys and values are non-empty strings; timestamps are positive integers. It supports:

- **Constructor():** create an empty store.
- **set(key, value, timestamp):** record that `key` had `value` starting at time `timestamp`. Older versions of the key are kept, not overwritten.
- **get(key, timestamp):** return the value of the version of `key` with the largest timestamp that is less than or equal to `timestamp`. If the key was never set, or all of its versions are newer than `timestamp`, return the empty string `""`.

The timestamps passed to `set` are strictly increasing, so the versions of each key arrive already in time order. In Go the constructor is a function named `Constructor` and the methods are `Set` and `Get`.

## Examples

- `set("color", "red", 3)`, `set("color", "blue", 8)`, then:
  - `get("color", 2)` → `""`: nothing had been stored yet at time 2.
  - `get("color", 3)` → `"red"`: a version stored exactly at the asked time counts.
  - `get("color", 5)` → `"red"`: the latest version at or before 5 is the one from time 3.
  - `get("color", 100)` → `"blue"`.
- `get("size", 5)` → `""` because `"size"` was never set.

## Key idea

Keep, for each key, a list of `(timestamp, value)` pairs. Because `set` is always called with a larger timestamp than before, appending keeps every list **sorted by timestamp** for free. Answering `get` then means "find the last entry whose timestamp is ≤ t" in a sorted list, which is exactly what **binary search** does in O(log n) instead of scanning the whole history.

## Approach

1. Keep a hash map `store` from key to a list of `(timestamp, value)` pairs.
2. **set(key, value, timestamp):** append `(timestamp, value)` to `store[key]`, creating the list if needed.
3. **get(key, timestamp):**
   1. If the key is not in `store`, return `""`.
   2. Binary search the key's list for the first entry whose timestamp is **greater** than `timestamp`: keep `lo = 0`, `hi = len(list)`; while `lo < hi`, look at `mid`; if `list[mid].timestamp <= timestamp`, move `lo = mid + 1`, otherwise `hi = mid`.
   3. Now `lo` is the number of entries with timestamp ≤ `timestamp`. If `lo == 0`, every version is too new: return `""`. Otherwise return the value at index `lo - 1`.

Scanning a key's list from the end until a small enough timestamp appears is also correct, but it costs O(n) per `get` when a key has many versions.

## Complexity

- **Time:** O(1) average for `set` (a hash lookup and an append) and O(log n) for `get`, where n is the number of versions of that key.
- **Space:** O(total number of `set` calls), since every version is kept.

## Common mistakes

- Overwriting the previous value in `set`. The old versions are needed to answer questions about earlier times.
- Searching for timestamp `< t` instead of `<= t`, which misses a version stored exactly at time `t`.
- Returning the value at index `lo` instead of `lo - 1`, or reading index `-1` when no version is old enough.
- Sorting the list on every `set`. The increasing timestamps already keep it sorted.

## Follow-up questions

- What if `set` timestamps could arrive out of order? (Keep each key's versions in a balanced search tree or sorted map, such as `TreeMap.floorEntry` in Java, so inserts stay O(log n).)
- How would you limit memory if only the last k versions matter? (Store each key's history in a ring buffer.)

## Related problems

- Snapshot Array
- Stock Price Fluctuation
- Design HashMap

## Solutions

```python
class TimeMap:
    def __init__(self):
        self.store = {}  # key -> list of (timestamp, value), sorted by timestamp

    def set(self, key: str, value: str, timestamp: int) -> None:
        self.store.setdefault(key, []).append((timestamp, value))

    def get(self, key: str, timestamp: int) -> str:
        versions = self.store.get(key, [])
        lo, hi = 0, len(versions)
        while lo < hi:  # find the first version newer than timestamp
            mid = (lo + hi) // 2
            if versions[mid][0] <= timestamp:
                lo = mid + 1
            else:
                hi = mid
        return versions[lo - 1][1] if lo > 0 else ""
```

```java
class TimeMap {
    private static class Version {
        final int timestamp;
        final String value;
        Version(int timestamp, String value) { this.timestamp = timestamp; this.value = value; }
    }

    private final Map<String, List<Version>> store = new HashMap<>(); // sorted by timestamp

    public TimeMap() {}

    public void set(String key, String value, int timestamp) {
        store.computeIfAbsent(key, k -> new ArrayList<>()).add(new Version(timestamp, value));
    }

    public String get(String key, int timestamp) {
        List<Version> versions = store.get(key);
        if (versions == null) {
            return "";
        }
        int lo = 0, hi = versions.size();
        while (lo < hi) { // find the first version newer than timestamp
            int mid = (lo + hi) / 2;
            if (versions.get(mid).timestamp <= timestamp) {
                lo = mid + 1;
            } else {
                hi = mid;
            }
        }
        return lo > 0 ? versions.get(lo - 1).value : "";
    }
}
```

```cpp
class TimeMap {
    unordered_map<string, vector<pair<int, string>>> store;  // sorted by timestamp

public:
    TimeMap() {}

    void set(string key, string value, int timestamp) {
        store[key].emplace_back(timestamp, value);
    }

    string get(string key, int timestamp) {
        auto it = store.find(key);
        if (it == store.end()) {
            return "";
        }
        const auto& versions = it->second;
        int lo = 0, hi = versions.size();
        while (lo < hi) {  // find the first version newer than timestamp
            int mid = (lo + hi) / 2;
            if (versions[mid].first <= timestamp) {
                lo = mid + 1;
            } else {
                hi = mid;
            }
        }
        return lo > 0 ? versions[lo - 1].second : "";
    }
};
```

```javascript
var TimeMap = function () {
  this.store = new Map(); // key -> array of [timestamp, value], sorted by timestamp
};

/**
 * @param {string} key
 * @param {string} value
 * @param {number} timestamp
 * @return {void}
 */
TimeMap.prototype.set = function (key, value, timestamp) {
  if (!this.store.has(key)) this.store.set(key, []);
  this.store.get(key).push([timestamp, value]);
};

/**
 * @param {string} key
 * @param {number} timestamp
 * @return {string}
 */
TimeMap.prototype.get = function (key, timestamp) {
  const versions = this.store.get(key) || [];
  let lo = 0, hi = versions.length;
  while (lo < hi) { // find the first version newer than timestamp
    const mid = (lo + hi) >> 1;
    if (versions[mid][0] <= timestamp) lo = mid + 1;
    else hi = mid;
  }
  return lo > 0 ? versions[lo - 1][1] : "";
};
```

```go
type timeVersion struct {
	timestamp int
	value     string
}

type TimeMap struct {
	store map[string][]timeVersion // sorted by timestamp
}

func Constructor() TimeMap {
	return TimeMap{store: make(map[string][]timeVersion)}
}

func (this *TimeMap) Set(key string, value string, timestamp int) {
	this.store[key] = append(this.store[key], timeVersion{timestamp, value})
}

func (this *TimeMap) Get(key string, timestamp int) string {
	versions := this.store[key] // nil (length 0) if the key was never set
	lo, hi := 0, len(versions)
	for lo < hi { // find the first version newer than timestamp
		mid := (lo + hi) / 2
		if versions[mid].timestamp <= timestamp {
			lo = mid + 1
		} else {
			hi = mid
		}
	}
	if lo == 0 {
		return ""
	}
	return versions[lo-1].value
}
```
