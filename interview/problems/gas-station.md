---
title: Gas Station
leetcode: gas-station
description: "Gas Station explained: find the station from which a car can drive a full circle using one greedy pass over the gas surplus, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

There are `n` gas stations on a circular road, numbered `0` to `n - 1`. At station `i` you can fill up `gas[i]` units of fuel, and driving from station `i` to the next one (`i + 1`, or back to `0` after the last) burns `cost[i]` units. The tank has no size limit and starts empty.

Return the index of a station where you can start, drive clockwise and come back to that same station without the tank ever going below zero. If no such station exists, return `-1`.

The two arrays have the same length (at least 1) and hold non-negative numbers. The input is built so that when an answer exists, it is the only one.

## Examples

- `gas = [2, 5, 1, 4]`, `cost = [3, 2, 4, 1]` → `1`. Starting at station 1 the tank reads 3, then 0, then 3, then 2 after each leg, so it never runs dry. Starting at station 0 fails at once (2 fuel, 3 needed).
- `gas = [1, 1, 1]`, `cost = [2, 1, 1]` → `-1`. The road needs 4 units in total but only 3 are available anywhere.
- `gas = [0, 0, 7]`, `cost = [2, 3, 2]` → `2`. Only the last station has fuel, so the trip must begin there.
- `gas = [3]`, `cost = [3]` → `0`. One station: fill 3, drive the loop for 3, arrive with an empty (but not negative) tank.

## Key idea

Write `diff[i] = gas[i] - cost[i]`: the net fuel gained by stopping at station `i` and driving on. Two facts solve the problem:

1. If the total of all `diff` values is negative, there is simply not enough fuel on the road, so no start works.
2. If you start at `s` and the tank first goes negative when leaving station `j`, then **no station between `s` and `j` can be the start either**. You reached each of them with a tank of zero or more, and starting there instead would mean arriving with zero, which is no better. So you can jump straight to `j + 1` as the next candidate.

When the total is non-negative, the last candidate left standing after one pass is the answer.

## Approach

1. Set `total = 0`, `tank = 0`, `start = 0`.
2. For each station `i`:
   1. Add `diff = gas[i] - cost[i]` to both `total` and `tank`.
   2. If `tank < 0`, the trip from `start` breaks here. Set `start = i + 1` and reset `tank = 0`.
3. If `total < 0` return `-1`, otherwise return `start`.

The brute force simulates a full lap from every station, which is O(n²) and too slow for 100,000 stations.

## Complexity

- **Time:** O(n). One pass over the stations.
- **Space:** O(1). Three counters.

## Common mistakes

- Resetting `start` to `i` instead of `i + 1`: station `i` is the one whose leg made the tank negative, so it cannot be the start.
- Forgetting the `total < 0` check. The greedy pass always ends with some `start`, even when the whole trip is impossible.
- Simulating the wrap-around with `i % n` for every candidate, which brings back the O(n²) cost.

## Follow-up questions

- *Why is the answer unique when it exists?* That is a guarantee of the input, not of the algorithm; with ties (for example all `diff` values zero) several stations would work, and this pass returns the first one it settles on.
- *Can you prove the last candidate works?* The prefix from `start` to the end is non-negative by construction, and the part before `start` has a deficit of at most `total`, which the prefix covers.

## Related problems

- [Jump Game](/interview/problems/jump-game/): another greedy one-pass scan that tracks how far you can get.
- [Maximum Subarray](/interview/problems/maximum-subarray/): the same "reset when the running sum goes negative" trick (Kadane's algorithm).

## Solutions

```python
class Solution:
    def canCompleteCircuit(self, gas: List[int], cost: List[int]) -> int:
        total = tank = start = 0
        for i in range(len(gas)):
            diff = gas[i] - cost[i]
            total += diff
            tank += diff
            if tank < 0:  # cannot leave station i when starting from `start`
                start = i + 1
                tank = 0
        return start if total >= 0 else -1
```

```java
class Solution {
    public int canCompleteCircuit(int[] gas, int[] cost) {
        int total = 0, tank = 0, start = 0;
        for (int i = 0; i < gas.length; i++) {
            int diff = gas[i] - cost[i];
            total += diff;
            tank += diff;
            if (tank < 0) { // cannot leave station i when starting from `start`
                start = i + 1;
                tank = 0;
            }
        }
        return total >= 0 ? start : -1;
    }
}
```

```cpp
class Solution {
public:
    int canCompleteCircuit(vector<int>& gas, vector<int>& cost) {
        int total = 0, tank = 0, start = 0;
        for (int i = 0; i < (int)gas.size(); i++) {
            int diff = gas[i] - cost[i];
            total += diff;
            tank += diff;
            if (tank < 0) {  // cannot leave station i when starting from `start`
                start = i + 1;
                tank = 0;
            }
        }
        return total >= 0 ? start : -1;
    }
};
```

```javascript
/**
 * @param {number[]} gas
 * @param {number[]} cost
 * @return {number}
 */
var canCompleteCircuit = function (gas, cost) {
  let total = 0, tank = 0, start = 0;
  for (let i = 0; i < gas.length; i++) {
    const diff = gas[i] - cost[i];
    total += diff;
    tank += diff;
    if (tank < 0) { // cannot leave station i when starting from `start`
      start = i + 1;
      tank = 0;
    }
  }
  return total >= 0 ? start : -1;
};
```

```go
func canCompleteCircuit(gas []int, cost []int) int {
	total, tank, start := 0, 0, 0
	for i := range gas {
		diff := gas[i] - cost[i]
		total += diff
		tank += diff
		if tank < 0 { // cannot leave station i when starting from `start`
			start = i + 1
			tank = 0
		}
	}
	if total < 0 {
		return -1
	}
	return start
}
```
