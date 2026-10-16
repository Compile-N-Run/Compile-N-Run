---
title: Median of Two Sorted Arrays
leetcode: median-of-two-sorted-arrays
description: "Median of Two Sorted Arrays explained: find the median of two sorted arrays without merging them by binary searching a partition in O(log(min(m, n))), with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given two arrays of integers, `nums1` (length `m`) and `nums2` (length `n`), each already sorted in non-decreasing order. Return the median of all `m + n` numbers taken together, as a floating-point value.

The *median* is the middle value of the combined sorted list. If the combined length is even, there are two middle values and the median is their average.

One of the arrays may be empty, but not both. The intended solution runs in O(log(m + n)) time or better, so merging the arrays (which is O(m + n)) is not what interviewers are looking for.

## Examples

- `nums1 = [1, 4, 9]`, `nums2 = [2, 3]` → `3.0`. Combined: `[1, 2, 3, 4, 9]`; the middle of five values is the third one.
- `nums1 = [5, 8]`, `nums2 = [1, 2, 10, 12]` → `6.5`. Combined: `[1, 2, 5, 8, 10, 12]`; the two middle values are 5 and 8.
- `nums1 = []`, `nums2 = [7]` → `7.0`. Only one number in total.
- `nums1 = [2, 2]`, `nums2 = [2, 2]` → `2.0`. Duplicates across arrays are fine.

## Key idea

The median splits the combined sorted list into a **left half** and a **right half** of equal size (the left half gets the extra element when the total is odd), where everything on the left is less than or equal to everything on the right.

We never need to build that list. Suppose the left half takes the first `i` elements of `nums1` and the first `j` elements of `nums2`. Because the left half must have a fixed size `half = (m + n + 1) / 2`, choosing `i` forces `j = half - i`. So the whole problem reduces to picking one number, `i`, and we can binary search for it.

For a candidate `i`, look at the four values around the two cut points:

```
nums1:  ... A[i-1] | A[i] ...
nums2:  ... B[j-1] | B[j] ...
```

Each array is sorted, so `A[i-1] <= A[i]` and `B[j-1] <= B[j]` hold automatically. The split is correct exactly when the cross conditions also hold: `A[i-1] <= B[j]` and `B[j-1] <= A[i]`. If `A[i-1] > B[j]`, we took too many from `nums1`, so move `i` left. If `B[j-1] > A[i]`, we took too few, so move `i` right. A missing neighbour (a cut at the very start or end of an array) counts as minus or plus infinity.

Once the split is right, the median is the largest value on the left (odd total), or the average of the largest left value and the smallest right value (even total).

## Approach

1. Make sure `nums1` is the shorter array (swap them if not). We binary search over its cut, so the search range is small and `j` can never go negative or past the end of `nums2`.
2. Let `m = len(nums1)`, `n = len(nums2)`, `half = (m + n + 1) / 2` (integer division). Search `i` in the range `lo = 0` to `hi = m`.
3. While `lo <= hi`:
   1. `i = (lo + hi) / 2`, `j = half - i`.
   2. `leftA = nums1[i-1]` if `i > 0` else minus infinity; `rightA = nums1[i]` if `i < m` else plus infinity. Same for `leftB` and `rightB` with `j` and `nums2`.
   3. If `leftA <= rightB` and `leftB <= rightA`, the split is correct:
      - odd total: return `max(leftA, leftB)`;
      - even total: return `(max(leftA, leftB) + min(rightA, rightB)) / 2`.
   4. Else if `leftA > rightB`: too many from `nums1`, set `hi = i - 1`.
   5. Else: too few from `nums1`, set `lo = i + 1`.
4. A correct split always exists, so the loop always returns.

Walking through example 2: `nums1 = [5, 8]` (shorter), `nums2 = [1, 2, 10, 12]`, `half = 3`. Try `i = 1`, `j = 2`: left side `5 | 1, 2`, right side `8 | 10, 12`. Check `5 <= 10` and `2 <= 8`: correct. Even total, so the median is `(max(5, 2) + min(8, 10)) / 2 = 6.5`.

The simple alternative merges the two arrays like merge sort and picks the middle, in O(m + n) time. It is a fine first answer to mention, and it is what you would write if the arrays were small.

## Complexity

- **Time:** O(log(min(m, n))). The binary search runs over the cut positions of the shorter array, halving the range each step, and every step does constant work.
- **Space:** O(1). Only a few indexes and boundary values are stored.

## Common mistakes

- Binary searching over the longer array. Then `j = half - i` can become negative or larger than `n`, and you index out of bounds.
- Forgetting the infinity sentinels when a cut sits at the start or end of an array (for example when one array is empty, or every element of `nums1` belongs to the right half).
- Integer division where a real division is needed: in Java, C++ and Go, `(a + b) / 2` on integers drops the `.5`. Divide by `2.0`.
- Getting `half` wrong. With `(m + n + 1) / 2` the left half holds the extra element for odd totals, so the odd answer is always the maximum of the left side.

## Follow-up questions

- How would you find the k-th smallest element of the two arrays? (The same idea, or discard `k/2` elements from one array per step.)
- What if the arrays did not fit in memory? (Stream them and merge until the middle position, or binary search on the value range.)

## Related problems

- Find Median from Data Stream
- Kth Smallest Element in a Sorted Matrix
- Merge Sorted Array

## Solutions

