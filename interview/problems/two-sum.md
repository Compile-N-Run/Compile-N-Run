---
title: Two Sum
leetcode: two-sum
description: "Two Sum explained: find the two array positions whose values add up to a target in one pass with a hash map, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given an array of integers `nums` and an integer `target`. Exactly two different positions in the array hold numbers that add up to `target`. Return those two positions (indexes), in any order.

You may not use the same position twice, and there is always exactly one valid answer.

## Examples

- `nums = [3, 8, 11, 5]`, `target = 13` → `[1, 3]`, because `8 + 5 = 13`.
- `nums = [4, 6, 4]`, `target = 8` → `[0, 2]`. The two 4s are different positions, so they can be used together.
- `nums = [-2, 7, 1]`, `target = -1` → `[0, 2]`, because `-2 + 1 = -1`.

## Key idea

For each number `x`, the only number that can complete it is `target - x` (its *complement*). Instead of searching the whole array for the complement, remember every number you have already seen in a hash map from value to index. Looking up the complement then takes constant time, so one pass over the array is enough.

## Approach

1. Create an empty hash map `seen` that maps a value to the index where it appeared.
2. Walk through the array. For each index `i` with value `x`:
   1. Compute `need = target - x`.
   2. If `need` is already in `seen`, the answer is `[seen[need], i]`. Stop.
   3. Otherwise store `seen[x] = i` and continue.
3. Checking *before* storing is what prevents using the same position twice: when we look up `need`, the current element is not in the map yet.

The brute-force alternative tries every pair with two nested loops. It is correct but takes O(n²) time, which is what interviewers expect you to improve on.

## Complexity

- **Time:** O(n). Each element is visited once and each map lookup or insert is O(1) on average.
- **Space:** O(n) for the hash map in the worst case.

## Common mistakes

- Storing every number first and then looking up complements: for `nums = [4, 6]`, `target = 8` this can pair the 4 with itself. Look up before you insert.
- Returning the values instead of their indexes.
- Sorting the array first (as in the two-pointer technique) loses the original indexes unless you sort index/value pairs.

## Solutions

```python
class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        seen = {}  # value -> index
        for i, x in enumerate(nums):
            need = target - x
            if need in seen:
                return [seen[need], i]
            seen[x] = i
        return []  # unreachable: the problem guarantees an answer
```

```java
class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> seen = new HashMap<>(); // value -> index
        for (int i = 0; i < nums.length; i++) {
            Integer j = seen.get(target - nums[i]);
            if (j != null) {
                return new int[] {j, i};
            }
            seen.put(nums[i], i);
        }
        return new int[0]; // unreachable: the problem guarantees an answer
    }
}
```

```cpp
class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> seen;  // value -> index
        for (int i = 0; i < (int)nums.size(); i++) {
            auto it = seen.find(target - nums[i]);
            if (it != seen.end()) {
                return {it->second, i};
            }
            seen[nums[i]] = i;
        }
        return {};  // unreachable: the problem guarantees an answer
    }
};
```

```javascript
/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function (nums, target) {
  const seen = new Map(); // value -> index
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (seen.has(need)) {
      return [seen.get(need), i];
    }
    seen.set(nums[i], i);
  }
  return []; // unreachable: the problem guarantees an answer
};
```

```go
func twoSum(nums []int, target int) []int {
	seen := make(map[int]int) // value -> index
	for i, x := range nums {
		if j, ok := seen[target-x]; ok {
			return []int{j, i}
		}
		seen[x] = i
	}
	return nil // unreachable: the problem guarantees an answer
}
```
