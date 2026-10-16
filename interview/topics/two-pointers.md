---
title: Two Pointers
topic: Two Pointers
group: patterns
description: "Two Pointers explained: walk an array or list with two indices that move toward each other or at different speeds, turning many nested-loop problems into a single pass."
---

## What it is

Two pointers is a way of scanning a sequence with two indices instead of one. Each index marks a position in the array, string or linked list, and the algorithm moves one of them on every step based on what it sees. The trick is that every move throws away a whole set of candidates at once, so you never go back and never check the same pair twice.

The most common shape is **opposite ends**: one pointer starts at the left edge, the other at the right edge, and they walk toward each other until they meet. Another shape is **fast and slow**: both start at the beginning and one moves faster, which is how you find the middle of a linked list or detect a cycle. A third shape is **reader and writer**: the reader scans every element while the writer marks where the next kept element should go, which is how you remove duplicates from an array in place.

In all three, the thing to understand is the *invariant*: a sentence that stays true after every move, such as "no pair to the left of `left` can be the answer". Once you can state the invariant, the loop almost writes itself.

## When to use it

- The input is **sorted**, or you are allowed to sort it, and the problem asks about pairs or triples (sum equals, closest to, less than a target).
- The problem asks you to **modify an array in place** with O(1) extra space: remove, compact, partition, reverse, move zeroes.
- You need to check something from **both ends** of a string or array at the same time, like whether it is a palindrome.
- It is a **linked list** question about the middle, the k-th node from the end, or whether there is a cycle, and you may not store the nodes.
- A brute-force solution would compare every element with every other element, and the comparison has a direction: if the result is "too small", only one of the two indices could sensibly change.

## How it works

Take the opposite-ends version on a sorted array: find two numbers that add up to `target`.

1. Put `left` at index 0 and `right` at the last index.
2. Look at `nums[left] + nums[right]`.
3. If it equals the target, you are done.
4. If it is too small, the only way to make it bigger is to move `left` one step right, because every value to the left of `right` paired with `nums[left]` is at most as big as the current sum.
5. If it is too big, move `right` one step left for the same reason in mirror.
6. Stop when the pointers meet: every pair has been ruled in or out.

Trace it on `nums = [1, 3, 4, 6, 9]`, `target = 10`:

| left | right | sum | move |
| --- | --- | --- | --- |
| 0 (1) | 4 (9) | 10 | found: indices 0 and 4 |

That was quick, so try `target = 7`:

| left | right | sum | move |
| --- | --- | --- | --- |
| 0 (1) | 4 (9) | 10 | too big, `right` to 3 |
| 0 (1) | 3 (6) | 7 | found: indices 0 and 3 |

And `target = 100`: the sum is always too small, `left` walks all the way to `right`, and the loop ends with no answer. Each element was visited at most once by each pointer, so the whole search is O(n) rather than the O(n²) of checking every pair.

## Template

The skeleton below searches a sorted array for two values that add up to a target. Replace the comparison and the two "move" rules with the problem's own version; the loop structure stays the same.

```python
def pair_with_sum(nums, target):
    """nums is sorted ascending. Return indices of two values adding to target, or None."""
    left, right = 0, len(nums) - 1
    while left < right:
        total = nums[left] + nums[right]  # problem-specific: what you measure at (left, right)
        if total == target:
            return [left, right]
        if total < target:
            left += 1  # too small: only a bigger left value can help
        else:
            right -= 1  # too big: only a smaller right value can help
    return None


print(pair_with_sum([1, 3, 4, 6, 9], 7))  # [0, 3]
print(pair_with_sum([1, 3, 4, 6, 9], 100))  # None
```

```java
import java.util.Arrays;

public class TwoPointers {
    // nums is sorted ascending. Return indices of two values adding to target, or null.
    static int[] pairWithSum(int[] nums, int target) {
        int left = 0, right = nums.length - 1;
        while (left < right) {
            int total = nums[left] + nums[right]; // problem-specific: what you measure
            if (total == target) return new int[] {left, right};
            if (total < target) left++;  // too small: only a bigger left value can help
            else right--;                // too big: only a smaller right value can help
        }
        return null;
    }

    public static void main(String[] args) {
        System.out.println(Arrays.toString(pairWithSum(new int[] {1, 3, 4, 6, 9}, 7)));   // [0, 3]
        System.out.println(Arrays.toString(pairWithSum(new int[] {1, 3, 4, 6, 9}, 100))); // null
    }
}
```

