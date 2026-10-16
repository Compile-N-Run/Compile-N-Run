---
title: Longest Consecutive Sequence
leetcode: longest-consecutive-sequence
description: "Longest Consecutive Sequence explained: find the longest run of consecutive integers in an unsorted array in O(n) with a hash set, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given an unsorted array of integers `nums`. Find the length of the longest group of values that form a run of consecutive integers, such as `7, 8, 9, 10`. The values can appear anywhere in the array and in any order; only which values are present matters.

The array may be empty (answer `0`), may contain duplicates (a repeated value counts once) and may contain negative numbers. The interviewer expects an O(n) solution, so sorting is not allowed.

## Examples

- `nums = [10, 4, 20, 1, 3, 2]` → `4`. The values `1, 2, 3, 4` form the longest run.
- `nums = [5, -1, 0, 7, 1, 6, 1]` → `3`. Both `-1, 0, 1` and `5, 6, 7` have length 3; the duplicate `1` does not make the first run longer.
- `nums = [42]` → `1`. A single value is a run of length 1.
- `nums = []` → `0`.

## Key idea

Put all values in a hash set. A value `x` is the *start* of a run exactly when `x - 1` is not in the set. From each start, count upward (`x + 1`, `x + 2`, ...) while the next value is in the set. Because we only count from starts, every value is visited by at most one counting loop, so the total work stays linear even though there is a loop inside a loop.

## Approach

1. Build a hash set `values` from `nums`. This also removes duplicates.
2. Set `best = 0`.
3. For each `x` in `values`:
   1. If `x - 1` is in `values`, skip `x`: it is in the middle of a run that will be counted from its start.
   2. Otherwise count `length = 1` and keep increasing while `x + length` is in `values`.
   3. Update `best = max(best, length)`.
4. Return `best`.

Sorting the array and scanning for runs is simpler but takes O(n log n). Counting upward from *every* value without the start check is O(n²) in the worst case, for example on `[1, 2, 3, ..., n]`.

## Complexity

- **Time:** O(n). Building the set is O(n), and each value is touched once by the outer loop and at most once by one counting loop.
- **Space:** O(n) for the hash set.

## Common mistakes

- Iterating over `nums` instead of the set: with many copies of a run's first value, the same run is counted again and again, which can become O(n²).
- Counting duplicates as extra length: `[1, 1, 2]` has a longest run of 2, not 3.
- Forgetting the empty array, which must return `0`.

## Follow-up questions

- Return the run itself, not just its length: remember the start value of the best run.
- Solve it with union-find: union each `x` with `x + 1` when both are present and report the largest component.

## Related problems

- Binary Tree Longest Consecutive Sequence
- Missing Number

## Solutions

```python
class Solution:
    def longestConsecutive(self, nums: List[int]) -> int:
        values = set(nums)
        best = 0
        for x in values:
            if x - 1 in values:
                continue  # not the start of a run
            length = 1
            while x + length in values:
                length += 1
            best = max(best, length)
        return best
```

```java
class Solution {
    public int longestConsecutive(int[] nums) {
        Set<Integer> values = new HashSet<>();
        for (int x : nums) {
            values.add(x);
        }
        int best = 0;
        for (int x : values) {
            if (values.contains(x - 1)) {
                continue; // not the start of a run
            }
            int length = 1;
            while (values.contains(x + length)) {
                length++;
            }
            best = Math.max(best, length);
        }
        return best;
    }
}
```

```cpp
class Solution {
public:
    int longestConsecutive(vector<int>& nums) {
        unordered_set<int> values(nums.begin(), nums.end());
        int best = 0;
        for (int x : values) {
            if (values.count(x - 1)) {
                continue;  // not the start of a run
            }
            int length = 1;
            while (values.count(x + length)) {
                length++;
            }
            best = max(best, length);
        }
        return best;
    }
};
```

```javascript
/**
 * @param {number[]} nums
 * @return {number}
 */
var longestConsecutive = function (nums) {
  const values = new Set(nums);
  let best = 0;
  for (const x of values) {
    if (values.has(x - 1)) {
      continue; // not the start of a run
    }
    let length = 1;
    while (values.has(x + length)) {
      length++;
    }
    best = Math.max(best, length);
  }
  return best;
};
```

```go
func longestConsecutive(nums []int) int {
	values := make(map[int]bool, len(nums))
	for _, x := range nums {
		values[x] = true
	}
	best := 0
	for x := range values {
		if values[x-1] {
			continue // not the start of a run
		}
		length := 1
		for values[x+length] {
			length++
		}
		if length > best {
			best = length
		}
	}
	return best
}
```
