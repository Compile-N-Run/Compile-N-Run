---
title: Meeting Rooms II
leetcode: meeting-rooms-ii
description: "Meeting Rooms II explained: find the fewest conference rooms needed for a list of meetings by sorting start and end times and sweeping through them with two pointers, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given a list of meetings, each written as `[start, end]`. A meeting occupies a room from `start` up to, but not including, `end`. Return the minimum number of rooms needed so that every meeting can take place without two meetings sharing a room at the same time.

A meeting that ends at time `t` frees its room for a meeting that starts at `t`. Every meeting has `start < end`, times are non-negative integers, and the list contains at least one meeting. The meetings are not given in any particular order.

## Examples

- `intervals = [[1, 5], [2, 6], [8, 9]]` → `2`. The first two meetings overlap between 2 and 5; the third starts after both have ended and can reuse a room.
- `intervals = [[0, 4], [4, 7]]` → `1`. The second meeting starts exactly when the first ends, so one room is enough.
- `intervals = [[1, 10], [2, 3], [4, 5], [6, 7]]` → `2`. The long meeting needs its own room, and the three short ones take turns in a second room.
- `intervals = [[3, 8], [3, 8], [3, 8]]` → `3`. Three identical meetings all need separate rooms.

## Key idea

The answer is the largest number of meetings running at the same moment. To find it you do not need to know *which* meeting ends, only *when* meetings end. Put all start times in one sorted list and all end times in another, then walk through time: each start needs a room, and each end that has happened by then gives a room back. Pairing starts and ends in this way is exactly what a room scheduler does, without tracking individual rooms.

## Approach

1. Copy the start times into `starts` and the end times into `ends`, and sort both lists.
2. Set `rooms = 0` and an index `j = 0` into `ends` (the earliest end time not yet used to free a room).
3. For each start time `s` in sorted order:
   1. If `s < ends[j]`, every room in use is still busy at time `s`, so open a new room: `rooms += 1`.
   2. Otherwise some meeting has ended by time `s` (`ends[j] <= s`). The new meeting takes over its room, and `j` moves on to the next end time. The room count stays the same.
4. Return `rooms`.

Using `<` rather than `<=` in step 3.1 is what lets a meeting start in a room at the exact moment the previous one ends.

A common alternative sorts meetings by start time and keeps a min-heap of the end times of rooms in use: pop the smallest end if it is `<= start`, then push the new end; the heap's final size is the answer. It has the same complexity. The brute force checks, for every meeting start, how many meetings contain that moment, which is O(n²).

## Complexity

- **Time:** O(n log n) for the two sorts; the sweep itself is O(n).
- **Space:** O(n) for the two sorted lists of times.

## Common mistakes

- Treating back-to-back meetings (`[0, 4]` and `[4, 7]`) as overlapping. A room is free again at its meeting's end time.
- Sorting the meetings by start time and only comparing each meeting with the previous one. A long early meeting can still be running when several later ones start, as in `[[1, 10], [2, 3], [4, 5]]`.
- Thinking the separate sorts lose information. It does not matter which meeting a given end time belongs to; any meeting that has ended frees a room.

## Follow-up questions

- Can a person attend all meetings? That is Meeting Rooms (the first version): sort by start and check that each meeting starts no earlier than the previous one ends.
- How would you also report which room each meeting gets? Use the heap approach and store `(end time, room id)` pairs.

## Related problems

- Meeting Rooms
- Merge Intervals
- Car Pooling

## Solutions

```python
class Solution:
    def minMeetingRooms(self, intervals: List[List[int]]) -> int:
        starts = sorted(s for s, _ in intervals)
        ends = sorted(e for _, e in intervals)
        rooms = j = 0
        for s in starts:
            if s < ends[j]:
                rooms += 1  # every room is busy: open a new one
            else:
                j += 1  # a meeting has ended: reuse its room
        return rooms
```

```java
class Solution {
    public int minMeetingRooms(int[][] intervals) {
        int n = intervals.length;
        int[] starts = new int[n], ends = new int[n];
        for (int i = 0; i < n; i++) {
            starts[i] = intervals[i][0];
            ends[i] = intervals[i][1];
        }
        Arrays.sort(starts);
        Arrays.sort(ends);
        int rooms = 0, j = 0;
        for (int s : starts) {
            if (s < ends[j]) {
                rooms++; // every room is busy: open a new one
            } else {
                j++; // a meeting has ended: reuse its room
            }
        }
        return rooms;
    }
}
```

```cpp
class Solution {
public:
    int minMeetingRooms(vector<vector<int>>& intervals) {
        vector<int> starts, ends;
        for (auto& m : intervals) {
            starts.push_back(m[0]);
            ends.push_back(m[1]);
        }
        sort(starts.begin(), starts.end());
        sort(ends.begin(), ends.end());
        int rooms = 0, j = 0;
        for (int s : starts) {
            if (s < ends[j]) {
                rooms++;  // every room is busy: open a new one
            } else {
                j++;  // a meeting has ended: reuse its room
            }
        }
        return rooms;
    }
};
```

```javascript
/**
 * @param {number[][]} intervals
 * @return {number}
 */
var minMeetingRooms = function (intervals) {
  const starts = intervals.map((m) => m[0]).sort((a, b) => a - b);
  const ends = intervals.map((m) => m[1]).sort((a, b) => a - b);
  let rooms = 0, j = 0;
  for (const s of starts) {
    if (s < ends[j]) {
      rooms++; // every room is busy: open a new one
    } else {
      j++; // a meeting has ended: reuse its room
    }
  }
  return rooms;
};
```

```go
import "sort"

func minMeetingRooms(intervals [][]int) int {
	n := len(intervals)
	starts, ends := make([]int, n), make([]int, n)
	for i, m := range intervals {
		starts[i], ends[i] = m[0], m[1]
	}
	sort.Ints(starts)
	sort.Ints(ends)
	rooms, j := 0, 0
	for _, s := range starts {
		if s < ends[j] {
			rooms++ // every room is busy: open a new one
		} else {
			j++ // a meeting has ended: reuse its room
		}
	}
	return rooms
}
```
