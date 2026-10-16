---
title: 3Sum
leetcode: 3sum
description: "3Sum explained: find every distinct triplet of numbers that adds up to zero by sorting the array and sweeping two pointers, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given an integer array `nums` with at least three elements. Find every group of three numbers, taken from three different positions, whose sum is exactly `0`.

Return each such group (a *triplet*) once: two triplets made of the same three values count as the same triplet, even if they come from different positions. The triplets, and the numbers inside each triplet, may be returned in any order. If no triplet sums to zero, return an empty list.

## Examples

- `nums = [-4, 1, 3, 2, -1, -2]` → `[[-4, 1, 3], [-2, -1, 3]]`. No other choice of three positions sums to zero.
- `nums = [-2, 1, 1, -2, 4, 0]` → `[[-2, -2, 4], [-2, 1, 1]]`. Both triplets use a repeated value, which is fine because the copies sit at different positions.
- `nums = [0, 0, 0, 0]` → `[[0, 0, 0]]`. Many position triples work, but they all hold the same values, so the triplet is listed once.
- `nums = [2, 5, -1]` → `[]`.

## Key idea

Sort the array first. Then fix the smallest number of the triplet, `nums[i]`, and the problem becomes "find two numbers to the right of `i` that sum to `-nums[i]`" in a sorted range. That is solved with two pointers: one at the left end, one at the right end. If their sum is too small, move the left pointer right (to a bigger number); if it is too large, move the right pointer left. Sorting also makes duplicates sit next to each other, so skipping equal neighbours removes repeated triplets without needing a set.

## Approach

1. Sort `nums`.
2. For each index `i` from `0` to `n - 3`:
   1. If `nums[i] > 0`, stop: every number after it is also positive, so no triplet can reach zero.
   2. If `i > 0` and `nums[i] == nums[i - 1]`, skip it; that first value was already tried.
   3. Set `lo = i + 1` and `hi = n - 1`. While `lo < hi`, compute `sum = nums[i] + nums[lo] + nums[hi]`:
      - `sum < 0`: increase `lo`.
      - `sum > 0`: decrease `hi`.
      - `sum == 0`: record `[nums[i], nums[lo], nums[hi]]`, move both pointers inward, then keep moving `lo` while it equals the previous value, so the same pair is not recorded again.
3. Return the recorded triplets.

The brute force checks all triples in O(n³) and still needs a set to drop duplicates. Sorting plus two pointers brings it down to O(n²).

## Complexity

- **Time:** O(n²). Sorting is O(n log n); for each of the n choices of `i`, the two pointers together walk at most n steps.
- **Space:** O(1) extra besides the output (O(log n) to O(n) for the sort, depending on the language).

## Common mistakes

- Skipping duplicates of `nums[i]` by comparing with `nums[i + 1]` instead of `nums[i - 1]`: this skips the first copy and misses triplets such as `[-2, -2, 4]`.
- Forgetting to skip duplicates after a match, which records the same triplet several times for input like `[-2, 0, 0, 2, 2]`.
- Using a set of triplets to remove duplicates: it works but hides the reasoning interviewers want to see and adds overhead.

## Follow-up questions

- How would you solve 3Sum Closest, where you return the sum nearest to a target? (Same sweep, track the best difference.)
- Can you generalise to 4Sum? (Add one more outer loop; k-Sum costs O(n^(k-1)).)

## Related problems

- Two Sum (the hash map version of the inner step)
- Two Sum II - Input Array Is Sorted (the two-pointer inner step on its own)
- 3Sum Closest, 4Sum

## Solutions

