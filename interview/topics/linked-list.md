---
title: Linked List
topic: Linked List
group: structures
description: "A linked list is a chain of nodes joined by pointers; interview problems test careful pointer surgery with three tools: a dummy head, slow and fast runners, and in-place reversal."
---

## What it is

A linked list is a sequence of nodes, where each node holds a value and a pointer to the next node. The list is known only by its first node, the *head*; the last node points to nothing. There is no index: to reach the fifth node you follow four pointers. In exchange, inserting or removing a node next to one you already hold is O(1), with no shifting of elements.

A *singly* linked list points forward only. A *doubly* linked list also points back, which lets you unlink a node without knowing its predecessor; that is what makes the LRU cache O(1).

Interviewers like linked lists not because they are common in production code but because they expose sloppy thinking: every operation is a few pointer assignments, and doing them in the wrong order silently loses half the list. The whole topic comes down to three tools, covered below.

## When to use it

- The problem hands you a `ListNode` and asks you to reverse, merge, split, reorder, remove from or detect a cycle in it.
- A design problem needs O(1) insertion and removal in the middle of an ordered sequence (LRU cache, a text editor's cursor).
- You need a queue that never reallocates, or want to splice two sequences together without copying.
- Digits or polynomial terms arrive as a list and you must do arithmetic on them node by node.

## How it works

**Dummy head.** Create a throwaway node in front of the real head and build or edit the list after it. The "first node" is no longer special: inserting before the head, removing the head and an empty result all fall out of the general case. Return `dummy.next` at the end.

**Slow and fast runners.** Two pointers start at the head; one steps once per loop, the other twice. When the fast one runs off the end, the slow one is at the middle. Give the fast one a head start of k nodes and they stay k apart, so when fast reaches the end, slow is k from the end. If the fast one ever lands on the slow one, the list has a cycle.

**In-place reversal.** Walk the list with three pointers, `prev`, `cur` and `nxt`. Trace it on `1 → 2 → 3`:

| step | prev | cur | action |
|---|---|---|---|
| start | `None` | 1 | save `nxt = 2`, point 1 at `None` |
| 1 | 1 | 2 | save `nxt = 3`, point 2 at 1 |
| 2 | 2 | 3 | save `nxt = None`, point 3 at 2 |
| 3 | 3 | `None` | stop; `prev` (3) is the new head |

The result is `3 → 2 → 1`. The order of the three assignments inside the loop is the whole trick: save the next node *before* you overwrite `cur.next`, or the rest of the list is gone.

The template builds a list from an array with a dummy head, finds the middle with runners, and reverses it in place.

## Template

```python
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next


def build(values):
    """Array -> linked list, using a dummy head so the loop has no special first case."""
    dummy = ListNode()
    tail = dummy
    for v in values:
        tail.next = ListNode(v)
        tail = tail.next
    return dummy.next


def reverse(head):
    """Reverse in place: three pointers, one pass."""
    prev, cur = None, head
    while cur:
        nxt = cur.next          # save the rest before breaking the link
        cur.next = prev         # point this node backwards
        prev, cur = cur, nxt    # step forward
    return prev                 # the old tail is the new head


def middle(head):
    """Slow/fast pointers: when fast reaches the end, slow is in the middle."""
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
    return slow


def to_list(head):
    out = []
    while head:
        out.append(head.val)
        head = head.next
    return out


head = build([1, 2, 3, 4, 5])
print(middle(head).val)          # 3
print(to_list(reverse(head)))    # [5, 4, 3, 2, 1]
```

```java
import java.util.*;

public class Main {
    static class ListNode {
        int val;
        ListNode next;
        ListNode(int val) { this.val = val; }
    }

    // Array -> linked list, using a dummy head so the loop has no special first case.
    static ListNode build(int[] values) {
        ListNode dummy = new ListNode(0), tail = dummy;
        for (int v : values) {
            tail.next = new ListNode(v);
            tail = tail.next;
        }
        return dummy.next;
    }

    // Reverse in place: three pointers, one pass.
    static ListNode reverse(ListNode head) {
        ListNode prev = null, cur = head;
        while (cur != null) {
            ListNode nxt = cur.next;   // save the rest before breaking the link
            cur.next = prev;           // point this node backwards
            prev = cur;                // step forward
            cur = nxt;
        }
        return prev;                   // the old tail is the new head
    }

    // Slow/fast pointers: when fast reaches the end, slow is in the middle.
    static ListNode middle(ListNode head) {
        ListNode slow = head, fast = head;
        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
        }
        return slow;
    }

    static List<Integer> toList(ListNode head) {
        List<Integer> out = new ArrayList<>();
        for (; head != null; head = head.next) out.add(head.val);
        return out;
    }

    public static void main(String[] args) {
        ListNode head = build(new int[]{1, 2, 3, 4, 5});
        System.out.println(middle(head).val);        // 3
        System.out.println(toList(reverse(head)));   // [5, 4, 3, 2, 1]
    }
}
```

```cpp
#include <iostream>
#include <vector>

struct ListNode {
    int val;
    ListNode* next;
    ListNode(int v) : val(v), next(nullptr) {}
};

// Array -> linked list, using a dummy head so the loop has no special first case.
ListNode* build(const std::vector<int>& values) {
    ListNode dummy(0);
    ListNode* tail = &dummy;
    for (int v : values) {
        tail->next = new ListNode(v);
        tail = tail->next;
    }
    return dummy.next;
}

// Reverse in place: three pointers, one pass.
ListNode* reverse(ListNode* head) {
    ListNode* prev = nullptr;
    ListNode* cur = head;
    while (cur) {
        ListNode* nxt = cur->next;  // save the rest before breaking the link
        cur->next = prev;           // point this node backwards
        prev = cur;                 // step forward
        cur = nxt;
    }
    return prev;                    // the old tail is the new head
}

// Slow/fast pointers: when fast reaches the end, slow is in the middle.
ListNode* middle(ListNode* head) {
    ListNode* slow = head;
    ListNode* fast = head;
    while (fast && fast->next) {
        slow = slow->next;
        fast = fast->next->next;
    }
    return slow;
}

int main() {
    ListNode* head = build({1, 2, 3, 4, 5});
    std::cout << middle(head)->val << '\n';                    // 3
    for (ListNode* p = reverse(head); p; p = p->next) std::cout << p->val << ' ';  // 5 4 3 2 1
    std::cout << '\n';
}
```

```javascript
class ListNode {
  constructor(val = 0, next = null) { this.val = val; this.next = next; }
}

// Array -> linked list, using a dummy head so the loop has no special first case.
function build(values) {
  const dummy = new ListNode();
  let tail = dummy;
  for (const v of values) {
    tail.next = new ListNode(v);
    tail = tail.next;
  }
  return dummy.next;
}

// Reverse in place: three pointers, one pass.
function reverse(head) {
  let prev = null, cur = head;
  while (cur !== null) {
    const nxt = cur.next;   // save the rest before breaking the link
    cur.next = prev;        // point this node backwards
    prev = cur;             // step forward
    cur = nxt;
  }
  return prev;              // the old tail is the new head
}

// Slow/fast pointers: when fast reaches the end, slow is in the middle.
function middle(head) {
  let slow = head, fast = head;
  while (fast !== null && fast.next !== null) {
    slow = slow.next;
    fast = fast.next.next;
  }
  return slow;
}

function toArray(head) {
  const out = [];
  for (; head !== null; head = head.next) out.push(head.val);
  return out;
}

const head = build([1, 2, 3, 4, 5]);
console.log(middle(head).val);           // 3
console.log(toArray(reverse(head)));     // [ 5, 4, 3, 2, 1 ]
```

```go
package main

import "fmt"

type ListNode struct {
	Val  int
	Next *ListNode
}

// build turns a slice into a linked list, using a dummy head so the loop has no special first case.
func build(values []int) *ListNode {
	dummy := &ListNode{}
	tail := dummy
	for _, v := range values {
		tail.Next = &ListNode{Val: v}
		tail = tail.Next
	}
	return dummy.Next
}

// reverse reverses in place: three pointers, one pass.
func reverse(head *ListNode) *ListNode {
	var prev *ListNode
	cur := head
	for cur != nil {
		nxt := cur.Next // save the rest before breaking the link
		cur.Next = prev // point this node backwards
		prev = cur      // step forward
		cur = nxt
	}
	return prev // the old tail is the new head
}

// middle uses slow/fast pointers: when fast reaches the end, slow is in the middle.
func middle(head *ListNode) *ListNode {
	slow, fast := head, head
	for fast != nil && fast.Next != nil {
		slow = slow.Next
		fast = fast.Next.Next
	}
	return slow
}

func main() {
	head := build([]int{1, 2, 3, 4, 5})
	fmt.Println(middle(head).Val) // 3
	for p := reverse(head); p != nil; p = p.Next {
		fmt.Print(p.Val, " ") // 5 4 3 2 1
	}
	fmt.Println()
}
```

## Variations

- **Remove the nth from the end**: advance `fast` n steps, then move both until `fast` hits the end; `slow` is just before the node to unlink.
- **Cycle detection** (Floyd): if `fast` meets `slow`, there is a cycle. To find where it starts, reset one pointer to the head and step both one at a time until they meet again.
- **Reverse a sub-range**: walk to the node before the range, reverse exactly k nodes, then stitch the three pieces together. Reverse Nodes in k-Group repeats this.
- **Merge two sorted lists**: a dummy head plus a tail pointer; at each step attach the smaller head and advance that list.
- **Split and recombine**: find the middle, cut, reverse the second half, then interleave (Reorder List) or compare (Palindrome Linked List).
- **Arithmetic on digits**: walk both lists together carrying the overflow; a dummy head collects the result.

## Common mistakes

- Overwriting `cur.next` before saving it. Always `nxt = cur.next` first.
- Dereferencing `fast.next.next` without checking `fast.next` first; the loop condition must test both `fast` and `fast.next`.
- Returning `head` after a reversal instead of `prev`, or returning `dummy` instead of `dummy.next`.
- Leaving the old tail pointing into the list after a partial reversal, which creates a cycle. When you cut a list, set the cut node's `next` to `None`.
- Forgetting the empty list and the one-node list; walk your code on both before you say it is done.
- Solving in O(n) extra space by copying values to an array when the interviewer asked for O(1) extra space. The array version is a fine first answer, but say that it is one.

## Complexity

Nearly every linked-list algorithm is O(n) time with O(1) extra space: you walk the list once or twice and move a handful of pointers. Recursive versions (recursive reversal, recursive merge) use O(n) stack space, which matters for long lists and is worth mentioning.

## Where to start

1. [206. Reverse Linked List](/interview/problems/reverse-linked-list/): the three-pointer loop until you can write it without thinking.
2. [21. Merge Two Sorted Lists](/interview/problems/merge-two-sorted-lists/): dummy head and tail pointer.
3. 876. Middle of the Linked List: slow and fast runners, nothing else.
4. [141. Linked List Cycle](/interview/problems/linked-list-cycle/): runners again, now looking for a meeting.
5. 19. Remove Nth Node From End of List: runners with a gap, plus the dummy head for removing the first node.
6. [2. Add Two Numbers](/interview/problems/add-two-numbers/): building a result list while walking two inputs with a carry.
7. [138. Copy List with Random Pointer](/interview/problems/copy-list-with-random-pointer/): a map from old to new nodes, or the interleaving trick for O(1) space.
8. [25. Reverse Nodes in k-Group](/interview/problems/reverse-nodes-in-k-group/): sub-range reversal and re-stitching, the hardest pointer surgery in the common set.
