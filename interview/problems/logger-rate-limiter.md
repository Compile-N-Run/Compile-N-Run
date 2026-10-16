---
title: Logger Rate Limiter
leetcode: logger-rate-limiter
description: "Logger Rate Limiter explained: let each message through at most once every 10 seconds by remembering when it was last printed in a hash map, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

Design a class `Logger` that receives a stream of messages, each with a timestamp in seconds, and decides whether each one should be printed. The rule: the same message text may be printed at most once every 10 seconds. If a message was printed at time `t`, an identical message is blocked until time `t + 10`, when it may be printed again.

- **Constructor():** create a logger that has printed nothing yet.
- **shouldPrintMessage(timestamp, message):** return `true` if the message should be printed now (and count it as printed), otherwise `false`.

Calls arrive in time order: each timestamp is greater than or equal to the previous one, and several messages may share the same timestamp. A message that is refused is **not** printed, so it does not restart the 10-second wait. In Go the constructor is `Constructor` and the method is `ShouldPrintMessage`. This is a LeetCode Premium problem.

## Examples

- `(1, "start")` → `true`, first time.
- `(4, "stop")` → `true`. Different messages are limited separately.
- `(10, "start")` → `false`. Only 9 seconds have passed since `"start"` was printed at 1.
- `(11, "start")` → `true`. Exactly 10 seconds later is allowed.
- `(13, "stop")` → `false` (9 seconds after 4), then `(14, "stop")` → `true`.

Refusals do not reset the clock: for `"a"` at times `0, 5, 9, 10`, the answers are `true, false, false, true`. The wait is still measured from 0, the last time `"a"` was actually printed.

## Key idea

For each message we only need to know one number: when it was last printed. A hash map from message text to that timestamp answers the question in O(1): print if the message is new or if at least 10 seconds have passed, and only then update the stored time.

## Approach

1. Keep a hash map `lastPrinted` from message to the timestamp it was last printed.
2. **shouldPrintMessage(timestamp, message):**
   1. If `message` is in the map and `timestamp - lastPrinted[message] < 10`, return `false` without changing anything.
   2. Otherwise set `lastPrinted[message] = timestamp` and return `true`.

## Complexity

- **Time:** O(1) average per call (one hash lookup and at most one insert), plus the time to hash the message string.
- **Space:** O(m), where `m` is the number of distinct messages seen.

## Common mistakes

- Updating the timestamp on every call, even when the message is refused. That keeps a message that is sent every few seconds blocked forever.
- Using `<= 10` instead of `< 10`: a message printed at 1 is allowed again at 11.
- Sharing one timer across all messages instead of tracking each message separately.

## Follow-up questions

- *The map grows forever. How would you bound memory?* Entries older than 10 seconds are useless. Keep a queue of `(timestamp, message)` for printed messages and drop entries from the front once they are 10 seconds old, removing them from the map (or set) as well. Memory is then bounded by the messages printed in the last 10 seconds.
- *What if calls can arrive out of order, or from several threads?* Out-of-order timestamps break the "drop from the front" cleanup; a lock (or a concurrent map with compare-and-set) is needed for threads.
- *How would you allow up to `k` prints per window instead of one?* Keep, per message, a queue of its last `k` print times.

## Related problems

- [Design Hit Counter](/interview/problems/design-hit-counter/): count events in a sliding time window.
- [LRU Cache](/interview/problems/lru-cache/): another design problem built on a hash map.

## Solutions

```python
class Logger:
    def __init__(self):
        self.last_printed = {}  # message -> timestamp it was last printed

    def shouldPrintMessage(self, timestamp: int, message: str) -> bool:
        last = self.last_printed.get(message)
        if last is not None and timestamp - last < 10:
            return False
        self.last_printed[message] = timestamp
        return True
```

```java
class Logger {
    private final Map<String, Integer> lastPrinted = new HashMap<>(); // message -> last print time

    public Logger() {}

    public boolean shouldPrintMessage(int timestamp, String message) {
        Integer last = lastPrinted.get(message);
        if (last != null && timestamp - last < 10) {
            return false;
        }
        lastPrinted.put(message, timestamp);
        return true;
    }
}
```

```cpp
class Logger {
    unordered_map<string, int> lastPrinted;  // message -> last print time

public:
    Logger() {}

    bool shouldPrintMessage(int timestamp, string message) {
        auto it = lastPrinted.find(message);
        if (it != lastPrinted.end() && timestamp - it->second < 10) {
            return false;
        }
        lastPrinted[message] = timestamp;
        return true;
    }
};
```

```javascript
var Logger = function () {
  this.lastPrinted = new Map(); // message -> last print time
};

/**
 * @param {number} timestamp
 * @param {string} message
 * @return {boolean}
 */
Logger.prototype.shouldPrintMessage = function (timestamp, message) {
  const last = this.lastPrinted.get(message);
  if (last !== undefined && timestamp - last < 10) {
    return false;
  }
  this.lastPrinted.set(message, timestamp);
  return true;
};
```

```go
type Logger struct {
	lastPrinted map[string]int // message -> last print time
}

func Constructor() Logger {
	return Logger{lastPrinted: make(map[string]int)}
}

func (this *Logger) ShouldPrintMessage(timestamp int, message string) bool {
	if last, ok := this.lastPrinted[message]; ok && timestamp-last < 10 {
		return false
	}
	this.lastPrinted[message] = timestamp
	return true
}
```
