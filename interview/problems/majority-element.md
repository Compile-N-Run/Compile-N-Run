---
title: Majority Element
leetcode: majority-element
description: "Majority Element explained: find the value that fills more than half of an array in one pass and constant memory with the Boyer-Moore voting algorithm, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given a non-empty array of integers `nums` of length `n`. One value appears **more than `n / 2` times** (strictly more than half of the positions). Return that value.

The array is guaranteed to contain such a majority value. Values can be negative and can be as large as about one billion in absolute value.

## Examples

- `nums = [2, 7, 2]` → `2`: it fills 2 of the 3 positions.
- `nums = [5]` → `5`: a single element is always the majority.
- `nums = [-1, -1, 4, 4, -1]` → `-1`: three of five positions.
- `nums = [3, 3, 8, 8, 3, 8, 8]` → `8`: four of seven positions, even though the array starts with 3s.

## Key idea

Imagine every majority element and every other element pairing off and cancelling each other out. Because the majority value has more copies than all other values combined, some of its copies are always left standing at the end. The **Boyer-Moore voting algorithm** does this cancelling in one pass with just two variables: a `candidate` and a `count`. A matching element adds a vote, a different element removes one, and when the count drops to zero the next element becomes the new candidate. Whatever survives at the end is the majority.

## Approach

1. Set `count = 0` (the value of `candidate` does not matter yet).
2. For each value `x` in `nums`:
   1. If `count == 0`, make `x` the new `candidate`.
   2. If `x == candidate`, increase `count`; otherwise decrease it.
3. Return `candidate`.

Why it works: every time `count` returns to 0, the prefix processed so far splits into pairs of different values, so at most half of it is the majority value. The majority must therefore still be the majority of what is left, and the same argument repeats until the end.

Simpler options are worth mentioning first in an interview: count every value in a hash map and return the one above `n / 2` (O(n) time, O(n) space), or sort and return the middle element `nums[n / 2]` (O(n log n) time). Boyer-Moore improves the memory to O(1).

## Complexity

- **Time:** O(n), one pass over the array.
- **Space:** O(1), just the candidate and the counter.

## Common mistakes

- Resetting the candidate when the count is zero *after* processing the current element instead of before, which skips an element.
- Using Boyer-Moore when a majority is *not* guaranteed. The survivor is then only a candidate and needs a second counting pass to confirm it.
- Returning the most frequent value with "at least half" logic: the majority must be strictly more than half.

## Follow-up questions

- What if no majority is guaranteed? Run a second pass that counts the candidate and checks `count > n / 2`.
- Find every value that appears more than `n / 3` times (Majority Element II). There can be at most two, so keep two candidates and two counters, then verify both.

## Related problems

- Majority Element II
- [Valid Anagram](/interview/problems/valid-anagram/) (the hash-map counting approach in another setting)

## Solutions

```python
class Solution:
    def majorityElement(self, nums: List[int]) -> int:
        candidate, count = 0, 0
        for x in nums:
            if count == 0:
                candidate = x
            count += 1 if x == candidate else -1
        return candidate
```

```java
class Solution {
    public int majorityElement(int[] nums) {
        int candidate = 0, count = 0;
        for (int x : nums) {
            if (count == 0) candidate = x;
            count += x == candidate ? 1 : -1;
        }
        return candidate;
    }
}
```

```cpp
class Solution {
public:
    int majorityElement(vector<int>& nums) {
        int candidate = 0, count = 0;
        for (int x : nums) {
            if (count == 0) candidate = x;
            count += x == candidate ? 1 : -1;
        }
        return candidate;
    }
};
```

```javascript
/**
 * @param {number[]} nums
 * @return {number}
 */
var majorityElement = function (nums) {
  let candidate = 0, count = 0;
  for (const x of nums) {
    if (count === 0) candidate = x;
    count += x === candidate ? 1 : -1;
  }
  return candidate;
};
```

```go
func majorityElement(nums []int) int {
	candidate, count := 0, 0
	for _, x := range nums {
		if count == 0 {
			candidate = x
		}
		if x == candidate {
			count++
		} else {
			count--
		}
	}
	return candidate
}
```
