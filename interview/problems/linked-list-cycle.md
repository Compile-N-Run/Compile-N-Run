---
title: Linked List Cycle
leetcode: linked-list-cycle
description: "Linked List Cycle explained: detect whether a singly linked list loops back on itself with Floyd's slow and fast pointers in O(1) space, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given the `head` of a singly linked list. Normally the last node's `next` is null, but in this list the last node's `next` may instead point back at some earlier node, so that following `next` forever never ends. Return `true` if the list contains such a cycle and `false` otherwise.

The list may be empty, and the cycle (if any) can start at any node, including the head or the last node itself. You only receive the `head`; nothing tells you where the cycle starts or how many nodes there are. Node values are ordinary integers and may repeat, so they cannot be used to tell nodes apart.

## Examples

- `5 → 8 → 2 → 9`, and `9.next` points back at `8` → `true`. Walking the list goes `5, 8, 2, 9, 8, 2, 9, ...` forever.
- `1 → 2`, and `2.next` points at `1` → `true`. The cycle covers the whole list.
- `4 → 4 → 4` with the last `next` null → `false`. Equal values do not make a cycle; only the pointers matter.
- `7`, a single node whose `next` is itself → `true`.
- An empty list → `false`.

## Key idea

Imagine two runners on a track. If the track is a straight line, the faster one reaches the end and stops. If the track is a loop, the faster runner eventually laps the slower one and they stand on the same spot. Do the same with two pointers: `slow` moves one node per step, `fast` moves two. If `fast` hits null, the list ends, so there is no cycle. If the pointers ever meet, the only way that can happen is inside a loop. This is **Floyd's cycle detection** (the "tortoise and hare"), and it needs no extra memory.

Why must they meet? Once both pointers are inside the cycle, the gap between them shrinks by exactly one node per step (fast gains two, slow moves one), so the gap reaches zero within one lap.

## Approach

1. Start `slow` and `fast` at `head`.
2. Loop while `fast` and `fast.next` are both non-null:
   1. Move `slow` one step and `fast` two steps.
   2. If `slow` and `fast` are the same node, return `true`.
3. If the loop exits, `fast` ran off the end, so return `false`.

The obvious alternative is a hash set of visited nodes: walk the list, and if you reach a node already in the set, there is a cycle. That is also O(n) time but needs O(n) memory, and interviewers nearly always ask for the O(1) version.

## Complexity

- **Time:** O(n). Without a cycle `fast` reaches the end in n/2 steps; with one, the pointers meet within n steps of `slow` entering the loop.
- **Space:** O(1): two pointers, no matter how long the list is.

## Common mistakes

- Checking `fast.next.next` without first confirming `fast.next` is non-null, which crashes on even-length lists.
- Comparing node *values* instead of node identity. Lists with repeated values would report a cycle that is not there.
- Comparing the pointers before moving them. They start at the same node, so an early check returns `true` for every list.
- Forgetting the empty list: with `head` null the loop condition fails immediately and the answer is `false`, but only if you do not dereference `head` beforehand.

## Follow-up questions

- *Where does the cycle start?* After the pointers meet, put one back at `head` and advance both one step at a time; they meet again at the cycle's first node (Linked List Cycle II).
- *How long is the cycle?* Keep one pointer at the meeting point and count the steps until the other returns to it.
- *Can you do it with a set?* Yes, in O(n) extra space; be ready to explain why the two-pointer method is preferred.

## Related problems

- [Happy Number](/interview/problems/happy-number/) (the same two-pointer trick on a sequence of numbers)
- [Reverse Linked List](/interview/problems/reverse-linked-list/)
- [Merge Two Sorted Lists](/interview/problems/merge-two-sorted-lists/)
- Linked List Cycle II
- Find the Duplicate Number

## Solutions

```python
class Solution:
    def hasCycle(self, head: Optional[ListNode]) -> bool:
        slow = fast = head
        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next
            if slow is fast:
                return True
        return False
```

```java
public class Solution {
    public boolean hasCycle(ListNode head) {
        ListNode slow = head, fast = head;
        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
            if (slow == fast) {
                return true;
            }
        }
        return false;
    }
}
```

```cpp
class Solution {
public:
    bool hasCycle(ListNode *head) {
        ListNode *slow = head, *fast = head;
        while (fast && fast->next) {
            slow = slow->next;
            fast = fast->next->next;
            if (slow == fast) {
                return true;
            }
        }
        return false;
    }
};
```

```javascript
/**
 * @param {ListNode} head
 * @return {boolean}
 */
var hasCycle = function (head) {
  let slow = head;
  let fast = head;
  while (fast !== null && fast.next !== null) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) {
      return true;
    }
  }
  return false;
};
```

```go
func hasCycle(head *ListNode) bool {
	slow, fast := head, head
	for fast != nil && fast.Next != nil {
		slow = slow.Next
		fast = fast.Next.Next
		if slow == fast {
			return true
		}
	}
	return false
}
```
