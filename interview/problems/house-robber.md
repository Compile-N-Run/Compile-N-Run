---
title: House Robber
leetcode: house-robber
description: "House Robber explained: pick non-adjacent array values with the largest total using one-pass dynamic programming with two variables, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

A row of houses is described by an array `nums`, where `nums[i]` is the amount of money in house `i`. You want to collect as much money as possible, but you may never take from two houses that are next to each other (their alarms are linked).

Return the largest total you can collect. The array has at least one house, and every amount is zero or positive.

## Examples

- `nums = [3, 10, 3, 1, 8]` → `18`. Take houses 1 and 4: `10 + 8`.
- `nums = [6, 1, 1, 6]` → `12`. Take the first and the last house; they are not neighbours.
- `nums = [4, 1, 2, 7, 5, 3, 1]` → `14`. Take houses 0, 3 and 5: `4 + 7 + 3`.
- `nums = [9]` → `9`.

## Key idea

Look at the houses from left to right and ask, for each house, "what is the best total using only the houses up to here?". For house `i` there are only two choices:

- **Skip it.** The best total is the same as for the houses up to `i - 1`.
- **Take it.** Then house `i - 1` is off limits, so the total is `nums[i]` plus the best total up to `i - 2`.

So `best(i) = max(best(i - 1), best(i - 2) + nums[i])`. This is *dynamic programming*: each answer is built from two smaller answers already computed. Since only the last two values are ever needed, two variables replace the whole table.

## Approach

1. Keep two numbers: `prev2` (best total up to two houses back) and `prev1` (best total up to the previous house). Both start at `0`, meaning "no houses yet".
2. For each amount `x` in `nums`:
   1. Compute `current = max(prev1, prev2 + x)`.
   2. Shift: `prev2 = prev1`, then `prev1 = current`.
3. Return `prev1`.

Trying every subset of houses and keeping the valid ones takes O(2^n) time. Plain recursion on the formula above without remembering results is just as slow, because the same subproblems are solved again and again.

## Complexity

- **Time:** O(n). One pass with constant work per house.
- **Space:** O(1). Only two running totals are kept.

## Common mistakes

- Greedily taking every other house (all even or all odd positions). `[6, 1, 1, 6]` shows why that fails: the best pick skips two houses in a row.
- Mixing up the update order: overwriting `prev2` before using it in `current` gives wrong totals.
- Special-casing arrays of length 1 or 2 with off-by-one bugs. Starting both variables at `0` handles them without extra code.

## Follow-up questions

- The houses stand in a circle, so the first and last are neighbours (House Robber II): run the same pass twice, once without the first house and once without the last, and take the larger result.
- Return which houses to take: keep the full table and walk back from the end.
- The houses form a binary tree (House Robber III): for each node return the best total with and without taking it.

## Related problems

- House Robber II
- House Robber III
- Climbing Stairs
- Delete and Earn

## Solutions

```python
class Solution:
    def rob(self, nums: List[int]) -> int:
        prev2, prev1 = 0, 0  # best totals up to two houses back and one house back
        for x in nums:
            prev2, prev1 = prev1, max(prev1, prev2 + x)
        return prev1
```

```java
class Solution {
    public int rob(int[] nums) {
        int prev2 = 0, prev1 = 0; // best totals up to two houses back and one house back
        for (int x : nums) {
            int current = Math.max(prev1, prev2 + x);
            prev2 = prev1;
            prev1 = current;
        }
        return prev1;
    }
}
```

```cpp
class Solution {
public:
    int rob(vector<int>& nums) {
        int prev2 = 0, prev1 = 0;  // best totals up to two houses back and one house back
        for (int x : nums) {
            int current = max(prev1, prev2 + x);
            prev2 = prev1;
            prev1 = current;
        }
        return prev1;
    }
};
```

```javascript
/**
 * @param {number[]} nums
 * @return {number}
 */
var rob = function (nums) {
  let prev2 = 0; // best total up to two houses back
  let prev1 = 0; // best total up to the previous house
  for (const x of nums) {
    const current = Math.max(prev1, prev2 + x);
    prev2 = prev1;
    prev1 = current;
  }
  return prev1;
};
```

```go
func rob(nums []int) int {
	prev2, prev1 := 0, 0 // best totals up to two houses back and one house back
	for _, x := range nums {
		prev2, prev1 = prev1, max(prev1, prev2+x)
	}
	return prev1
}
```
