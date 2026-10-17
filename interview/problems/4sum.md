---
title: 4Sum
leetcode: 4sum
description: "4Sum explained: find every distinct quadruplet that adds up to a target by sorting, fixing two numbers and closing in with two pointers while skipping duplicates, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given an integer array `nums` and an integer `target`. Return all **distinct** quadruplets `[a, b, c, d]` taken from four different positions of the array whose values add up to `target`. Two quadruplets are the same if they contain the same values, regardless of order, so each combination of values must appear exactly once in the answer. The quadruplets themselves may be returned in any order.

The array can be empty or shorter than four elements (then the answer is empty), it may contain duplicates, and both values and `target` can be anywhere in the 32-bit range, so four values may overflow a 32-bit sum.

## Examples

- `nums = [1, 0, -1, 0, -2, 2]`, `target = 0` → `[[-2, -1, 1, 2], [-2, 0, 0, 2], [-1, 0, 0, 1]]`.
- `nums = [2, 2, 2, 2, 2]`, `target = 8` → `[[2, 2, 2, 2]]`. Five positions, but only one distinct combination.
- `nums = [-3, -1, 0, 2, 4, 5]`, `target = 2` → `[[-3, -1, 2, 4]]`.
- `nums = [1, 2, 3]`, `target = 6` → `[]`. Fewer than four numbers.
- `nums = [1000000000, 1000000000, 1000000000, 1000000000]`, `target = -294967296` → `[]`. The true sum is 4,000,000,000; a 32-bit sum would wrap to exactly this target and wrongly report a match.

## Key idea

Sorting the array does two things at once. First, equal values become neighbours, so skipping a value that equals the one before it removes duplicate quadruplets without a hash set. Second, once two numbers `a` and `b` are fixed, finding the remaining pair with sum `target - a - b` in the sorted suffix is the classic two-pointer walk: a left pointer at the start and a right pointer at the end move toward each other, stepping left when the sum is too small and right when it is too large. This is exactly 3Sum with one more fixed element around it.

## Approach

1. Sort `nums`; let `n` be its length.
2. For `i` from `0` to `n - 4`: skip if `nums[i] == nums[i-1]` (same first value as a quadruplet already explored).
3. For `j` from `i + 1` to `n - 3`: skip if `j > i + 1` and `nums[j] == nums[j-1]`.
4. Set `lo = j + 1`, `hi = n - 1`. While `lo < hi`, compute `sum = nums[i] + nums[j] + nums[lo] + nums[hi]` in 64-bit arithmetic:
   1. If `sum < target`, move `lo` right.
   2. If `sum > target`, move `hi` left.
   3. Otherwise record the quadruplet, then advance `lo` past every copy of `nums[lo]` and retreat `hi` past every copy of `nums[hi]`.
5. Return the recorded quadruplets.

The brute force checks all C(n, 4) combinations and deduplicates them with a set: O(n⁴), far too slow at n = 200. A hash-map variant (pair sums) reaches O(n²) on average but makes deduplication messy; the sorted two-pointer method is the one interviewers expect.

## Complexity

