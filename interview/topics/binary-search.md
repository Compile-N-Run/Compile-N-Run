---
title: Binary Search
topic: Binary Search
group: patterns
description: "Binary Search explained: halve a sorted range on every step to find a value or the first position where a condition flips, including the search-on-the-answer trick for optimisation problems."
---

## What it is

Binary search finds something in a sorted range by cutting the range in half over and over. You look at the middle element, decide which half the answer must be in, and throw the other half away. After about log₂(n) steps the range has one element left. For a million elements that is twenty steps instead of a million.

The classic version answers "is `target` in this sorted array, and where?". The version interviewers care about more is broader: the range does not have to hold sorted *values*, it has to hold a **condition that is false for a while and then true for the rest** (or the other way round). A sorted array is the special case where the condition is `nums[i] >= target`. Seen this way, binary search also answers "the smallest ship capacity that still works" or "the first bad version", where the array is implicit.

## When to use it

- The input is **sorted**, or rotated-sorted, or a matrix with sorted rows, and the problem asks for a value or position.
- The problem asks for the **first** or **last** index satisfying a condition, or an insert position, or the count of elements below a value.
- The problem asks for the **minimum value of x such that something is possible** (or the maximum such that it is still allowed), and you can write a cheap `feasible(x)` check. If a bigger x is always at least as feasible as a smaller one, you can binary search on x. This is "binary search on the answer".
- The required time is O(log n), or O(n log n) where an O(n) check runs inside a log-sized loop.
- You can see a "peak" or "valley" structure where the middle element tells you which side the target must be on, as in Find Peak Element.

## How it works

Use the "first index where the condition becomes true" version, with `nums = [1, 3, 3, 5, 8]` and the condition `nums[i] >= 4`. The condition reads `false, false, false, true, true`, and the answer is index 3.

1. Keep a range `[lo, hi)` that is guaranteed to contain the answer. Start with `lo = 0` and `hi = n` (n means "no index satisfies it", which is a valid answer too).
2. While `lo < hi`, compute `mid = lo + (hi - lo) / 2`, rounding down.
3. If the condition holds at `mid`, the answer is `mid` or something before it: set `hi = mid`. Keep `mid` inside the range because it might be the answer.
4. If it does not hold at `mid`, the answer is strictly after `mid`: set `lo = mid + 1`.
5. When `lo == hi`, that single index is the answer.

Trace:

| lo | hi | mid | nums[mid] >= 4? | next range |
| --- | --- | --- | --- | --- |
| 0 | 5 | 2 | 3 >= 4: no | lo = 3 |
| 3 | 5 | 4 | 8 >= 4: yes | hi = 4 |
| 3 | 4 | 3 | 5 >= 4: yes | hi = 3 |
| 3 | 3 | - | loop ends | answer 3 |

Checking "is `target` present?" is then a one-liner: find the first index with `nums[i] >= target` and see whether `nums[i] == target`. Finding the last occurrence is the first index with `nums[i] > target`, minus one.

## Template

The skeleton below returns the smallest index whose value is at least `target` (the "lower bound"). To reuse it, replace the condition with your own, keeping it in the false...false true...true shape. For search-on-the-answer, `lo` and `hi` become the smallest and largest possible answers and the condition becomes `feasible(mid)`.

```python
def first_true(nums, target):
    """Smallest index i with nums[i] >= target, or len(nums) if there is none. nums is sorted."""
    lo, hi = 0, len(nums)  # the answer is somewhere in [lo, hi]; hi means "no such index"
    while lo < hi:
        mid = lo + (hi - lo) // 2
        if nums[mid] >= target:  # problem-specific condition: false...false true...true
            hi = mid  # mid works, so look for an earlier one (mid stays a candidate)
        else:
            lo = mid + 1  # mid fails, so the answer is to the right of it
    return lo


print(first_true([1, 3, 3, 5, 8], 4))  # 3
print(first_true([1, 3, 3, 5, 8], 3))  # 1
print(first_true([1, 3, 3, 5, 8], 9))  # 5
```

```java
public class BinarySearch {
    // Smallest index i with nums[i] >= target, or nums.length if there is none. nums is sorted.
    static int firstTrue(int[] nums, int target) {
        int lo = 0, hi = nums.length; // the answer is somewhere in [lo, hi]
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (nums[mid] >= target) { // problem-specific condition: false...false true...true
                hi = mid;              // mid works, so look for an earlier one
            } else {
                lo = mid + 1;          // mid fails, so the answer is to the right of it
            }
        }
        return lo;
    }

    public static void main(String[] args) {
        int[] nums = {1, 3, 3, 5, 8};
        System.out.println(firstTrue(nums, 4)); // 3
        System.out.println(firstTrue(nums, 3)); // 1
        System.out.println(firstTrue(nums, 9)); // 5
    }
}
```

