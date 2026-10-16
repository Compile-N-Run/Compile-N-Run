---
title: Remove Duplicates from Sorted Array
leetcode: remove-duplicates-from-sorted-array
description: "Remove Duplicates from Sorted Array explained: keep one copy of each value at the front of a sorted array in place with a slow write pointer and a fast read pointer, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given an array of integers `nums` sorted in non-decreasing order, so equal values sit next to each other. Rearrange it in place so that each distinct value appears exactly once at the front of the array, in the original (sorted) order. Then return `k`, the number of distinct values.

Only the first `k` positions matter: the checker reads `nums[0..k-1]` and ignores whatever is left after them. You must not allocate a second array; modify `nums` itself using O(1) extra memory. The array has at least one element.

## Examples

- `nums = [2, 2, 5, 7, 7, 7]` → returns `3`, and `nums` starts with `[2, 5, 7]`. The remaining three positions can hold anything.
- `nums = [-4, -4, -4]` → returns `1`, and `nums` starts with `[-4]`.
- `nums = [1, 3, 8]` → returns `3`. There are no duplicates, so the array is unchanged.
- `nums = [6]` → returns `1`.

## Key idea

Because the array is sorted, a value is new exactly when it differs from the last value we kept. So keep two pointers: a *write* pointer marking the end of the "kept" prefix, and a *read* pointer that scans every element. Whenever the read pointer finds a value different from the last kept one (`nums[write - 1]`), copy it to `nums[write]` and grow the prefix. Duplicates are simply skipped. The write pointer never passes the read pointer, so we never overwrite a value we still need to look at.

## Approach

1. The first element is always kept, so start with `write = 1`.
2. For each index `read` from `1` to `n - 1`:
   1. If `nums[read] != nums[write - 1]`, it is a new value: set `nums[write] = nums[read]` and increase `write` by one.
   2. Otherwise it repeats the last kept value; skip it.
3. Return `write`. Positions `0 .. write - 1` now hold every distinct value once, in order.

Walking through `[2, 2, 5, 7, 7, 7]`: the read pointer skips the second 2, copies 5 into position 1, copies 7 into position 2, and skips the last two 7s. The answer is `write = 3`.

A tempting alternative is to delete duplicates with `pop` or `splice`. Each deletion shifts every later element, so that is O(n²) in the worst case. Building a new list or a set is O(n) but breaks the in-place rule (and a set may lose the order).

## Complexity

- **Time:** O(n). Each element is read once.
- **Space:** O(1). Only two indexes are used.

## Common mistakes

- Comparing `nums[read]` with `nums[read - 1]` instead of the last kept value. That happens to work here because the array is sorted, but comparing with `nums[write - 1]` states the rule directly and extends to the "keep at most two copies" variant.
- Returning the array instead of the count `k`, or forgetting to actually move the values to the front.
- Starting `write` at 0 and reading `nums[write - 1]`, which is out of bounds.

## Follow-up questions

- What if each value may appear at most twice? (Compare with `nums[write - 2]` instead and start `write` at 2.)
- What if the array were not sorted? (You would need a hash set of seen values, which costs O(n) extra space.)

## Related problems

- [Move Zeroes](/interview/problems/move-zeroes/)
- [Merge Sorted Array](/interview/problems/merge-sorted-array/)
- Remove Duplicates from Sorted Array II
- Remove Element

## Solutions

```python
class Solution:
    def removeDuplicates(self, nums: List[int]) -> int:
        write = 1  # nums[0] is always kept
        for read in range(1, len(nums)):
            if nums[read] != nums[write - 1]:  # a value we have not kept yet
                nums[write] = nums[read]
                write += 1
        return write
```

```java
class Solution {
    public int removeDuplicates(int[] nums) {
        int write = 1; // nums[0] is always kept
        for (int read = 1; read < nums.length; read++) {
            if (nums[read] != nums[write - 1]) { // a value we have not kept yet
                nums[write++] = nums[read];
            }
        }
        return write;
    }
}
```

```cpp
class Solution {
public:
    int removeDuplicates(vector<int>& nums) {
        int write = 1;  // nums[0] is always kept
        for (int read = 1; read < (int)nums.size(); read++) {
            if (nums[read] != nums[write - 1]) {  // a value we have not kept yet
                nums[write++] = nums[read];
            }
        }
        return write;
    }
};
```

```javascript
/**
 * @param {number[]} nums
 * @return {number}
 */
var removeDuplicates = function (nums) {
  let write = 1; // nums[0] is always kept
  for (let read = 1; read < nums.length; read++) {
    if (nums[read] !== nums[write - 1]) { // a value we have not kept yet
      nums[write++] = nums[read];
    }
  }
  return write;
};
```

```go
func removeDuplicates(nums []int) int {
	write := 1 // nums[0] is always kept
	for read := 1; read < len(nums); read++ {
		if nums[read] != nums[write-1] { // a value we have not kept yet
			nums[write] = nums[read]
			write++
		}
	}
	return write
}
```
