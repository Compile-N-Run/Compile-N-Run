---
title: Permutations
leetcode: permutations
description: "Permutations explained: list every ordering of an array of distinct integers with backtracking that picks one unused number per position, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given an array `nums` of distinct integers. Return every possible ordering (permutation) of its elements, each one as a list. The orderings can be returned in any order, but each must appear exactly once.

The array has at least one element and is short (at most 6 numbers on LeetCode), because an array of `n` numbers has `n!` orderings. The numbers can be negative.

## Examples

- `nums = [4, 9]` → `[[4, 9], [9, 4]]`. Two numbers can be arranged two ways.
- `nums = [1, 2, 3]` → `[[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]]`, all `3! = 6` orderings.
- `nums = [-5]` → `[[-5]]`. A single number has one ordering.
- `nums = [0, -1, 7, 2]` → 24 lists, one for each ordering of the four numbers.

## Key idea

Build a permutation one position at a time. For the first position you can choose any of the `n` numbers; for the second, any of the `n - 1` numbers you have not used yet; and so on. When every number is placed, you have one complete permutation.

This is *backtracking*: choose a number, go deeper to fill the next position, then undo the choice and try the next number in its place. A boolean `used` array records which numbers are already in the current partial permutation, so you never pick one twice.

The choices form a tree. The root is the empty list, each level fills one more position, and every leaf at depth `n` is an answer:

```
                    []
          /         |         \
        [1]        [2]        [3]
       /   \      /   \      /   \
   [1,2] [1,3] [2,1] [2,3] [3,1] [3,2]
     |     |     |     |     |     |
 [1,2,3] [1,3,2] ...                 [3,2,1]
```

## Approach

1. Keep a list `path` (the partial permutation), a boolean array `used` of length `n`, and the result list.
2. Write a recursive helper `backtrack()`:
   1. If `path` has `n` elements, append a **copy** of it to the result and return.
   2. Otherwise, for each index `i` from `0` to `n - 1` with `used[i]` false:
      1. Mark `used[i] = true` and append `nums[i]` to `path`.
      2. Call `backtrack()` to fill the remaining positions.
      3. Undo: remove the last element of `path` and set `used[i] = false`.
3. Call `backtrack()` once and return the result.

There is no cheaper way to do this: the output itself has `n!` lists of length `n`, so any correct algorithm must spend at least that much time writing them.

## Complexity

- **Time:** O(n · n!). There are `n!` permutations and copying each into the result costs O(n). The internal nodes of the tree add only a constant factor.
- **Space:** O(n) besides the output, for `path`, `used` and the recursion stack. The output itself takes O(n · n!).

## Common mistakes

- Appending `path` itself instead of a copy. Every entry in the result then points at the same list, which is empty once backtracking finishes.
- Forgetting to undo the choice (pop from `path` and reset `used[i]`), so later branches see stale numbers.
- Checking `nums[i] in path` instead of a `used` array. It works for distinct numbers but costs O(n) per check.

## Follow-up questions

- What if `nums` may contain duplicates and each distinct ordering must appear once? (Sort first, then skip `nums[i]` when it equals `nums[i - 1]` and `nums[i - 1]` is not used in the current path.)
- Can you produce the permutations without recursion? (Repeatedly apply the next-permutation step starting from the sorted array.)

## Related problems

- [Next Permutation](/interview/problems/next-permutation/)
- [Generate Parentheses](/interview/problems/generate-parentheses/)
- [Letter Combinations of a Phone Number](/interview/problems/letter-combinations-of-a-phone-number/)
- Permutations II
- Subsets
- Combination Sum

## Solutions

```python
class Solution:
    def permute(self, nums: List[int]) -> List[List[int]]:
        result, path = [], []
        used = [False] * len(nums)

        def backtrack():
            if len(path) == len(nums):
                result.append(path[:])  # copy: path keeps changing
                return
            for i, x in enumerate(nums):
                if not used[i]:
                    used[i] = True
                    path.append(x)
                    backtrack()
                    path.pop()  # undo the choice
                    used[i] = False

        backtrack()
        return result
```

```java
class Solution {
    public List<List<Integer>> permute(int[] nums) {
        List<List<Integer>> result = new ArrayList<>();
        backtrack(nums, new boolean[nums.length], new ArrayList<>(), result);
        return result;
    }

    private void backtrack(int[] nums, boolean[] used, List<Integer> path, List<List<Integer>> result) {
        if (path.size() == nums.length) {
            result.add(new ArrayList<>(path)); // copy: path keeps changing
            return;
        }
        for (int i = 0; i < nums.length; i++) {
            if (!used[i]) {
                used[i] = true;
                path.add(nums[i]);
                backtrack(nums, used, path, result);
                path.remove(path.size() - 1); // undo the choice
                used[i] = false;
            }
        }
    }
}
```

```cpp
class Solution {
    void backtrack(const vector<int>& nums, vector<bool>& used, vector<int>& path, vector<vector<int>>& result) {
        if (path.size() == nums.size()) {
            result.push_back(path);  // push_back copies the vector
            return;
        }
        for (size_t i = 0; i < nums.size(); i++) {
            if (!used[i]) {
                used[i] = true;
                path.push_back(nums[i]);
                backtrack(nums, used, path, result);
                path.pop_back();  // undo the choice
                used[i] = false;
            }
        }
    }

public:
    vector<vector<int>> permute(vector<int>& nums) {
        vector<vector<int>> result;
        vector<int> path;
        vector<bool> used(nums.size(), false);
        backtrack(nums, used, path, result);
        return result;
    }
};
```

```javascript
/**
 * @param {number[]} nums
 * @return {number[][]}
 */
var permute = function (nums) {
  const result = [], path = [];
  const used = new Array(nums.length).fill(false);
  const backtrack = () => {
    if (path.length === nums.length) {
      result.push([...path]); // copy: path keeps changing
      return;
    }
    for (let i = 0; i < nums.length; i++) {
      if (!used[i]) {
        used[i] = true;
        path.push(nums[i]);
        backtrack();
        path.pop(); // undo the choice
        used[i] = false;
      }
    }
  };
  backtrack();
  return result;
};
```

```go
func permute(nums []int) [][]int {
	result := [][]int{}
	path := []int{}
	used := make([]bool, len(nums))
	var backtrack func()
	backtrack = func() {
		if len(path) == len(nums) {
			result = append(result, append([]int(nil), path...)) // copy: path keeps changing
			return
		}
		for i, x := range nums {
			if !used[i] {
				used[i] = true
				path = append(path, x)
				backtrack()
				path = path[:len(path)-1] // undo the choice
				used[i] = false
			}
		}
	}
	backtrack()
	return result
}
```
