---
title: Move Zeroes
leetcode: move-zeroes
description: "Move Zeroes explained: shift every zero to the end of an array in place while keeping the other numbers in order, using a read pointer and a write pointer, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given an array of integers `nums`. Rearrange it so that every `0` ends up at the end of the array, while the non-zero numbers keep the order they had originally.

The change must be made in place: modify `nums` itself without copying it into a second array. The function returns nothing; the test looks at `nums` afterwards. The array has at least one element.

## Examples

- `nums = [4, 0, 5, 0, 0, 9]` → `nums` becomes `[4, 5, 9, 0, 0, 0]`. The non-zero values 4, 5, 9 stay in their original order.
- `nums = [0, 0, 7]` → `[7, 0, 0]`.
- `nums = [-3, 2]` → `[-3, 2]`. There are no zeros, so nothing moves.
- `nums = [0]` → `[0]`.

## Key idea

Think of the array as having a "finished" part at the front that holds only non-zero numbers, in order. Keep a *write* pointer at the end of that part. Scan the array with a *read* pointer; every time you meet a non-zero number, swap it into the write position and move the write pointer forward. The zeros get pushed backwards by the swaps, and since non-zero values are placed in the order you meet them, their relative order is preserved.

## Approach

1. Set `write = 0`. Everything before `write` is non-zero and already in its final place.
2. For each index `read` from `0` to `n - 1`:
   1. If `nums[read]` is not zero, swap `nums[read]` and `nums[write]`, then increase `write` by one.
   2. If it is zero, do nothing; it will be swapped backwards later (or it is already at the end).
3. When the loop ends, positions `0 .. write - 1` hold the non-zero values in order and the rest are zeros.

A simpler two-pass variant copies every non-zero value forward (`nums[write++] = nums[read]`) and then fills the remaining positions with zeros. Both are O(n). Using a second array is easy too, but it breaks the in-place requirement.

## Complexity

- **Time:** O(n). The read pointer visits each element once and each swap is O(1).
- **Space:** O(1). Only two index variables are used.

## Common mistakes

- Removing zeros with a library call inside the loop (`remove`, `splice`, `pop(i)`): each removal shifts the rest of the array, which makes the solution O(n²), and changing an array while iterating over it skips elements.
- Returning a new array instead of modifying `nums`. The caller only sees the original array.
- Sorting the array: that moves the zeros but destroys the original order of the other numbers.

## Follow-up questions

- Can you minimise the number of writes? The swap version writes only when a non-zero value has to move; the copy-and-fill version always rewrites the tail.
- How would you move every occurrence of an arbitrary value `x` instead of `0`? Same algorithm, with `!= x` as the test.

## Related problems

- Remove Element and Remove Duplicates from Sorted Array use the same read/write pointer pattern.

## Solutions

```python
class Solution:
    def moveZeroes(self, nums: List[int]) -> None:
        write = 0  # next position for a non-zero value
        for read in range(len(nums)):
            if nums[read] != 0:
                nums[write], nums[read] = nums[read], nums[write]
                write += 1
```

```java
class Solution {
    public void moveZeroes(int[] nums) {
        int write = 0; // next position for a non-zero value
        for (int read = 0; read < nums.length; read++) {
            if (nums[read] != 0) {
                int tmp = nums[write];
                nums[write] = nums[read];
                nums[read] = tmp;
                write++;
            }
        }
    }
}
```

```cpp
class Solution {
public:
    void moveZeroes(vector<int>& nums) {
        int write = 0;  // next position for a non-zero value
        for (int read = 0; read < (int)nums.size(); read++) {
            if (nums[read] != 0) {
                swap(nums[write], nums[read]);
                write++;
            }
        }
    }
};
```

```javascript
/**
 * @param {number[]} nums
 * @return {void} Do not return anything, modify nums in-place instead.
 */
var moveZeroes = function (nums) {
  let write = 0; // next position for a non-zero value
  for (let read = 0; read < nums.length; read++) {
    if (nums[read] !== 0) {
      [nums[write], nums[read]] = [nums[read], nums[write]];
      write++;
    }
  }
};
```

```go
func moveZeroes(nums []int) {
	write := 0 // next position for a non-zero value
	for read := range nums {
		if nums[read] != 0 {
			nums[write], nums[read] = nums[read], nums[write]
			write++
		}
	}
}
```