```python
class Solution:
    def findMedianSortedArrays(self, nums1: List[int], nums2: List[int]) -> float:
        if len(nums1) > len(nums2):
            nums1, nums2 = nums2, nums1  # binary search the shorter array
        m, n = len(nums1), len(nums2)
        half = (m + n + 1) // 2
        lo, hi = 0, m
        while lo <= hi:
            i = (lo + hi) // 2  # elements of nums1 in the left half
            j = half - i        # elements of nums2 in the left half
            left_a = nums1[i - 1] if i > 0 else float('-inf')
            right_a = nums1[i] if i < m else float('inf')
            left_b = nums2[j - 1] if j > 0 else float('-inf')
            right_b = nums2[j] if j < n else float('inf')
            if left_a <= right_b and left_b <= right_a:
                if (m + n) % 2 == 1:
                    return float(max(left_a, left_b))
                return (max(left_a, left_b) + min(right_a, right_b)) / 2
            if left_a > right_b:
                hi = i - 1  # too many from nums1
            else:
                lo = i + 1  # too few from nums1
        return 0.0  # unreachable for valid input
```

```java
class Solution {
    public double findMedianSortedArrays(int[] nums1, int[] nums2) {
        if (nums1.length > nums2.length) {
            return findMedianSortedArrays(nums2, nums1); // binary search the shorter array
        }
        int m = nums1.length, n = nums2.length;
        int half = (m + n + 1) / 2;
        int lo = 0, hi = m;
        while (lo <= hi) {
            int i = (lo + hi) / 2; // elements of nums1 in the left half
            int j = half - i;      // elements of nums2 in the left half
            int leftA = i > 0 ? nums1[i - 1] : Integer.MIN_VALUE;
            int rightA = i < m ? nums1[i] : Integer.MAX_VALUE;
            int leftB = j > 0 ? nums2[j - 1] : Integer.MIN_VALUE;
            int rightB = j < n ? nums2[j] : Integer.MAX_VALUE;
            if (leftA <= rightB && leftB <= rightA) {
                if ((m + n) % 2 == 1) {
                    return Math.max(leftA, leftB);
                }
                return ((long) Math.max(leftA, leftB) + Math.min(rightA, rightB)) / 2.0;
            } else if (leftA > rightB) {
                hi = i - 1; // too many from nums1
            } else {
                lo = i + 1; // too few from nums1
            }
        }
        return 0.0; // unreachable for valid input
    }
}
```

```cpp
class Solution {
public:
    double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {
        if (nums1.size() > nums2.size()) {
            return findMedianSortedArrays(nums2, nums1);  // binary search the shorter array
        }
        int m = nums1.size(), n = nums2.size();
        int half = (m + n + 1) / 2;
        int lo = 0, hi = m;
        while (lo <= hi) {
            int i = (lo + hi) / 2;  // elements of nums1 in the left half
            int j = half - i;       // elements of nums2 in the left half
            int leftA = i > 0 ? nums1[i - 1] : INT_MIN;
            int rightA = i < m ? nums1[i] : INT_MAX;
            int leftB = j > 0 ? nums2[j - 1] : INT_MIN;
            int rightB = j < n ? nums2[j] : INT_MAX;
            if (leftA <= rightB && leftB <= rightA) {
                if ((m + n) % 2 == 1) {
                    return max(leftA, leftB);
                }
                return ((long long)max(leftA, leftB) + min(rightA, rightB)) / 2.0;
            } else if (leftA > rightB) {
                hi = i - 1;  // too many from nums1
            } else {
                lo = i + 1;  // too few from nums1
            }
        }
        return 0.0;  // unreachable for valid input
    }
};
```

```javascript
/**
 * @param {number[]} nums1
 * @param {number[]} nums2
 * @return {number}
 */
var findMedianSortedArrays = function (nums1, nums2) {
  if (nums1.length > nums2.length) {
    return findMedianSortedArrays(nums2, nums1); // binary search the shorter array
  }
  const m = nums1.length, n = nums2.length;
  const half = Math.floor((m + n + 1) / 2);
  let lo = 0, hi = m;
  while (lo <= hi) {
    const i = Math.floor((lo + hi) / 2); // elements of nums1 in the left half
    const j = half - i;                  // elements of nums2 in the left half
    const leftA = i > 0 ? nums1[i - 1] : -Infinity;
    const rightA = i < m ? nums1[i] : Infinity;
    const leftB = j > 0 ? nums2[j - 1] : -Infinity;
    const rightB = j < n ? nums2[j] : Infinity;
    if (leftA <= rightB && leftB <= rightA) {
      if ((m + n) % 2 === 1) {
        return Math.max(leftA, leftB);
      }
      return (Math.max(leftA, leftB) + Math.min(rightA, rightB)) / 2;
    } else if (leftA > rightB) {
      hi = i - 1; // too many from nums1
    } else {
      lo = i + 1; // too few from nums1
    }
  }
  return 0; // unreachable for valid input
};
```

```go
import "math"

func findMedianSortedArrays(nums1 []int, nums2 []int) float64 {
	if len(nums1) > len(nums2) {
		nums1, nums2 = nums2, nums1 // binary search the shorter array
	}
	m, n := len(nums1), len(nums2)
	half := (m + n + 1) / 2
	lo, hi := 0, m
	for lo <= hi {
		i := (lo + hi) / 2 // elements of nums1 in the left half
		j := half - i      // elements of nums2 in the left half
		leftA, rightA := math.MinInt, math.MaxInt
		leftB, rightB := math.MinInt, math.MaxInt
		if i > 0 {
			leftA = nums1[i-1]
		}
		if i < m {
			rightA = nums1[i]
		}
		if j > 0 {
			leftB = nums2[j-1]
		}
		if j < n {
			rightB = nums2[j]
		}
		if leftA <= rightB && leftB <= rightA {
			if (m+n)%2 == 1 {
				return float64(max(leftA, leftB))
			}
			return float64(max(leftA, leftB)+min(rightA, rightB)) / 2
		} else if leftA > rightB {
			hi = i - 1 // too many from nums1
		} else {
			lo = i + 1 // too few from nums1
		}
	}
	return 0 // unreachable for valid input
}
```
