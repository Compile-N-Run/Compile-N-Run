---
title: Rotate Array
leetcode: rotate-array
description: "Rotate Array explained: shift every element k places to the right, wrapping around, in place with O(1) extra space using three reversals, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given an integer array `nums` and a non-negative integer `k`. Rotate the array to the **right** by `k` steps: every element moves `k` positions towards the end, and elements that fall off the end wrap around to the front.

Modify `nums` **in place** and return nothing; the array itself is checked afterwards. The array has at least one element, and `k` may be larger than the array's length. A good answer uses O(1) extra space.

## Examples

- `nums = [10, 20, 30, 40, 50]`, `k = 2` → `nums` becomes `[40, 50, 10, 20, 30]`. The last two elements wrap to the front.
- `nums = [1, 2, 3]`, `k = 4` → `[3, 1, 2]`. Rotating by 3 brings the array back to where it started, so 4 steps is the same as 1.
- `nums = [-5, 8]`, `k = 0` → `[-5, 8]`. Nothing moves.
- `nums = [9]`, `k = 7` → `[9]`.

## Key idea

After the rotation, the last `k` elements come first, followed by the first `n - k` elements, each block keeping its own order. Reversing the whole array puts the two blocks in the right places but leaves each block backwards; reversing each block again fixes them. For `[10, 20, 30, 40, 50]` with `k = 2`:

- reverse everything: `[50, 40, 30, 20, 10]`
- reverse the first `k = 2`: `[40, 50, 30, 20, 10]`
- reverse the remaining 3: `[40, 50, 10, 20, 30]`

Each reversal is a simple two-pointer swap, so no extra array is needed.

## Approach

1. Let `n` be the length and set `k = k % n`, since rotating by `n` changes nothing.
2. Reverse the whole array (indexes `0` to `n - 1`).
3. Reverse the first `k` elements (indexes `0` to `k - 1`).
4. Reverse the rest (indexes `k` to `n - 1`).

`reverse(lo, hi)` swaps `nums[lo]` with `nums[hi]` and moves both pointers inward until they meet.

Other options: copy into a new array with `result[(i + k) % n] = nums[i]` and copy back (O(n) extra space, but very clear), or rotate one step at a time `k` times (O(n·k) time, too slow when both are large).

## Complexity

- **Time:** O(n). Every element is swapped at most twice across the three reversals.
- **Space:** O(1). Only a few index variables.

## Common mistakes

- Forgetting `k % n`. With `k > n` the block boundaries fall outside the array.
- Doing the steps in the wrong order. Reversing the first `k` and the last `n - k` elements *before* reversing the whole array performs a left rotation by `k`, not a right one. For a right rotation, reverse the whole array first.
- Building a new array and assigning it to the parameter (`nums = result` in Python, Java or Go). That only rebinds the local name; the caller's array is unchanged. Copy the values back into `nums` (`nums[:] = result` in Python, `copy(nums, result)` in Go).
- Returning the array in languages where LeetCode expects nothing; the check is on the array itself.

## Follow-up questions

- Give three different solutions. (Extra array, three reversals, and cyclic replacements: start at index 0, move its value to `(i + k) % n`, carry the displaced value onward, and start a new cycle whenever you return to the starting index.)
- Rotate to the left instead. (A left rotation by `k` is a right rotation by `n - k`, or reverse the two blocks first and the whole array last.)
- Rotate a linked list by `k`. (Rotate List: connect the tail to the head, then cut the ring at the right place.)

## Related problems

- [Rotate Image](/interview/problems/rotate-image/): rotating a matrix in place, also built from simple reversals (transpose, then reverse each row).
- Rotate List: the same rotation on a linked list.
- Reverse Words in a String: the same reverse-the-whole-then-reverse-each-part trick on words.
- [Search in Rotated Sorted Array](/interview/problems/search-in-rotated-sorted-array/): searching an array that has already been rotated.

## Solutions

```python
class Solution:
    def rotate(self, nums: List[int], k: int) -> None:
        def reverse(lo: int, hi: int) -> None:
            while lo < hi:
                nums[lo], nums[hi] = nums[hi], nums[lo]
                lo, hi = lo + 1, hi - 1

        n = len(nums)
        k %= n
        reverse(0, n - 1)
        reverse(0, k - 1)
        reverse(k, n - 1)
```

```java
class Solution {
    public void rotate(int[] nums, int k) {
        int n = nums.length;
        k %= n;
        reverse(nums, 0, n - 1);
        reverse(nums, 0, k - 1);
        reverse(nums, k, n - 1);
    }

    private void reverse(int[] nums, int lo, int hi) {
        while (lo < hi) {
            int tmp = nums[lo];
            nums[lo++] = nums[hi];
            nums[hi--] = tmp;
        }
    }
}
```

```cpp
class Solution {
public:
    void rotate(vector<int>& nums, int k) {
        int n = nums.size();
        k %= n;
        reverse(nums.begin(), nums.end());
        reverse(nums.begin(), nums.begin() + k);
        reverse(nums.begin() + k, nums.end());
    }
};
```

```javascript
/**
 * @param {number[]} nums
 * @param {number} k
 * @return {void} Do not return anything, modify nums in-place instead.
 */
var rotate = function (nums, k) {
  const reverse = (lo, hi) => {
    while (lo < hi) {
      [nums[lo], nums[hi]] = [nums[hi], nums[lo]];
      lo++;
      hi--;
    }
  };
  const n = nums.length;
  k %= n;
  reverse(0, n - 1);
  reverse(0, k - 1);
  reverse(k, n - 1);
};
```

```go
func rotate(nums []int, k int) {
	n := len(nums)
	k %= n
	reverse(nums)
	reverse(nums[:k])
	reverse(nums[k:])
}

// reverse flips a slice in place; slices share the array, so this edits nums.
func reverse(a []int) {
	for lo, hi := 0, len(a)-1; lo < hi; lo, hi = lo+1, hi-1 {
		a[lo], a[hi] = a[hi], a[lo]
	}
}
```
