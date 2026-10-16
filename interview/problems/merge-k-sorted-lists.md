---
title: Merge k Sorted Lists
leetcode: merge-k-sorted-lists
description: "Merge k Sorted Lists explained: combine k sorted linked lists into one by merging them in pairs, divide-and-conquer style, in O(N log k) time, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given an array `lists` of `k` singly linked lists. Each list is already sorted in non-decreasing order. Merge all of them into one sorted linked list and return its head.

The array itself may be empty, and any of the lists may be empty (a null head). In both cases the empty lists simply contribute nothing; if there are no nodes at all, return an empty list (null). Values can be negative and can repeat.

## Examples

- `lists = [[1, 4, 9], [2, 3], [5, 6, 10]]` → `[1, 2, 3, 4, 5, 6, 9, 10]`.
- `lists = [[], [-3, 0]]` → `[-3, 0]`. The empty list adds nothing.
- `lists = [[7], [7, 8]]` → `[7, 7, 8]`. Equal values are all kept.
- `lists = []` → `[]`. There is nothing to merge.

## Key idea

Merging *two* sorted lists is easy: repeatedly take the smaller head. To merge `k` lists, do it in rounds like merge sort: pair up the lists and merge each pair, which halves the number of lists, and repeat until one list is left. Every node takes part in one merge per round, and there are only about log₂ k rounds, so the total work is O(N log k), where N is the total number of nodes.

## Approach

1. Write a helper `mergeTwo(a, b)` that merges two sorted lists:
   1. Start from a dummy node and keep a `tail` pointer.
   2. While both lists are non-empty, attach the node with the smaller value to `tail` and advance that list.
   3. Attach whatever remains of the non-empty list.
   4. Return `dummy.next`.
2. If `lists` is empty, return null.
3. Use a step size `step = 1`. While `step < k`: for every `i = 0, 2·step, 4·step, …` with `i + step < k`, set `lists[i] = mergeTwo(lists[i], lists[i + step])`. Then double `step`.
4. Return `lists[0]`.

Merging the lists one after another into a growing result is simpler but slow: the result is re-walked for every list, which costs O(N·k). Another O(N log k) option is a min-heap holding the current head of each list; pop the smallest, append it and push its successor. Both are accepted answers; pairwise merging needs no heap, so it looks the same in every language.

## Complexity

- **Time:** O(N log k). There are ⌈log₂ k⌉ rounds and each round touches every node at most once.
- **Space:** O(1) extra. Nodes are relinked in place and the rounds are done with a loop, not recursion.

## Common mistakes

- Forgetting the empty input `[]` or lists that are null: accessing `lists[0]` or `node.val` then crashes.
- Merging sequentially (`result = mergeTwo(result, list)`) and claiming O(N log k); that version is O(N·k).
- In the heap version, comparing nodes directly when values tie (Python cannot compare `ListNode` objects); add a tiebreaker such as the list index.

## Follow-up questions

- Implement the min-heap version and compare it with pairwise merging.
- What if the lists are too large for memory? (External k-way merge with a heap of file cursors.)

## Related problems

- Merge Two Sorted Lists (the helper on its own)
- Sort List (merge sort on a linked list)
- Kth Smallest Element in a Sorted Matrix (k-way merge with a heap)

## Solutions

```python
class Solution:
    def mergeKLists(self, lists: List[Optional[ListNode]]) -> Optional[ListNode]:
        def merge_two(a, b):
            dummy = tail = ListNode()
            while a and b:
                if a.val <= b.val:
                    tail.next, a = a, a.next
                else:
                    tail.next, b = b, b.next
                tail = tail.next
            tail.next = a or b
            return dummy.next

        if not lists:
            return None
        k, step = len(lists), 1
        while step < k:
            for i in range(0, k - step, 2 * step):
                lists[i] = merge_two(lists[i], lists[i + step])
            step *= 2
        return lists[0]
```

```java
class Solution {
    public ListNode mergeKLists(ListNode[] lists) {
        if (lists.length == 0) {
            return null;
        }
        int k = lists.length;
        for (int step = 1; step < k; step *= 2) {
            for (int i = 0; i + step < k; i += 2 * step) {
                lists[i] = mergeTwo(lists[i], lists[i + step]);
            }
        }
        return lists[0];
    }

    private ListNode mergeTwo(ListNode a, ListNode b) {
        ListNode dummy = new ListNode(), tail = dummy;
        while (a != null && b != null) {
            if (a.val <= b.val) {
                tail.next = a;
                a = a.next;
            } else {
                tail.next = b;
                b = b.next;
            }
            tail = tail.next;
        }
        tail.next = a != null ? a : b;
        return dummy.next;
    }
}
```

```cpp
class Solution {
public:
    ListNode* mergeKLists(vector<ListNode*>& lists) {
        if (lists.empty()) return nullptr;
        int k = lists.size();
        for (int step = 1; step < k; step *= 2) {
            for (int i = 0; i + step < k; i += 2 * step) {
                lists[i] = mergeTwo(lists[i], lists[i + step]);
            }
        }
        return lists[0];
    }

private:
    ListNode* mergeTwo(ListNode* a, ListNode* b) {
        ListNode dummy;
        ListNode* tail = &dummy;
        while (a && b) {
            if (a->val <= b->val) {
                tail->next = a;
                a = a->next;
            } else {
                tail->next = b;
                b = b->next;
            }
            tail = tail->next;
        }
        tail->next = a ? a : b;
        return dummy.next;
    }
};
```

```javascript
/**
 * @param {ListNode[]} lists
 * @return {ListNode}
 */
var mergeKLists = function (lists) {
  const mergeTwo = (a, b) => {
    const dummy = new ListNode();
    let tail = dummy;
    while (a && b) {
      if (a.val <= b.val) {
        tail.next = a;
        a = a.next;
      } else {
        tail.next = b;
        b = b.next;
      }
      tail = tail.next;
    }
    tail.next = a || b;
    return dummy.next;
  };

  if (lists.length === 0) {
    return null;
  }
  const k = lists.length;
  for (let step = 1; step < k; step *= 2) {
    for (let i = 0; i + step < k; i += 2 * step) {
      lists[i] = mergeTwo(lists[i], lists[i + step]);
    }
  }
  return lists[0];
};
```

```go
func mergeKLists(lists []*ListNode) *ListNode {
	if len(lists) == 0 {
		return nil
	}
	k := len(lists)
	for step := 1; step < k; step *= 2 {
		for i := 0; i+step < k; i += 2 * step {
			lists[i] = mergeTwo(lists[i], lists[i+step])
		}
	}
	return lists[0]
}

func mergeTwo(a, b *ListNode) *ListNode {
	dummy := &ListNode{}
	tail := dummy
	for a != nil && b != nil {
		if a.Val <= b.Val {
			tail.Next = a
			a = a.Next
		} else {
			tail.Next = b
			b = b.Next
		}
		tail = tail.Next
	}
	if a != nil {
		tail.Next = a
	} else {
		tail.Next = b
	}
	return dummy.Next
}
```
