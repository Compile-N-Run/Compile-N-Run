---
title: Subsets
leetcode: subsets
description: "Subsets explained: generate every subset (the power set) of an array of distinct numbers with backtracking that decides, element by element, whether to include it, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given an array `nums` of **distinct** integers. Return every possible subset of it, including the empty subset and the full array. This collection is called the power set. No subset may appear twice, and the subsets (and the elements inside each one) may be in any order.

The array may be empty, in which case the only subset is the empty one.

## Examples

- `nums = [1, 2, 3]` → `[[], [1], [2], [3], [1, 2], [1, 3], [2, 3], [1, 2, 3]]`: 2³ = 8 subsets.
- `nums = [-1, 4]` → `[[], [-1], [4], [-1, 4]]`.
- `nums = [0]` → `[[], [0]]`.
- `nums = []` → `[[]]`. There is exactly one subset of nothing: the empty one.

## Key idea

A subset is a sequence of yes/no decisions: for each element, either take it or leave it. With `n` elements that gives 2ⁿ subsets, and every path through those decisions is a different subset because the elements are distinct.

Backtracking builds the subsets one decision at a time. Keep a growing `current` list and a position `start`. At every call, the `current` list *is* a subset, so record a copy of it. Then, for each index `i` from `start` onward, add `nums[i]`, recurse with `start = i + 1` (so later elements can only be added after earlier ones, which prevents duplicates like `[1, 2]` and `[2, 1]`), and remove `nums[i]` again before trying the next index.

## Approach

1. Create an empty `result` list and an empty `current` list.
2. Define `backtrack(start)`:
   1. Append a copy of `current` to `result`. (Every call records one subset, including the empty one on the first call.)
   2. For `i` from `start` to the last index: push `nums[i]` onto `current`, call `backtrack(i + 1)`, pop `nums[i]`.
3. Call `backtrack(0)` and return `result`.

An equally good alternative is the bitmask loop: for each `mask` from `0` to `2ⁿ - 1`, the subset contains `nums[i]` exactly when bit `i` of `mask` is set. It is shorter but only works while `n` fits in an integer's bit width, and the backtracking template generalises to Combination Sum, Permutations and Subsets II.

## Complexity

- **Time:** O(n · 2ⁿ). There are 2ⁿ subsets and copying each one costs up to O(n).
- **Space:** O(n) for the recursion stack and the `current` list, not counting the O(n · 2ⁿ) output.

## Common mistakes

- Appending `current` itself instead of a copy. Every entry of the result then points at the same list, which ends up empty.
- Forgetting to remove the element after the recursive call, so later subsets carry stale elements.
- Recursing with `start` instead of `i + 1`, which produces the same subset several times.
- Recording subsets only at the leaves of the recursion (when `start == n`), which drops every subset that is not a full path.
- Returning nothing for an empty input. The answer is `[[]]`, not `[]`.

## Follow-up questions

- What changes if `nums` can contain duplicates? (Subsets II: sort first and skip an element when it equals the previous one at the same recursion depth.)
- Can you generate subsets without recursion? (The bitmask loop, or start from `[[]]` and for each number append it to a copy of every subset found so far.)
- How would you generate only the subsets of size `k`? (Combinations: record `current` only when its length is `k` and stop recursing early.)

## Related problems

- [Permutations](/interview/problems/permutations/)
- [Combination Sum](/interview/problems/combination-sum/)
- [Letter Combinations of a Phone Number](/interview/problems/letter-combinations-of-a-phone-number/)
- Subsets II
- Combinations

## Solutions

```python
class Solution:
    def subsets(self, nums: List[int]) -> List[List[int]]:
        result, current = [], []

        def backtrack(start: int) -> None:
            result.append(current[:])  # every call records one subset
            for i in range(start, len(nums)):
                current.append(nums[i])
                backtrack(i + 1)
                current.pop()

        backtrack(0)
        return result
```

```java
class Solution {
    public List<List<Integer>> subsets(int[] nums) {
        List<List<Integer>> result = new ArrayList<>();
        backtrack(nums, 0, new ArrayList<>(), result);
        return result;
    }

    private void backtrack(int[] nums, int start, List<Integer> current, List<List<Integer>> result) {
        result.add(new ArrayList<>(current)); // every call records one subset
        for (int i = start; i < nums.length; i++) {
            current.add(nums[i]);
            backtrack(nums, i + 1, current, result);
            current.remove(current.size() - 1);
        }
    }
}
```

```cpp
class Solution {
    void backtrack(const vector<int>& nums, int start, vector<int>& current, vector<vector<int>>& result) {
        result.push_back(current);  // every call records one subset
        for (int i = start; i < (int)nums.size(); i++) {
            current.push_back(nums[i]);
            backtrack(nums, i + 1, current, result);
            current.pop_back();
        }
    }

public:
    vector<vector<int>> subsets(vector<int>& nums) {
        vector<vector<int>> result;
        vector<int> current;
        backtrack(nums, 0, current, result);
        return result;
    }
};
```

```javascript
/**
 * @param {number[]} nums
 * @return {number[][]}
 */
var subsets = function (nums) {
  const result = [];
  const current = [];
  const backtrack = (start) => {
    result.push(current.slice()); // every call records one subset
    for (let i = start; i < nums.length; i++) {
      current.push(nums[i]);
      backtrack(i + 1);
      current.pop();
    }
  };
  backtrack(0);
  return result;
};
```

```go
func subsets(nums []int) [][]int {
	result := [][]int{}
	current := []int{}
	var backtrack func(start int)
	backtrack = func(start int) {
		result = append(result, append([]int{}, current...)) // every call records one subset
		for i := start; i < len(nums); i++ {
			current = append(current, nums[i])
			backtrack(i + 1)
			current = current[:len(current)-1]
		}
	}
	backtrack(0)
	return result
}
```
