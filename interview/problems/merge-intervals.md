---
title: Merge Intervals
leetcode: merge-intervals
description: "Merge Intervals explained: combine every group of overlapping ranges by sorting on the start and sweeping once, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given a list of intervals, where each interval is a pair `[start, end]` with `start <= end`. The list has at least one interval and is not necessarily sorted.

Two intervals overlap when they share at least one point, and intervals that only touch at an endpoint (like `[2, 4]` and `[4, 7]`) count as overlapping. Merge every group of overlapping intervals into one interval that covers the whole group, and return the resulting list of non-overlapping intervals. The order of the output intervals does not matter.

## Examples

- `[[6, 8], [1, 4], [3, 5]]` → `[[1, 5], [6, 8]]`. `[1, 4]` and `[3, 5]` overlap on `3..4`; `[6, 8]` is separate.
- `[[2, 4], [4, 7]]` → `[[2, 7]]`. They touch at 4, which counts as overlapping.
- `[[1, 10], [2, 3], [4, 5]]` → `[[1, 10]]`. The first interval swallows the other two.
- `[[5, 5]]` → `[[5, 5]]`. A single interval (even of length zero) is returned as it is.

## Key idea

If the intervals are sorted by their start, any interval that overlaps the current group must come right after it: once you see an interval that starts after the group's end, no later interval can reach back into the group, because later intervals start even further right. So sort by start, then walk left to right, either stretching the last merged interval or starting a new one.

## Approach

1. Sort the intervals by their start value.
2. Put the first interval into the result list.
3. For each remaining interval `[s, e]`, look at the last interval in the result, `[ls, le]`:
   1. If `s <= le`, they overlap (or touch). Extend the last interval: `le = max(le, e)`. Use `max` because the new interval might lie completely inside the old one.
   2. Otherwise there is a gap, so append `[s, e]` as a new interval.
4. Return the result.

The brute-force alternative repeatedly scans for any pair that overlaps and merges it until no pair is left. That takes O(n²) or worse, which is why the sort-then-sweep idea matters.

## Complexity

- **Time:** O(n log n) for sorting; the sweep afterwards is O(n).
- **Space:** O(n) for the output (plus whatever the sort uses internally).

## Common mistakes

- Forgetting to sort first. The sweep only works on intervals ordered by start.
- Writing `le = e` instead of `le = max(le, e)`. For `[[1, 10], [2, 3]]` that would shrink the merged interval to `[1, 3]`.
- Using `s < le` instead of `s <= le`, so touching intervals like `[2, 4]` and `[4, 7]` stay separate.
- Comparing with the previous *input* interval instead of the last *merged* interval.

## Follow-up questions

- What if new intervals arrive one at a time and you must keep the merged list up to date? (Insert Interval: binary search for the position, then merge neighbours; or keep a balanced tree.)
- How many meeting rooms are needed if each interval is a meeting? (Meeting Rooms II, which sorts start and end times separately.)

## Related problems

- Insert Interval
- Non-overlapping Intervals
- Meeting Rooms II

## Solutions

```python
class Solution:
    def merge(self, intervals: List[List[int]]) -> List[List[int]]:
        intervals.sort(key=lambda iv: iv[0])
        merged = [list(intervals[0])]
        for start, end in intervals[1:]:
            last = merged[-1]
            if start <= last[1]:  # overlaps or touches the last merged interval
                last[1] = max(last[1], end)
            else:
                merged.append([start, end])
        return merged
```

```java
class Solution {
    public int[][] merge(int[][] intervals) {
        Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));
        List<int[]> merged = new ArrayList<>();
        merged.add(new int[] {intervals[0][0], intervals[0][1]});
        for (int i = 1; i < intervals.length; i++) {
            int[] last = merged.get(merged.size() - 1);
            if (intervals[i][0] <= last[1]) { // overlaps or touches the last merged interval
                last[1] = Math.max(last[1], intervals[i][1]);
            } else {
                merged.add(new int[] {intervals[i][0], intervals[i][1]});
            }
        }
        return merged.toArray(new int[0][]);
    }
}
```

```cpp
class Solution {
public:
    vector<vector<int>> merge(vector<vector<int>>& intervals) {
        sort(intervals.begin(), intervals.end(), [](const vector<int>& a, const vector<int>& b) { return a[0] < b[0]; });
        vector<vector<int>> merged = {intervals[0]};
        for (size_t i = 1; i < intervals.size(); i++) {
            vector<int>& last = merged.back();
            if (intervals[i][0] <= last[1]) {  // overlaps or touches the last merged interval
                last[1] = max(last[1], intervals[i][1]);
            } else {
                merged.push_back(intervals[i]);
            }
        }
        return merged;
    }
};
```

```javascript
/**
 * @param {number[][]} intervals
 * @return {number[][]}
 */
var merge = function (intervals) {
  intervals.sort((a, b) => a[0] - b[0]);
  const merged = [[intervals[0][0], intervals[0][1]]];
  for (let i = 1; i < intervals.length; i++) {
    const [start, end] = intervals[i];
    const last = merged[merged.length - 1];
    if (start <= last[1]) {
      // overlaps or touches the last merged interval
      last[1] = Math.max(last[1], end);
    } else {
      merged.push([start, end]);
    }
  }
  return merged;
};
```

```go
import "sort"

func merge(intervals [][]int) [][]int {
	sort.Slice(intervals, func(i, j int) bool { return intervals[i][0] < intervals[j][0] })
	merged := [][]int{{intervals[0][0], intervals[0][1]}}
	for _, iv := range intervals[1:] {
		last := merged[len(merged)-1]
		if iv[0] <= last[1] { // overlaps or touches the last merged interval
			last[1] = max(last[1], iv[1])
		} else {
			merged = append(merged, []int{iv[0], iv[1]})
		}
	}
	return merged
}
```