- **Time:** O(n³). Two nested loops choose `i` and `j`, and the two-pointer sweep inside is O(n). Sorting is O(n log n) and disappears next to that.
- **Space:** O(1) beyond the output (plus the sort's own stack).

## Common mistakes

- Summing four 32-bit integers in a 32-bit type. Values near ±10⁹ overflow; use `long`/`long long`, or a language whose integers are wide enough.
- Skipping duplicates with `nums[j] == nums[j-1]` for every `j`, including `j == i + 1`. That wrongly drops `[2, 2, 2, 2]`; the skip must only apply when `j` has moved past its first position.
- Forgetting to skip duplicates after recording a match, which produces the same quadruplet several times.
- Breaking out of the loop at the first match instead of continuing the sweep.

## Follow-up questions

- *How does this generalise to kSum?* Recurse: fix one element and solve (k-1)Sum on the suffix, with 2Sum as the two-pointer base case; time O(n^(k-1)).
- *Can you prune early?* After sorting, if `nums[i] * 4 > target` no later `i` can work, and if `nums[i] + 3 * nums[n-1] < target` this `i` cannot work; the same applies to `j`.
- *What if you only need the count of quadruplets, with positions distinct but values repeated?* 4Sum II uses a hash map of pair sums for O(n²).

## Related problems

- [Two Sum](/interview/problems/two-sum/)
- [3Sum](/interview/problems/3sum/)
- 3Sum Closest
- 4Sum II

## Solutions

```python
class Solution:
    def fourSum(self, nums: List[int], target: int) -> List[List[int]]:
        nums.sort()
        n, result = len(nums), []
        for i in range(n - 3):
            if i > 0 and nums[i] == nums[i - 1]:
                continue  # same first value as an earlier quadruplet
            for j in range(i + 1, n - 2):
                if j > i + 1 and nums[j] == nums[j - 1]:
                    continue
                lo, hi = j + 1, n - 1
                while lo < hi:
                    total = nums[i] + nums[j] + nums[lo] + nums[hi]
                    if total < target:
                        lo += 1
                    elif total > target:
                        hi -= 1
                    else:
                        result.append([nums[i], nums[j], nums[lo], nums[hi]])
                        lo += 1
                        while lo < hi and nums[lo] == nums[lo - 1]:
                            lo += 1
                        hi -= 1
                        while lo < hi and nums[hi] == nums[hi + 1]:
                            hi -= 1
        return result
```

```java
class Solution {
    public List<List<Integer>> fourSum(int[] nums, int target) {
        Arrays.sort(nums);
        int n = nums.length;
        List<List<Integer>> result = new ArrayList<>();
        for (int i = 0; i < n - 3; i++) {
            if (i > 0 && nums[i] == nums[i - 1]) continue; // same first value as an earlier quadruplet
            for (int j = i + 1; j < n - 2; j++) {
                if (j > i + 1 && nums[j] == nums[j - 1]) continue;
                int lo = j + 1, hi = n - 1;
                while (lo < hi) {
                    long total = (long) nums[i] + nums[j] + nums[lo] + nums[hi]; // long: four ints can overflow
                    if (total < target) {
                        lo++;
                    } else if (total > target) {
                        hi--;
                    } else {
                        result.add(Arrays.asList(nums[i], nums[j], nums[lo], nums[hi]));
                        lo++;
                        while (lo < hi && nums[lo] == nums[lo - 1]) lo++;
                        hi--;
                        while (lo < hi && nums[hi] == nums[hi + 1]) hi--;
                    }
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
    vector<vector<int>> fourSum(vector<int>& nums, int target) {
        sort(nums.begin(), nums.end());
        int n = nums.size();
        vector<vector<int>> result;
        for (int i = 0; i < n - 3; i++) {
            if (i > 0 && nums[i] == nums[i - 1]) continue;  // same first value as an earlier quadruplet
            for (int j = i + 1; j < n - 2; j++) {
                if (j > i + 1 && nums[j] == nums[j - 1]) continue;
                int lo = j + 1, hi = n - 1;
                while (lo < hi) {
                    long long total = (long long)nums[i] + nums[j] + nums[lo] + nums[hi];  // four ints can overflow
                    if (total < target) {
                        lo++;
                    } else if (total > target) {
                        hi--;
                    } else {
                        result.push_back({nums[i], nums[j], nums[lo], nums[hi]});
                        lo++;
                        while (lo < hi && nums[lo] == nums[lo - 1]) lo++;
                        hi--;
                        while (lo < hi && nums[hi] == nums[hi + 1]) hi--;
                    }
                }
            }
        }
        return result;
    }
};
```

```javascript
/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[][]}
 */
var fourSum = function (nums, target) {
  nums.sort((a, b) => a - b);
  const n = nums.length;
  const result = [];
  for (let i = 0; i < n - 3; i++) {
    if (i > 0 && nums[i] === nums[i - 1]) continue; // same first value as an earlier quadruplet
    for (let j = i + 1; j < n - 2; j++) {
      if (j > i + 1 && nums[j] === nums[j - 1]) continue;
      let lo = j + 1, hi = n - 1;
      while (lo < hi) {
        const total = nums[i] + nums[j] + nums[lo] + nums[hi]; // doubles hold the sum exactly
        if (total < target) {
          lo++;
        } else if (total > target) {
          hi--;
        } else {
          result.push([nums[i], nums[j], nums[lo], nums[hi]]);
          lo++;
          while (lo < hi && nums[lo] === nums[lo - 1]) lo++;
          hi--;
          while (lo < hi && nums[hi] === nums[hi + 1]) hi--;
        }
      }
    }
  }
  return result;
};
```

```go
import "sort"

func fourSum(nums []int, target int) [][]int {
	sort.Ints(nums)
	n := len(nums)
	result := [][]int{}
	for i := 0; i < n-3; i++ {
		if i > 0 && nums[i] == nums[i-1] {
			continue // same first value as an earlier quadruplet
		}
		for j := i + 1; j < n-2; j++ {
			if j > i+1 && nums[j] == nums[j-1] {
				continue
			}
			lo, hi := j+1, n-1
			for lo < hi {
				total := nums[i] + nums[j] + nums[lo] + nums[hi] // int is 64-bit here, so no overflow
				if total < target {
					lo++
				} else if total > target {
					hi--
				} else {
					result = append(result, []int{nums[i], nums[j], nums[lo], nums[hi]})
					lo++
					for lo < hi && nums[lo] == nums[lo-1] {
						lo++
					}
					hi--
					for lo < hi && nums[hi] == nums[hi+1] {
						hi--
					}
				}
			}
		}
	}
	return result
}
```
