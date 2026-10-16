---
title: Tree
topic: Tree
group: graphs
description: "Trees explained for interviews: what a tree is, how recursion on a node and its children solves most tree problems, and a template for general and n-ary trees in Python, Java, C++, JavaScript and Go."
---

## What it is

A tree is a set of nodes connected so that there is exactly one path between any two of them. One node is picked as the **root**; every other node has one **parent** (the node just above it on the way to the root) and any number of **children**. A node with no children is a **leaf**. The nodes below a node, together with that node, form its **subtree**.

This guide is about trees in general: nodes with any number of children (often called **n-ary trees**), and the recursion that works on all of them. Trees where every node has at most two children get their own guide at [Binary Tree](/interview/topics/binary-tree/), and sorted ones at [Binary Search Tree](/interview/topics/binary-search-tree/). Everything here applies to those too.

What makes trees pleasant in interviews is that they are *recursive by shape*: a tree is a root plus a list of smaller trees. So almost any question about a tree ("how tall is it?", "how many nodes?", "what is the largest value?") can be answered by asking the same question about each child's subtree and combining the results.

## When to use it

- The input is a tree, given as node objects with a `children` list (or `left`/`right` pointers), or as a list of parent-child edges you must build into a tree.
- The problem asks for something about a whole structure that can be computed from its parts: height, size, sum, maximum, whether some property holds everywhere.
- The problem talks about ancestors, descendants, paths from the root, levels, or leaves.
- A hierarchy is hiding in the statement: a file system, an org chart, nested comments, a parse of an expression.
- "Each node has exactly one parent" or "there are n nodes and n - 1 edges and the graph is connected" are both ways of saying "this is a tree".

## How it works

The core move is a function that takes a node and returns some fact about that node's subtree. It has two parts:

1. **Base case.** If the node is empty (`None`/`null`/`nil`), return the answer for an empty tree: usually `0`, `true`, or "nothing".
2. **Recursive case.** Call the same function on every child, then combine their answers with the node's own value.

Because every child is solved before the parent combines them, this is a **post-order** traversal. If you need to do something to a node *before* visiting its children (printing the path so far, passing a running sum downwards), that is **pre-order**: do the work first, then recurse.

Take this tree and ask for its height, counting nodes along the longest root-to-leaf path:

```
        1
      / | \
     2  3  4
     |     |
     5     6
           |
           7
```

- `height(5)`: no children, so `1 + max(nothing) = 1`. Same for `3`.
- `height(2)`: its only child gives 1, so `1 + 1 = 2`.
- `height(7) = 1`, `height(6) = 2`, `height(4) = 3`.
- `height(1)`: children give 2, 1 and 3, so `1 + 3 = 4`.

Each node is visited once, each edge is crossed once down and once up, and the whole thing is six lines of code. Swap `1 + max(children)` for `1 + sum(children)` and you count nodes; swap it for `max(node.val, max(children))` and you find the largest value. The shape of the solution never changes, only the combining step.

Two things to keep an eye on:

- **Depth of recursion.** A tree with 10,000 nodes in one long chain recurses 10,000 levels deep. Python's default limit is about 1,000, so either raise it (`sys.setrecursionlimit`) or rewrite with an explicit stack. Java, C++, Go and JavaScript go deeper but can still overflow on very long chains.
- **Passing information down versus up.** Returning values combines children into parents (up). Extra parameters, such as the depth so far or the sum along the path, carry information from parents to children (down). Many problems need both at once.

## Template

The skeleton below computes the height of an n-ary tree, but the comments mark the two places that change from problem to problem: the base case and the combining step.

```python
class Node:
    def __init__(self, val, children=None):
        self.val = val
        self.children = children or []


def solve(node):
    """Post-order recursion on an n-ary tree: solve every child first, then combine."""
    if node is None:
        return 0  # base case: the answer for an empty tree
    results = [solve(child) for child in node.children]
    # Combine the children's answers with this node (here: height of the tree).
    return 1 + max(results, default=0)


if __name__ == "__main__":
    root = Node(1, [Node(2, [Node(5)]), Node(3), Node(4, [Node(6, [Node(7)])])])
    print(solve(root))  # 4
```

```java
import java.util.*;

public class Main {
    static class Node {
        int val;
        List<Node> children = new ArrayList<>();
        Node(int val) { this.val = val; }
    }

    // Post-order recursion on an n-ary tree: solve every child first, then combine.
    static int solve(Node node) {
        if (node == null) return 0; // base case: the answer for an empty tree
        int best = 0;
        for (Node child : node.children) {
            best = Math.max(best, solve(child));
        }
        // Combine the children's answers with this node (here: height of the tree).
        return 1 + best;
    }

    public static void main(String[] args) {
        Node n1 = new Node(1), n2 = new Node(2), n3 = new Node(3), n4 = new Node(4),
             n5 = new Node(5), n6 = new Node(6), n7 = new Node(7);
        n1.children.addAll(List.of(n2, n3, n4));
        n2.children.add(n5);
        n4.children.add(n6);
        n6.children.add(n7);
        System.out.println(solve(n1)); // 4
    }
}
```

