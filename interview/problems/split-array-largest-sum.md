---
title: Split Array Largest Sum
leetcode: split-array-largest-sum
description: "Split Array Largest Sum explained: cut an array into k consecutive pieces so the biggest piece sum is as small as possible, by binary searching the answer and checking it greedily, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given an array `nums` of non-negative integers and an integer `k` with `1 <= k <= len(nums)`. Cut the array into exactly `k` **non-empty, consecutive** pieces (you may not reorder elements). Each piece has a sum; the cut you choose has a "largest piece sum". Return the smallest largest piece sum that any valid cut can achieve.

In other words: among all ways to split the array into `k` contiguous parts, find the one whose heaviest part is as light as possible, and return that weight.

## Examples

- `nums = [7, 2, 5, 10, 8]`, `k = 2` → `18`. Cut as `[7, 2, 5]` and `[10, 8]`: the sums are 14 and 18. Every other cut has a heavier piece (`[7, 2, 5, 10] | [8]` gives 24, `[7, 2] | [5, 10, 8]` gives 23).
- `nums = [1, 2, 3, 4, 5]`, `k = 2` → `9`. `[1, 2, 3] | [4, 5]` gives sums 6 and 9.
- `nums = [1, 4, 4]`, `k = 3` → `4`. With three pieces every element stands alone, so the answer is the largest element.
- `nums = [5]`, `k = 1` → `5`. One piece means the whole array.

## Key idea

Instead of asking "what is the best cut?", ask the easier yes/no question "can the array be cut into at most `k` pieces so that no piece sums to more than `limit`?" That question has a greedy answer: walk left to right, keep adding to the current piece, and start a new piece only when adding the next number would push the piece over `limit`. If that produces at most `k` pieces, `limit` is achievable.

The yes/no answer is **monotonic**: if a limit works, every larger limit works too. The smallest possible limit is the largest single element (every element must fit in some piece) and the largest useful limit is the total sum (one piece). So we can binary search the answer between those two bounds, asking the greedy question at each step.

Fewer than `k` pieces is fine for the check because you can always cut a piece further without increasing any sum, as long as there are enough elements (which there are, since `k <= len(nums)`).

## Approach

1. Set `lo = max(nums)` and `hi = sum(nums)`.
2. While `lo < hi`:
   1. `mid = (lo + hi) / 2`.
   2. Run the greedy check: start with one piece whose sum is 0; for each number, if `sum + num > mid`, close the piece (count it) and start a new one holding just `num`; otherwise add `num` to the current piece. Count the final piece too.
   3. If the number of pieces is at most `k`, `mid` works, so move `hi = mid`. Otherwise `lo = mid + 1`.
3. Return `lo`, the smallest limit that passed the check.

A dynamic-programming solution (`dp[i][j]` = best answer for the first `i` numbers in `j` pieces) takes O(k · n²) time and gets too slow for large inputs. The binary search needs only O(n) per check.

## Complexity

- **Time:** O(n · log S), where `S` is the sum of the array: each binary-search step runs the O(n) greedy check, and there are about `log S` steps.
- **Space:** O(1) beyond the input.

## Common mistakes

- Starting the search at `lo = 0` instead of the largest element. The greedy check then "succeeds" with a piece that is already over the limit, or you must add extra code to reject such limits.
- Writing the greedy check with `>=` instead of `>`, which cuts one piece too early and can report a limit as impossible when it is fine.
- Using `hi = mid - 1` when the check passes. `mid` itself might be the answer, so keep it in the range.
- Forgetting to count the last piece, so the check is off by one.

## Follow-up questions

- The same "binary search on the answer plus a greedy feasibility check" pattern solves Koko Eating Bananas, Capacity To Ship Packages Within D Days and Minimum Number of Days to Make m Bouquets. Interviewers often ask you to spot the pattern.
- How would you also return the cut positions, not just the largest sum? (Re-run the greedy check with the final limit and record where each piece ends.)
- What changes if the numbers can be negative? (Piece sums are no longer monotonic in length, so the greedy check breaks; you need the DP.)

## Related problems

- [Koko Eating Bananas](/interview/problems/koko-eating-bananas/)
- Capacity To Ship Packages Within D Days
- Minimize Max Distance to Gas Station

## Solutions

```python
class Solution:
    def splitArray(self, nums: List[int], k: int) -> int:
        def pieces_needed(limit: int) -> int:
            count, current = 1, 0
            for num in nums:
                if current + num > limit:  # this number starts a new piece
                    count += 1
                    current = num
                else:
                    current += num
            return count

        lo, hi = max(nums), sum(nums)
        while lo < hi:
            mid = (lo + hi) // 2
            if pieces_needed(mid) <= k:
                hi = mid
            else:
                lo = mid + 1
        return lo
```

```java
class Solution {
    public int splitArray(int[] nums, int k) {
        int lo = 0, hi = 0;
        for (int num : nums) {
            lo = Math.max(lo, num);
            hi += num;
        }
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (piecesNeeded(nums, mid) <= k) {
                hi = mid;
            } else {
                lo = mid + 1;
            }
        }
        return lo;
    }

    private int piecesNeeded(int[] nums, int limit) {
        int count = 1, current = 0;
        for (int num : nums) {
            if (current + num > limit) { // this number starts a new piece
                count++;
                current = num;
            } else {
                current += num;
            }
        }
        return count;
    }
}
```

```cpp
class Solution {
    static int piecesNeeded(const vector<int>& nums, int limit) {
        int count = 1, current = 0;
        for (int num : nums) {
            if (current + num > limit) {  // this number starts a new piece
                count++;
                current = num;
            } else {
                current += num;
            }
        }
        return count;
    }

public:
    int splitArray(vector<int>& nums, int k) {
        int lo = *max_element(nums.begin(), nums.end());
        int hi = accumulate(nums.begin(), nums.end(), 0);
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (piecesNeeded(nums, mid) <= k) {
                hi = mid;
            } else {
                lo = mid + 1;
            }
        }
        return lo;
    }
};
```

```javascript
/**
 * @param {number[]} nums
 * @param {number} k
 * @return {number}
 */
var splitArray = function (nums, k) {
  const piecesNeeded = (limit) => {
    let count = 1;
    let current = 0;
    for (const num of nums) {
      if (current + num > limit) {
        // this number starts a new piece
        count++;
        current = num;
      } else {
        current += num;
      }
    }
    return count;
  };

  let lo = Math.max(...nums);
  let hi = nums.reduce((a, b) => a + b, 0);
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (piecesNeeded(mid) <= k) {
      hi = mid;
    } else {
      lo = mid + 1;
    }
  }
  return lo;
};
```

```go
func splitArray(nums []int, k int) int {
	piecesNeeded := func(limit int) int {
		count, current := 1, 0
		for _, num := range nums {
			if current+num > limit { // this number starts a new piece
				count++
				current = num
			} else {
				current += num
			}
		}
		return count
	}

	lo, hi := 0, 0
	for _, num := range nums {
		lo = max(lo, num)
		hi += num
	}
	for lo < hi {
		mid := (lo + hi) / 2
		if piecesNeeded(mid) <= k {
			hi = mid
		} else {
			lo = mid + 1
		}
	}
	return lo
}
```
