---
title: Combination Sum
leetcode: combination-sum
description: "Combination Sum explained: list every multiset of candidate numbers (each reusable) that adds up to a target with sorted backtracking and pruning, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given an array `candidates` of **distinct** positive integers and a positive integer `target`. Find every combination of candidates whose sum is exactly `target`. The same number may be picked as many times as you like.

Two combinations count as the same if they use each number the same number of times, so `[2, 3, 3]` and `[3, 2, 3]` are one combination. Return all different combinations, in any order (the numbers inside each one may also be in any order). If none exist, return an empty list.

The inputs are small (at most 30 candidates, values and target up to 40) and are chosen so the answer has fewer than 150 combinations.

## Examples

- `candidates = [3, 4, 5]`, `target = 8` → `[[3, 5], [4, 4]]`. Using 4 twice is allowed; `[3, 3]` falls short and `[3, 3, 3]` overshoots.
- `candidates = [6, 3, 9]`, `target = 9` → `[[3, 3, 3], [3, 6], [9]]`. The input does not have to be sorted.
- `candidates = [2]`, `target = 6` → `[[2, 2, 2]]`.
- `candidates = [5]`, `target = 3` → `[]`. Every candidate is already bigger than the target.

## Key idea

Build combinations one number at a time and undo each choice after exploring it (*backtracking*). Two rules keep it fast and free of duplicates:

1. **Never look back.** Each call gets a `start` index and may only pick candidates from `start` onward. After choosing `candidates[i]`, the recursive call starts at `i` again (not `i + 1`) so the same number can be reused, but it never returns to smaller indexes. Every combination is therefore built in exactly one order, so `[3, 5]` and `[5, 3]` cannot both appear.
2. **Stop early.** Sort the candidates first. When `candidates[i]` is larger than what is left of the target, every later candidate is larger too, so the loop can end there.

## Approach

1. Sort `candidates` and start with an empty `path` and an empty result list.
2. Define `backtrack(start, remaining)`:
   1. If `remaining == 0`, add a copy of `path` to the result and return.
   2. For `i` from `start` to the end:
      - If `candidates[i] > remaining`, break (the rest are even bigger).
      - Append `candidates[i]` to `path`, call `backtrack(i, remaining - candidates[i])`, then remove it again.
3. Call `backtrack(0, target)` and return the result.

## Complexity

- **Time:** exponential in the worst case, roughly O(n^(t/m)) where `t` is the target and `m` the smallest candidate, because that is how deep a combination can go and each level may branch `n` ways. In practice the pruning and the small limits keep it fast. Copying each finished combination costs O(t/m) more per answer.
- **Space:** O(t/m) for the recursion depth and the current path, not counting the output.

## Common mistakes

- Recursing with `i + 1`: numbers can then be used only once, and `[4, 4]` is lost.
- Recursing from `0` instead of `i`: the same combination appears in several orders.
- Adding `path` itself instead of a copy. Later changes to `path` then overwrite the stored answers (they all end up empty).
- Breaking out of the loop without sorting first; with an unsorted array, a later candidate might still fit.

## Follow-up questions

- *Each number may be used at most once and the input may contain duplicates?* That is Combination Sum II: recurse with `i + 1` and skip a candidate equal to the previous one at the same level.
- *Only count the combinations?* Use dynamic programming instead of listing them, exactly like Coin Change II: `ways[s] += ways[s - c]` for each candidate `c` in the outer loop.

## Related problems

- Combination Sum II and Combination Sum III: the same backtracking with "use once" and "exactly k numbers" rules.
- [Coin Change](/interview/problems/coin-change/): the same reusable "coins", but asking for the fewest instead of all combinations.
- [Letter Combinations of a Phone Number](/interview/problems/letter-combinations-of-a-phone-number/) and [Generate Parentheses](/interview/problems/generate-parentheses/): more backtracking practice.

## Solutions

```python
class Solution:
    def combinationSum(self, candidates: List[int], target: int) -> List[List[int]]:
        candidates.sort()
        result, path = [], []

        def backtrack(start: int, remaining: int) -> None:
            if remaining == 0:
                result.append(path[:])  # store a copy
                return
            for i in range(start, len(candidates)):
                if candidates[i] > remaining:
                    break  # sorted: every later candidate is too big as well
                path.append(candidates[i])
                backtrack(i, remaining - candidates[i])  # i, not i + 1: reuse is allowed
                path.pop()

        backtrack(0, target)
        return result
```

```java
class Solution {
    public List<List<Integer>> combinationSum(int[] candidates, int target) {
        Arrays.sort(candidates);
        List<List<Integer>> result = new ArrayList<>();
        backtrack(candidates, 0, target, new ArrayList<>(), result);
        return result;
    }

    private void backtrack(int[] candidates, int start, int remaining, List<Integer> path, List<List<Integer>> result) {
        if (remaining == 0) {
            result.add(new ArrayList<>(path)); // store a copy
            return;
        }
        for (int i = start; i < candidates.length; i++) {
            if (candidates[i] > remaining) break; // sorted: every later candidate is too big as well
            path.add(candidates[i]);
            backtrack(candidates, i, remaining - candidates[i], path, result); // i, not i + 1: reuse is allowed
            path.remove(path.size() - 1);
        }
    }
}
```

```cpp
class Solution {
public:
    vector<vector<int>> combinationSum(vector<int>& candidates, int target) {
        sort(candidates.begin(), candidates.end());
        vector<vector<int>> result;
        vector<int> path;
        backtrack(candidates, 0, target, path, result);
        return result;
    }

private:
    void backtrack(const vector<int>& candidates, int start, int remaining, vector<int>& path, vector<vector<int>>& result) {
        if (remaining == 0) {
            result.push_back(path);  // push_back copies the vector
            return;
        }
        for (int i = start; i < (int)candidates.size(); i++) {
            if (candidates[i] > remaining) break;  // sorted: every later candidate is too big as well
            path.push_back(candidates[i]);
            backtrack(candidates, i, remaining - candidates[i], path, result);  // i, not i + 1: reuse is allowed
            path.pop_back();
        }
    }
};
```

```javascript
/**
 * @param {number[]} candidates
 * @param {number} target
 * @return {number[][]}
 */
var combinationSum = function (candidates, target) {
  candidates.sort((a, b) => a - b);
  const result = [], path = [];
  const backtrack = (start, remaining) => {
    if (remaining === 0) {
      result.push([...path]); // store a copy
      return;
    }
    for (let i = start; i < candidates.length; i++) {
      if (candidates[i] > remaining) break; // sorted: every later candidate is too big as well
      path.push(candidates[i]);
      backtrack(i, remaining - candidates[i]); // i, not i + 1: reuse is allowed
      path.pop();
    }
  };
  backtrack(0, target);
  return result;
};
```

```go
import "sort"

func combinationSum(candidates []int, target int) [][]int {
	sort.Ints(candidates)
	result := [][]int{}
	path := []int{}
	var backtrack func(start, remaining int)
	backtrack = func(start, remaining int) {
		if remaining == 0 {
			result = append(result, append([]int(nil), path...)) // store a copy
			return
		}
		for i := start; i < len(candidates); i++ {
			if candidates[i] > remaining {
				break // sorted: every later candidate is too big as well
			}
			path = append(path, candidates[i])
			backtrack(i, remaining-candidates[i]) // i, not i + 1: reuse is allowed
			path = path[:len(path)-1]
		}
	}
	backtrack(0, target)
	return result
}
```
