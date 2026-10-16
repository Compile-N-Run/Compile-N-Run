---
title: Binary Tree
topic: Binary Tree
group: graphs
description: "Binary trees explained for interviews: the left/right recursion that solves most tree questions, the three depth-first orders and level order, and a template that returns one value up while tracking the answer, in Python, Java, C++, JavaScript and Go."
---

## What it is

A binary tree is a tree in which every node has at most two children, called **left** and **right**. The node at the top is the root; nodes with no children are leaves. In interview code a node is usually a small object with `val`, `left` and `right`, and an absent child is `None`/`null`/`nil`.

Binary trees are the most common tree in interviews because two children keep the code short: there is no loop over children, just two recursive calls. Nearly every binary tree question is one of a handful of patterns in disguise: compute something from the two subtrees and combine, walk the tree in a particular order, or process it level by level. The general-tree background is in [Tree](/interview/topics/tree/); this guide focuses on the binary case.

## When to use it

- The input is a `TreeNode` (the problem's own class) and the statement says "binary tree".
- The question is about depth, height, diameter, path sums, mirror images, or whether two trees are the same.
- You are asked to traverse in a named order (pre-order, in-order, post-order) or to rebuild a tree from such orders.
- The problem wants something per level: the values on each level, the rightmost node, a zigzag.
- Values are sorted left-to-right: then the tree is a binary search tree and [Binary Search Tree](/interview/topics/binary-search-tree/) applies on top of everything here.

## How it works

**Three depth-first orders.** With two children, there are three natural orders to visit a node and its subtrees, named for where the node itself goes:

- **Pre-order**: node, left, right. Good for copying a tree or building a path from the root downwards.
- **In-order**: left, node, right. In a binary search tree this visits the values in sorted order.
- **Post-order**: left, right, node. Needed whenever the node's answer depends on its children: heights, sums, "is this subtree valid?".

**The post-order pattern with a tracked answer.** Many problems ask for something that is *not* what each subtree naturally returns. The diameter (the longest path between any two nodes, in edges) is the classic case: each subtree can only tell its parent its height, but the longest path through a node is `left height + right height`, and the best such path may live anywhere in the tree. The trick is to write a helper that returns the height and, as a side effect, updates a shared "best so far":

```
        1
       / \
      2   3
     / \   \
    4   5   6
       /
      7
```

- Leaves 4, 7 and 6 return height 1 and see a through-path of 0.
- Node 5: left is 1 (via 7), right is 0. Through-path `1 + 0 = 1`; returns `1 + 1 = 2`.
- Node 2: left 1, right 2. Through-path 3 (4-2-5-7); returns 3.
- Node 3: left 0, right 1. Through-path 1; returns 2.
- Node 1: left 3, right 2. Through-path `3 + 2 = 5` (7-5-2-1-3-6), the answer; returns 4, which nobody uses.

Every binary tree problem that says "path" or "longest" or "maximum through a node" is this pattern. The helper's return value is "the best thing that can continue upwards"; the tracked variable is "the best thing seen anywhere".

**Level order.** When the question is about levels, recursion is awkward and a queue is natural. Put the root in a queue; then, while the queue is not empty, note its current size `k`, pop exactly `k` nodes (that is one level), and push each one's children. See [Breadth-First Search](/interview/topics/breadth-first-search/).

**Rebuilding from traversals.** Pre-order's first element is the root; find it in the in-order list, and everything to its left is the left subtree, everything to its right is the right subtree. Recurse on both halves. A hash map from value to in-order index keeps this O(n).

## Template

The skeleton returns one value to the parent (the height) while tracking the real answer (the diameter) in a shared variable. Change the two commented lines for a different problem.

```python
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val, self.left, self.right = val, left, right


def solve(root):
    """Post-order recursion: each call returns a value for its parent and may update a shared answer."""
    best = 0  # the problem's answer, updated as we go (here: the diameter)

    def height(node):
        nonlocal best
        if node is None:
            return 0  # base case: an empty subtree
        left = height(node.left)
        right = height(node.right)
        best = max(best, left + right)  # problem-specific: combine both sides at this node
        return 1 + max(left, right)  # what the parent needs to know about this subtree

    height(root)
    return best


if __name__ == "__main__":
    root = TreeNode(1, TreeNode(2, TreeNode(4), TreeNode(5, TreeNode(7))), TreeNode(3, None, TreeNode(6)))
    print(solve(root))  # 5: the path 7-5-2-1-3-6 has 5 edges
```

```java
public class Main {
    static class TreeNode {
        int val;
        TreeNode left, right;
        TreeNode(int val) { this.val = val; }
    }

    static int best; // the problem's answer, updated as we go (here: the diameter)

    // Post-order recursion: each call returns a value for its parent and may update a shared answer.
    static int height(TreeNode node) {
        if (node == null) return 0; // base case: an empty subtree
        int left = height(node.left);
        int right = height(node.right);
        best = Math.max(best, left + right); // problem-specific: combine both sides at this node
        return 1 + Math.max(left, right); // what the parent needs to know about this subtree
    }

    static int solve(TreeNode root) {
        best = 0; // reset: the harness may call solve more than once
        height(root);
        return best;
    }

    public static void main(String[] args) {
        TreeNode n1 = new TreeNode(1), n2 = new TreeNode(2), n3 = new TreeNode(3), n4 = new TreeNode(4),
                 n5 = new TreeNode(5), n6 = new TreeNode(6), n7 = new TreeNode(7);
        n1.left = n2; n1.right = n3; n2.left = n4; n2.right = n5; n5.left = n7; n3.right = n6;
        System.out.println(solve(n1)); // 5
    }
}
```

```cpp
#include <algorithm>
#include <iostream>
using namespace std;

struct TreeNode {
    int val;
    TreeNode* left = nullptr;
    TreeNode* right = nullptr;
    TreeNode(int v) : val(v) {}
};

// Post-order recursion: each call returns a value for its parent and may update a shared answer.
int height(TreeNode* node, int& best) {
    if (node == nullptr) return 0;  // base case: an empty subtree
    int left = height(node->left, best);
    int right = height(node->right, best);
    best = max(best, left + right);  // problem-specific: combine both sides at this node
    return 1 + max(left, right);     // what the parent needs to know about this subtree
}

int solve(TreeNode* root) {
    int best = 0;  // the problem's answer (here: the diameter)
    height(root, best);
    return best;
}

int main() {
    TreeNode n1(1), n2(2), n3(3), n4(4), n5(5), n6(6), n7(7);
    n1.left = &n2; n1.right = &n3; n2.left = &n4; n2.right = &n5; n5.left = &n7; n3.right = &n6;
    cout << solve(&n1) << endl;  // 5
}
```

```javascript
class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

// Post-order recursion: each call returns a value for its parent and may update a shared answer.
function solve(root) {
  let best = 0; // the problem's answer, updated as we go (here: the diameter)
  function height(node) {
    if (node === null) return 0; // base case: an empty subtree
    const left = height(node.left);
    const right = height(node.right);
    best = Math.max(best, left + right); // problem-specific: combine both sides at this node
    return 1 + Math.max(left, right); // what the parent needs to know about this subtree
  }
  height(root);
  return best;
}

const root = new TreeNode(
  1,
  new TreeNode(2, new TreeNode(4), new TreeNode(5, new TreeNode(7))),
  new TreeNode(3, null, new TreeNode(6)),
);
console.log(solve(root)); // 5
```

```go
package main

import "fmt"

type TreeNode struct {
	Val         int
	Left, Right *TreeNode
}

// Post-order recursion: each call returns a value for its parent and may update a shared answer.
func solve(root *TreeNode) int {
	best := 0 // the problem's answer, updated as we go (here: the diameter)
	var height func(node *TreeNode) int
	height = func(node *TreeNode) int {
		if node == nil {
			return 0 // base case: an empty subtree
		}
		left := height(node.Left)
		right := height(node.Right)
		best = max(best, left+right) // problem-specific: combine both sides at this node
		return 1 + max(left, right)  // what the parent needs to know about this subtree
	}
	height(root)
	return best
}

func main() {
	root := &TreeNode{Val: 1,
		Left:  &TreeNode{Val: 2, Left: &TreeNode{Val: 4}, Right: &TreeNode{Val: 5, Left: &TreeNode{Val: 7}}},
		Right: &TreeNode{Val: 3, Right: &TreeNode{Val: 6}},
	}
	fmt.Println(solve(root)) // 5
}
```

## Variations

- **Two trees at once.** "Same tree", "symmetric tree" and "merge two trees" recurse on a pair of nodes: both empty is true, one empty is false, otherwise compare values and recurse on the matching children (for symmetry, compare left with right).
- **Passing state downwards.** Path-sum problems carry the running sum as a parameter; "count good nodes" carries the largest value seen on the path so far. The base case checks the condition at a leaf.
- **Iterative traversal with a stack.** Interviewers sometimes ask for in-order without recursion: walk left pushing nodes, pop one, visit it, then move to its right child and repeat. Morris traversal does it in O(1) extra space, but is rarely required.
- **Serialization.** Pre-order with an explicit marker for empty children (`#`) turns a tree into a string that can be parsed back with the same recursion.

## Common mistakes

- Returning the tracked answer from the helper instead of the value the parent needs. The helper and the answer are two different things.
- Forgetting that the diameter and similar "through a node" values use *both* children while the returned height uses only the larger one.
- Treating a node with one child as a leaf. A leaf has no children at all; this matters for "minimum depth" and path-sum problems.
- Negative values: when a problem allows negative node values, do not use `0` as "no path"; a subtree may contribute less than nothing and should be dropped with `max(0, ...)`.
- Off-by-one between counting nodes and counting edges.

## Complexity

Every pattern above visits each node a constant number of times: O(n) time. Recursive solutions use O(height) stack space; level-order uses O(width) queue space. Both are O(n) in the worst case (a chain, or a full bottom level).

## Where to start

1. 104. Maximum Depth of Binary Tree: the base case plus `1 + max(left, right)`.
2. 226. Invert Binary Tree: swap the children, recurse; the simplest pre-order.
3. 100. Same Tree: recursion on a pair of nodes.
4. 543. Diameter of Binary Tree: the template exactly, so write it without looking.
5. 102. Binary Tree Level Order Traversal: the queue with a per-level count.
6. [236. Lowest Common Ancestor of a Binary Tree](/interview/problems/lowest-common-ancestor-of-a-binary-tree/): a post-order where each side reports what it found.
7. 105. Construct Binary Tree from Preorder and Inorder Traversal: split by the root's in-order index.
8. [124. Binary Tree Maximum Path Sum](/interview/problems/binary-tree-maximum-path-sum/): the diameter idea with values, negatives and all.
