---
title: Longest Increasing Subsequence
leetcode: longest-increasing-subsequence
description: "Longest Increasing Subsequence explained: find the length of the longest strictly increasing subsequence with the O(n log n) patience-sorting and binary-search method, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given an array of integers `nums`. A *subsequence* is what remains after deleting any number of elements (possibly none) without changing the order of the rest. Return the length of the longest subsequence whose values are **strictly** increasing.

The array has at least one element, and values may be negative or repeated.

## Examples

- `nums = [4, 1, 6, 2, 7, 3, 8]` → `4`. For example `1, 2, 3, 8` or `1, 6, 7, 8`. No five values are in increasing order.
- `nums = [5, 5, 5]` → `1`. Equal values do not count as increasing, so only one 5 can be used.
- `nums = [9, 7, 4, 2]` → `1`. The array only goes down; any single element is a valid subsequence.
- `nums = [-3, 10, -1, 0, 2]` → `4`, from `-3, -1, 0, 2`. Skipping the 10 pays off.

## Key idea

Keep an array `tails` where `tails[k]` is the **smallest possible last value** of an increasing subsequence of length `k + 1` seen so far. A small tail is better than a large one, because more future numbers can extend it.

`tails` is always sorted, so for each new number `x` a binary search finds the first tail that is `>= x`:

- If there is none, `x` is larger than every tail and extends the longest subsequence: append it.
- Otherwise replace that tail with `x`. The subsequence of that length can now end with a smaller value.

The length of `tails` at the end is the answer. (The values in `tails` are not necessarily a real subsequence; only the length is meaningful.) This is the same as the card game *patience*: each tail is the top card of a pile, and the number of piles is the answer.

## Approach

1. Start with an empty list `tails`.
2. For each `x` in `nums`:
   1. Binary-search the leftmost index `i` with `tails[i] >= x` (a "lower bound").
   2. If `i == len(tails)`, append `x`; otherwise set `tails[i] = x`.
3. Return `len(tails)`.

Searching for `>= x` (not `> x`) is what makes the subsequence strictly increasing: an equal value replaces the tail instead of extending it.

The classic dynamic-programming solution is also worth knowing: `dp[i]` is the length of the longest increasing subsequence that ends at `i`, computed as `1 + max(dp[j])` over all `j < i` with `nums[j] < nums[i]`. It is easier to explain but takes O(n²) time, which interviewers usually ask you to improve.

## Complexity

- **Time:** O(n log n). One binary search over at most `n` tails per element.
- **Space:** O(n) for `tails` in the worst case (a fully increasing array).

## Common mistakes

- Using an upper bound (first tail `> x`): duplicates then extend the list and `[5, 5, 5]` returns 3.
- Returning `tails` as the subsequence itself. It can mix values from different subsequences; rebuilding the real sequence needs parent pointers.
- Initialising the O(n²) DP with 0 instead of 1: every element alone is a subsequence of length 1.

## Follow-up questions

- *Print one longest subsequence.* Store, for each element, the index of the element before it (the tail at position `i - 1` when it was placed) and walk back from the last pile.
- *Count how many longest subsequences there are.* That is Number of Longest Increasing Subsequence, solved with an O(n²) DP that keeps a count next to each length.
- *Non-decreasing instead of strictly increasing?* Switch the binary search to the first tail `> x`.

## Related problems

- Russian Doll Envelopes: sort by one dimension, then run this LIS on the other.
- Increasing Triplet Subsequence: the same idea with only two tails.
- [Coin Change](/interview/problems/coin-change/) and [House Robber](/interview/problems/house-robber/): more one-dimensional DP practice.

## Solutions

```python
class Solution:
    def lengthOfLIS(self, nums: List[int]) -> int:
        tails = []  # tails[k] = smallest end of an increasing subsequence of length k + 1
        for x in nums:
            i = bisect.bisect_left(tails, x)  # first tail >= x
            if i == len(tails):
                tails.append(x)
            else:
                tails[i] = x
        return len(tails)
```

```java
class Solution {
    public int lengthOfLIS(int[] nums) {
        int[] tails = new int[nums.length]; // tails[k] = smallest end of a subsequence of length k + 1
        int size = 0;
        for (int x : nums) {
            int lo = 0, hi = size; // find the first tail >= x in tails[0..size)
            while (lo < hi) {
                int mid = (lo + hi) >>> 1;
                if (tails[mid] < x) lo = mid + 1;
                else hi = mid;
            }
            tails[lo] = x;
            if (lo == size) size++;
        }
        return size;
    }
}
```

```cpp
class Solution {
public:
    int lengthOfLIS(vector<int>& nums) {
        vector<int> tails;  // tails[k] = smallest end of a subsequence of length k + 1
        for (int x : nums) {
            auto it = lower_bound(tails.begin(), tails.end(), x);  // first tail >= x
            if (it == tails.end()) tails.push_back(x);
            else *it = x;
        }
        return (int)tails.size();
    }
};
```

```javascript
/**
 * @param {number[]} nums
 * @return {number}
 */
var lengthOfLIS = function (nums) {
  const tails = []; // tails[k] = smallest end of a subsequence of length k + 1
  for (const x of nums) {
    let lo = 0, hi = tails.length; // find the first tail >= x
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (tails[mid] < x) lo = mid + 1;
      else hi = mid;
    }
    tails[lo] = x; // appends when lo === tails.length
  }
  return tails.length;
};
```

```go
import "sort"

func lengthOfLIS(nums []int) int {
	tails := []int{} // tails[k] = smallest end of a subsequence of length k + 1
	for _, x := range nums {
		i := sort.SearchInts(tails, x) // first tail >= x
		if i == len(tails) {
			tails = append(tails, x)
		} else {
			tails[i] = x
		}
	}
	return len(tails)
}
```