```cpp
#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;

struct Node {
    int val;
    vector<Node*> children;
    Node(int v) : val(v) {}
};

// Post-order recursion on an n-ary tree: solve every child first, then combine.
int solve(Node* node) {
    if (node == nullptr) return 0;  // base case: the answer for an empty tree
    int best = 0;
    for (Node* child : node->children) best = max(best, solve(child));
    // Combine the children's answers with this node (here: height of the tree).
    return 1 + best;
}

int main() {
    Node n1(1), n2(2), n3(3), n4(4), n5(5), n6(6), n7(7);
    n1.children = {&n2, &n3, &n4};
    n2.children = {&n5};
    n4.children = {&n6};
    n6.children = {&n7};
    cout << solve(&n1) << endl;  // 4
}
```

```javascript
class Node {
  constructor(val, children = []) {
    this.val = val;
    this.children = children;
  }
}

// Post-order recursion on an n-ary tree: solve every child first, then combine.
function solve(node) {
  if (node === null) return 0; // base case: the answer for an empty tree
  let best = 0;
  for (const child of node.children) best = Math.max(best, solve(child));
  // Combine the children's answers with this node (here: height of the tree).
  return 1 + best;
}

const root = new Node(1, [
  new Node(2, [new Node(5)]),
  new Node(3),
  new Node(4, [new Node(6, [new Node(7)])]),
]);
console.log(solve(root)); // 4
```

```go
package main

import "fmt"

type Node struct {
	Val      int
	Children []*Node
}

// Post-order recursion on an n-ary tree: solve every child first, then combine.
func solve(node *Node) int {
	if node == nil {
		return 0 // base case: the answer for an empty tree
	}
	best := 0
	for _, child := range node.Children {
		best = max(best, solve(child))
	}
	// Combine the children's answers with this node (here: height of the tree).
	return 1 + best
}

func main() {
	root := &Node{Val: 1, Children: []*Node{
		{Val: 2, Children: []*Node{{Val: 5}}},
		{Val: 3},
		{Val: 4, Children: []*Node{{Val: 6, Children: []*Node{{Val: 7}}}}},
	}}
	fmt.Println(solve(root)) // 4
}
```

## Variations

- **Level by level.** When the question is about levels ("average of each level", "rightmost node on each level"), use a queue instead of recursion: see [Breadth-First Search](/interview/topics/breadth-first-search/). Push the root, then repeatedly take every node currently in the queue, process it, and push its children.
- **Tree given as edges.** If you get `n` and a list of `(parent, child)` pairs, build an adjacency list first, find the root (the node that is nobody's child), and then recurse exactly as above. If the edges are undirected, pass the parent along so you do not walk back up.
- **Return more than one value.** Problems like "is the tree balanced?" need both a yes/no and a height from each subtree. Return a pair, or use a sentinel such as `-1` for "not balanced".
- **Trees as graphs.** A tree is a connected graph with no cycles, so every graph technique in [Depth-First Search](/interview/topics/depth-first-search/) works on it, without the visited set.

## Common mistakes

- Forgetting the empty-tree base case, so the function dereferences `None`/`null`.
- Combining with `+` when the problem wants `max`, or the other way round. Say out loud what the function returns before writing it.
- Mixing up height counted in nodes with height counted in edges; the two differ by one. Check the problem's examples.
- Using a global or shared variable for the answer and forgetting to reset it between calls (test harnesses call your function more than once).
- Visiting a child twice when the tree is given as undirected edges, because the parent was not excluded.

## Complexity

Recursion that visits each node once runs in O(n) time for n nodes. The space is the depth of the recursion stack: O(height), which is O(log n) for a bushy tree and O(n) for a chain. A level-order traversal with a queue uses O(width) instead, which can also reach O(n).

## Where to start

1. 559. Maximum Depth of N-ary Tree: the height example above, written out once by hand.
2. 589. N-ary Tree Preorder Traversal: do the work before recursing into children.
3. 104. Maximum Depth of Binary Tree: the same idea with exactly two children, so you see the binary-tree form.
4. 110. Balanced Binary Tree: return two facts from each subtree at once.
5. [236. Lowest Common Ancestor of a Binary Tree](/interview/problems/lowest-common-ancestor-of-a-binary-tree/): post-order where each subtree reports what it found.
6. 429. N-ary Tree Level Order Traversal: the queue-based alternative to recursion.
7. [124. Binary Tree Maximum Path Sum](/interview/problems/binary-tree-maximum-path-sum/): the value returned to the parent differs from the answer you track; a classic interview hard.
