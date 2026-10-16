---
title: Reverse Nodes in k-Group
leetcode: reverse-nodes-in-k-group
description: "Reverse Nodes in k-Group explained: reverse a linked list k nodes at a time, leaving a short tail as is, by rewiring pointers group by group with a dummy head in O(1) extra space, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given the `head` of a singly linked list and a positive integer `k`. Cut the list into consecutive groups of `k` nodes, starting from the head, and reverse the order of the nodes inside each group. If the last group has fewer than `k` nodes, leave it exactly as it is. Return the head of the resulting list.

You must rearrange the nodes themselves by changing `next` pointers; changing the values stored in the nodes is not allowed. The list has at least one node and `k` is between 1 and the length of the list.

## Examples

- `10 → 20 → 30 → 40 → 50 → 60 → 70`, `k = 3` → `30 → 20 → 10 → 60 → 50 → 40 → 70`. Two full groups are reversed; `70` alone is a short group and stays.
- `1 → 2 → 3 → 4`, `k = 4` → `4 → 3 → 2 → 1`: one group covering the whole list.
- `5 → 6 → 7 → 8 → 9`, `k = 2` → `6 → 5 → 8 → 7 → 9`.
- `1 → 2 → 3`, `k = 1` → `1 → 2 → 3`: groups of one node do not change anything.

## Key idea

This is [Reverse Linked List](/interview/problems/reverse-linked-list/) applied to one block at a time, plus careful reconnection. For each group we need four nodes: the node just **before** the group (`groupPrev`), the group's first and last nodes, and the node just **after** it (`groupNext`). Reverse the pointers inside the group, then hook `groupPrev` to the old last node (the new front of the group) and the old first node (now the back) to `groupNext`. A dummy node placed before the head means the first group has a `groupPrev` too, so it needs no special case. Before reversing, walk `k` steps ahead to make sure a full group exists; if not, stop.

## Approach

1. Create a `dummy` node whose `next` is `head`, and set `groupPrev = dummy`.
2. Repeat:
   1. Walk `k` steps from `groupPrev` to find the group's last node `kth`. If the list ends first, return `dummy.next`.
   2. Remember `groupNext = kth.next`.
   3. Reverse the group: start with `prev = groupNext` and `curr = groupPrev.next`, and while `curr != groupNext`, save `curr.next`, point `curr.next` to `prev`, and move `prev` and `curr` forward. Starting `prev` at `groupNext` makes the old first node point straight at the rest of the list.
   4. Let `first = groupPrev.next` (the old first node, now the group's tail). Set `groupPrev.next = kth`, then `groupPrev = first` for the next round.

A recursive version (reverse the first `k` nodes, then recurse on the rest) is shorter but uses one stack frame per group. Copying values into an array and rebuilding is not allowed, since the nodes themselves must move.

## Complexity

- **Time:** O(n). Each node is visited at most twice: once while checking that a full group exists and once while reversing.
- **Space:** O(1). Only a handful of pointers, which answers the usual "constant extra memory" follow-up.

## Common mistakes

- Reversing the final short group as well. Count `k` nodes ahead *before* touching any pointer.
- Losing the connection between groups: the previous group's tail must point to the new front of the current group, not to its old front.
- Forgetting to advance `groupPrev` to the old first node; using `kth` instead points into the middle of the reversed group.
- Returning `head`. After the first group is reversed, the original head is no longer first; return `dummy.next`.

## Follow-up questions

- What if the leftover nodes at the end should be reversed too? Drop the "full group exists" check and reverse whatever remains.
- How would you reverse only the nodes between two positions? That is Reverse Linked List II, the same reconnection idea for a single block.

## Related problems

- [Reverse Linked List](/interview/problems/reverse-linked-list/)
- Swap Nodes in Pairs (the special case `k = 2`)
- Reverse Linked List II

## Solutions

```python
class Solution:
    def reverseKGroup(self, head: Optional[ListNode], k: int) -> Optional[ListNode]:
        dummy = ListNode(0, head)
        group_prev = dummy
        while True:
            kth = group_prev
            for _ in range(k):  # find the last node of this group
                kth = kth.next
                if kth is None:
                    return dummy.next  # fewer than k nodes left
            group_next = kth.next
            prev, curr = group_next, group_prev.next
            while curr is not group_next:
                curr.next, prev, curr = prev, curr, curr.next
            first = group_prev.next  # old first node, now the group's tail
            group_prev.next = kth
            group_prev = first
```

```java
class Solution {
    public ListNode reverseKGroup(ListNode head, int k) {
        ListNode dummy = new ListNode(0, head);
        ListNode groupPrev = dummy;
        while (true) {
            ListNode kth = groupPrev;
            for (int i = 0; i < k; i++) { // find the last node of this group
                kth = kth.next;
                if (kth == null) return dummy.next; // fewer than k nodes left
            }
            ListNode groupNext = kth.next;
            ListNode prev = groupNext, curr = groupPrev.next;
            while (curr != groupNext) {
                ListNode next = curr.next;
                curr.next = prev;
                prev = curr;
                curr = next;
            }
            ListNode first = groupPrev.next; // old first node, now the group's tail
            groupPrev.next = kth;
            groupPrev = first;
        }
    }
}
```

```cpp
class Solution {
public:
    ListNode* reverseKGroup(ListNode* head, int k) {
        ListNode dummy(0, head);
        ListNode* groupPrev = &dummy;
        while (true) {
            ListNode* kth = groupPrev;
            for (int i = 0; i < k; i++) {  // find the last node of this group
                kth = kth->next;
                if (!kth) return dummy.next;  // fewer than k nodes left
            }
            ListNode* groupNext = kth->next;
            ListNode *prev = groupNext, *curr = groupPrev->next;
            while (curr != groupNext) {
                ListNode* next = curr->next;
                curr->next = prev;
                prev = curr;
                curr = next;
            }
            ListNode* first = groupPrev->next;  // old first node, now the group's tail
            groupPrev->next = kth;
            groupPrev = first;
        }
    }
};
```

```javascript
/**
 * @param {ListNode} head
 * @param {number} k
 * @return {ListNode}
 */
var reverseKGroup = function (head, k) {
  const dummy = new ListNode(0, head);
  let groupPrev = dummy;
  while (true) {
    let kth = groupPrev;
    for (let i = 0; i < k; i++) { // find the last node of this group
      kth = kth.next;
      if (!kth) return dummy.next; // fewer than k nodes left
    }
    const groupNext = kth.next;
    let prev = groupNext, curr = groupPrev.next;
    while (curr !== groupNext) {
      const next = curr.next;
      curr.next = prev;
      prev = curr;
      curr = next;
    }
    const first = groupPrev.next; // old first node, now the group's tail
    groupPrev.next = kth;
    groupPrev = first;
  }
};
```

```go
func reverseKGroup(head *ListNode, k int) *ListNode {
	dummy := &ListNode{Next: head}
	groupPrev := dummy
	for {
		kth := groupPrev
		for i := 0; i < k; i++ { // find the last node of this group
			kth = kth.Next
			if kth == nil {
				return dummy.Next // fewer than k nodes left
			}
		}
		groupNext := kth.Next
		prev, curr := groupNext, groupPrev.Next
		for curr != groupNext {
			next := curr.Next
			curr.Next = prev
			prev = curr
			curr = next
		}
		first := groupPrev.Next // old first node, now the group's tail
		groupPrev.Next = kth
		groupPrev = first
	}
}
```
