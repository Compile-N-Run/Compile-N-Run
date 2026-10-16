---
title: Copy List with Random Pointer
leetcode: copy-list-with-random-pointer
description: "Copy List with Random Pointer explained: make a deep copy of a linked list whose nodes also point to a random node, using a hash map from old nodes to new ones, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given the `head` of a linked list (possibly empty) whose nodes have three fields: a value `val`, the usual `next` pointer, and an extra pointer `random` that is either null or points to **any** node of the same list (earlier, later, or the node itself).

Return the head of a **deep copy**: a brand-new list with the same number of nodes, where each new node has the same value as its original, and the new `next` and `random` pointers mirror the original structure, but point only to new nodes. No pointer in the copy may lead back into the original list, and the original must be left unchanged.

The list has at most 1000 nodes. LeetCode provides the `Node` class (named `_Node` in JavaScript).

## Examples

Below, a list is written as `[value, random]` pairs, where `random` is the position (0-based) of the node it points to, or `null`.

- `[[4, 2], [8, null], [2, 0]]` → a new list `[[4, 2], [8, null], [2, 0]]`. The first copy's `random` points to the *third copy*, not to the original third node.
- `[[6, 0]]` → `[[6, 0]]`. A node whose `random` points to itself; the copy must point to itself too.
- `[[1, 1], [1, 0], [1, null]]` → the same shape. Values repeat, so you cannot find a node's copy by its value.
- `[]` → `[]`, an empty list.

## Key idea

Copying `next` pointers alone is easy: walk the list and create nodes. The hard part is `random`: when you copy a node, its random target may not have been copied yet, and values cannot identify nodes because they may repeat.

The fix is a **hash map from each original node to its copy**. Build all the copies first, filling the map. Then a second pass sets each copy's `next` and `random` by looking up the copies of the original's `next` and `random`. Because every copy already exists, every lookup succeeds.

## Approach

1. If `head` is null, return null.
2. First pass: for every node `cur` in the original list, create `Node(cur.val)` and store `copy[cur] = newNode`.
3. Second pass: for every node `cur`:
   1. `copy[cur].next = copy[cur.next]` (or null if `cur.next` is null).
   2. `copy[cur].random = copy[cur.random]` (or null if `cur.random` is null).
4. Return `copy[head]`.

A naive approach copies the `next` chain first and then, for each node, walks from the head to find which position its `random` points to and walks the copy to the same position. That costs O(n) per node, O(n²) in total.

## Complexity

- **Time:** O(n). Two passes over the list with O(1) average hash map work per node.
- **Space:** O(n) for the hash map (not counting the copy itself, which the problem requires).

## Common mistakes

- Pointing a copy's `random` at the original node (`copy.random = cur.random`). That is a shallow copy: the new list leaks into the old one.
- Looking up copies by value. Values are not unique, so two different nodes with value `1` would share one copy.
- Trying to set `random` in the first pass, before the target's copy exists.
- Forgetting the null cases: `next` of the last node and any null `random` must stay null in the copy.

## Follow-up questions

- *Can you do it with O(1) extra space?* Interleave the copies with the originals: insert each copy right after its original (`A → A' → B → B' → …`). Then `cur.next.random = cur.random.next` sets every copy's `random`, because the copy of any node is the node right after it. Finally, unweave the two lists, restoring the original `next` pointers.
- *How would you copy a general graph?* Clone Graph uses the same "original → copy" map, filled during a DFS or BFS.

## Related problems

- Clone Graph
- Clone Binary Tree With Random Pointer
- [LRU Cache](/interview/problems/lru-cache/): another problem where a hash map points straight at linked list nodes.

## Solutions

```python
class Solution:
    def copyRandomList(self, head: 'Optional[Node]') -> 'Optional[Node]':
        if head is None:
            return None
        copy = {}  # original node -> its copy
        cur = head
        while cur:
            copy[cur] = Node(cur.val)
            cur = cur.next
        cur = head
        while cur:
            copy[cur].next = copy.get(cur.next)  # .get(None) gives None
            copy[cur].random = copy.get(cur.random)
            cur = cur.next
        return copy[head]
```

```java
class Solution {
    public Node copyRandomList(Node head) {
        if (head == null) {
            return null;
        }
        Map<Node, Node> copy = new HashMap<>(); // original node -> its copy
        for (Node cur = head; cur != null; cur = cur.next) {
            copy.put(cur, new Node(cur.val));
        }
        for (Node cur = head; cur != null; cur = cur.next) {
            copy.get(cur).next = copy.get(cur.next); // get(null) returns null
            copy.get(cur).random = copy.get(cur.random);
        }
        return copy.get(head);
    }
}
```

```cpp
class Solution {
public:
    Node* copyRandomList(Node* head) {
        if (head == nullptr) {
            return nullptr;
        }
        unordered_map<Node*, Node*> copy;  // original node -> its copy
        copy[nullptr] = nullptr;           // so null next/random pointers map to null
        for (Node* cur = head; cur; cur = cur->next) {
            copy[cur] = new Node(cur->val);
        }
        for (Node* cur = head; cur; cur = cur->next) {
            copy[cur]->next = copy[cur->next];
            copy[cur]->random = copy[cur->random];
        }
        return copy[head];
    }
};
```

```javascript
/**
 * @param {Node} head  (LeetCode calls the class _Node; use that name there)
 * @return {Node}
 */
var copyRandomList = function (head) {
  if (head === null) {
    return null;
  }
  const copy = new Map(); // original node -> its copy
  copy.set(null, null); // so null next/random pointers map to null
  for (let cur = head; cur !== null; cur = cur.next) {
    copy.set(cur, new Node(cur.val));
  }
  for (let cur = head; cur !== null; cur = cur.next) {
    copy.get(cur).next = copy.get(cur.next);
    copy.get(cur).random = copy.get(cur.random);
  }
  return copy.get(head);
};
```

```go
func copyRandomList(head *Node) *Node {
	if head == nil {
		return nil
	}
	copies := map[*Node]*Node{nil: nil} // original node -> its copy; nil maps to nil
	for cur := head; cur != nil; cur = cur.Next {
		copies[cur] = &Node{Val: cur.Val}
	}
	for cur := head; cur != nil; cur = cur.Next {
		copies[cur].Next = copies[cur.Next]
		copies[cur].Random = copies[cur.Random]
	}
	return copies[head]
}
```
