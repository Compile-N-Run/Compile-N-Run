---
title: Find the Duplicate Number
leetcode: find-the-duplicate-number
description: "Find the Duplicate Number explained: locate the one repeated value in an array of n+1 numbers from 1..n without modifying it and in O(1) extra space, by treating the array as a linked list and running Floyd's cycle detection, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You get an array `nums` with `n + 1` integers, and every value lies between `1` and `n` inclusive. By the pigeonhole principle at least one value must appear more than once; here exactly one value is repeated, although it may be repeated several times. Return that value.

The constraints make the problem interesting: you must not modify the array (so sorting or marking entries is out) and you may use only constant extra space (so no hash set). The intended solution still runs in linear time.

## Examples

- `[2, 5, 1, 4, 3, 5]` → `5`. Six numbers from `1..5`; the value 5 appears twice.
- `[1, 3, 4, 2, 2]` → `2`.
- `[4, 4, 4, 4, 4, 4]` → `4`. The duplicate may appear many times, and other values may be missing entirely.
- `[1, 1]` → `1`. The smallest possible input (`n = 1`).

## Key idea

Read each value as a pointer: index `i` "points to" index `nums[i]`. Since every value is between `1` and `n`, every pointer lands inside the array, and index `0` is never pointed to, so starting from index `0` we never come back to the start. Following pointers from `0` therefore traces a path that must eventually loop (there are only `n + 1` indexes). A loop needs some index to be pointed to twice, and that happens exactly when two positions hold the same value: the duplicate is the index where the loop begins. Finding the start of a loop in a linked list without extra memory is exactly what Floyd's tortoise-and-hare algorithm does.

## Approach

1. Start two pointers at index `0`. Move `slow` one step (`slow = nums[slow]`) and `fast` two steps (`fast = nums[nums[fast]]`) until they meet. The meeting point is somewhere inside the cycle.
2. Reset one pointer to `0` and keep the other at the meeting point. Now move both one step at a time. The point where they meet is the entrance of the cycle, which is the duplicate value.
3. Return it.

Why step 2 works: if the cycle entrance is `m` steps from the start and the cycle has length `L`, the first meeting happens at a position that is a multiple of `L` steps away from the entrance (measured along the cycle). Walking `m` more steps from there lands exactly on the entrance, and walking `m` steps from the start obviously does too.

Simpler alternatives and why they fail the constraints: sorting modifies the array; a hash set uses O(n) space. A binary search on the *value* range (count how many entries are `<= mid`) respects both constraints but costs O(n log n).

## Complexity

- **Time:** O(n). Both phases walk at most a few times around a path of at most `n + 1` indexes.
- **Space:** O(1). Only two index variables.

## Common mistakes

- Starting the pointers at `nums[0]` instead of index `0`. Starting at `0` is what guarantees we begin outside the cycle (nothing points to index 0 because every value is at least 1).
- Returning the first meeting point. That is a point *on* the cycle, not necessarily its entrance; the second phase is required.
- Using a `do ... while` style check incorrectly so the loop exits immediately because `slow == fast` at the very beginning.
- Trying to apply the trick to arrays whose values can be `0` or exceed `n`: the pointer view then runs off the array.

## Follow-up questions

- How would you solve it if modifying the array were allowed? (Negate the entry at index `nums[i]` while scanning; the first value whose slot is already negative is the duplicate. O(n) time, O(1) space.)
- How does the binary-search-on-values approach work, and what is its complexity? (For a candidate `mid`, count entries `<= mid`; if the count exceeds `mid`, the duplicate is in the lower half. O(n log n) time.)
- What if there could be several different duplicated values? (Then the cycle trick finds only one of them; the marking approach finds all.)

## Related problems

- [Happy Number](/interview/problems/happy-number/) (the same cycle detection on a sequence of numbers)
- [First Missing Positive](/interview/problems/first-missing-positive/) (uses the array itself as the hash table)
- Linked List Cycle II
- Missing Number
- Find All Duplicates in an Array

## Solutions

```python
class Solution:
    def findDuplicate(self, nums: List[int]) -> int:
        # Phase 1: tortoise and hare meet somewhere inside the cycle.
        slow = fast = 0
        while True:
            slow = nums[slow]
            fast = nums[nums[fast]]
            if slow == fast:
                break
        # Phase 2: walk from the start and from the meeting point at the same speed.
        slow = 0
        while slow != fast:
            slow = nums[slow]
            fast = nums[fast]
        return slow
```

```java
class Solution {
    public int findDuplicate(int[] nums) {
        // Phase 1: tortoise and hare meet somewhere inside the cycle.
        int slow = 0, fast = 0;
        do {
            slow = nums[slow];
            fast = nums[nums[fast]];
        } while (slow != fast);
        // Phase 2: walk from the start and from the meeting point at the same speed.
        slow = 0;
        while (slow != fast) {
            slow = nums[slow];
            fast = nums[fast];
        }
        return slow;
    }
}
```

```cpp
class Solution {
public:
    int findDuplicate(vector<int>& nums) {
        // Phase 1: tortoise and hare meet somewhere inside the cycle.
        int slow = 0, fast = 0;
        do {
            slow = nums[slow];
            fast = nums[nums[fast]];
        } while (slow != fast);
        // Phase 2: walk from the start and from the meeting point at the same speed.
        slow = 0;
        while (slow != fast) {
            slow = nums[slow];
            fast = nums[fast];
        }
        return slow;
    }
};
```

```javascript
/**
 * @param {number[]} nums
 * @return {number}
 */
var findDuplicate = function (nums) {
  // Phase 1: tortoise and hare meet somewhere inside the cycle.
  let slow = 0;
  let fast = 0;
  do {
    slow = nums[slow];
    fast = nums[nums[fast]];
  } while (slow !== fast);
  // Phase 2: walk from the start and from the meeting point at the same speed.
  slow = 0;
  while (slow !== fast) {
    slow = nums[slow];
    fast = nums[fast];
  }
  return slow;
};
```

```go
func findDuplicate(nums []int) int {
	// Phase 1: tortoise and hare meet somewhere inside the cycle.
	slow, fast := 0, 0
	for {
		slow = nums[slow]
		fast = nums[nums[fast]]
		if slow == fast {
			break
		}
	}
	// Phase 2: walk from the start and from the meeting point at the same speed.
	slow = 0
	for slow != fast {
		slow = nums[slow]
		fast = nums[fast]
	}
	return slow
}
```
