---
title: Top K Frequent Elements
leetcode: top-k-frequent-elements
description: "Top K Frequent Elements explained: count occurrences with a hash map and group values into frequency buckets to return the k most common numbers in linear time, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given an array of integers `nums` and an integer `k`. Return the `k` values that appear most often in the array. The answer may list them in any order.

`k` is at least 1 and never larger than the number of distinct values, and the input is chosen so that the answer is unambiguous: there is never a tie for the last place in the top `k`. The array has at least one element and values can be negative.

## Examples

- `nums = [5, 7, 5, 9, 7, 5]`, `k = 2` → `[5, 7]`. 5 appears three times, 7 twice and 9 once.
- `nums = [-3, -3, 4]`, `k = 1` → `[-3]`, the only value that appears twice.
- `nums = [8, 2, 6]`, `k = 3` → `[8, 2, 6]` (any order). Every distinct value is requested.

## Key idea

First count how often each value appears with a hash map. The interesting part is picking the top `k` without sorting all counts. A frequency can only be between 1 and `n` (the array length), so make `n + 1` *buckets*, where bucket `f` holds every value that appears exactly `f` times. Walking the buckets from the highest frequency down and collecting values until you have `k` of them gives the answer in linear time.

## Approach

1. Build a map `count` from value to number of occurrences.
2. Create a list of `n + 1` empty buckets. For every `(value, f)` in `count`, append `value` to `buckets[f]`.
3. Walk `f` from `n` down to `1`. Append each value in `buckets[f]` to the result and stop as soon as the result holds `k` values.
4. Return the result.

Sorting the distinct values by count also works and is often fine in an interview, but costs O(n log n). A min-heap of size `k` costs O(n log k). Bucket sort reaches O(n), which is the usual follow-up.

## Complexity

- **Time:** O(n). Counting is one pass, filling buckets touches each distinct value once, and the final walk visits at most `n + 1` buckets.
- **Space:** O(n) for the count map and the buckets.

## Common mistakes

- Making only `n` buckets: a value that fills the whole array has frequency `n`, so you need indexes `0..n`.
- Returning the frequencies instead of the values.
- Forgetting to stop once `k` values are collected, which can return too many when a bucket holds several values.

## Follow-up questions

- What if the data is a stream too large to keep in memory? (Approximate counting, such as Count-Min Sketch with a heap.)
- How would you return the values sorted by frequency? (The bucket walk already produces them from most to least frequent.)

## Related problems

- Top K Frequent Words (same idea, with ties broken alphabetically)
- Kth Largest Element in an Array (heap or quickselect)

## Solutions

```python
class Solution:
    def topKFrequent(self, nums: List[int], k: int) -> List[int]:
        count = Counter(nums)
        buckets = [[] for _ in range(len(nums) + 1)]  # buckets[f] = values seen f times
        for value, f in count.items():
            buckets[f].append(value)
        result = []
        for f in range(len(nums), 0, -1):
            for value in buckets[f]:
                result.append(value)
                if len(result) == k:
                    return result
        return result
```

```java
class Solution {
    public int[] topKFrequent(int[] nums, int k) {
        Map<Integer, Integer> count = new HashMap<>();
        for (int x : nums) {
            count.merge(x, 1, Integer::sum);
        }
        List<List<Integer>> buckets = new ArrayList<>(); // buckets.get(f) = values seen f times
        for (int i = 0; i <= nums.length; i++) {
            buckets.add(new ArrayList<>());
        }
        for (Map.Entry<Integer, Integer> e : count.entrySet()) {
            buckets.get(e.getValue()).add(e.getKey());
        }
        int[] result = new int[k];
        int filled = 0;
        for (int f = nums.length; f > 0 && filled < k; f--) {
            for (int value : buckets.get(f)) {
                result[filled++] = value;
                if (filled == k) {
                    break;
                }
            }
        }
        return result;
    }
}
```

```cpp
class Solution {
public:
    vector<int> topKFrequent(vector<int>& nums, int k) {
        unordered_map<int, int> count;
        for (int x : nums) count[x]++;
        vector<vector<int>> buckets(nums.size() + 1);  // buckets[f] = values seen f times
        for (auto& [value, f] : count) buckets[f].push_back(value);
        vector<int> result;
        for (int f = nums.size(); f > 0; f--) {
            for (int value : buckets[f]) {
                result.push_back(value);
                if ((int)result.size() == k) return result;
            }
        }
        return result;
    }
};
```

```javascript
/**
 * @param {number[]} nums
 * @param {number} k
 * @return {number[]}
 */
var topKFrequent = function (nums, k) {
  const count = new Map();
  for (const x of nums) {
    count.set(x, (count.get(x) || 0) + 1);
  }
  const buckets = Array.from({ length: nums.length + 1 }, () => []); // buckets[f] = values seen f times
  for (const [value, f] of count) {
    buckets[f].push(value);
  }
  const result = [];
  for (let f = nums.length; f > 0; f--) {
    for (const value of buckets[f]) {
      result.push(value);
      if (result.length === k) {
        return result;
      }
    }
  }
  return result;
};
```

```go
func topKFrequent(nums []int, k int) []int {
	count := make(map[int]int)
	for _, x := range nums {
		count[x]++
	}
	buckets := make([][]int, len(nums)+1) // buckets[f] = values seen f times
	for value, f := range count {
		buckets[f] = append(buckets[f], value)
	}
	result := make([]int, 0, k)
	for f := len(nums); f > 0; f-- {
		for _, value := range buckets[f] {
			result = append(result, value)
			if len(result) == k {
				return result
			}
		}
	}
	return result
}
```