```cpp
#include <iostream>
#include <vector>

// Smallest index i with nums[i] >= target, or nums.size() if there is none. nums is sorted.
int firstTrue(const std::vector<int>& nums, int target) {
    int lo = 0, hi = (int)nums.size();  // the answer is somewhere in [lo, hi]
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (nums[mid] >= target) {  // problem-specific condition: false...false true...true
            hi = mid;               // mid works, so look for an earlier one
        } else {
            lo = mid + 1;           // mid fails, so the answer is to the right of it
        }
    }
    return lo;
}

int main() {
    std::vector<int> nums = {1, 3, 3, 5, 8};
    std::cout << firstTrue(nums, 4) << "\n";  // 3
    std::cout << firstTrue(nums, 3) << "\n";  // 1
    std::cout << firstTrue(nums, 9) << "\n";  // 5
    return 0;
}
```

```javascript
// Smallest index i with nums[i] >= target, or nums.length if there is none. nums is sorted.
function firstTrue(nums, target) {
  let lo = 0;
  let hi = nums.length; // the answer is somewhere in [lo, hi]
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (nums[mid] >= target) {
      // problem-specific condition: false...false true...true
      hi = mid; // mid works, so look for an earlier one
    } else {
      lo = mid + 1; // mid fails, so the answer is to the right of it
    }
  }
  return lo;
}

console.log(firstTrue([1, 3, 3, 5, 8], 4)); // 3
console.log(firstTrue([1, 3, 3, 5, 8], 3)); // 1
console.log(firstTrue([1, 3, 3, 5, 8], 9)); // 5
```

```go
package main

import "fmt"

// firstTrue returns the smallest index i with nums[i] >= target, or len(nums) if there is none.
// nums must be sorted.
func firstTrue(nums []int, target int) int {
	lo, hi := 0, len(nums) // the answer is somewhere in [lo, hi]
	for lo < hi {
		mid := lo + (hi-lo)/2
		if nums[mid] >= target { // problem-specific condition: false...false true...true
			hi = mid // mid works, so look for an earlier one
		} else {
			lo = mid + 1 // mid fails, so the answer is to the right of it
		}
	}
	return lo
}

func main() {
	nums := []int{1, 3, 3, 5, 8}
	fmt.Println(firstTrue(nums, 4)) // 3
	fmt.Println(firstTrue(nums, 3)) // 1
	fmt.Println(firstTrue(nums, 9)) // 5
}
```

## Variations

- **Exact match.** Run the template, then check `lo < n && nums[lo] == target`. Or use the textbook `while lo <= hi` loop that returns as soon as `nums[mid] == target`.
- **First and last position.** First index with `nums[i] >= target` and first index with `nums[i] > target`; the last position is the second result minus one.
- **Search on the answer.** The range is the set of candidate answers (say capacity from `max(weights)` to `sum(weights)`), the condition is `feasible(mid)`, and the check usually costs O(n) with a greedy scan. Koko Eating Bananas, Capacity To Ship Packages, Split Array Largest Sum.
- **Last true instead of first true.** When the condition is `true...true false...false` and you want the last true, either negate the condition and subtract one from the result, or mirror the loop (`lo = mid` with `mid` rounded up).
- **Rotated sorted array.** At every step one half of `[lo, hi]` is properly sorted; check whether the target lies inside that half to decide where to go.
- **Peak finding.** Compare `nums[mid]` with `nums[mid + 1]`: if the next element is bigger, a peak exists to the right, otherwise to the left (or at `mid`).

## Common mistakes

- Mixing up the two loop styles. `while lo < hi` with `hi = n` and `hi = mid` is one consistent set; `while lo <= hi` with `hi = n - 1` and `hi = mid - 1` is another. Taking one line from each is the usual cause of infinite loops or skipped answers.
- Setting `hi = mid - 1` in the first-true version, which can throw away the answer.
- Setting `lo = mid` with floor division, which loops forever when `hi - lo == 1`.
- A condition that is not monotonic. If the true/false pattern can flip more than once, binary search returns something, but not the answer.
- Computing `(lo + hi) / 2` in Java, C++ or Go on very large ranges, where the sum can overflow. `lo + (hi - lo) / 2` is safe.
- Searching on the answer with a wrong range: `lo` must be a value that could be the answer and `hi` must be a value you know is feasible (or one past the largest candidate, matching the `[lo, hi)` convention).

## Complexity

**O(log n)** comparisons for a range of n candidates. With search-on-the-answer the cost is **O(n log(range))**, where the O(n) is the feasibility check and the range is the gap between the smallest and largest candidate answer. Space is O(1).

## Where to start

1. 704. Binary Search: the plain version, to get the loop right once.
2. 35. Search Insert Position: the first-true template exactly.
3. [34. Find First and Last Position of Element in Sorted Array](/interview/problems/find-first-and-last-position-of-element-in-sorted-array/): two lower-bound searches with different conditions.
4. [162. Find Peak Element](/interview/problems/find-peak-element/): binary search where the condition comes from comparing neighbours.
5. [33. Search in Rotated Sorted Array](/interview/problems/search-in-rotated-sorted-array/): deciding which half is sorted on every step.
6. [875. Koko Eating Bananas](/interview/problems/koko-eating-bananas/): the first search-on-the-answer problem, with an easy feasibility check.
7. [1011. Capacity To Ship Packages Within D Days](/interview/problems/capacity-to-ship-packages-within-d-days/): search on the answer with a greedy packing check.
8. [410. Split Array Largest Sum](/interview/problems/split-array-largest-sum/): the same shape at Hard level, which also has a dynamic programming solution to compare against.