```cpp
#include <iostream>
#include <vector>

// nums is sorted ascending. Return indices of two values adding to target, or {-1, -1}.
std::vector<int> pairWithSum(const std::vector<int>& nums, int target) {
    int left = 0, right = (int)nums.size() - 1;
    while (left < right) {
        int total = nums[left] + nums[right];  // problem-specific: what you measure
        if (total == target) return {left, right};
        if (total < target) left++;   // too small: only a bigger left value can help
        else right--;                 // too big: only a smaller right value can help
    }
    return {-1, -1};
}

int main() {
    std::vector<int> nums = {1, 3, 4, 6, 9};
    std::vector<int> r = pairWithSum(nums, 7);
    std::cout << r[0] << " " << r[1] << "\n";  // 0 3
    r = pairWithSum(nums, 100);
    std::cout << r[0] << " " << r[1] << "\n";  // -1 -1
    return 0;
}
```

```javascript
// nums is sorted ascending. Return indices of two values adding to target, or null.
function pairWithSum(nums, target) {
  let left = 0;
  let right = nums.length - 1;
  while (left < right) {
    const total = nums[left] + nums[right]; // problem-specific: what you measure
    if (total === target) return [left, right];
    if (total < target) left++; // too small: only a bigger left value can help
    else right--; // too big: only a smaller right value can help
  }
  return null;
}

console.log(pairWithSum([1, 3, 4, 6, 9], 7)); // [ 0, 3 ]
console.log(pairWithSum([1, 3, 4, 6, 9], 100)); // null
```

```go
package main

import "fmt"

// pairWithSum takes a sorted slice and returns indices of two values adding to target, or -1, -1.
func pairWithSum(nums []int, target int) (int, int) {
	left, right := 0, len(nums)-1
	for left < right {
		total := nums[left] + nums[right] // problem-specific: what you measure
		if total == target {
			return left, right
		}
		if total < target {
			left++ // too small: only a bigger left value can help
		} else {
			right-- // too big: only a smaller right value can help
		}
	}
	return -1, -1
}

func main() {
	fmt.Println(pairWithSum([]int{1, 3, 4, 6, 9}, 7))   // 0 3
	fmt.Println(pairWithSum([]int{1, 3, 4, 6, 9}, 100)) // -1 -1
}
```

## Variations

- **Opposite ends.** The template above. Also used for palindromes (compare `s[left]` with `s[right]`), reversing in place, and Container With Most Water, where you move the pointer at the shorter line.
- **Fast and slow.** `slow` moves one node, `fast` moves two. When `fast` reaches the end, `slow` is at the middle. If they ever meet, the list has a cycle. The same idea works on arrays treated as "next = nums[i]" links.
- **Reader and writer.** `read` visits every element; `write` is the next free slot in the kept part of the array. Copy `nums[read]` to `nums[write]` when it should be kept. Remove Duplicates and Move Zeroes are this pattern.
- **Fix one, two-pointer the rest.** For triples (3Sum), loop over the first element and run the opposite-ends search on the part after it. This turns O(n³) into O(n²).
- **Two sequences.** One pointer in each array, as in merging two sorted arrays or checking whether one string is a subsequence of another.

## Common mistakes

- Running the opposite-ends search on an **unsorted** array. The "too small, move left" rule is only valid when the array is sorted.
- Using `left <= right` when the two pointers must point at different elements, so an element pairs with itself.
- Moving **both** pointers on a step where only one move is justified. Skipping an index can skip the answer.
- Forgetting to skip duplicates when the problem asks for unique pairs or triples.
- In fast-and-slow loops, reading `fast.next.next` without checking that `fast` and `fast.next` exist.
- In reader-and-writer loops, overwriting an element before the reader has looked at it. Writing never runs ahead of reading, so it is safe, but only if `write <= read` holds throughout.

## Complexity

Each pointer moves in one direction and at most n times, so the usual cost is **O(n) time** and **O(1) extra space**. When the problem needs sorting first, that adds O(n log n). The "fix one, then two-pointer" version for triples costs O(n²).

## Where to start

1. [125. Valid Palindrome](/interview/problems/valid-palindrome/): the simplest opposite-ends loop, plus skipping characters you do not care about.
2. [283. Move Zeroes](/interview/problems/move-zeroes/): the reader-and-writer shape, moving elements in place.
3. [26. Remove Duplicates from Sorted Array](/interview/problems/remove-duplicates-from-sorted-array/): reader-and-writer again, this time deciding what to keep by comparing with the last kept value.
4. 167. Two Sum II - Input Array Is Sorted: the template above, almost line for line.
5. [88. Merge Sorted Array](/interview/problems/merge-sorted-array/): one pointer in each array, walking from the back so nothing gets overwritten.
6. [141. Linked List Cycle](/interview/problems/linked-list-cycle/): fast and slow pointers on a linked list.
7. [11. Container With Most Water](/interview/problems/container-with-most-water/): opposite ends where you have to argue which pointer is safe to move.
8. [15. 3Sum](/interview/problems/3sum/): fix one element and run the pair search on the rest, with duplicate handling.
