---
title: Clone Graph
leetcode: clone-graph
description: "Clone Graph explained: deep-copy a connected undirected graph given one of its nodes, with a depth-first search and a map from each original node to its copy, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

You are given a reference to one node of a **connected, undirected** graph. Each node has an integer `val` and a list `neighbors` of the nodes it is joined to. Return a **deep copy** of the whole graph: a new set of nodes with the same values and the same connections, sharing no node object with the original.

Node values are unique and run from 1 to the number of nodes; the node you receive is the one with value 1. There are no self-loops and no repeated edges, and the graph has at most 100 nodes. If the given node is null (an empty graph), return null. The copy's structure is what is checked, so the clone of node 1 must be returned and every reachable node must be copied exactly once.

## Examples

Graphs are written as adjacency lists indexed by value, so entry `i` lists the neighbours of node `i + 1`.

- `[[2, 4], [1, 3], [2, 4], [1, 3]]` → a square: 1-2-3-4-1. The copy has four new nodes wired the same way.
- `[[]]` → a single node with no neighbours. The copy is one new node with value 1.
- `[]` → null in, null out.
- `[[2, 3], [1, 3], [1, 2]]` → a triangle. Every node is reachable from every other, and the copy must contain exactly three nodes.

## Key idea

Walking the graph is easy; the difficulty is that a node is reached many times (through each of its neighbours) but must be copied only **once**, and the copies must point at each other, not at the originals. A hash map from original node to its clone solves both problems: when you meet a node you have already copied, return the existing clone instead of making another one. Register the clone in the map *before* visiting the neighbours, so that a cycle (`1 → 2 → 1`) finds the half-built clone of 1 and stops instead of recursing forever.

## Approach

1. If the input node is null, return null.
2. Keep a map `clones` from original node to its copy.
3. Define `clone(node)`:
   1. If `node` is already in `clones`, return its copy.
   2. Create `copy = new Node(node.val)` and store `clones[node] = copy` right away.
   3. For each `nb` in `node.neighbors`, append `clone(nb)` to `copy.neighbors`.
   4. Return `copy`.
4. Return `clone(startNode)`.

The same idea works breadth-first: create the clone of the start node, put the start node in a queue, and for each dequeued node create clones for its unseen neighbours and link them. BFS avoids deep recursion, but with at most 100 nodes the recursive version is fine and shorter.

## Complexity

- **Time:** O(V + E). Each node is cloned once and each edge is followed once from each end.
- **Space:** O(V) for the map and the recursion stack (or the queue).

## Common mistakes

- Registering the clone in the map **after** the neighbour loop. On any cycle the recursion never finds the clone and runs until the stack overflows.
- Appending the *original* neighbours to the clone's list, or copying the `neighbors` list itself. A deep copy must point only at new nodes.
- Keying the map by `val` and then creating a new node whenever the value is unseen, but forgetting to look it up when the value is seen, which produces duplicate nodes with the same value. Keying by node object (or by value, consistently) both work; mixing them does not.
- Returning the input node for the empty-graph case instead of null is fine (both are null), but returning a fresh node is not: an empty graph has no node 1.

## Follow-up questions

- *What if the graph were directed?* Nothing changes: follow outgoing edges only; nodes reachable from the start are copied.
- *What if the graph were not connected?* You cannot reach the other components from one node, so the input would have to be a list of nodes; run the same procedure from each, sharing the map.
- *Can you do it iteratively?* Yes, with BFS or an explicit stack; see the Approach section.

## Related problems

- [Copy List with Random Pointer](/interview/problems/copy-list-with-random-pointer/): the same original-to-copy map on a linked list.
- [Number of Islands](/interview/problems/number-of-islands/): depth-first search with a visited set.
- [Course Schedule](/interview/problems/course-schedule/): another graph traversal that must handle cycles.
- Clone Binary Tree With Random Pointer

## Solutions

```python
class Solution:
    def cloneGraph(self, node: Optional['Node']) -> Optional['Node']:
        if node is None:
            return None
        clones = {}  # original node -> its copy

        def clone(orig):
            if orig in clones:
                return clones[orig]
            copy = Node(orig.val)
            clones[orig] = copy  # register before visiting neighbours so cycles stop here
            copy.neighbors = [clone(nb) for nb in orig.neighbors]
            return copy

        return clone(node)
```

```java
class Solution {
    public Node cloneGraph(Node node) {
        if (node == null) {
            return null;
        }
        return clone(node, new HashMap<>());
    }

    private Node clone(Node orig, Map<Node, Node> clones) { // clones: original node -> its copy
        if (clones.containsKey(orig)) {
            return clones.get(orig);
        }
        Node copy = new Node(orig.val);
        clones.put(orig, copy); // register before visiting neighbours so cycles stop here
        for (Node nb : orig.neighbors) {
            copy.neighbors.add(clone(nb, clones));
        }
        return copy;
    }
}
```

```cpp
class Solution {
public:
    Node* cloneGraph(Node* node) {
        if (node == nullptr) {
            return nullptr;
        }
        unordered_map<Node*, Node*> clones;  // original node -> its copy
        return clone(node, clones);
    }

private:
    Node* clone(Node* orig, unordered_map<Node*, Node*>& clones) {
        auto it = clones.find(orig);
        if (it != clones.end()) {
            return it->second;
        }
        Node* copy = new Node(orig->val);
        clones[orig] = copy;  // register before visiting neighbours so cycles stop here
        for (Node* nb : orig->neighbors) {
            copy->neighbors.push_back(clone(nb, clones));
        }
        return copy;
    }
};
```

```javascript
/**
 * @param {Node} node  (LeetCode calls the class _Node; use that name there)
 * @return {Node}
 */
var cloneGraph = function (node) {
  if (node === null) {
    return null;
  }
  const clones = new Map(); // original node -> its copy
  const clone = (orig) => {
    if (clones.has(orig)) {
      return clones.get(orig);
    }
    const copy = new Node(orig.val);
    clones.set(orig, copy); // register before visiting neighbours so cycles stop here
    for (const nb of orig.neighbors) {
      copy.neighbors.push(clone(nb));
    }
    return copy;
  };
  return clone(node);
};
```

```go
func cloneGraph(node *Node) *Node {
	if node == nil {
		return nil
	}
	clones := map[*Node]*Node{} // original node -> its copy
	var clone func(orig *Node) *Node
	clone = func(orig *Node) *Node {
		if copy, ok := clones[orig]; ok {
			return copy
		}
		copy := &Node{Val: orig.Val}
		clones[orig] = copy // register before visiting neighbours so cycles stop here
		for _, nb := range orig.Neighbors {
			copy.Neighbors = append(copy.Neighbors, clone(nb))
		}
		return copy
	}
	return clone(node)
}
```
