---
title: Reverse Linked List
leetcode: reverse-linked-list
description: "Reverse Linked List explained: flip a singly linked list in place by walking it once and turning each next pointer around, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given the `head` of a singly linked list: each node holds a value and a pointer `next` to the following node, and the last node points to nothing (`null`). Reverse the list so the last node comes first, and return the new head.

The list may be empty (`head` is `null`), in which case you return `null`. It has at most a few thousand nodes.

## Examples

- `1 → 2 → 3 → 4` → `4 → 3 → 2 → 1`.
- `8 → 5` → `5 → 8`.
- `7` → `7`. A single node is already its own reverse.
- empty list → empty list.

## Key idea

Reversing a list does not require moving any values: it is enough to turn every arrow around, so each node points to the node that used to come *before* it. Walk the list once with two pointers, `prev` (the part already reversed) and `curr` (the next node to flip). Before flipping `curr.next`, save the original next node, or you lose the rest of the list.

## Approach

1. Set `prev = null` and `curr = head`.
2. While `curr` is not `null`:
   1. Save `next = curr.next` (the rest of the list).
   2. Point `curr.next` back to `prev`.
   3. Move both pointers one step: `prev = curr`, `curr = next`.
3. When the loop ends, `curr` is `null` and `prev` is the old last node, which is the new head. Return `prev`.

You could also copy the values into an array and write them back in reverse, but that uses O(n) extra memory; turning the pointers around needs only two variables.

## Complexity

- **Time:** O(n). Each node is visited once.
- **Space:** O(1). Only a few pointer variables are used.

## Common mistakes

- Changing `curr.next` before saving it, which cuts off the rest of the list.
- Returning `head` at the end. After reversing, the old head is the *last* node; the new head is `prev`.
- Forgetting the empty list. With `prev = null` and the loop condition on `curr`, it works without a special case.

## Follow-up questions

- Can you do it recursively? Reverse the rest of the list starting at `head.next`, then set `head.next.next = head` and `head.next = null`. It is elegant but uses O(n) stack space and can overflow on very long lists.
- How would you reverse only the part between positions `left` and `right`? (Reverse Linked List II.)
- How would you reverse the list in groups of k nodes? (Reverse Nodes in k-Group.)

## Related problems

- Reverse Linked List II
- Palindrome Linked List
- Reverse Nodes in k-Group

## Solutions

```python
class Solution:
    def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:
        prev, curr = None, head
        while curr:
            nxt = curr.next  # save the rest of the list
            curr.next = prev
            prev, curr = curr, nxt
        return prev
```

```java
class Solution {
    public ListNode reverseList(ListNode head) {
        ListNode prev = null, curr = head;
        while (curr != null) {
            ListNode next = curr.next; // save the rest of the list
            curr.next = prev;
            prev = curr;
            curr = next;
        }
        return prev;
    }
}
```

```cpp
class Solution {
public:
    ListNode* reverseList(ListNode* head) {
        ListNode *prev = nullptr, *curr = head;
        while (curr) {
            ListNode* next = curr->next;  // save the rest of the list
            curr->next = prev;
            prev = curr;
            curr = next;
        }
        return prev;
    }
};
```

```javascript
/**
 * @param {ListNode} head
 * @return {ListNode}
 */
var reverseList = function (head) {
  let prev = null, curr = head;
  while (curr) {
    const next = curr.next; // save the rest of the list
    curr.next = prev;
    prev = curr;
    curr = next;
  }
  return prev;
};
```

```go
func reverseList(head *ListNode) *ListNode {
	var prev *ListNode
	curr := head
	for curr != nil {
		next := curr.Next // save the rest of the list
		curr.Next = prev
		prev, curr = curr, next
	}
	return prev
}
```