```python
class Solution:
    def threeSum(self, nums: List[int]) -> List[List[int]]:
        nums.sort()
        n = len(nums)
        result = []
        for i in range(n - 2):
            if nums[i] > 0:
                break
            if i > 0 and nums[i] == nums[i - 1]:
                continue  # same first value as the previous round
            lo, hi = i + 1, n - 1
            while lo < hi:
                total = nums[i] + nums[lo] + nums[hi]
                if total < 0:
                    lo += 1
                elif total > 0:
                    hi -= 1
                else:
                    result.append([nums[i], nums[lo], nums[hi]])
                    lo += 1
                    hi -= 1
                    while lo < hi and nums[lo] == nums[lo - 1]:
                        lo += 1  # skip copies of the second value
        return result
```

```java
class Solution {
    public List<List<Integer>> threeSum(int[] nums) {
        Arrays.sort(nums);
        int n = nums.length;
        List<List<Integer>> result = new ArrayList<>();
        for (int i = 0; i < n - 2; i++) {
            if (nums[i] > 0) {
                break;
            }
            if (i > 0 && nums[i] == nums[i - 1]) {
                continue; // same first value as the previous round
            }
            int lo = i + 1, hi = n - 1;
            while (lo < hi) {
                int sum = nums[i] + nums[lo] + nums[hi];
                if (sum < 0) {
                    lo++;
                } else if (sum > 0) {
                    hi--;
                } else {
                    result.add(Arrays.asList(nums[i], nums[lo], nums[hi]));
                    lo++;
                    hi--;
                    while (lo < hi && nums[lo] == nums[lo - 1]) {
                        lo++; // skip copies of the second value
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
    vector<vector<int>> threeSum(vector<int>& nums) {
        sort(nums.begin(), nums.end());
        int n = nums.size();
        vector<vector<int>> result;
        for (int i = 0; i < n - 2; i++) {
            if (nums[i] > 0) break;
            if (i > 0 && nums[i] == nums[i - 1]) continue;  // same first value as the previous round
            int lo = i + 1, hi = n - 1;
            while (lo < hi) {
                int sum = nums[i] + nums[lo] + nums[hi];
                if (sum < 0) {
                    lo++;
                } else if (sum > 0) {
                    hi--;
                } else {
                    result.push_back({nums[i], nums[lo], nums[hi]});
                    lo++;
                    hi--;
                    while (lo < hi && nums[lo] == nums[lo - 1]) lo++;  // skip copies of the second value
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
 * @return {number[][]}
 */
var threeSum = function (nums) {
  nums.sort((a, b) => a - b); // numeric sort; the default sort compares strings
  const n = nums.length;
  const result = [];
  for (let i = 0; i < n - 2; i++) {
    if (nums[i] > 0) {
      break;
    }
    if (i > 0 && nums[i] === nums[i - 1]) {
      continue; // same first value as the previous round
    }
    let lo = i + 1;
    let hi = n - 1;
    while (lo < hi) {
      const sum = nums[i] + nums[lo] + nums[hi];
      if (sum < 0) {
        lo++;
      } else if (sum > 0) {
        hi--;
      } else {
        result.push([nums[i], nums[lo], nums[hi]]);
        lo++;
        hi--;
        while (lo < hi && nums[lo] === nums[lo - 1]) {
          lo++; // skip copies of the second value
        }
      }
    }
  }
  return result;
};
```

```go
import "sort"

func threeSum(nums []int) [][]int {
	sort.Ints(nums)
	n := len(nums)
	result := [][]int{}
	for i := 0; i < n-2; i++ {
		if nums[i] > 0 {
			break
		}
		if i > 0 && nums[i] == nums[i-1] {
			continue // same first value as the previous round
		}
		lo, hi := i+1, n-1
		for lo < hi {
			sum := nums[i] + nums[lo] + nums[hi]
			if sum < 0 {
				lo++
			} else if sum > 0 {
				hi--
			} else {
				result = append(result, []int{nums[i], nums[lo], nums[hi]})
				lo++
				hi--
				for lo < hi && nums[lo] == nums[lo-1] {
					lo++ // skip copies of the second value
				}
			}
		}
	}
	return result
}
```
