---
title: Contains Duplicate
leetcode: contains-duplicate
description: "Contains Duplicate explained: decide whether any value appears twice in an array by remembering seen values in a hash set, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given an array of integers `nums` with at least one element. Return `true` if some value occurs at least twice in the array, and `false` if every value is different from all the others. Values can be negative and can be as large as 32-bit integers allow.

## Examples

- `[4, 1, 7, 1]` → `true`. The value `1` appears at positions 1 and 3.
- `[3, 8, -2, 5]` → `false`. All four values are distinct.
- `[0, 0]` → `true`. Two copies of the same value are enough.
- `[42]` → `false`. A single element can never repeat.

## Key idea

A duplicate exists exactly when some value has been seen earlier in the array. A **hash set** lets you ask "have I seen this value before?" in constant time, so one pass over the array answers the question: insert each value, and the first time an insertion finds the value already present, you are done.

## Approach

1. Create an empty hash set `seen`.
2. Walk through `nums` from left to right. For each value:
   1. If the value is already in `seen`, return `true` immediately.
   2. Otherwise add it to `seen`.
3. If the loop finishes without a hit, every value was new, so return `false`.

The brute force compares every pair of positions, which is O(n²) and too slow for large arrays. Sorting first and comparing neighbours works in O(n log n) with no extra memory, which is a reasonable alternative when memory is tight, but the hash set is the usual expected answer.

## Complexity

- **Time:** O(n) on average; each element costs one hash lookup and one insertion.
- **Space:** O(n) for the set in the worst case (no duplicates, so every value is stored).

## Common mistakes

- Comparing only adjacent elements of the unsorted array, which misses duplicates that are not next to each other.
- Returning `false` as soon as one value is new instead of continuing to check the rest.
- Using a list instead of a set for `seen`, which turns each membership test into a linear scan and the whole thing back into O(n²).

## Follow-up questions

- Can you solve it without extra memory? (Sort in place, then check neighbours: O(n log n) time, O(1) extra space.)
- What if a duplicate only counts when the two copies are at most `k` positions apart? (Contains Duplicate II: keep a sliding window set of the last `k` values.)
- How would you handle a stream of values that does not fit in memory? (A Bloom filter gives a probabilistic answer with bounded memory.)

## Related problems

- [Two Sum](/interview/problems/two-sum/)
- [Valid Anagram](/interview/problems/valid-anagram/)
- Contains Duplicate II
- Contains Duplicate III

## Solutions

```python
class Solution:
    def containsDuplicate(self, nums: List[int]) -> bool:
        seen = set()
        for x in nums:
            if x in seen:
                return True
            seen.add(x)
        return False
```

```java
class Solution {
    public boolean containsDuplicate(int[] nums) {
        Set<Integer> seen = new HashSet<>();
        for (int x : nums) {
            if (!seen.add(x)) { // add returns false when x was already present
                return true;
            }
        }
        return false;
    }
}
```

```cpp
class Solution {
public:
    bool containsDuplicate(vector<int>& nums) {
        unordered_set<int> seen;
        for (int x : nums) {
            if (!seen.insert(x).second) {  // insert reports whether x was new
                return true;
            }
        }
        return false;
    }
};
```

```javascript
/**
 * @param {number[]} nums
 * @return {boolean}
 */
var containsDuplicate = function (nums) {
  const seen = new Set();
  for (const x of nums) {
    if (seen.has(x)) return true;
    seen.add(x);
  }
  return false;
};
```

```go
func containsDuplicate(nums []int) bool {
	seen := make(map[int]struct{}, len(nums))
	for _, x := range nums {
		if _, ok := seen[x]; ok {
			return true
		}
		seen[x] = struct{}{}
	}
	return false
}
```
