---
title: Merge Two Sorted Lists
leetcode: merge-two-sorted-lists
description: "Merge Two Sorted Lists explained: splice two sorted linked lists into one sorted list with a dummy head and a tail pointer, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given the heads of two singly linked lists, `list1` and `list2`. Each list is already sorted in non-decreasing order (equal values may repeat). Combine them into one sorted list by relinking the existing nodes, and return the head of the combined list.

Either list, or both, may be empty (`null`). If both are empty, return an empty list.

## Examples

- `list1 = 2 → 5 → 9`, `list2 = 1 → 6` → `1 → 2 → 5 → 6 → 9`.
- `list1 = 3 → 3 → 4`, `list2 = 3` → `3 → 3 → 3 → 4`. Equal values are all kept.
- `list1 = empty`, `list2 = 7 → 8` → `7 → 8`. Nothing to merge, so the other list is the answer.
- `list1 = empty`, `list2 = empty` → empty.

## Key idea

The smallest remaining value is always at the front of one of the two lists. So repeatedly compare the two front nodes, detach the smaller one and attach it to the end of the result. When one list runs out, the rest of the other list is already sorted and can be attached in one step.

A *dummy* node placed before the result removes the special case of "the result is still empty": there is always a node to attach to, and the real head is `dummy.next` at the end.

## Approach

1. Create a dummy node and a pointer `tail` that starts at it.
2. While both `list1` and `list2` are non-empty:
   1. If `list1.val <= list2.val`, link `tail.next = list1` and move `list1` forward. Otherwise do the same with `list2`.
   2. Move `tail` to the node just attached.
3. Attach whatever is left: `tail.next = list1` if it is non-empty, otherwise `list2`.
4. Return `dummy.next`.

You could also copy all values into an array, sort it and build a new list, but that takes O((m + n) log(m + n)) time and extra memory, and ignores that the inputs are already sorted.

## Complexity

- **Time:** O(m + n), where m and n are the list lengths. Each node is attached exactly once.
- **Space:** O(1). Only the existing nodes are relinked; the dummy node is a constant extra.

## Common mistakes

- Forgetting to attach the leftover part after the loop, which drops the tail of the longer list.
- Forgetting to advance `tail`, so every new node overwrites the previous link.
- Not handling empty inputs: dereferencing `list1.val` when `list1` is `null`.
- Writing it recursively without thinking about depth: the recursive version uses O(m + n) stack space and can overflow on very long lists.

## Follow-up questions

- Merge `k` sorted lists (Merge k Sorted Lists): use a min-heap of list heads, or merge pairs of lists in rounds.
- Write the recursive version: the smaller head's `next` is the merge of its rest with the other list.
- Merge two sorted arrays in place when the first has room at the end (Merge Sorted Array): fill from the back.

## Related problems

- Merge k Sorted Lists
- Merge Sorted Array
- Sort List

## Solutions

```python
class Solution:
    def mergeTwoLists(self, list1: Optional[ListNode], list2: Optional[ListNode]) -> Optional[ListNode]:
        dummy = tail = ListNode()
        while list1 and list2:
            if list1.val <= list2.val:
                tail.next, list1 = list1, list1.next
            else:
                tail.next, list2 = list2, list2.next
            tail = tail.next
        tail.next = list1 or list2  # attach the leftover part
        return dummy.next
```

```java
class Solution {
    public ListNode mergeTwoLists(ListNode list1, ListNode list2) {
        ListNode dummy = new ListNode();
        ListNode tail = dummy;
        while (list1 != null && list2 != null) {
            if (list1.val <= list2.val) {
                tail.next = list1;
                list1 = list1.next;
            } else {
                tail.next = list2;
                list2 = list2.next;
            }
            tail = tail.next;
        }
        tail.next = list1 != null ? list1 : list2; // attach the leftover part
        return dummy.next;
    }
}
```

```cpp
class Solution {
public:
    ListNode* mergeTwoLists(ListNode* list1, ListNode* list2) {
        ListNode dummy;
        ListNode* tail = &dummy;
        while (list1 && list2) {
            if (list1->val <= list2->val) {
                tail->next = list1;
                list1 = list1->next;
            } else {
                tail->next = list2;
                list2 = list2->next;
            }
            tail = tail->next;
        }
        tail->next = list1 ? list1 : list2;  // attach the leftover part
        return dummy.next;
    }
};
```

```javascript
/**
 * @param {ListNode} list1
 * @param {ListNode} list2
 * @return {ListNode}
 */
var mergeTwoLists = function (list1, list2) {
  const dummy = new ListNode();
  let tail = dummy;
  while (list1 && list2) {
    if (list1.val <= list2.val) {
      tail.next = list1;
      list1 = list1.next;
    } else {
      tail.next = list2;
      list2 = list2.next;
    }
    tail = tail.next;
  }
  tail.next = list1 || list2; // attach the leftover part
  return dummy.next;
};
```

```go
func mergeTwoLists(list1 *ListNode, list2 *ListNode) *ListNode {
	dummy := &ListNode{}
	tail := dummy
	for list1 != nil && list2 != nil {
		if list1.Val <= list2.Val {
			tail.Next = list1
			list1 = list1.Next
		} else {
			tail.Next = list2
			list2 = list2.Next
		}
		tail = tail.Next
	}
	// attach the leftover part
	if list1 != nil {
		tail.Next = list1
	} else {
		tail.Next = list2
	}
	return dummy.Next
}
```
