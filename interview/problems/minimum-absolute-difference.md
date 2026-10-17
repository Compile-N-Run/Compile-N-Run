---
title: Minimum Absolute Difference
leetcode: minimum-absolute-difference
description: "Minimum Absolute Difference explained: sort the array once, find the smallest gap between neighbours and list every neighbouring pair with that gap in ascending order, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given an array `arr` of at least two **distinct** integers (values may be negative). Find the smallest absolute difference between any two of its elements, then return every pair `[a, b]` with `a < b` whose difference `b - a` equals that minimum.

The pairs must be listed in ascending order: sort them by `a`, which is enough because the values are distinct. Each pair is returned as a two-element list.

## Examples

- `[4, 2, 1, 3]` → `[[1, 2], [2, 3], [3, 4]]`. The smallest gap is 1 and three neighbouring pairs have it.
- `[1, 3, 6, 10, 15]` → `[[1, 3]]`. Gaps are 2, 3, 4, 5; only one pair has the minimum.
- `[3, 8, -10, 23, 19, -4, -14, 27]` → `[[-14, -10], [19, 23], [23, 27]]`. Negative values work the same way.
- `[10, 1, 100, 7]` → `[[7, 10]]`. Sorted: 1, 7, 10, 100 with gaps 6, 3, 90.

## Key idea

Once the array is sorted, the closest pair of values must sit **next to each other**: if `a < m < b`, then `m - a` and `b - m` are both smaller than `b - a`, so a non-adjacent pair can never be the closest. That turns a search over all O(n²) pairs into one look at the n - 1 neighbouring gaps. Sorting also hands you the pairs in the required ascending order for free.

## Approach

1. Sort `arr`.
2. Walk the neighbours `arr[i-1], arr[i]` and record the smallest gap `best`.
3. Walk them again (or in the same pass, resetting the result whenever a smaller gap appears) and append `[arr[i-1], arr[i]]` for every gap equal to `best`.
4. Return the list; it is already ascending because the scan goes left to right over sorted values.

The brute force compares every pair, O(n²), which is too slow for 10⁵ elements. A counting approach (values are bounded) is possible but needs far more memory than the sort.

## Complexity

- **Time:** O(n log n) for the sort; both scans are O(n).
- **Space:** O(k) for the `k` output pairs, plus whatever the sort uses (O(log n) to O(n) depending on the language).

## Common mistakes

- Looking for the minimum difference without sorting and comparing all pairs, which times out on large inputs.
- Computing `abs(arr[i] - arr[i-1])` with 32-bit arithmetic when values span the whole range. Here values lie within ±10⁶, so this is safe, but say so in an interview.
- Collecting pairs on the first scan without resetting the list when a smaller gap appears, which leaves pairs from a larger gap in the result.
- Returning `[b, a]` instead of `[a, b]`, or forgetting that the output order matters.

## Follow-up questions

- *Can you do it in one pass after sorting?* Yes: when the current gap is smaller than `best`, clear the list and set `best`; when equal, append.
- *What if the array may contain duplicates?* The minimum becomes 0 and the pairs are the duplicated values; decide with the interviewer whether `[x, x]` should be reported once or once per repeat.
- *What if values are streamed and you must answer at any time?* Keep a balanced tree (or sorted container) of seen values and update the minimum gap with the two neighbours of each inserted value.

## Related problems

- [Contains Duplicate](/interview/problems/contains-duplicate/)
- [Kth Largest Element in an Array](/interview/problems/kth-largest-element-in-an-array/)
- Minimum Absolute Difference in BST
- K-diff Pairs in an Array

## Solutions

```python
class Solution:
    def minimumAbsDifference(self, arr: List[int]) -> List[List[int]]:
        arr.sort()
        best = min(arr[i] - arr[i - 1] for i in range(1, len(arr)))
        return [[arr[i - 1], arr[i]] for i in range(1, len(arr)) if arr[i] - arr[i - 1] == best]
```

```java
class Solution {
    public List<List<Integer>> minimumAbsDifference(int[] arr) {
        Arrays.sort(arr);
        int best = Integer.MAX_VALUE;
        for (int i = 1; i < arr.length; i++) {
            best = Math.min(best, arr[i] - arr[i - 1]);
        }
        List<List<Integer>> pairs = new ArrayList<>();
        for (int i = 1; i < arr.length; i++) {
            if (arr[i] - arr[i - 1] == best) {
                pairs.add(Arrays.asList(arr[i - 1], arr[i]));
            }
        }
        return pairs;
    }
}
```

```cpp
class Solution {
public:
    vector<vector<int>> minimumAbsDifference(vector<int>& arr) {
        sort(arr.begin(), arr.end());
        int best = INT_MAX;
        for (size_t i = 1; i < arr.size(); i++) {
            best = min(best, arr[i] - arr[i - 1]);
        }
        vector<vector<int>> pairs;
        for (size_t i = 1; i < arr.size(); i++) {
            if (arr[i] - arr[i - 1] == best) {
                pairs.push_back({arr[i - 1], arr[i]});
            }
        }
        return pairs;
    }
};
```

```javascript
/**
 * @param {number[]} arr
 * @return {number[][]}
 */
var minimumAbsDifference = function (arr) {
  arr.sort((a, b) => a - b);
  let best = Infinity;
  for (let i = 1; i < arr.length; i++) {
    best = Math.min(best, arr[i] - arr[i - 1]);
  }
  const pairs = [];
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] - arr[i - 1] === best) {
      pairs.push([arr[i - 1], arr[i]]);
    }
  }
  return pairs;
};
```

```go
import (
	"math"
	"sort"
)

func minimumAbsDifference(arr []int) [][]int {
	sort.Ints(arr)
	best := math.MaxInt32
	for i := 1; i < len(arr); i++ {
		best = min(best, arr[i]-arr[i-1])
	}
	pairs := [][]int{}
	for i := 1; i < len(arr); i++ {
		if arr[i]-arr[i-1] == best {
			pairs = append(pairs, []int{arr[i-1], arr[i]})
		}
	}
	return pairs
}
```
