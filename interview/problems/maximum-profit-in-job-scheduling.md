---
title: Maximum Profit in Job Scheduling
leetcode: maximum-profit-in-job-scheduling
description: "Maximum Profit in Job Scheduling explained: choose non-overlapping jobs with the largest total profit by sorting on end time and combining dynamic programming with binary search, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given `n` jobs described by three arrays of the same length: `startTime[i]`, `endTime[i]` and `profit[i]`. Job `i` runs from `startTime[i]` to `endTime[i]` (start is strictly less than end) and pays `profit[i]` if you take it. You can only do one job at a time, so you must pick a set of jobs that never overlap. A job that ends at time `t` and another that starts at time `t` do **not** overlap. Return the largest total profit you can earn.

There is at least one job, there can be up to fifty thousand, and times can be as large as a billion, so the times cannot be used as array indices.

## Examples

- `startTime = [1, 2, 4]`, `endTime = [3, 5, 6]`, `profit = [50, 10, 70]` → `120`. Take the first and third jobs (`1..3` and `4..6`); the middle job overlaps both.
- `startTime = [1, 1, 1]`, `endTime = [2, 3, 4]`, `profit = [5, 6, 4]` → `6`. All three start at the same time, so only one can be taken.
- `startTime = [1, 3, 5]`, `endTime = [3, 5, 7]`, `profit = [10, 10, 10]` → `30`. The jobs touch end to start, which is allowed.
- `startTime = [2, 5, 1, 6]`, `endTime = [4, 7, 8, 9]`, `profit = [30, 25, 100, 20]` → `100`. The long job `1..8` alone beats any combination of the others (`30 + 25 = 55` is the best of those).

## Key idea

Sort the jobs by their end time. Then think about the jobs in that order and ask, for each prefix, "what is the best profit using only these jobs?" When you reach a job, you either skip it (the answer stays what it was for the previous prefix) or take it, in which case everything else you take must end no later than this job's start. Because the jobs are sorted by end time, "all jobs that end no later than time `t`" is a prefix, and binary search finds how long that prefix is. So each job costs one binary search and one `max`.

## Approach

1. Build a list of `(end, start, profit)` triples and sort it by `end`.
2. Let `dp[i]` be the best profit using only the first `i` jobs in sorted order, with `dp[0] = 0`.
3. For `i` from `1` to `n`, with job `(end, start, profit)` at sorted position `i - 1`:
   1. Binary search for `j`, the number of jobs whose end time is `<= start` (an upper-bound search over the sorted end times; all of them come before position `i - 1`, since this job's end is larger than its start).
   2. `dp[i] = max(dp[i - 1], dp[j] + profit)`: skip the job, or take it on top of the best schedule that finishes in time.
4. Return `dp[n]`.

Trying every subset of jobs is exponential. A dynamic programme that scans back linearly for the latest compatible job is O(n²), which is too slow at fifty thousand jobs; the binary search brings it to O(n log n).

## Complexity

- **Time:** O(n log n) for the sort and for `n` binary searches.
- **Space:** O(n) for the sorted jobs and the `dp` array.

## Common mistakes

- Sorting by start time and trying to extend forwards. It can be made to work (with `dp` defined from the back), but sorting by end time keeps the compatible jobs as a prefix.
- Using a lower-bound search (`end < start`) instead of an upper bound (`end <= start`), which rejects jobs that touch end to start.
- Searching only among the jobs before the current one by index, but forgetting the sort, so earlier indices are not actually earlier in time.
- Greedy by profit or by earliest end. Earliest-end greedy maximises the *number* of jobs, not the profit.

## Follow-up questions

- *What if you can run `k` jobs at the same time?* With `k = 2` and more it becomes a flow or interval-scheduling-with-capacity problem; the binary-search DP does not extend directly.
- *What if you must take at most `m` jobs?* Add a dimension: `dp[i][c]` for `c` jobs taken, O(n · m).
- *Can you reconstruct which jobs were chosen?* Store, for each `i`, whether `dp[i]` came from skipping or taking, then walk backwards from `n`.
- *Why not Meeting Rooms II?* That problem asks how many jobs overlap at once; this one asks which non-overlapping subset pays most. Both start by sorting, but the rest differs.

## Related problems

- [Meeting Rooms II](/interview/problems/meeting-rooms-ii/)
- [House Robber](/interview/problems/house-robber/)
- [Longest Increasing Subsequence](/interview/problems/longest-increasing-subsequence/)
- Non-overlapping Intervals
- Maximum Number of Events That Can Be Attended II

## Solutions

```python
class Solution:
    def jobScheduling(self, startTime: List[int], endTime: List[int], profit: List[int]) -> int:
        jobs = sorted(zip(endTime, startTime, profit))
        ends = [end for end, _, _ in jobs]
        dp = [0] * (len(jobs) + 1)  # dp[i]: best profit using the first i jobs
        for i, (end, start, gain) in enumerate(jobs, 1):
            j = bisect.bisect_right(ends, start)  # jobs that end no later than this one starts
            dp[i] = max(dp[i - 1], dp[j] + gain)
        return dp[-1]
```

```java
class Solution {
    public int jobScheduling(int[] startTime, int[] endTime, int[] profit) {
        int n = startTime.length;
        Integer[] order = new Integer[n];
        for (int i = 0; i < n; i++) {
            order[i] = i;
        }
        Arrays.sort(order, (a, b) -> Integer.compare(endTime[a], endTime[b]));
        int[] ends = new int[n];
        for (int i = 0; i < n; i++) {
            ends[i] = endTime[order[i]];
        }
        int[] dp = new int[n + 1]; // dp[i]: best profit using the first i jobs
        for (int i = 1; i <= n; i++) {
            int job = order[i - 1];
            int j = upperBound(ends, startTime[job]); // jobs that end no later than this one starts
            dp[i] = Math.max(dp[i - 1], dp[j] + profit[job]);
        }
        return dp[n];
    }

    // number of values in the sorted array that are <= target
    private int upperBound(int[] sorted, int target) {
        int lo = 0, hi = sorted.length;
        while (lo < hi) {
            int mid = (lo + hi) / 2;
            if (sorted[mid] <= target) {
                lo = mid + 1;
            } else {
                hi = mid;
            }
        }
        return lo;
    }
}
```

```cpp
class Solution {
public:
    int jobScheduling(vector<int>& startTime, vector<int>& endTime, vector<int>& profit) {
        int n = startTime.size();
        vector<array<int, 3>> jobs(n);  // {end, start, profit}
        for (int i = 0; i < n; i++) {
            jobs[i] = {endTime[i], startTime[i], profit[i]};
        }
        sort(jobs.begin(), jobs.end());
        vector<int> ends(n);
        for (int i = 0; i < n; i++) {
            ends[i] = jobs[i][0];
        }
        vector<int> dp(n + 1, 0);  // dp[i]: best profit using the first i jobs
        for (int i = 1; i <= n; i++) {
            auto [end, start, gain] = jobs[i - 1];
            int j = upper_bound(ends.begin(), ends.end(), start) - ends.begin();  // jobs that end no later than this one starts
            dp[i] = max(dp[i - 1], dp[j] + gain);
        }
        return dp[n];
    }
};
```

```javascript
/**
 * @param {number[]} startTime
 * @param {number[]} endTime
 * @param {number[]} profit
 * @return {number}
 */
var jobScheduling = function (startTime, endTime, profit) {
  const n = startTime.length;
  const jobs = Array.from({ length: n }, (_, i) => [endTime[i], startTime[i], profit[i]]);
  jobs.sort((a, b) => a[0] - b[0]);
  const ends = jobs.map((job) => job[0]);
  // number of end times that are <= target
  const upperBound = (target) => {
    let lo = 0;
    let hi = n;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (ends[mid] <= target) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  };
  const dp = new Array(n + 1).fill(0); // dp[i]: best profit using the first i jobs
  for (let i = 1; i <= n; i++) {
    const [, start, gain] = jobs[i - 1];
    const j = upperBound(start); // jobs that end no later than this one starts
    dp[i] = Math.max(dp[i - 1], dp[j] + gain);
  }
  return dp[n];
};
```

```go
import "sort"

func jobScheduling(startTime []int, endTime []int, profit []int) int {
	n := len(startTime)
	order := make([]int, n)
	for i := range order {
		order[i] = i
	}
	sort.Slice(order, func(a, b int) bool { return endTime[order[a]] < endTime[order[b]] })
	ends := make([]int, n)
	for i, job := range order {
		ends[i] = endTime[job]
	}
	dp := make([]int, n+1) // dp[i]: best profit using the first i jobs
	for i := 1; i <= n; i++ {
		job := order[i-1]
		j := sort.SearchInts(ends, startTime[job]+1) // jobs that end no later than this one starts
		dp[i] = max(dp[i-1], dp[j]+profit[job])
	}
	return dp[n]
}
```
